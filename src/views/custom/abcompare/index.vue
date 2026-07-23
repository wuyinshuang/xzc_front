<template>
  <div class="app-container">
    <el-card class="query-card" shadow="never">
      <template #header>
        <span class="card-title">ABtest分流参数</span>
      </template>
      <el-form :model="form" ref="formRef" label-width="100px" :rules="rules">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="实验ID" prop="experimentId">
              <el-input v-model="form.experimentId" placeholder="请输入实验ID，如：EXP-001" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="实验组比例" prop="splitRatio">
              <el-input-number 
                v-model="form.splitRatio" 
                :min="0" 
                :max="1" 
                :step="0.1" 
                :precision="2" 
                placeholder="0-1，如0.5表示50%" 
                style="width: 100%;"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="客户ID列表" prop="customerIds">
              <el-input
                v-model="customerIdsText"
                type="textarea"
                :rows="4"
                placeholder="请输入客户ID，多个ID用逗号、空格或换行分隔&#10;示例：C001, C002, C003, C004"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item style="text-align: center;">
          <el-button type="primary" icon="Operation" @click="handleSplit" :loading="loading">
            开始分流
          </el-button>
          <el-button icon="Refresh" @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-if="result" class="result-card" shadow="never">
      <template #header>
        <div class="result-header">
          <span class="card-title">分流结果</span>
          <el-tag type="success" size="large">实验ID：{{ result.experimentId }}</el-tag>
        </div>
      </template>

      <el-row :gutter="20" class="stat-row">
        <el-col :span="8">
          <div class="stat-item stat-control">
            <div class="stat-label">对照组</div>
            <div class="stat-value">{{ result.controlCount }} 人</div>
            <div class="stat-percent">{{ controlPercent }}%</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-item stat-experiment">
            <div class="stat-label">实验组</div>
            <div class="stat-value">{{ result.experimentCount }} 人</div>
            <div class="stat-percent">{{ experimentPercent }}%</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-item stat-total">
            <div class="stat-label">总人数</div>
            <div class="stat-value">{{ totalCount }} 人</div>
            <div class="stat-percent">100%</div>
          </div>
        </el-col>
      </el-row>

      <el-divider content-position="left">分配明细</el-divider>

      <el-table :data="result.assignments" border stripe style="width: 100%">
        <el-table-column label="序号" type="index" width="70" align="center" />
        <el-table-column label="客户ID" align="center" prop="customerId" min-width="250" show-overflow-tooltip />
        <el-table-column label="分组" align="center" prop="group" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.group === 'experiment' || scope.row.group === 'treatment' ? 'warning' : 'info'" size="small">
              {{ getGroupName(scope.row.group) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="桶号/Hash值" align="center" prop="bucket" width="120" v-if="hasBucketColumn">
          <template #default="scope">
            {{ scope.row.bucket !== undefined ? scope.row.bucket : (scope.row.hash !== undefined ? scope.row.hash : '-') }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup name="AbCompare">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { abtestSplit } from '@/api/custom/abcompare'

const formRef = ref(null)
const loading = ref(false)
const result = ref(null)
const customerIdsText = ref('')

const form = reactive({
  experimentId: '',
  splitRatio: 0.5,
  customerIds: []
})

const rules = {
  experimentId: [
    { required: true, message: '请输入实验ID', trigger: 'blur' }
  ],
  splitRatio: [
    { required: true, message: '请输入实验组比例', trigger: 'blur' }
  ],
  customerIds: [
    { required: true, type: 'array', message: '请输入至少一个客户ID', trigger: 'change' }
  ]
}

const totalCount = computed(() => {
  if (!result.value) return 0
  return (result.value.controlCount || 0) + (result.value.experimentCount || 0)
})

const controlPercent = computed(() => {
  if (totalCount.value === 0) return 0
  return ((result.value.controlCount / totalCount.value) * 100).toFixed(1)
})

const experimentPercent = computed(() => {
  if (totalCount.value === 0) return 0
  return ((result.value.experimentCount / totalCount.value) * 100).toFixed(1)
})

const hasBucketColumn = computed(() => {
  if (!result.value?.assignments?.length) return false
  const first = result.value.assignments[0]
  return first.bucket !== undefined || first.hash !== undefined
})

function parseCustomerIds() {
  if (!customerIdsText.value.trim()) return []
  return customerIdsText.value
    .split(/[\s,，\n]+/)
    .map(id => id.trim())
    .filter(id => id.length > 0)
}

function getGroupName(group) {
  const groupMap = {
    'control': '对照组',
    'experiment': '实验组',
    'treatment': '实验组',
    'CONTROL': '对照组',
    'EXPERIMENT': '实验组',
    'TREATMENT': '实验组'
  }
  return groupMap[group] || group
}

async function handleSplit() {
  form.customerIds = parseCustomerIds()
  if (form.customerIds.length === 0) {
    ElMessage.warning('请输入至少一个客户ID')
    return
  }
  if (!formRef.value) return
  
  formRef.value.validate(async (valid) => {
    if (!valid) return
    
    loading.value = true
    result.value = null
    
    try {
      const res = await abtestSplit({
        customerIds: form.customerIds,
        experimentId: form.experimentId,
        splitRatio: form.splitRatio
      })
      
      if (res.error) {
        ElMessage.error(res.error)
        return
      }
      
      result.value = res
      ElMessage.success('分流完成')
    } catch (e) {
      console.error('分流失败', e)
      ElMessage.error('分流失败，请重试')
    } finally {
      loading.value = false
    }
  })
}

function resetForm() {
  formRef.value?.resetFields()
  customerIdsText.value = ''
  form.experimentId = ''
  form.splitRatio = 0.5
  form.customerIds = []
  result.value = null
}
</script>

<style lang="scss" scoped>
.query-card {
  margin-bottom: 20px;
}
.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}
.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.stat-row {
  margin-bottom: 10px;
}
.stat-item {
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  color: #fff;
}
.stat-control {
  background: linear-gradient(135deg, #909399 0%, #606266 100%);
}
.stat-experiment {
  background: linear-gradient(135deg, #e6a23c 0%, #cf9236 100%);
}
.stat-total {
  background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
}
.stat-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}
.stat-value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 4px;
}
.stat-percent {
  font-size: 13px;
  opacity: 0.8;
}
</style>
