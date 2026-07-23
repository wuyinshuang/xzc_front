<template>
  <div class="app-container strategy-simulate-page">
    <el-card shadow="never" class="input-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">策略模拟查询</span>
        </div>
      </template>

      <el-form :model="form" ref="formRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="客户ID" prop="customerId" required>
              <el-input v-model="form.customerId" placeholder="请输入客户ID" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="产品类型" prop="productType" required>
              <el-select v-model="form.productType" placeholder="请选择产品类型" style="width: 100%;">
                <el-option label="现金贷 (CASH_LOAN)" value="CASH_LOAN" />
                <el-option label="消费分期 (CONSUMER_INSTALLMENT)" value="CONSUMER_INSTALLMENT" />
                <el-option label="循环贷 (REVOLVING_CREDIT)" value="REVOLVING_CREDIT" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="期限(月)" prop="termMonths">
              <el-input-number v-model="form.termMonths" :min="1" :max="60" placeholder="贷款期限" controls-position="right" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="情景类型" prop="scenarioType">
              <el-select v-model="form.scenarioType" placeholder="选择情景类型（可选）" clearable style="width: 100%;">
                <el-option label="基准情景 (baseline)" value="baseline" />
                <el-option label="乐观情景 (optimistic)" value="optimistic" />
                <el-option label="悲观情景 (pessimistic)" value="pessimistic" />
                <el-option label="极端情景 (extreme)" value="extreme" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="16" style="text-align: right;">
            <el-form-item>
              <el-button @click="resetForm">重置</el-button>
              <el-button type="primary" icon="Search" @click="handleSimulate" :loading="loading">执行策略模拟</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <div v-if="result" class="result-container">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-card shadow="never" class="summary-card">
            <template #header>
              <div class="card-header">
                <span class="section-title">推荐决策</span>
              </div>
            </template>
            <div class="recommend-summary">
              <div class="recommend-item main">
                <div class="recommend-label">推荐利率</div>
                <div class="recommend-value primary">{{ numVal(result.recommendedRate) }}%</div>
              </div>
              <div class="recommend-item">
                <div class="recommend-label">推荐上浮</div>
                <div class="recommend-value">+{{ numVal(result.recommendedUplift) }}%</div>
              </div>
              <div class="recommend-item">
                <div class="recommend-label">风控下限利率</div>
                <div class="recommend-value">{{ numVal(result.riskFloorRate) }}%</div>
              </div>
              <div class="recommend-item">
                <div class="recommend-label">预期转化概率</div>
                <div class="recommend-value success">{{ formatPercent(result.expectedConvProb) }}</div>
              </div>
              <div class="recommend-item">
                <div class="recommend-label">预期增量利润</div>
                <div class="recommend-value warning">{{ numVal(result.expectedIncrProfit) }}%</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="24">
          <el-card shadow="never" class="curve-card">
            <template #header>
              <span class="section-title"><el-icon><TrendCharts /></el-icon> 转化概率曲线 & 增量利润曲线</span>
            </template>
            <el-table :data="conversionCurveList" size="small" border stripe>
              <el-table-column label="利率档位" prop="rateKey" width="120" align="center">
                <template #default="{ row }">{{ strVal(row.rateKey) }}</template>
              </el-table-column>
              <el-table-column label="上浮比例(%)" prop="uplift" width="120" align="center">
                <template #default="{ row }">+{{ numVal(row.uplift) }}%</template>
              </el-table-column>
              <el-table-column label="利率(%)" prop="rate" width="120" align="center">
                <template #default="{ row }">
                  <span :class="{'rate-recommended': numVal(row.rate) === numVal(result.recommendedRate)}">
                    {{ numVal(row.rate) }}%
                    <el-tag v-if="numVal(row.rate) === numVal(result.recommendedRate)" type="success" size="small" style="margin-left: 4px;">推荐</el-tag>
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="转化概率" prop="convProb" width="140" align="center">
                <template #default="{ row }">{{ formatPercent(row.convProb) }}</template>
              </el-table-column>
              <el-table-column label="增量利润(%)" prop="incrProfit" width="140" align="center">
                <template #default="{ row }">
                  <span :class="profitClass(row.incrProfit)">{{ numVal(row.incrProfit) }}%</span>
                </template>
              </el-table-column>
            </el-table>
            <div v-if="conversionCurveList.length === 0" class="empty-table-tip">暂无转化曲线数据</div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px;" v-if="scenarioData">
        <el-col :span="24">
          <el-card shadow="never" class="scenario-card">
            <template #header>
              <span class="section-title"><el-icon><DataLine /></el-icon> 情景模拟结果</span>
            </template>
            <el-descriptions :column="3" border size="small">
              <el-descriptions-item label="情景类型">
                <el-tag :type="scenarioType(scenarioData.type)">{{ scenarioNameMap[scenarioData.type] || strVal(scenarioData.type) }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="平均利率">{{ numVal(scenarioData.avgRate) }}%</el-descriptions-item>
              <el-descriptions-item label="净收益率">
                <span :class="profitClass(scenarioData.netProfitRate)">{{ numVal(scenarioData.netProfitRate) }}%</span>
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-empty v-else-if="!loading" description="输入客户ID和产品类型后点击「执行策略模拟」" :image-size="120" />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, TrendCharts, DataLine } from '@element-plus/icons-vue'
import { strategySimulate } from '@/api/price/strategy'

