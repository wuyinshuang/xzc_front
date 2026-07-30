<template>
  <div class="app-container customer-report-page">
    <el-card shadow="never" class="input-card">
      <template #header>
        <span class="card-title">生成客户决策报告</span>
      </template>
      <el-form :model="form" ref="formRef" label-width="100px" :inline="true">
        <el-form-item label="客户ID" prop="customerId">
          <el-input v-model="form.customerId" placeholder="请输入客户ID" clearable style="width: 240px;" />
        </el-form-item>
        <el-form-item label="贷款金额(元)" prop="loanAmount">
          <el-input-number v-model="form.loanAmount" :min="1000" :precision="2" placeholder="贷款金额" controls-position="right" style="width: 180px;" />
        </el-form-item>
        <el-form-item label="贷款期数" prop="loanPeriod">
          <el-input-number v-model="form.loanPeriod" :min="1" :max="60" placeholder="期数" controls-position="right" style="width: 140px;" />
        </el-form-item>
        <el-form-item label="还款方式" prop="repaymentMethod">
          <el-select v-model="form.repaymentMethod" placeholder="请选择还款方式" style="width: 160px;">
            <el-option label="自动选择" value="AUTO" />
            <el-option label="等额本息(EPI)" value="EPI" />
            <el-option label="等额本金(EPP)" value="EPP" />
            <el-option label="先息后本(IFP)" value="IFP" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Document" @click="handleGenerate" :loading="loading">生成报告</el-button>
          <el-button icon="RefreshRight" @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div v-if="reportData" class="report-container">
      <el-card shadow="never" class="report-card">
        <template #header>
          <div class="report-header">
            <div>
              <span class="report-title">客户定价决策报告</span>
              <el-tag type="success" style="margin-left: 12px;">报告ID: {{ reportData.reportId }}</el-tag>
            </div>
            <div class="report-actions">
              <el-button icon="Printer" @click="handlePrint">打印</el-button>
              <el-button type="primary" icon="Download" @click="handleDownload">下载报告</el-button>
            </div>
          </div>
        </template>

        <div class="report-content" id="reportContent">
          <div class="report-meta">
            <el-descriptions :column="3" border size="small">
              <el-descriptions-item label="客户姓名">{{ reportData.customerName || '-' }}</el-descriptions-item>
              <el-descriptions-item label="客户ID">{{ reportData.customerId }}</el-descriptions-item>
              <el-descriptions-item label="生成时间">{{ formatTime(reportData.generatedAt) }}</el-descriptions-item>
            </el-descriptions>
          </div>

          <div class="greeting-section">
            <div class="section-icon"><el-icon :size="24"><ChatDotRound /></el-icon></div>
            <div class="greeting-text">{{ reportData.greeting }}</div>
          </div>

          <div class="pricing-result" v-if="myPricing">
            <el-divider content-position="left">定价方案概览</el-divider>
            <el-row :gutter="16">
              <el-col :span="6">
                <div class="stat-item">
                  <div class="stat-label">产品名称</div>
                  <div class="stat-value">{{ myPricing.productName || '个人消费贷款' }}</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-item highlight">
                  <div class="stat-label">最终年利率</div>
                  <div class="stat-value big primary">{{ myPricing.finalRate }}%</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-item">
                  <div class="stat-label">基础利率</div>
                  <div class="stat-value">{{ myPricing.baseRate }}%</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-item">
                  <div class="stat-label">智能上浮</div>
                  <div class="stat-value warning">+{{ myPricing.uplift }}%</div>
                </div>
              </el-col>
            </el-row>
            <el-row :gutter="16" style="margin-top: 12px;">
              <el-col :span="6">
                <div class="stat-item">
                  <div class="stat-label">贷款金额</div>
                  <div class="stat-value">¥{{ formatNumber(myPricing.loanAmount) }}</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-item">
                  <div class="stat-label">贷款期数</div>
                  <div class="stat-value">{{ myPricing.loanPeriod }} 期</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-item">
                  <div class="stat-label">风险等级</div>
                  <div class="stat-value">
                    <el-tag :type="riskLevelType(myPricing.riskLevel)">{{ myPricing.riskLevel }}</el-tag>
                  </div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-item">
                  <div class="stat-label">还款方式</div>
                  <div class="stat-value">{{ myPricing.repaymentMethodName || repaymentMethodMap[myPricing.repaymentMethod] || myPricing.repaymentMethod }}</div>
                </div>
              </el-col>
            </el-row>
            <div class="risk-desc" v-if="myPricing.riskLevelDescription">
              <el-alert :title="myPricing.riskLevelDescription" :type="riskLevelType(myPricing.riskLevel)" :closable="false" show-icon />
            </div>
            <div class="selection-reason" v-if="myPricing.selectionReason">
              <p class="note-text"><el-icon><InfoFilled /></el-icon> {{ myPricing.selectionReason }}</p>
            </div>
          </div>

          <div class="repayment-section" v-if="repayment">
            <el-divider content-position="left">还款计划明细</el-divider>
            <el-row :gutter="16">
              <el-col :span="6">
                <div class="stat-item">
                  <div class="stat-label">月供金额</div>
                  <div class="stat-value big success">¥{{ formatNumber(repayment.monthlyPayment) }}</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-item">
                  <div class="stat-label">总还款金额</div>
                  <div class="stat-value">¥{{ formatNumber(repayment.totalRepayment) }}</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-item">
                  <div class="stat-label">总利息</div>
                  <div class="stat-value danger">¥{{ formatNumber(repayment.totalInterest) }}</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-item">
                  <div class="stat-label">还款期数</div>
                  <div class="stat-value">{{ repayment.totalPeriods }} 期</div>
                </div>
              </el-col>
            </el-row>
          </div>

          <div class="explanation-section" v-if="explanation">
            <el-divider content-position="left">定价说明</el-divider>
            <div class="explanation-summary">
              <p>{{ explanation.summary }}</p>
            </div>
            
            <div v-if="explanation.positiveFactors && explanation.positiveFactors.length > 0" class="factors-section positive">
              <h4><el-icon><CircleCheckFilled /></el-icon> 有利因素</h4>
              <ul>
                <li v-for="(factor, idx) in explanation.positiveFactors" :key="'pos-' + idx">{{ factor }}</li>
              </ul>
            </div>
            
            <div v-if="explanation.negativeFactors && explanation.negativeFactors.length > 0" class="factors-section negative">
              <h4><el-icon><CircleCloseFilled /></el-icon> 不利因素</h4>
              <ul>
                <li v-for="(factor, idx) in explanation.negativeFactors" :key="'neg-' + idx">{{ factor }}</li>
              </ul>
            </div>
            
            <div v-if="explanation.calculationLogic" class="logic-section">
              <h4><el-icon><Cpu /></el-icon> 计算逻辑</h4>
              <p>{{ explanation.calculationLogic }}</p>
            </div>
            
            <div v-if="explanation.marketComparison" class="comparison-section">
              <h4><el-icon><DataLine /></el-icon> 市场对比</h4>
              <p>{{ explanation.marketComparison }}</p>
            </div>
          </div>

          <div class="report-footer">
            <el-divider />
            <p class="footer-text">本报告由鑫智策智能定价系统自动生成，仅供参考。</p>
            <p class="footer-time">生成时间：{{ formatTime(reportData.generatedAt) }}</p>
          </div>
        </div>
      </el-card>
    </div>

    <el-empty v-else-if="!loading" description="输入客户ID后点击生成报告" :image-size="120" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Document, RefreshRight, Printer, Download, ChatDotRound, InfoFilled, CircleCheckFilled, CircleCloseFilled, Cpu, DataLine } from '@element-plus/icons-vue'
