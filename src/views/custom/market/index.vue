<template>
  <div class="app-container">
    <el-card shadow="never" class="form-card">
      <template #header>
        <span class="card-title">生成营销决策报告</span>
      </template>
      <el-form :model="form" ref="formRef" label-width="100px" :rules="rules">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="产品类型" prop="productType">
              <el-select v-model="form.productType" placeholder="请选择产品类型" style="width: 100%;">
                <el-option label="现金贷" value="CASH_LOAN" />
                <el-option label="消费分期" value="CONSUMER_INSTALLMENT" />
                <el-option label="循环信贷" value="REVOLVING_CREDIT" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="期限(月)" prop="termMonths">
              <el-input-number v-model="form.termMonths" :min="1" :max="60" placeholder="请输入期限" style="width: 100%;" controls-position="right" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="情景类型" prop="scenarioType">
              <el-input v-model="form.scenarioType" placeholder="请输入情景类型（可选）" clearable style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="客户ID列表" prop="customerIds">
              <el-input
                v-model="customerIdsText"
                type="textarea"
                :rows="3"
                placeholder="请输入客户ID，多个ID用逗号、空格或换行分隔&#10;示例：C20260618000000000000000000002, C20260618000000000000000000003"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item style="text-align: center;">
          <el-button type="primary" icon="Document" @click="handleGenerate" :loading="loading">
            生成报告
          </el-button>
          <el-button icon="Refresh" @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-if="report" shadow="never" class="report-card" v-loading="loading">
      <template #header>
        <div class="report-header">
          <span class="card-title">{{ report.title }}</span>
          <div class="report-meta-tags">
            <el-tag type="primary">产品：{{ productTypeMap[report.productType] || report.productType }}</el-tag>
            <el-tag type="success">期限：{{ report.termMonths }}个月</el-tag>
            <el-tag type="warning">客群规模：{{ report.customerCount }}人</el-tag>
            <el-tag type="info" v-if="report.reportId">报告ID：{{ report.reportId }}</el-tag>
          </div>
        </div>
      </template>

      <div class="report-content">
        <div v-if="report.background" class="report-section">
          <h3>1. 项目背景</h3>
          <p class="section-text">{{ report.background }}</p>
        </div>

        <div v-if="report.marketAnalysis" class="report-section">
          <h3>2. 市场分析与竞品对比</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="竞品数量" v-if="report.marketAnalysis.competitorCount !== undefined">
              {{ report.marketAnalysis.competitorCount }}
            </el-descriptions-item>
            <el-descriptions-item label="竞品平均利率" v-if="report.marketAnalysis.competitorAvgRate !== undefined">
              {{ formatPercent(report.marketAnalysis.competitorAvgRate) }}
            </el-descriptions-item>
            <el-descriptions-item label="市场定位" :span="2" v-if="report.marketAnalysis.positioning">
              {{ report.marketAnalysis.positioning }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div v-if="report.customerGroup" class="report-section">
          <h3>3. 目标客群分析</h3>
          <el-row :gutter="16" class="stat-row">
            <el-col :span="6" v-if="report.customerGroup.totalCount !== undefined">
              <div class="stat-item">
                <div class="stat-label">客群总数</div>
                <div class="stat-value">{{ report.customerGroup.totalCount }}</div>
              </div>
            </el-col>
            <el-col :span="6" v-if="report.customerGroup.avgPd !== undefined">
              <div class="stat-item">
                <div class="stat-label">平均PD</div>
                <div class="stat-value">{{ formatPercent(report.customerGroup.avgPd) }}</div>
              </div>
            </el-col>
            <el-col :span="6" v-if="report.customerGroup.avgLtv !== undefined">
              <div class="stat-item">
                <div class="stat-label">平均LTV</div>
                <div class="stat-value">{{ formatPercent(report.customerGroup.avgLtv) }}</div>
              </div>
            </el-col>
            <el-col :span="6" v-if="report.customerGroup.dominantSensitivityGroup">
              <div class="stat-item">
                <div class="stat-label">主导敏感度分组</div>
                <div class="stat-value">{{ report.customerGroup.dominantSensitivityGroup }}</div>
              </div>
            </el-col>
          </el-row>
          <div v-if="report.customerGroup.sensitivityDistribution" class="sub-section">
            <h4>敏感度分布</h4>
            <div class="tag-list">
              <el-tag v-for="(count, group) in report.customerGroup.sensitivityDistribution" :key="group" class="dist-tag">
                {{ group }}: {{ count }}人
              </el-tag>
            </div>
          </div>
          <div v-if="report.customerGroup.engine1Model" class="sub-section">
            <h4>引擎一模型信息</h4>
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item label="模型版本">
                {{ report.customerGroup.engine1Model.modelVersion || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="风险档位">
                {{ report.customerGroup.riskLevel || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="预测PD" v-if="report.customerGroup.predictedPd !== undefined">
                {{ formatPercent(report.customerGroup.predictedPd) }}
              </el-descriptions-item>
              <el-descriptions-item label="风险溢价" v-if="report.customerGroup.riskPremium !== undefined">
                {{ formatPercent(report.customerGroup.riskPremium) }}
              </el-descriptions-item>
              <el-descriptions-item label="基础利率" v-if="report.customerGroup.baseRate !== undefined">
                {{ formatPercent(report.customerGroup.baseRate) }}
              </el-descriptions-item>
            </el-descriptions>
            <p v-if="report.customerGroup.calculationBasis" class="calc-basis">{{ report.customerGroup.calculationBasis }}</p>
            <div v-if="report.customerGroup.positiveFactors?.length" class="factors">
              <span class="factor-label positive">正向因素：</span>
              <el-tag v-for="(f, i) in report.customerGroup.positiveFactors" :key="'p'+i" type="success" size="small" class="factor-tag">{{ f }}</el-tag>
            </div>
            <div v-if="report.customerGroup.negativeFactors?.length" class="factors">
              <span class="factor-label negative">负向因素：</span>
              <el-tag v-for="(f, i) in report.customerGroup.negativeFactors" :key="'n'+i" type="danger" size="small" class="factor-tag">{{ f }}</el-tag>
            </div>
          </div>
        </div>

        <div v-if="report.pricing" class="report-section">
          <h3>4. 定价测算</h3>
          <pre class="json-pre">{{ formatJson(report.pricing) }}</pre>
        </div>

        <div v-if="report.scenario" class="report-section">
          <h3>5. 风险与收益模拟</h3>
          <pre class="json-pre">{{ formatJson(report.scenario) }}</pre>
        </div>

        <div v-if="report.compliance" class="report-section">
          <h3>6. 合规校验结论</h3>
          <div v-if="typeof report.compliance === 'string'" class="section-text">{{ report.compliance }}</div>
          <pre v-else class="json-pre">{{ formatJson(report.compliance) }}</pre>
        </div>

        <div v-if="report.abtestSummary" class="report-section">
          <h3>7. ABtest效果对比</h3>
          <p class="section-text">{{ report.abtestSummary }}</p>
        </div>

        <div v-if="report.recommendations?.length" class="report-section">
          <h3>8. 实施建议</h3>
          <ul class="recommend-list">
            <li v-for="(rec, i) in report.recommendations" :key="i">{{ rec }}</li>
          </ul>
        </div>

        <div v-if="report.generatedAt" class="generated-time">
          生成时间：{{ report.generatedAt }}
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup name="CustomMarket">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { generatePricingReport } from '@/api/custom/market'

const formRef = ref(null)
const loading = ref(false)
const report = ref(null)
const customerIdsText = ref('')

const productTypeMap = {
  'CASH_LOAN': '现金贷',
  'CONSUMER_INSTALLMENT': '消费分期',
  'REVOLVING_CREDIT': '循环信贷'
}

const form = reactive({
  productType: 'CASH_LOAN',
  termMonths: 12,
  scenarioType: '',
  customerIds: []
})

const rules = {
  productType: [
    { required: true, message: '请选择产品类型', trigger: 'change' }
  ],
  termMonths: [
    { required: true, message: '请输入期限', trigger: 'blur' }
  ]
}

function parseCustomerIds() {
  if (!customerIdsText.value.trim()) return []
  return customerIdsText.value
    .split(/[\s,，\n]+/)
    .map(id => id.trim())
    .filter(id => id.length > 0)
}

function formatPercent(val) {
  if (val === null || val === undefined) return '-'
  const num = Number(val)
  if (isNaN(num)) return val
  return (num * 100).toFixed(2) + '%'
}

function formatJson(obj) {
  if (!obj) return ''
  try {
    return JSON.stringify(obj, null, 2)
  } catch (e) {
    return String(obj)
  }
}

async function handleGenerate() {
  form.customerIds = parseCustomerIds()
  if (form.customerIds.length === 0) {
    ElMessage.warning('请输入至少一个客户ID')
    return
  }
  if (!formRef.value) return
  
  formRef.value.validate(async (valid) => {
    if (!valid) return
    
    loading.value = true
    report.value = null
    
    try {
      const params = {
        customerIds: form.customerIds,
        productType: form.productType,
        termMonths: form.termMonths
      }
      if (form.scenarioType && form.scenarioType.trim()) {
        params.scenarioType = form.scenarioType.trim()
      }
      
      const res = await generatePricingReport(params)
      
      if (res.error) {
        ElMessage.error(res.error)
        return
      }
      
      report.value = res
      ElMessage.success('报告生成成功')
    } catch (e) {
      console.error('生成报告失败', e)
      ElMessage.error('生成报告失败：' + (e.message || ''))
    } finally {
      loading.value = false
    }
  })
}

function resetForm() {
  formRef.value?.resetFields()
  customerIdsText.value = ''
  form.productType = 'CASH_LOAN'
  form.termMonths = 12
  form.scenarioType = ''
  form.customerIds = []
  report.value = null
}
</script>

<style lang="scss" scoped>
.form-card {
  margin-bottom: 20px;
}
.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}
.report-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}
.report-meta-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.report-content {
  padding: 0 10px;
}
.report-section {
  margin-bottom: 28px;
}
.report-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #409eff;
  border-left: 4px solid #409eff;
  padding-left: 10px;
  margin: 0 0 14px 0;
}
.report-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #606266;
  margin: 16px 0 10px 0;
}
.section-text {
  line-height: 1.8;
  color: #303133;
  font-size: 14px;
  text-align: justify;
}
.stat-row {
  margin-bottom: 16px;
}
.stat-item {
  background: #f5f7fa;
  border-radius: 6px;
  padding: 14px;
  text-align: center;
}
.stat-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 6px;
}
.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
}
.tag-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.dist-tag {
  font-size: 13px;
}
.calc-basis {
  margin: 12px 0;
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
  font-style: italic;
}
.factors {
  margin-top: 8px;
  font-size: 13px;
}
.factor-label {
  font-weight: 600;
  margin-right: 6px;
  &.positive { color: #67c23a; }
  &.negative { color: #f56c6c; }
}
.factor-tag {
  margin-right: 6px;
  margin-bottom: 4px;
}
.json-pre {
  background: #f5f7fa;
  border-radius: 4px;
  padding: 14px;
  font-size: 12px;
  line-height: 1.6;
  overflow-x: auto;
  color: #606266;
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
}
.recommend-list {
  padding-left: 20px;
  line-height: 2;
  color: #303133;
  font-size: 14px;
}
.generated-time {
  text-align: right;
  color: #909399;
  font-size: 12px;
  padding-top: 20px;
  border-top: 1px dashed #dcdfe6;
}
</style>
