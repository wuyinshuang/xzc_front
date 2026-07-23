<template>
  <div class="app-container risk-tier-page">
    <el-card shadow="never" class="input-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">风控档位查询</span>
        </div>
      </template>

      <el-form :model="form" ref="formRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="客户ID列表" prop="customerIdsText" required>
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
            <el-button type="primary" icon="Search" @click="handleQuery" :loading="loading">查询风控档位</el-button>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <div v-if="resultList.length > 0" class="result-container">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-card shadow="never" class="result-card">
            <template #header>
              <div class="card-header">
                <span class="section-title"><el-icon><Document /></el-icon> 查询结果 (共{{ resultList.length }}条)</span>
              </div>
            </template>
            <el-table :data="resultList" size="small" border stripe>
              <el-table-column label="序号" type="index" width="60" align="center" />
              <el-table-column label="客户ID" prop="customerId" min-width="220" show-overflow-tooltip>
                <template #default="{ row }">{{ strVal(row.customerId) }}</template>
              </el-table-column>
              <el-table-column label="风控档位" prop="riskTier" width="120" align="center">
                <template #default="{ row }">
                  <el-tag :type="tierTagType(numVal(row.riskTier))">档位{{ numVal(row.riskTier) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="档位利率(%)" prop="tierRate" width="140" align="center">
                <template #default="{ row }">
                  <span class="rate-value">{{ numVal(row.tierRate) }}%</span>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="24">
          <el-card shadow="never" class="stats-card">
            <template #header>
              <span class="section-title"><el-icon><DataAnalysis /></el-icon> 档位分布统计</span>
            </template>
            <el-row :gutter="16">
              <el-col :span="6" v-for="tier in 7" :key="tier">
                <div class="tier-stat">
                  <div class="tier-label">
                    <el-tag :type="tierTagType(tier)" size="small">档位{{ tier }}</el-tag>
                  </div>
                  <div class="tier-count">{{ getTierCount(tier) }} 人</div>
                </div>
              </el-col>
            </el-row>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-empty v-else-if="!loading" description="输入客户ID后点击「查询风控档位」" :image-size="120" />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Document, DataAnalysis } from '@element-plus/icons-vue'
import { queryRiskTier } from '@/api/query/risk'

const formRef = ref()
const loading = ref(false)
const resultList = ref([])
const customerIdsText = ref('')

function numVal(val) {
  if (val === undefined || val === null || val === '') return 0
  const num = Number(val)
  return isNaN(num) ? 0 : num
}

function strVal(val) {
  if (val === undefined || val === null || val === '') return '0'
  return String(val)
}

function tierTagType(tier) {
  const t = numVal(tier)
  if (t <= 2) return 'success'
  if (t <= 4) return 'warning'
  return 'danger'
}

function parseCustomerIds() {
  if (!customerIdsText.value.trim()) return []
  return customerIdsText.value
    .split(/[\s,，\n]+/)
    .map(id => id.trim())
    .filter(id => id.length > 0)
}

function getTierCount(tier) {
  return resultList.value.filter(item => numVal(item.riskTier) === tier).length
}

async function handleQuery() {
  const customerIds = parseCustomerIds()
  if (customerIds.length === 0) {
    ElMessage.warning('请输入至少一个客户ID')
    return
  }
  
  loading.value = true
  resultList.value = []
  
  try {
    const res = await queryRiskTier(customerIds)
    if (Array.isArray(res)) {
      resultList.value = res
    } else if (Array.isArray(res?.data)) {
      resultList.value = res.data
    } else if (Array.isArray(res?.list)) {
      resultList.value = res.list
    } else {
      resultList.value = []
    }
    ElMessage.success(`查询完成，共返回${resultList.value.length}条数据`)
  } catch (e) {
    console.error('查询风控档位失败', e)
    ElMessage.error('查询失败：' + (e.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

function resetForm() {
  customerIdsText.value = ''
  resultList.value = []
}
</script>

<style lang="scss" scoped>
.risk-tier-page {
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
    
    .result-card, .stats-card {
      border-radius: 10px;
    }
    
    .rate-value {
      font-weight: 600;
      color: #409EFF;
      font-size: 15px;
    }
    
    .stats-card {
      .tier-stat {
        text-align: center;
        padding: 12px;
        background: #f5f7fa;
        border-radius: 8px;
        margin-bottom: 8px;
        
        .tier-label {
          margin-bottom: 8px;
        }
        
        .tier-count {
          font-size: 20px;
          font-weight: 700;
          color: #303133;
        }
      }
    }
  }
}
</style>