import { generateCustomerReport } from '@/api/custom/report'

const route = useRoute()
const formRef = ref()
const loading = ref(false)
const reportData = ref(null)

const repaymentMethodMap = {
  AUTO: '自动选择',
  EPI: '等额本息',
  EPP: '等额本金',
  IFP: '先息后本'
}

const form = reactive({
  customerId: '',
  loanAmount: 300000,
  loanPeriod: 12,
  repaymentMethod: 'AUTO'
})

const myPricing = computed(() => {
  if (!reportData.value) return null
  if (typeof reportData.value.myPricing === 'string') {
    try {
      return JSON.parse(reportData.value.myPricing)
    } catch (e) {
      return null
    }
  }
  return reportData.value.myPricing
})

const repayment = computed(() => {
  if (!reportData.value) return null
  if (typeof reportData.value.repayment === 'string') {
    try {
      return JSON.parse(reportData.value.repayment)
    } catch (e) {
      return null
    }
  }
  return reportData.value.repayment
})

const explanation = computed(() => {
  if (!reportData.value) return null
  if (typeof reportData.value.explanation === 'string') {
    try {
      return JSON.parse(reportData.value.explanation)
    } catch (e) {
      return null
    }
  }
  return reportData.value.explanation
})

function formatTime(timeStr) {
  if (!timeStr) return '-'
  try {
    if (typeof timeStr === 'string') {
      return timeStr.replace('T', ' ').substring(0, 19)
    }
    return timeStr
  } catch (e) {
    return timeStr
  }
}

