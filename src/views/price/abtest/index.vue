<template>
  <div class="app-container">
    <el-form ref="queryRef" :model="queryParams" :inline="true" size="default">
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable :style="{width: '200px'}">
          <el-option v-for="(item, index) in statusOptions" :key="index" :label="item.label"
            :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        <el-button type="primary" plain icon="Plus" @click="handleAdd">创建 ABtest 实验</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="abtestList" border style="width: 100%">
      <el-table-column label="实验ID" align="center" prop="experimentId" min-width="160" />
      <el-table-column label="实验名称" align="center" prop="experimentName" min-width="200" />
      <el-table-column label="描述" align="center" prop="description" min-width="240" />
      <el-table-column label="状态" align="center" prop="status" min-width="120">
        <template #default="scope">
          <dict-tag :options="statusOptions" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="分流比例" align="center" prop="splitRatio" min-width="120" />
      <el-table-column label="对照组策略" align="center" prop="controlStrategy" min-width="180" />
      <el-table-column label="实验组策略" align="center" prop="experimentStrategy" min-width="180" />
      <el-table-column label="客户号数量" align="center" prop="customerIds" min-width="120">
        <template #default="scope">
          <span>{{ scope.row.customerIds ? scope.row.customerIds.length : 0 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="开始时间" align="center" prop="startTime" min-width="180" />
      <el-table-column label="操作" align="center" width="280" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <div style="white-space: nowrap;">
            <el-button link type="primary" icon="View" @click="handleDetail(scope.row)">效果</el-button>
            <el-button link type="success" icon="VideoPlay" @click="handleStart(scope.row)" :disabled="scope.row.status !== 'CREATED' && scope.row.status !== 'PAUSED'">启动</el-button>
            <el-button link type="warning" icon="VideoPause" @click="handlePause(scope.row)" :disabled="scope.row.status !== 'RUNNING'">暂停</el-button>
            <el-button link type="danger" icon="CircleClose" @click="handleTerminate(scope.row)" :disabled="scope.row.status === 'COMPLETED' || scope.row.status === 'TERMINATED'">终止</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="创建 ABtest 实验" v-model="addOpen" width="700px" append-to-body>
      <el-form ref="addFormRef" :model="addForm" :rules="addRules" label-width="120px">
        <el-form-item label="实验名称" prop="experimentName">
          <el-input v-model="addForm.experimentName" placeholder="请输入实验名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="addForm.description" type="textarea" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="分流比例" prop="splitRatio">
          <el-input v-model="addForm.splitRatio" placeholder="请输入分流比例，如0.5" />
        </el-form-item>
        <el-form-item label="对照组策略" prop="controlStrategy">
          <el-select v-model="addForm.controlStrategy" placeholder="请选择对照组策略" :style="{width: '100%'}">
            <el-option label="固定档位 (FIXED_TIER)" value="FIXED_TIER" />
            <el-option label="基础定价 (BASE_PRICING)" value="BASE_PRICING" />
            <el-option label="规则引擎 (RULE_ENGINE)" value="RULE_ENGINE" />
          </el-select>
        </el-form-item>
        <el-form-item label="实验组策略" prop="experimentStrategy">
          <el-select v-model="addForm.experimentStrategy" placeholder="请选择实验组策略" :style="{width: '100%'}">
            <el-option label="AI UPLIFT上浮策略" value="AI_UPLIFT" />
            <el-option label="风险定价 (RISK_PRICING)" value="RISK_PRICING" />
            <el-option label="优化策略 (OPTIMIZED)" value="OPTIMIZED" />
          </el-select>
        </el-form-item>
        <el-form-item label="客户号列表" prop="customerIdsText">
          <el-input
            v-model="addForm.customerIdsText"
            type="textarea"
            :rows="6"
            placeholder="请输入客户号，多个客户号用逗号、换行或空格分隔，最多500个&#10;示例：C001,C002,C003"
          />
          <div style="margin-top: 4px; font-size: 12px; color: #909399;">
            已输入客户号：<span :style="{color: customerCount > 500 ? '#F56C6C' : '#67C23A', fontWeight: 'bold'}">{{ customerCount }}</span> / 500
            <span v-if="customerCount > 500" style="color: #F56C6C; margin-left: 8px;">客户号数量超过上限，请分批创建</span>
          </div>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="addForm.status" placeholder="请选择状态" :style="{width: '100%'}">
            <el-option v-for="(item, index) in statusOptions" :key="index" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitAdd" :disabled="customerCount > 500">确 定</el-button>
          <el-button @click="addOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog title="实验详情" v-model="detailOpen" width="900px" append-to-body>
      <el-form ref="detailFormRef" :model="detailData" label-width="150px" v-loading="detailLoading">
        <el-divider content-position="left">基本信息</el-divider>
        <el-row>
          <el-col :span="12">
            <el-form-item label="实验ID">
              <span>{{ detailData.experiment?.experimentId }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="实验名称">
              <span>{{ detailData.experiment?.name }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分流比例">
              <span>{{ detailData.experiment?.splitRatio }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <span>{{ detailData.experiment?.status }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">转化率</el-divider>
        <el-row>
          <el-col :span="8">
            <el-form-item label="对照组">
              <span>{{ detailData.conversionRate?.control }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="实验组">
              <span>{{ detailData.conversionRate?.experiment }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="差异值">
              <span>{{ detailData.conversionRate?.delta }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">平均利率</el-divider>
        <el-row>
          <el-col :span="8">
            <el-form-item label="对照组">
              <span>{{ detailData.avgRate?.control }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="实验组">
              <span>{{ detailData.avgRate?.experiment }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="差异值">
              <span>{{ detailData.avgRate?.delta }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">增量利润</el-divider>
        <el-row>
          <el-col :span="8">
            <el-form-item label="对照组">
              <span>{{ detailData.incrementalProfit?.control }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="实验组">
              <span>{{ detailData.incrementalProfit?.experiment }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="差异值">
              <span>{{ detailData.incrementalProfit?.delta }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="策略覆盖率">
              <span>{{ detailData.strategyCoverage }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">显著性</el-divider>
        <el-row>
          <el-col :span="12">
            <el-form-item label="P值">
              <span>{{ detailData.significance?.pValue }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否显著">
              <span>{{ detailData.significance?.significant }}</span>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailOpen = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup name="Abtest">
import { listAbtest, getAbtestMetrics, addAbtest, pauseAbtest, startAbtest, terminateAbtest } from "@/api/price/abtest"

const { proxy } = getCurrentInstance()
const queryRef = ref()
const addFormRef = ref()

const loading = ref(false)
const abtestList = ref([])
const queryParams = ref({
  status: undefined
})

const statusOptions = ref([{
  "label": "已创建",
  "value": "CREATED"
}, {
  "label": "运行中",
  "value": "RUNNING"
}, {
  "label": "已暂停",
  "value": "PAUSED"
}, {
  "label": "已完成",
  "value": "COMPLETED"
}])

const detailOpen = ref(false)
const detailLoading = ref(false)
const detailData = ref({})

const addOpen = ref(false)
const addForm = ref({
  experimentName: '',
  description: '',
  splitRatio: '',
  controlStrategy: 'FIXED_TIER',
  experimentStrategy: 'AI_UPLIFT',
  customerIdsText: '',
  status: 'CREATED'
})
const addRules = {
  experimentName: [{ required: true, message: "实验名称不能为空", trigger: "blur" }],
  splitRatio: [
    { required: true, message: "分流比例不能为空", trigger: "blur" },
    { type: 'number', transform: (value) => Number(value), message: "分流比例必须为数字", trigger: "blur" }
  ],
  controlStrategy: [{ required: true, message: "请选择对照组策略", trigger: "change" }],
  experimentStrategy: [{ required: true, message: "请选择实验组策略", trigger: "change" }],
  status: [{ required: true, message: "状态不能为空", trigger: "change" }]
}

const customerCount = computed(() => {
  if (!addForm.value.customerIdsText) return 0
  const ids = parseCustomerIds(addForm.value.customerIdsText)
  return ids.length
})

function parseCustomerIds(text) {
  if (!text) return []
  return text.split(/[,，\s\n\r]+/).map(id => id.trim()).filter(id => id.length > 0)
}

function getList() {
  loading.value = true
  const params = {}
  if (queryParams.value.status) {
    params.status = queryParams.value.status
  }
  listAbtest(params).then(response => {
    if (Array.isArray(response)) {
      abtestList.value = response
    } else if (response && Array.isArray(response.list)) {
      abtestList.value = response.list
    } else {
      abtestList.value = []
    }
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

function handleQuery() {
  getList()
}

function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

function handleDetail(row) {
  detailOpen.value = true
  detailLoading.value = true
  getAbtestMetrics(row.experimentId).then(response => {
    detailData.value = response || {}
    detailLoading.value = false
  }).catch(() => {
    detailLoading.value = false
  })
}

function handleAdd() {
  addForm.value = {
    experimentName: '',
    description: '',
    splitRatio: '',
    controlStrategy: 'FIXED_TIER',
    experimentStrategy: 'AI_UPLIFT',
    customerIdsText: '',
    status: 'CREATED'
  }
  addOpen.value = true
}

function submitAdd() {
  addFormRef.value.validate(valid => {
    if (valid) {
      const customerIds = parseCustomerIds(addForm.value.customerIdsText)
      if (customerIds.length > 500) {
        proxy.$modal.msgError(`客户号数量超过上限500条，当前${customerIds.length}条，请分批创建实验`)
        return
      }
      if (customerIds.length === 0) {
        proxy.$modal.msgWarning("请输入至少一个客户号")
        return
      }
      const submitData = {
        experimentName: addForm.value.experimentName,
        description: addForm.value.description,
        splitRatio: Number(addForm.value.splitRatio),
        controlStrategy: addForm.value.controlStrategy,
        experimentStrategy: addForm.value.experimentStrategy,
        customerIds: customerIds,
        status: addForm.value.status
      }
      addAbtest(submitData).then(() => {
        proxy.$modal.msgSuccess("创建成功")
        addOpen.value = false
        getList()
      }).catch(err => {
        if (err && err.error && err.limit) {
          proxy.$modal.msgError(err.error)
        }
      })
    }
  })
}

function handlePause(row) {
  proxy.$modal.confirm('确认要暂停实验"' + row.experimentName + '"吗?').then(() => {
    return pauseAbtest(row.experimentId)
  }).then(() => {
    proxy.$modal.msgSuccess("暂停成功")
    getList()
  }).catch(() => {})
}

function handleStart(row) {
  proxy.$modal.confirm('确认要启动实验"' + row.experimentName + '"吗?').then(() => {
    return startAbtest(row.experimentId)
  }).then(() => {
    proxy.$modal.msgSuccess("启动成功")
    getList()
  }).catch(() => {})
}

function handleTerminate(row) {
  proxy.$modal.confirm('确认要终止实验"' + row.experimentName + '"吗?终止后无法恢复!').then(() => {
    return terminateAbtest(row.experimentId)
  }).then(() => {
    proxy.$modal.msgSuccess("终止成功")
    getList()
  }).catch(() => {})
}

getList()
</script>
<style>
</style>
