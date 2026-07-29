<template>
  <div class="app-container customer-summary-page">
    <el-card shadow="never" class="input-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">客户统计摘要</span>
        </div>
      </template>

      <el-form label-width="120px">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="客户ID列表" required>
              <el-input
                v-model="customerIdsText"
                type="textarea"
                :rows="4"
                placeholder="请输入客户ID，多个ID用逗号、空格或换行分隔&#10;示例：C20260618000000000000000000002, C20260618000000000000000000005"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24" style="text-align: center;">
            <el-button @click="resetForm">重置</el-button>
            <el-button type="primary" icon="DataAnalysis" @click="handleQuery" :loading="loading">查询客群统计</el-button>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <div v-if="statsResult" class="result-container">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-card shadow="never" class="summary-card">
            <template #header>
              <span class="section-title"><el-icon><TrendCharts /></el-icon> 客群统计概览</span>
            </template>
            <div class="stats-summary">
              <div class="stat-item main">
                <div class="stat-label">客户总数</div>
                <div class="stat-value primary">{{ numVal(statsResult.count) }}</div>
                <div class="stat-unit">人</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">平均违约概率</div>
                <div class="stat-value danger">{{ formatPercent(statsResult.avgPd) }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">平均LTV</div>
                <div class="stat-value warning">{{ formatPercent(statsResult.avgLtv) }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">平均风控档位利率</div>
                <div class="stat-value success">{{ numVal(statsResult.avgRiskTierRate) }}%</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="24">
          <el-card shadow="never" class="sensitivity-card">
            <template #header>
              <span class="section-title"><el-icon><PieChart /></el-icon> 敏感度分布</span>
            </template>
            <div class="sensitivity-dist">
              <div class="sensitivity-item high">
                <div class="sens-label">高敏感度</div>
                <div class="sens-count">{{ numVal(statsResult.highCount) }} 人</div>
                <div class="sens-percent">
                  <el-progress 
                    :percentage="getSensitivityPercent('high')" 
                    :color="'#F56C6C'"
                    :stroke-width="12"
                  />
                </div>
              </div>
              <div class="sensitivity-item mid">
                <div class="sens-label">中敏感度</div>
                <div class="sens-count">{{ numVal(statsResult.midCount) }} 人</div>
                <div class="sens-percent">
                  <el-progress 
                    :percentage="getSensitivityPercent('mid')" 
                    :color="'#E6A23C'"
                    :stroke-width="12"
                  />
                </div>
              </div>
              <div class="sensitivity-item low">
                <div class="sens-label">低敏感度</div>
                <div class="sens-count">{{ numVal(statsResult.lowCount) }} 人</div>
                <div class="sens-percent">
                  <el-progress 
                    :percentage="getSensitivityPercent('low')" 
                    :color="'#67C23A'"
                    :stroke-width="12"
                  />
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="24">
          <el-card shadow="never" class="detail-card">
            <template #header>
              <span class="section-title"><el-icon><List /></el-icon> 统计指标详情</span>
            </template>
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item label="客户总数">{{ numVal(statsResult.count) }} 人</el-descriptions-item>
              <el-descriptions-item label="平均风控档位利率">{{ numVal(statsResult.avgRiskTierRate) }}%</el-descriptions-item>
              <el-descriptions-item label="平均违约概率">{{ formatPercent(statsResult.avgPd) }}</el-descriptions-item>
              <el-descriptions-item label="平均LTV">{{ formatPercent(statsResult.avgLtv) }}</el-descriptions-item>
              <el-descriptions-item label="高敏感度客户">{{ numVal(statsResult.highCount) }} 人 ({{ getSensitivityPercent('high') }}%)</el-descriptions-item>
              <el-descriptions-item label="中敏感度客户">{{ numVal(statsResult.midCount) }} 人 ({{ getSensitivityPercent('mid') }}%)</el-descriptions-item>
              <el-descriptions-item label="低敏感度客户">{{ numVal(statsResult.lowCount) }} 人 ({{ getSensitivityPercent('low') }}%)</el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-empty v-else-if="!loading" description="输入客户ID后点击「查询客群统计」" :image-size="120" />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { DataAnalysis, TrendCharts, PieChart, List } from '@element-plus/icons-vue'
import { queryCustomerStats } from '@/api/query/risk'

const loading = ref(false)
const statsResult = ref(null)
const customerIdsText = ref('')

function numVal(val) {
  if (val === undefined || val === null || val === '') return 0
  const num = Number(val)
  return isNaN(num) ? 0 : num
}

function formatPercent(val) {
  const n = numVal(val)
  if (n <= 1) return (n * 100).toFixed(2) + '%'
  return n.toFixed(2) + '%'
}

function parseCustomerIds() {
  if (!customerIdsText.value.trim()) return []
  return customerIdsText.value
    .split(/[\s,，\n]+/)
    .map(id => id.trim())
    .filter(id => id.length > 0)
}

function getSensitivityPercent(type) {
  const total = numVal(statsResult.value?.count)
  if (total === 0) return 0
  let count = 0
  switch(type) {
    case 'high': count = numVal(statsResult.value?.highCount); break
    case 'mid': count = numVal(statsResult.value?.midCount); break
    case 'low': count = numVal(statsResult.value?.lowCount); break
  }
  return Number(((count / total) * 100).toFixed(1))
}

async function handleQuery() {
  const customerIds = parseCustomerIds()
  if (customerIds.length === 0) {
    ElMessage.warning('请输入至少一个客户ID')
    return
  }
  
  loading.value = true
  statsResult.value = null
  
  try {
    const res = await queryCustomerStats(customerIds)
    if (res && typeof res === 'object' && !Array.isArray(res)) {
      statsResult.value = res
    } else if (res?.data && typeof res.data === 'object') {
      statsResult.value = res.data
    } else {
      statsResult.value = {
        count: 0,
        avgPd: 0,
        avgLtv: 0,
        avgRiskTierRate: 0,
        highCount: 0,
        midCount: 0,
        lowCount: 0
      }
    }
    ElMessage.success('客群统计查询完成')
  } catch (e) {
    console.error('查询客群统计失败', e)
    ElMessage.error('查询失败：' + (e.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

function resetForm() {
  customerIdsText.value = ''
  statsResult.value = null
}
</script>

<style lang="scss" scoped>
.customer-summary-page {
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
    
    .summary-card, .sensitivity-card, .detail-card {
      border-radius: 10px;
    }
    
    .stats-summary {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
      
      .stat-item {
        flex: 1;
        min-width: 140px;
        text-align: center;
        padding: 20px 12px;
        background: #f5f7fa;
        border-radius: 8px;
        
        &.main {
          background: linear-gradient(135deg, #ecf5ff 0%, #d9ecff 100%);
          border: 2px solid #409EFF;
        }
        
        .stat-label {
          font-size: 13px;
          color: #606266;
          margin-bottom: 8px;
        }
        
        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #303133;
          
          &.primary { color: #409EFF; font-size: 32px; }
          &.success { color: #67C23A; }
          &.warning { color: #E6A23C; }
          &.danger { color: #F56C6C; }
        }
        
        .stat-unit {
          font-size: 12px;
          color: #909399;
          margin-top: 4px;
        }
      }
    }
    
    .sensitivity-dist {
      display: flex;
      flex-direction: column;
      gap: 20px;
      
      .sensitivity-item {
        .sens-label {
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 8px;
        }
        
        .sens-count {
          font-size: 18px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 8px;
        }
        
        .sens-percent {
          margin-top: 4px;
        }
        
        &.high .sens-label { color: #F56C6C; }
        &.mid .sens-label { color: #E6A23C; }
        &.low .sens-label { color: #67C23A; }
      }
    }
  }
}
</style>