function formatNumber(num) {
  if (num === undefined || num === null) return '-'
  return Number(num).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function riskLevelType(level) {
  if (!level) return 'info'
  if (level.includes('极低') || level.includes('低')) return 'success'
  if (level.includes('中')) return 'warning'
  if (level.includes('高')) return 'danger'
  return 'info'
}

async function handleGenerate() {
  if (!form.customerId || !form.customerId.trim()) {
    ElMessage.warning('请输入客户ID')
    return
  }
  
  loading.value = true
  reportData.value = null
  
  try {
    const params = {}
    if (form.loanAmount) params.loanAmount = form.loanAmount
    if (form.loanPeriod) params.loanPeriod = form.loanPeriod
    if (form.repaymentMethod && form.repaymentMethod !== 'AUTO') params.repaymentMethod = form.repaymentMethod
    
    const res = await generateCustomerReport(form.customerId.trim(), params)
    reportData.value = res
    ElMessage.success('客户报告生成成功')
  } catch (e) {
    console.error('生成客户报告失败', e)
    ElMessage.error('生成报告失败：' + (e.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.customerId = ''
  form.loanAmount = 300000
  form.loanPeriod = 12
  form.repaymentMethod = 'AUTO'
  reportData.value = null
}

function handlePrint() {
  const printContent = document.getElementById('reportContent')
  if (printContent) {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>客户定价决策报告 - ${reportData.value.reportId}</title>
          <style>
            body { font-family: 'Microsoft YaHei', sans-serif; padding: 40px; }
            .stat-item { display: inline-block; width: 23%; margin: 8px 1%; padding: 12px; background: #f5f7fa; border-radius: 6px; text-align: center; }
            .stat-label { font-size: 13px; color: #909399; margin-bottom: 4px; }
            .stat-value { font-size: 16px; font-weight: 600; color: #303133; }
            .stat-value.big { font-size: 24px; }
            .stat-value.primary { color: #409EFF; }
            .stat-value.success { color: #67C23A; }
            .stat-value.warning { color: #E6A23C; }
            .stat-value.danger { color: #F56C6C; }
            .greeting-section { background: #ecf5ff; padding: 20px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #409EFF; }
            .positive { color: #67C23A; }
            .negative { color: #F56C6C; }
            ul { padding-left: 20px; }
            .footer-text { text-align: center; color: #909399; font-size: 12px; margin-top: 40px; }
            .footer-time { text-align: center; color: #c0c4cc; font-size: 11px; }
          </style>
        </head>
        <body>${printContent.innerHTML}</body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }
}

function handleDownload() {
  if (!reportData.value) return
  
  const content = generateMarkdownReport()
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `客户定价报告_${reportData.value.customerId}_${reportData.value.reportId}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  ElMessage.success('报告下载已开始')
}

function generateMarkdownReport() {
  const data = reportData.value
  const p = myPricing.value
  const r = repayment.value
  const e = explanation.value
  
  let md = `# 客户定价决策报告\n\n`
  md += `**报告ID**: ${data.reportId}\n`
  md += `**客户ID**: ${data.customerId}\n`
  md += `**客户姓名**: ${data.customerName || '-'}\n`
  md += `**生成时间**: ${formatTime(data.generatedAt)}\n\n`
  md += `---\n\n`
  md += `## 问候语\n\n${data.greeting}\n\n`
  
  if (p) {
    md += `## 定价方案概览\n\n`
    md += `- 产品名称: ${p.productName || '个人消费贷款'}\n`
    md += `- 贷款金额: ¥${formatNumber(p.loanAmount)}\n`
    md += `- 贷款期数: ${p.loanPeriod} 期\n`
    md += `- 最终年利率: **${p.finalRate}%** (基础利率 ${p.baseRate}% + 上浮 ${p.uplift}%)\n`
    md += `- 风险等级: ${p.riskLevel}\n`
    md += `- 还款方式: ${p.repaymentMethodName || repaymentMethodMap[p.repaymentMethod]}\n\n`
    if (p.riskLevelDescription) {
      md += `> ${p.riskLevelDescription}\n\n`
    }
  }
  
  if (r) {
    md += `## 还款计划明细\n\n`
    md += `- 月供金额: **¥${formatNumber(r.monthlyPayment)}**\n`
    md += `- 总还款金额: ¥${formatNumber(r.totalRepayment)}\n`
    md += `- 总利息: ¥${formatNumber(r.totalInterest)}\n`
    md += `- 还款期数: ${r.totalPeriods} 期\n\n`
  }
  
  if (e) {
    md += `## 定价说明\n\n${e.summary}\n\n`
    if (e.positiveFactors && e.positiveFactors.length > 0) {
      md += `### 有利因素\n\n`
      e.positiveFactors.forEach(f => { md += `- ${f}\n` })
      md += '\n'
    }
    if (e.negativeFactors && e.negativeFactors.length > 0) {
      md += `### 不利因素\n\n`
      e.negativeFactors.forEach(f => { md += `- ${f}\n` })
      md += '\n'
    }
    if (e.calculationLogic) {
      md += `### 计算逻辑\n\n${e.calculationLogic}\n\n`
    }
    if (e.marketComparison) {
      md += `### 市场对比\n\n${e.marketComparison}\n\n`
    }
  }
  
  md += `---\n\n`
  md += `*本报告由鑫智策智能定价系统自动生成，仅供参考。*\n`
  md += `*生成时间: ${formatTime(data.generatedAt)}*\n`
  
  return md
}

onMounted(() => {
  if (route.query.customerId) {
    form.customerId = route.query.customerId
    if (route.query.loanAmount) {
      form.loanAmount = Number(route.query.loanAmount)
    }
    if (route.query.loanPeriod) {
      form.loanPeriod = Number(route.query.loanPeriod)
    }
    handleGenerate()
  }
})
</script>

<style lang="scss" scoped>
.customer-report-page {
  .input-card {
    margin-bottom: 20px;
    
    .card-title {
      font-size: 16px;
      font-weight: 600;
    }
  }
  
  .report-container {
    .report-card {
      border-radius: 10px;
      
      .report-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .report-title {
          font-size: 16px;
          font-weight: 600;
        }
      }
      
      .report-content {
        .report-meta {
          margin-bottom: 20px;
        }
        
        .greeting-section {
          background: linear-gradient(135deg, #ecf5ff 0%, #f0f9eb 100%);
          padding: 20px 24px;
          border-radius: 10px;
          border-left: 4px solid #409EFF;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 20px;
          
          .section-icon {
            color: #409EFF;
            flex-shrink: 0;
            margin-top: 2px;
          }
          
          .greeting-text {
            font-size: 15px;
            line-height: 1.8;
            color: #303133;
          }
        }
        
        .stat-item {
          background: #f5f7fa;
          border-radius: 8px;
          padding: 16px;
          text-align: center;
          height: 100%;
          
          &.highlight {
            background: linear-gradient(135deg, #ecf5ff 0%, #d9ecff 100%);
            border: 1px solid #b3d8ff;
          }
          
          .stat-label {
            font-size: 13px;
            color: #909399;
            margin-bottom: 8px;
          }
          
          .stat-value {
            font-size: 16px;
            font-weight: 600;
            color: #303133;
            
            &.big {
              font-size: 22px;
            }
            
            &.primary { color: #409EFF; }
            &.success { color: #67C23A; }
            &.warning { color: #E6A23C; }
            &.danger { color: #F56C6C; }
          }
        }
        
        .risk-desc {
          margin-top: 16px;
        }
        
        .selection-reason {
          margin-top: 12px;
          
          .note-text {
            font-size: 13px;
            color: #909399;
            display: flex;
            align-items: center;
            gap: 6px;
            margin: 0;
          }
        }
        
        .explanation-section {
          .explanation-summary {
            background: #f5f7fa;
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 16px;
            line-height: 1.8;
            color: #303133;
          }
          
          .factors-section {
            margin-bottom: 16px;
            
            h4 {
              display: flex;
              align-items: center;
              gap: 6px;
              font-size: 14px;
              font-weight: 600;
              margin: 0 0 8px 0;
              
              &.positive { color: #67C23A; }
              &.negative { color: #F56C6C; }
            }
            
            &.positive h4 { color: #67C23A; }
            &.negative h4 { color: #F56C6C; }
            
            ul {
              margin: 0;
              padding-left: 24px;
              
              li {
                line-height: 1.8;
                color: #606266;
                font-size: 14px;
              }
            }
          }
          
          .logic-section, .comparison-section {
            margin-bottom: 16px;
            
            h4 {
              display: flex;
              align-items: center;
              gap: 6px;
              font-size: 14px;
              font-weight: 600;
              margin: 0 0 8px 0;
              color: #409EFF;
            }
            
            p {
              margin: 0;
              padding: 12px 16px;
              background: #fafafa;
              border-radius: 6px;
              line-height: 1.8;
              color: #606266;
              font-size: 14px;
            }
          }
        }
        
        .report-footer {
          margin-top: 40px;
          
          .footer-text {
            text-align: center;
            color: #909399;
            font-size: 13px;
            margin: 0 0 4px 0;
          }
          
          .footer-time {
            text-align: center;
            color: #c0c4cc;
            font-size: 12px;
            margin: 0;
          }
        }
      }
    }
  }
}

@media print {
  .input-card, .report-actions {
    display: none !important;
  }
}
</style>