const formRef = ref()
const loading = ref(false)
const result = ref(null)

const productTypeMap = {
  CASH_LOAN: '现金贷',
  CONSUMER_INSTALLMENT: '消费分期',
  REVOLVING_CREDIT: '循环贷'
}

const scenarioNameMap = {
  baseline: '基准情景',
  optimistic: '乐观情景',
  pessimistic: '悲观情景',
  extreme: '极端情景',
  BASELINE: '基准情景',
  OPTIMISTIC: '乐观情景',
  PESSIMISTIC: '悲观情景',
  EXTREME: '极端情景'
}

const scenarioColorMap = {
  baseline: 'info',
  optimistic: 'success',
  pessimistic: 'warning',
  extreme: 'danger',
  BASELINE: 'info',
  OPTIMISTIC: 'success',
  PESSIMISTIC: 'warning',
  EXTREME: 'danger'
}

const form = reactive({
  customerId: '',
  productType: 'CASH_LOAN',
  termMonths: 12,
  scenarioType: ''
})

function numVal(val) {
  if (val === undefined || val === null || val === '') return 0
  const num = Number(val)
  return isNaN(num) ? 0 : num
}

function strVal(val) {
  if (val === undefined || val === null || val === '') return '0'
  return String(val)
}

const conversionCurveList = computed(() => {
  if (!result.value || !result.value.conversionCurve) return []
  let curve = result.value.conversionCurve
  if (typeof curve === 'string') {
    try { curve = JSON.parse(curve) } catch (e) { return [] }
  }
  if (typeof curve !== 'object' || curve === null) return []
  return Object.entries(curve).map(([key, value]) => {
    let v = value
    if (typeof v === 'string') {
      try { v = JSON.parse(v) } catch (e) { v = {} }
    }
    return {
      rateKey: key,
      uplift: v.uplift ?? 0,
      rate: v.rate ?? 0,
      convProb: v.convProb ?? 0,
      incrProfit: v.incrProfit ?? 0
    }
  })
})

const scenarioData = computed(() => {
  if (!result.value || !result.value.scenario) return null
  let s = result.value.scenario
  if (typeof s === 'string') {
    try { s = JSON.parse(s) } catch (e) { return null }
  }
  if (typeof s !== 'object' || s === null) return null
  return {
    type: s.type || s.scenarioType || '',
    avgRate: s.avgRate ?? 0,
    netProfitRate: s.netProfitRate ?? 0
  }
})

function formatPercent(val) {
  const n = numVal(val)
  if (n <= 1) return (n * 100).toFixed(1) + '%'
  return n.toFixed(1) + '%'
}

function scenarioType(type) {
  return scenarioColorMap[type] || 'info'
}

function profitClass(val) {
  const n = numVal(val)
  if (n > 0) return 'profit-positive'
  if (n < 0) return 'profit-negative'
  return ''
}

async function handleSimulate() {
  if (!form.customerId || !form.customerId.trim()) {
    ElMessage.warning('请输入客户ID')
    return
  }
  if (!form.productType) {
    ElMessage.warning('请选择产品类型')
    return
  }
  
  loading.value = true
  result.value = null
  
  try {
    const params = {
      customerId: form.customerId.trim(),
      productType: form.productType
    }
    
    if (form.termMonths) params.termMonths = form.termMonths
    if (form.scenarioType) params.scenarioType = form.scenarioType
    
    const res = await strategySimulate(params)
    result.value = res
    ElMessage.success('策略模拟完成')
  } catch (e) {
    console.error('策略模拟失败', e)
    ElMessage.error('模拟失败：' + (e.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.customerId = ''
  form.productType = 'CASH_LOAN'
  form.termMonths = 12
  form.scenarioType = ''
  result.value = null
}
</script>

<style lang="scss" scoped>
.strategy-simulate-page {
  .input-card {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .card-title {
      font-size: 16px;
      font-weight: 600;
    }
  }
  
  .result-container {
    .section-title {
      font-size: 15px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .summary-card {
      border-radius: 10px;
      
      .recommend-summary {
        display: flex;
        gap: 20px;
        flex-wrap: wrap;
        
        .recommend-item {
          flex: 1;
          min-width: 140px;
          text-align: center;
          padding: 16px 12px;
          background: #f5f7fa;
          border-radius: 8px;
          
          &.main {
            background: linear-gradient(135deg, #ecf5ff 0%, #d9ecff 100%);
            border: 2px solid #409EFF;
          }
          
          .recommend-label {
            font-size: 13px;
            color: #606266;
            margin-bottom: 8px;
          }
          
          .recommend-value {
            font-size: 24px;
            font-weight: 700;
            color: #303133;
            
            &.primary { color: #409EFF; font-size: 28px; }
            &.success { color: #67C23A; }
            &.warning { color: #E6A23C; }
          }
        }
      }
    }
    
    .curve-card, .scenario-card {
      border-radius: 10px;
    }
    
    .empty-table-tip {
      text-align: center;
      padding: 20px;
      color: #909399;
      font-size: 13px;
    }
    
    .rate-recommended {
      font-weight: 600;
      color: #67C23A;
    }
    
    .profit-positive {
      color: #67C23A;
      font-weight: 600;
    }
    
    .profit-negative {
      color: #F56C6C;
      font-weight: 600;
    }
  }
}
</style>
