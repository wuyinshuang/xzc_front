<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" label-width="88px" class="customer-query-form" :inline="false">
      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item label="客户名称" prop="customerName">
            <el-input v-model="queryParams.customerName" placeholder="请输入客户名称" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="客户类型" prop="customerType">
            <el-select v-model="queryParams.customerType" placeholder="请选择客户类型" clearable style="width: 100%;">
              <el-option label="存量客户" value="OLD" />
              <el-option label="新增客户" value="NEW" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="风控档位" prop="riskTier">
            <el-select v-model="queryParams.riskTier" placeholder="请选择风控档位" clearable style="width: 100%;">
              <el-option label="档位1" :value="1" />
              <el-option label="档位2" :value="2" />
              <el-option label="档位3" :value="3" />
              <el-option label="档位4" :value="4" />
              <el-option label="档位5" :value="5" />
              <el-option label="档位6" :value="6" />
              <el-option label="档位7" :value="7" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="年龄范围" prop="age" class="range-form-item">
            <div class="range-input-wrapper">
              <el-input-number v-model="queryParams.ageMin" :min="0" :max="150" placeholder="最小" controls-position="right" />
              <span class="range-separator">-</span>
              <el-input-number v-model="queryParams.ageMax" :min="0" :max="150" placeholder="最大" controls-position="right" />
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="性别" prop="gender">
            <el-select v-model="queryParams.gender" placeholder="请选择性别" clearable style="width: 100%;">
              <el-option label="男" :value="1" />
              <el-option label="女" :value="2" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="月收入" prop="monthlyIncome" class="range-form-item">
            <div class="range-input-wrapper">
              <el-input-number v-model="queryParams.incomeMin" :min="0" placeholder="最小" :precision="2" controls-position="right" />
              <span class="range-separator">-</span>
              <el-input-number v-model="queryParams.incomeMax" :min="0" placeholder="最大" :precision="2" controls-position="right" />
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="征信分" prop="creditScore" class="range-form-item">
            <div class="range-input-wrapper">
              <el-input-number v-model="queryParams.creditScoreMin" :min="0" :max="1000" placeholder="最小" controls-position="right" />
              <span class="range-separator">-</span>
              <el-input-number v-model="queryParams.creditScoreMax" :min="0" :max="1000" placeholder="最大" controls-position="right" />
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="职业" prop="occupation">
            <el-input v-model="queryParams.occupation" placeholder="请输入职业" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="学历" prop="education">
            <el-select v-model="queryParams.education" placeholder="请选择学历" clearable style="width: 100%;">
              <el-option label="高中" value="高中" />
              <el-option label="大专" value="大专" />
              <el-option label="本科" value="本科" />
              <el-option label="硕士" value="硕士" />
              <el-option label="博士" value="博士" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="行业" prop="industry">
            <el-input v-model="queryParams.industry" placeholder="请输入行业" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="区域" prop="region">
            <el-input v-model="queryParams.region" placeholder="请输入区域" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="婚姻状态" prop="maritalStatus">
            <el-select v-model="queryParams.maritalStatus" placeholder="请选择婚姻状态" clearable style="width: 100%;">
              <el-option label="未婚" value="未婚" />
              <el-option label="已婚" value="已婚" />
              <el-option label="离异" value="离异" />
              <el-option label="丧偶" value="丧偶" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="渠道" prop="channel">
            <el-select v-model="queryParams.channel" placeholder="请选择渠道" clearable style="width: 100%;">
              <el-option label="APP" value="APP" />
              <el-option label="WEB" value="WEB" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="敏感度分组" prop="sensitivityGroup">
            <el-select v-model="queryParams.sensitivityGroup" placeholder="请选择敏感度" clearable style="width: 100%;">
              <el-option label="低敏感" value="LOW" />
              <el-option label="中敏感" value="MID" />
              <el-option label="高敏感" value="HIGH" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="违约概率" prop="pd" class="range-form-item">
            <div class="range-input-wrapper">
              <el-input-number v-model="queryParams.pdMin" :min="0" :max="1" :step="0.001" :precision="4" placeholder="最小" controls-position="right" />
              <span class="range-separator">-</span>
              <el-input-number v-model="queryParams.pdMax" :min="0" :max="1" :step="0.001" :precision="4" placeholder="最大" controls-position="right" />
            </div>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24" style="text-align: center; padding-bottom: 12px;">
          <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-table v-loading="loading" :data="customerList" border style="width: 100%" :scrollbar-always-on="true">
      <el-table-column label="客户ID" align="center" prop="customerId" width="260" fixed="left" show-overflow-tooltip />
      <el-table-column label="客户名称" align="center" prop="customerName" width="100" />
      <el-table-column label="客户类型" align="center" prop="customerType" width="90">
        <template #default="scope">
          <el-tag :type="scope.row.customerType === 'NEW' ? 'success' : 'primary'" size="small">
            {{ scope.row.customerType === 'NEW' ? '新增' : '存量' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="年龄" align="center" prop="age" width="60" />
      <el-table-column label="性别" align="center" prop="gender" width="60">
        <template #default="scope">
          {{ scope.row.gender === 1 ? '男' : '女' }}
        </template>
      </el-table-column>
      <el-table-column label="职业" align="center" prop="occupation" width="100" />
      <el-table-column label="月收入(元)" align="center" prop="monthlyIncome" width="110">
        <template #default="scope">
          {{ formatNumber(scope.row.monthlyIncome) }}
        </template>
      </el-table-column>
      <el-table-column label="公积金(元)" align="center" prop="housingFund" width="110">
        <template #default="scope">
          {{ formatNumber(scope.row.housingFund) }}
        </template>
      </el-table-column>
      <el-table-column label="学历" align="center" prop="education" width="80" />
      <el-table-column label="行业" align="center" prop="industry" width="100" />
      <el-table-column label="区域" align="center" prop="region" width="70" />
      <el-table-column label="婚姻状态" align="center" prop="maritalStatus" width="80" />
      <el-table-column label="贷款金额(元)" align="center" prop="loanAmount" width="110">
        <template #default="scope">
          {{ formatNumber(scope.row.loanAmount) }}
        </template>
      </el-table-column>
      <el-table-column label="贷款期限(月)" align="center" prop="loanPeriod" width="100" />
      <el-table-column label="征信分" align="center" prop="creditScore" width="80" />
      <el-table-column label="PD" align="center" prop="pd" width="80">
        <template #default="scope">
          {{ (scope.row.pd * 100).toFixed(2) }}%
        </template>
      </el-table-column>
      <el-table-column label="LGD" align="center" prop="lgd" width="80">
        <template #default="scope">
          {{ (scope.row.lgd * 100).toFixed(2) }}%
        </template>
      </el-table-column>
      <el-table-column label="欺诈分" align="center" prop="fraudScore" width="80" />
      <el-table-column label="LTV" align="center" prop="ltv" width="80">
        <template #default="scope">
          {{ (scope.row.ltv * 100).toFixed(2) }}%
        </template>
      </el-table-column>
      <el-table-column label="风控档位" align="center" prop="riskTier" width="80">
        <template #default="scope">
          <el-tag :type="getRiskTierType(scope.row.riskTier)" size="small">档位{{ scope.row.riskTier }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="档位利率(%)" align="center" prop="riskTierRate" width="100">
        <template #default="scope">
          {{ scope.row.riskTierRate?.toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column label="价格敏感度" align="center" prop="priceSensitivity" width="100">
        <template #default="scope">
          {{ (scope.row.priceSensitivity * 100).toFixed(2) }}%
        </template>
      </el-table-column>
      <el-table-column label="敏感度分组" align="center" prop="sensitivityGroup" width="100">
        <template #default="scope">
          <el-tag size="small" :type="scope.row.sensitivityGroup === 'LOW' ? 'success' : scope.row.sensitivityGroup === 'MEDIUM' ? 'warning' : 'danger'">
            {{ sensitivityMap[scope.row.sensitivityGroup] || scope.row.sensitivityGroup }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="额度使用率" align="center" prop="amountUsedRatio" width="100">
        <template #default="scope">
          {{ (scope.row.amountUsedRatio * 100).toFixed(2) }}%
        </template>
      </el-table-column>
      <el-table-column label="渠道" align="center" prop="channel" width="70" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="160" />
      <el-table-column label="操作" align="center" width="80" fixed="right">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleView(scope.row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <el-dialog v-model="detailVisible" title="客户详情" width="800px">
      <el-descriptions :column="2" border v-if="currentCustomer">
        <el-descriptions-item label="客户ID" :span="2">{{ currentCustomer.customerId }}</el-descriptions-item>
        <el-descriptions-item label="客户名称">{{ currentCustomer.customerName }}</el-descriptions-item>
        <el-descriptions-item label="客户类型">
          <el-tag :type="currentCustomer.customerType === 'NEW' ? 'success' : 'primary'" size="small">
            {{ currentCustomer.customerType === 'NEW' ? '新增' : '存量' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="年龄">{{ currentCustomer.age }}岁</el-descriptions-item>
        <el-descriptions-item label="性别">{{ currentCustomer.gender === 1 ? '男' : '女' }}</el-descriptions-item>
        <el-descriptions-item label="职业">{{ currentCustomer.occupation }}</el-descriptions-item>
        <el-descriptions-item label="学历">{{ currentCustomer.education }}</el-descriptions-item>
        <el-descriptions-item label="行业">{{ currentCustomer.industry }}</el-descriptions-item>
        <el-descriptions-item label="区域">{{ currentCustomer.region }}</el-descriptions-item>
        <el-descriptions-item label="婚姻状态">{{ currentCustomer.maritalStatus }}</el-descriptions-item>
        <el-descriptions-item label="月收入">{{ formatNumber(currentCustomer.monthlyIncome) }}元</el-descriptions-item>
        <el-descriptions-item label="公积金缴存">{{ formatNumber(currentCustomer.housingFund) }}元</el-descriptions-item>
        <el-descriptions-item label="贷款金额">{{ formatNumber(currentCustomer.loanAmount) }}元</el-descriptions-item>
        <el-descriptions-item label="贷款期限">{{ currentCustomer.loanPeriod }}个月</el-descriptions-item>
        <el-descriptions-item label="征信分">{{ currentCustomer.creditScore }}</el-descriptions-item>
        <el-descriptions-item label="欺诈分">{{ currentCustomer.fraudScore }}</el-descriptions-item>
        <el-descriptions-item label="PD">{{ (currentCustomer.pd * 100).toFixed(4) }}%</el-descriptions-item>
        <el-descriptions-item label="LGD">{{ (currentCustomer.lgd * 100).toFixed(2) }}%</el-descriptions-item>
        <el-descriptions-item label="LTV">{{ (currentCustomer.ltv * 100).toFixed(2) }}%</el-descriptions-item>
        <el-descriptions-item label="风控档位">
          <el-tag :type="getRiskTierType(currentCustomer.riskTier)" size="small">档位{{ currentCustomer.riskTier }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="档位利率">{{ currentCustomer.riskTierRate?.toFixed(2) }}%</el-descriptions-item>
        <el-descriptions-item label="价格敏感度">{{ (currentCustomer.priceSensitivity * 100).toFixed(2) }}%</el-descriptions-item>
        <el-descriptions-item label="敏感度分组">
          <el-tag size="small" :type="currentCustomer.sensitivityGroup === 'LOW' ? 'success' : currentCustomer.sensitivityGroup === 'MEDIUM' ? 'warning' : 'danger'">
            {{ sensitivityMap[currentCustomer.sensitivityGroup] || currentCustomer.sensitivityGroup }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="额度使用率">{{ (currentCustomer.amountUsedRatio * 100).toFixed(2) }}%</el-descriptions-item>
        <el-descriptions-item label="渠道">{{ currentCustomer.channel }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentCustomer.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ currentCustomer.updateTime }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="CustomQuery">
import { ref, reactive, toRefs, onMounted } from 'vue'
import { listCustomers } from '@/api/custom/customer'

const loading = ref(true)
const customerList = ref([])
const total = ref(0)
const detailVisible = ref(false)
const currentCustomer = ref(null)

const sensitivityMap = {
  LOW: '低敏感',
  MEDIUM: '中敏感',
  HIGH: '高敏感'
}

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    customerName: undefined,
    customerType: undefined,
    riskTier: undefined,
    ageMin: undefined,
    ageMax: undefined,
    gender: undefined,
    incomeMin: undefined,
    incomeMax: undefined,
    creditScoreMin: undefined,
    creditScoreMax: undefined,
    occupation: undefined,
    education: undefined,
    industry: undefined,
    region: undefined,
    maritalStatus: undefined,
    channel: undefined,
    sensitivityGroup: undefined,
    pdMin: undefined,
    pdMax: undefined
  }
})

const { queryParams } = toRefs(data)

function formatNumber(num) {
  if (num === null || num === undefined) return '-'
  return Number(num).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function getRiskTierType(tier) {
  const types = ['', 'success', 'info', 'warning', 'danger', 'danger']
  return types[tier] || 'info'
}

function getList() {
  loading.value = true
  const params = {}
  Object.keys(queryParams.value).forEach(key => {
    const val = queryParams.value[key]
    if (val !== undefined && val !== null && val !== '') {
      params[key] = val
    }
  })
  listCustomers(params).then(response => {
    customerList.value = response.rows || response.list || []
    total.value = response.total || 0
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

function resetQuery() {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    customerName: undefined,
    customerType: undefined,
    riskTier: undefined,
    ageMin: undefined,
    ageMax: undefined,
    gender: undefined,
    incomeMin: undefined,
    incomeMax: undefined,
    creditScoreMin: undefined,
    creditScoreMax: undefined,
    occupation: undefined,
    education: undefined,
    industry: undefined,
    region: undefined,
    maritalStatus: undefined,
    channel: undefined,
    sensitivityGroup: undefined,
    pdMin: undefined,
    pdMax: undefined
  }
  handleQuery()
}

function handleView(row) {
  currentCustomer.value = row
  detailVisible.value = true
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.customer-query-form {
  background: #fff;
  padding: 18px 16px 0;
  margin-bottom: 12px;
  border-radius: 4px;
}
.customer-query-form :deep(.el-form-item) {
  margin-bottom: 15px;
}
.range-form-item :deep(.el-form-item__content) {
  white-space: nowrap;
  display: flex;
  align-items: center;
}
.range-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}
.range-input-wrapper :deep(.el-input-number) {
  flex: 1;
  width: auto !important;
}
.range-separator {
  color: #909399;
  flex-shrink: 0;
}
</style>
