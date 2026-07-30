<template>
  <div class="app-container calculate-page">
    <el-card shadow="never" class="input-card">
      <template #header>
        <span class="card-title">客户定价测算</span>
      </template>
      <el-form :model="form" ref="formRef" label-width="100px" :inline="true">
        <el-form-item label="客户ID" prop="customerId">
          <el-input v-model="form.customerId" placeholder="请输入客户ID" clearable style="width: 200px;" />
        </el-form-item>
        <el-form-item label="贷款金额" prop="loanAmount">
          <el-input-number v-model="form.loanAmount" :min="0" :precision="2" placeholder="请输入贷款金额" controls-position="right" style="width: 180px;" />
        </el-form-item>
        <el-form-item label="期限(月)" prop="loanPeriod">
          <el-input-number v-model="form.loanPeriod" :min="1" :max="60" placeholder="请输入期限" controls-position="right" style="width: 150px;" />
        </el-form-item>
        <el-form-item>
          <el-button type="info" icon="Check" @click="handleFeatureCheck" :loading="loading.featureCheck">特征检查</el-button>
          <el-button type="primary" icon="Money" @click="handleRealtimePricing" :loading="loading.realtimePricing">实时定价</el-button>
          <el-button type="success" icon="Setting" @click="handleAdvancedPricingOpen" :loading="loading.advancedPricing">高级定价</el-button>
          <el-button type="warning" icon="DataLine" @click="handleLoadChart" :loading="loading.chart">加载曲线图表</el-button>
          <el-button type="primary" icon="Document" @click="goToReport" plain>生成客户报告</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="20" class="result-row" v-if="hasResult">
      <el-col :span="chartVisible ? 14 : 24">
        <el-card shadow="never" class="result-card" v-if="featureCheckResult !== null">
          <template #header>
            <div class="card-header">
              <span class="result-title">特征检查结果</span>
              <el-tag :type="featureCheckResult.dataComplete ? 'success' : 'warning'">
                {{ featureCheckResult.dataComplete ? '数据完整，可直接定价' : '存在缺失特征' }}
              </el-tag>
            </div>
          </template>
          <div v-loading="loading.featureCheck">
            <template v-if="featureCheckResult && typeof featureCheckResult === 'object'">
              <el-alert 
                :title="featureCheckResult.summary || '检查完成'" 
                :type="featureCheckResult.dataComplete ? 'success' : 'warning'"
                :closable="false"
                style="margin-bottom: 12px;"
              />
              <el-descriptions :column="2" border size="small">
                <el-descriptions-item label="客户ID">{{ form.customerId }}</el-descriptions-item>
                <el-descriptions-item label="数据是否完整">
                  <el-tag :type="featureCheckResult.dataComplete ? 'success' : 'danger'">
                    {{ featureCheckResult.dataComplete ? '是' : '否' }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="缺失字段" :span="2" v-if="featureCheckResult.missingFields && featureCheckResult.missingFields.length > 0">
                  <div class="warning-list">
                    <el-tag v-for="(field, idx) in featureCheckResult.missingFields" :key="'miss-' + idx" type="danger" style="margin: 2px;">{{ fieldNameMap[field] || field }}</el-tag>
                  </div>
                </el-descriptions-item>
                <el-descriptions-item label="建议补充字段" :span="2" v-if="featureCheckResult.suggestedFields && featureCheckResult.suggestedFields.length > 0">
                  <div class="warning-list">
                    <el-tag v-for="(field, idx) in featureCheckResult.suggestedFields" :key="'sug-' + idx" type="warning" effect="plain" style="margin: 2px;">{{ fieldNameMap[field] || field }}</el-tag>
                  </div>
                  <div style="margin-top: 8px; color: #909399; font-size: 12px;">
                    提示：可点击"高级定价"按钮手动覆盖特征进行定价
                  </div>
                </el-descriptions-item>
              </el-descriptions>
            </template>
            <pre v-else-if="typeof featureCheckResult === 'object'" class="json-pre">{{ JSON.stringify(featureCheckResult, null, 2) }}</pre>
            <div v-else>{{ featureCheckResult }}</div>
          </div>
        </el-card>

        <el-card shadow="never" class="result-card" v-if="pricingResult !== null">
          <template #header>
            <div class="card-header">
              <span class="result-title">{{ pricingType === 'realtime' ? '实时定价结果' : '高级定价结果' }}</span>
              <div>
                <el-tag :type="pricingResult.degraded ? 'danger' : 'success'" style="margin-right: 8px;">
                  {{ pricingResult.degraded ? '已降级' : '正常定价' }}
                </el-tag>
                <el-tag :type="pricingResult.dataComplete ? 'success' : 'warning'" v-if="pricingResult.dataComplete !== undefined">
                  {{ pricingResult.dataComplete ? '数据完整' : '数据不完整' }}
                </el-tag>
                <el-tag type="info" style="margin-left: 8px;" v-if="pricingResult.elapsedMs">耗时: {{ pricingResult.elapsedMs }}ms</el-tag>
              </div>
            </div>
          </template>
          <div v-loading="loading[pricingType === 'realtime' ? 'realtimePricing' : 'advancedPricing']">
            <el-descriptions :column="2" border size="small" v-if="pricingResult && typeof pricingResult === 'object'">
              <el-descriptions-item label="决策ID" :span="2">{{ pricingResult.decisionId || '-' }}</el-descriptions-item>
              <el-descriptions-item label="客户ID">{{ pricingResult.customerId || form.customerId }}</el-descriptions-item>
              <el-descriptions-item label="是否降级" v-if="pricingResult.degraded !== undefined">
                <el-tag :type="pricingResult.degraded ? 'danger' : 'success'">
                  {{ pricingResult.degraded ? '是' : '否' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="风控档位利率">
                <span class="rate-text">{{ pricingResult.riskTierRate !== undefined ? pricingResult.riskTierRate + '%' : '-' }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="最优建议利率">
                <span class="rate-text primary">{{ pricingResult.optimalRate !== undefined ? pricingResult.optimalRate + '%' : '-' }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="最优上浮幅度">
                <span class="uplift-text">{{ pricingResult.optimalUplift !== undefined ? '+' + pricingResult.optimalUplift + '%' : '-' }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="预期增量利润" v-if="pricingResult.expectedIncrementalProfit !== undefined">{{ pricingResult.expectedIncrementalProfit }}%</el-descriptions-item>
              <el-descriptions-item label="状态原因" v-if="pricingResult.reason">{{ pricingResult.reason }}</el-descriptions-item>
              <el-descriptions-item label="是否生成报告" v-if="pricingResult.reportGenerated !== undefined">
                <el-tag :type="pricingResult.reportGenerated ? 'success' : 'info'">
                  {{ pricingResult.reportGenerated ? '是' : '否' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="定价报告ID" v-if="pricingResult.reportId">{{ pricingResult.reportId }}</el-descriptions-item>
              <el-descriptions-item label="使用覆盖特征" :span="2" v-if="advancedForm && hasAdvancedFeatures">
                <div class="warning-list">
                  <el-tag v-for="(val, key) in getUsedAdvancedFeatures()" :key="key" type="primary" effect="plain" style="margin: 2px;">
                    {{ fieldNameMap[key] || key }}: {{ val }}
                  </el-tag>
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="特征警告" :span="2" v-if="pricingResult.featureWarnings && pricingResult.featureWarnings.length > 0">
                <div class="warning-list">
                  <el-tag v-for="(warning, idx) in pricingResult.featureWarnings" :key="idx" type="warning" style="margin: 2px;">{{ warning }}</el-tag>
                </div>
              </el-descriptions-item>
            </el-descriptions>
            <pre v-else-if="typeof pricingResult === 'object'" class="json-pre">{{ JSON.stringify(pricingResult, null, 2) }}</pre>
          </div>
        </el-card>
      </el-col>

      <el-col :span="10" v-if="chartVisible">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="result-title">转化概率曲线</span>
              <div v-if="curveData">
                <el-tag type="primary" style="margin-right: 6px;">基础利率: {{ curveData.baseRate }}%</el-tag>
                <el-tag :type="sensitivityTagType" style="margin-right: 6px;">敏感度: {{ sensitivityGroupMap[curveData.sensitivityGroup] || curveData.sensitivityGroup }}</el-tag>
                <el-tag type="info">{{ predictionVersionMap[curveData.predictionVersion] || curveData.predictionVersion }}</el-tag>
              </div>
            </div>
          </template>
          <div class="chart-summary" v-if="curveData && curveData.candidates">
            <div class="summary-item" v-for="(cand, idx) in curveData.candidates" :key="idx">
              <div class="cand-rate">{{ cand.rate }}%</div>
              <div class="cand-uplift" :class="cand.uplift >= 0 ? 'positive' : 'negative'">{{ cand.uplift >= 0 ? '+' : '' }}{{ cand.uplift }}%</div>
              <div class="cand-prob">转化 {{ cand.convProb <= 1 ? (cand.convProb * 100).toFixed(1) + '%' : cand.convProb + '%' }}</div>
              <div class="cand-profit">利润 {{ cand.incrProfit }}%</div>
            </div>
          </div>
          <div ref="chartRef" class="chart-container" v-loading="loading.chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog title="高级定价 - 特征覆盖" v-model="advancedOpen" width="600px" append-to-body>
      <el-alert
        title="高级定价支持手动覆盖客户特征，适用于特征缺失或What-If模拟场景"
        type="info"
        :closable="false"
        style="margin-bottom: 16px;"
      />
      <el-form :model="advancedForm" ref="advancedFormRef" label-width="120px">
        <el-form-item label="客户ID">
          <el-input v-model="advancedForm.customerId" disabled />
        </el-form-item>
        <el-divider content-position="left">手动覆盖特征（选填）</el-divider>
        <el-form-item label="月公积金缴存额">
          <el-input-number v-model="advancedForm.housingFund" :min="0" :precision="2" placeholder="元/月" controls-position="right" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="学历">
          <el-select v-model="advancedForm.education" placeholder="请选择学历" clearable style="width: 100%;">
            <el-option label="高中" value="高中" />
            <el-option label="大专" value="大专" />
            <el-option label="本科" value="本科" />
            <el-option label="硕士" value="硕士" />
            <el-option label="博士" value="博士" />
          </el-select>
        </el-form-item>
        <el-form-item label="行业">
          <el-input v-model="advancedForm.industry" placeholder="请输入行业" clearable />
        </el-form-item>
        <el-form-item label="地区">
          <el-input v-model="advancedForm.region" placeholder="请输入地区" clearable />
        </el-form-item>
        <el-form-item label="婚姻状况">
          <el-select v-model="advancedForm.maritalStatus" placeholder="请选择婚姻状况" clearable style="width: 100%;">
            <el-option label="未婚" value="未婚" />
            <el-option label="已婚" value="已婚" />
            <el-option label="离异" value="离异" />
          </el-select>
        </el-form-item>
        <el-form-item label="贷款金额">
          <el-input-number v-model="advancedForm.loanAmount" :min="0" :precision="2" controls-position="right" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="期限(月)">
          <el-input-number v-model="advancedForm.loanPeriod" :min="1" :max="60" controls-position="right" style="width: 100%;" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="advancedOpen = false">取消</el-button>
        <el-button type="primary" @click="submitAdvancedPricing" :loading="loading.advancedPricing">开始定价</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { checkCustomerFeature, realtimePricing, realtimeAdvancedPricing, getConversionCurve } from '@/api/custom/calculate'

const router = useRouter()
const formRef = ref()
const advancedFormRef = ref()
const chartRef = ref()
let chartInstance = null

const fieldNameMap = {
  housingFund: '月公积金缴存额',
  education: '学历',
  industry: '行业',
  region: '地区',
  maritalStatus: '婚姻状况'
}

const sensitivityGroupMap = {
  HIGH: '高敏感',
  MID: '中敏感',
  LOW: '低敏感'
}

const predictionVersionMap = {
  V0_RULE: '规则版本V0',
  V1_MODEL: '模型版本V1'
}

const advancedFieldLabelMap = {
  housingFund: '月公积金',
  education: '学历',
  industry: '行业',
  region: '地区',
  maritalStatus: '婚姻'
}

const sensitivityTagType = computed(() => {
  if (!curveData.value) return ''
  const type = curveData.value.sensitivityGroup
  if (type === 'HIGH') return 'danger'
  if (type === 'MID') return 'warning'
  return 'success'
})

const form = reactive({
  customerId: '',
  loanAmount: 300000,
  loanPeriod: 12
})

const advancedOpen = ref(false)
const advancedForm = reactive({
  customerId: '',
  housingFund: undefined,
  education: '',
  industry: '',
  region: '',
  maritalStatus: '',
  loanAmount: 300000,
  loanPeriod: 12
})

const loading = reactive({
  featureCheck: false,
  realtimePricing: false,
  advancedPricing: false,
  chart: false
})

const featureCheckResult = ref(null)
const pricingResult = ref(null)
const pricingType = ref('')
const chartVisible = ref(false)
const curveData = ref(null)

const hasResult = computed(() => {
  return featureCheckResult.value !== null || pricingResult.value !== null || chartVisible.value
})

const hasAdvancedFeatures = computed(() => {
  return !!(advancedForm.housingFund || advancedForm.education || advancedForm.industry || advancedForm.region || advancedForm.maritalStatus)
})

function validateCustomerId() {
  if (!form.customerId || !form.customerId.trim()) {
    ElMessage.warning('请输入客户ID')
    return false
  }
  return true
}

function goToReport() {
  if (!validateCustomerId()) return
  router.push({
    path: '/info/report',
    query: {
      customerId: form.customerId.trim(),
      loanAmount: form.loanAmount,
      loanPeriod: form.loanPeriod
    }
  })
}

function getUsedAdvancedFeatures() {
  const result = {}
  if (advancedForm.housingFund) result.housingFund = advancedForm.housingFund + '元'
  if (advancedForm.education) result.education = advancedForm.education
  if (advancedForm.industry) result.industry = advancedForm.industry
  if (advancedForm.region) result.region = advancedForm.region
  if (advancedForm.maritalStatus) result.maritalStatus = advancedForm.maritalStatus
  return result
}

async function handleFeatureCheck() {
  if (!validateCustomerId()) return
  
  loading.featureCheck = true
  featureCheckResult.value = null
  
  try {
    const res = await checkCustomerFeature(form.customerId.trim())
    if (res.error) {
      ElMessage.error(res.error)
      return
    }
    featureCheckResult.value = res
    if (res.dataComplete) {
      ElMessage.success(res.summary || '特征检查完成，数据完整')
    } else {
      ElMessage.warning(res.summary || '检测到缺失特征')
    }
  } catch (e) {
    console.error('特征检查失败', e)
    ElMessage.error('特征检查失败：' + (e.message || ''))
  } finally {
    loading.featureCheck = false
  }
}

async function handleRealtimePricing() {
  if (!validateCustomerId()) return
  
  loading.realtimePricing = true
  pricingResult.value = null
  pricingType.value = 'realtime'
  
  try {
    const params = {
      customerId: form.customerId.trim(),
      generateReport: true,
      loanAmount: form.loanAmount,
      loanPeriod: form.loanPeriod
    }
    
    const res = await realtimePricing(params)
    if (res.error) {
      ElMessage.error(res.error)
      return
    }
    pricingResult.value = res
    if (res.reportGenerated && res.reportId) {
      ElMessage.success('定价完成，已生成报告：' + res.reportId)
    } else {
      ElMessage.success('定价完成')
    }
    if (chartVisible.value && curveData.value) {
      await nextTick()
      renderChart(curveData.value)
    }
  } catch (e) {
    console.error('实时定价失败', e)
    ElMessage.error('实时定价失败：' + (e.message || ''))
  } finally {
    loading.realtimePricing = false
  }
}

function handleAdvancedPricingOpen() {
  if (!validateCustomerId()) return
  advancedForm.customerId = form.customerId.trim()
  advancedForm.loanAmount = form.loanAmount
  advancedForm.loanPeriod = form.loanPeriod
  advancedForm.housingFund = undefined
  advancedForm.education = ''
  advancedForm.industry = ''
  advancedForm.region = ''
  advancedForm.maritalStatus = ''
  advancedOpen.value = true
}

async function submitAdvancedPricing() {
  if (!advancedForm.customerId) {
    ElMessage.warning('请输入客户ID')
    return
  }
  
  loading.advancedPricing = true
  pricingResult.value = null
  pricingType.value = 'advanced'
  
  try {
    const params = {
      customerId: advancedForm.customerId,
      generateReport: true,
      loanAmount: advancedForm.loanAmount,
      loanPeriod: advancedForm.loanPeriod
    }
    
    if (advancedForm.housingFund && advancedForm.housingFund > 0) {
      params.housingFund = advancedForm.housingFund
    }
    if (advancedForm.education && advancedForm.education.trim()) {
      params.education = advancedForm.education.trim()
    }
    if (advancedForm.industry && advancedForm.industry.trim()) {
      params.industry = advancedForm.industry.trim()
    }
    if (advancedForm.region && advancedForm.region.trim()) {
      params.region = advancedForm.region.trim()
    }
    if (advancedForm.maritalStatus && advancedForm.maritalStatus.trim()) {
      params.maritalStatus = advancedForm.maritalStatus.trim()
    }
    
    const res = await realtimeAdvancedPricing(params)
    if (res.error) {
      ElMessage.error(res.error)
      return
    }
    pricingResult.value = res
    advancedOpen.value = false
    if (res.reportGenerated && res.reportId) {
      ElMessage.success('高级定价完成，已生成报告：' + res.reportId)
    } else {
      ElMessage.success('高级定价完成')
    }
    if (chartVisible.value && curveData.value) {
      await nextTick()
      renderChart(curveData.value)
    }
  } catch (e) {
    console.error('高级定价失败', e)
    ElMessage.error('高级定价失败：' + (e.message || ''))
  } finally {
    loading.advancedPricing = false
  }
}

async function handleLoadChart() {
  if (!validateCustomerId()) return
  
  loading.chart = true
  chartVisible.value = true
  
  try {
    const res = await getConversionCurve(form.customerId.trim())
    if (res.error) {
      ElMessage.error(res.error)
      return
    }
    curveData.value = res
    
    await nextTick()
    renderChart(res)
    ElMessage.success('曲线图表加载完成')
  } catch (e) {
    console.error('加载曲线图表失败', e)
    ElMessage.error('加载曲线图表失败：' + (e.message || ''))
  } finally {
    loading.chart = false
  }
}

function renderChart(data) {
  if (!chartRef.value) return
  
  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }
  
  let candidates = []
  
  if (data.candidates && Array.isArray(data.candidates)) {
    candidates = data.candidates
  } else if (Array.isArray(data)) {
    candidates = data
  } else if (data.points && Array.isArray(data.points)) {
    candidates = data.points.map(p => ({
      rate: p.rate || p[0],
      convProb: p.probability || p.conversion || p[1],
      incrProfit: p.profit || p.incrProfit || p[2] || 0
    }))
  }
  
  const xAxisData = candidates.map(c => c.rate)
  const convProbData = candidates.map(c => {
    let v = c.convProb
    if (v > 1) v = v / 100
    return v
  })
  const profitData = candidates.map(c => Number(c.incrProfit) || 0)
  
  let optimalRate = null
  if (pricingResult.value && pricingResult.value.recommendedRate) {
    optimalRate = pricingResult.value.recommendedRate
  }
  
  const markPointData = optimalRate ? [{
    name: '最优利率',
    xAxis: optimalRate,
    yAxis: convProbData[xAxisData.indexOf(optimalRate)] || 0.5,
    value: '推荐',
    itemStyle: { color: '#67C23A' }
  }] : []
  
  const option = {
    title: {
      text: '利率-转化概率/增量利润曲线',
      left: 'center',
      textStyle: { fontSize: 14 }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: function(params) {
        let result = `利率: ${params[0].name}%<br/>`
        params.forEach(p => {
          if (p.seriesName === '转化概率') {
            let val = p.value
            if (val <= 1) val = val * 100
            result += `转化概率: ${val.toFixed(1)}%<br/>`
          } else if (p.seriesName === '增量利润') {
            result += `增量利润: ${p.value.toFixed(2)}%<br/>`
          }
        })
        return result
      }
    },
    legend: {
      data: ['转化概率', '增量利润'],
      top: 25
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '25%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      name: '利率(%)',
      nameLocation: 'middle',
      nameGap: 25
    },
    yAxis: [
      {
        type: 'value',
        name: '转化概率',
        position: 'left',
        min: 0,
        max: 1,
        axisLabel: {
          formatter: function(val) {
            return (val * 100).toFixed(0) + '%'
          }
        }
      },
      {
        type: 'value',
        name: '增量利润(%)',
        position: 'right',
        axisLabel: {
          formatter: '{value}%'
        }
      }
    ],
    series: [
      {
        name: '转化概率',
        type: 'line',
        yAxisIndex: 0,
        smooth: true,
        data: convProbData,
        lineStyle: {
          width: 3,
          color: '#409EFF'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
          ])
        },
        itemStyle: { color: '#409EFF' },
        markPoint: {
          data: markPointData,
          symbol: 'pin',
          symbolSize: 50
        }
      },
      {
        name: '增量利润',
        type: 'bar',
        yAxisIndex: 1,
        data: profitData,
        itemStyle: {
          color: function(params) {
            return params.value >= 0 ? '#67C23A' : '#F56C6C'
          },
          opacity: 0.6
        }
      }
    ]
  }
  
  if (optimalRate !== null) {
    option.series[0].markLine = {
      symbol: 'none',
      data: [{ xAxis: optimalRate.toString() }],
      label: {
        formatter: '推荐利率: {c}%',
        position: 'end'
      },
      lineStyle: {
        color: '#67C23A',
        width: 2,
        type: 'dashed'
      }
    }
  }
  
  chartInstance.setOption(option, true)
}

function handleResize() {
  if (chartInstance) {
    chartInstance.resize()
  }
}

window.addEventListener('resize', handleResize)

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>

<style lang="scss" scoped>
.calculate-page {
  .input-card {
    margin-bottom: 20px;
  }
  
  .card-title {
    font-size: 16px;
    font-weight: 600;
  }
  
  .result-row {
    .result-card {
      margin-bottom: 20px;
    }
    
    .chart-card {
      margin-bottom: 20px;
      min-height: 400px;
    }
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .result-title {
    font-size: 15px;
    font-weight: 600;
  }
  
  .warning-list {
    line-height: 2;
  }
  
  .rate-text {
    font-weight: 600;
    font-size: 14px;
    &.primary {
      color: #409EFF;
      font-size: 16px;
    }
  }
  
  .uplift-text {
    color: #67C23A;
    font-weight: 600;
  }
  
  .json-pre {
    background: #f5f7fa;
    padding: 12px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    line-height: 1.5;
    overflow-x: auto;
    margin: 0;
  }
  
  .chart-container {
    width: 100%;
    height: 380px;
  }
  
  .chart-summary {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
    flex-wrap: wrap;
    
    .summary-item {
      flex: 1;
      min-width: 100px;
      background: #f5f7fa;
      border-radius: 6px;
      padding: 8px;
      text-align: center;
      
      .cand-rate {
        font-weight: 600;
        font-size: 15px;
        color: #303133;
      }
      
      .cand-uplift {
        font-size: 12px;
        font-weight: 500;
        margin: 2px 0;
        
        &.positive { color: #67C23A; }
        &.negative { color: #F56C6C; }
      }
      
      .cand-prob {
        font-size: 12px;
        color: #409EFF;
      }
      
      .cand-profit {
        font-size: 12px;
        color: #909399;
      }
    }
  }
}
</style>
