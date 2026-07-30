<template>
  <div class="app-container dashboard-page">
    <div class="dashboard-header">
      <h2 class="page-title">仪表盘概览</h2>
    </div>

    <el-row :gutter="20" class="stat-cards-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card pricing-card" v-loading="loading.pricing" :body-style="{ padding: '15px 20px', overflow: 'hidden' }">
          <div class="card-icon">
            <el-icon :size="36"><Money /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">定价统计</div>
            <div class="stat-main">
              <div class="stat-big">{{ pricingSummary.totalCount || 0 }}</div>
              <div class="stat-sub">今日: {{ pricingSummary.todayCount || 0 }} 次</div>
            </div>
            <div class="stat-charts">
              <div class="chart-row">
                <span class="chart-label">成功率</span>
                <el-progress :percentage="pricingSummary.successRate || 0" :color="'#67C23A'" :stroke-width="14" :show-text="false" style="flex:1;" />
                <span class="chart-value success">{{ pricingSummary.successRate || 0 }}%</span>
              </div>
              <div class="chart-row">
                <span class="chart-label">降级率</span>
                <el-progress :percentage="pricingSummary.degradedRate || 0" :color="'#E6A23C'" :stroke-width="14" :show-text="false" style="flex:1;" />
                <span class="chart-value warning">{{ pricingSummary.degradedRate || 0 }}%</span>
              </div>
              <div class="mini-table">
                <div class="mini-table-row">
                  <span>平均耗时</span>
                  <span>{{ (pricingSummary.avgElapsedMs || 0).toFixed(0) }}ms</span>
                </div>
                <div class="mini-table-row">
                  <span>平均利率</span>
                  <span>{{ pricingSummary.avgFinalRate || 0 }}%</span>
                </div>
                <div class="mini-table-row">
                  <span>平均上浮</span>
                  <span class="primary">+{{ pricingSummary.avgUplift || 0 }}%</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card report-card" v-loading="loading.report" :body-style="{ padding: '15px 20px', overflow: 'hidden' }">
          <div class="card-icon">
            <el-icon :size="36"><Document /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">报告统计</div>
            <div class="stat-main">
              <div class="stat-big">{{ reportSummary.totalReports || 0 }}</div>
              <div class="stat-sub">今日生成: {{ reportSummary.todayReports || 0 }} 份</div>
            </div>
            <div class="stat-charts">
              <div class="report-bars">
                <div class="report-bar-item">
                  <div class="bar-label">客户报告</div>
                  <div class="bar-track">
                    <div class="bar-fill customer-bar" :style="{ width: reportBarWidth(reportSummary.customerReports, reportSummary.totalReports) }"></div>
                  </div>
                  <span class="bar-value">{{ reportSummary.customerReports || 0 }}</span>
                </div>
                <div class="report-bar-item">
                  <div class="bar-label">决策报告</div>
                  <div class="bar-track">
                    <div class="bar-fill decision-bar" :style="{ width: reportBarWidth(reportSummary.decisionReports, reportSummary.totalReports) }"></div>
                  </div>
                  <span class="bar-value">{{ reportSummary.decisionReports || 0 }}</span>
                </div>
              </div>
              <div class="mini-table">
                <div class="mini-table-row">
                  <span>总查看</span>
                  <span>{{ reportSummary.totalViewedCount || 0 }} 次</span>
                </div>
                <div class="mini-table-row">
                  <span>总下载</span>
                  <span>{{ reportSummary.totalDownloadCount || 0 }} 次</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card model-card" v-loading="loading.model" :body-style="{ padding: '15px 20px', overflow: 'hidden' }">
          <div class="card-icon">
            <el-icon :size="36"><Cpu /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">模型状态</div>
            <div class="stat-main model-stat-main">
              <el-progress
                type="dashboard"
                :percentage="modelStatus.passRate || 0"
                :color="modelStatus.modelServiceAvailable ? '#67C23A' : '#F56C6C'"
                :width="80"
                :stroke-width="8"
              >
                <template #default>
                  <div class="dashboard-progress-inner">
                    <span class="progress-num">{{ modelStatus.passRate || 0 }}%</span>
                    <span class="progress-text">通过率</span>
                  </div>
                </template>
              </el-progress>
              <el-tag :type="modelStatus.modelServiceAvailable ? 'success' : 'danger'" effect="plain" size="small" style="margin-top: 4px;">
                {{ modelStatus.modelServiceAvailable ? '服务可用' : '服务不可用' }}
              </el-tag>
            </div>
            <div class="stat-charts">
              <div class="mini-table">
                <div class="mini-table-row">
                  <span>模型版本</span>
                  <span>{{ modelStatus.currentVersion || '-' }}</span>
                </div>
                <div class="mini-table-row">
                  <span>总验证</span>
                  <span>{{ modelStatus.totalValidations || 0 }} 次</span>
                </div>
                <div class="mini-table-row">
                  <span>最近MAE</span>
                  <span>{{ modelStatus.lastMae || '-' }}</span>
                </div>
                <div class="mini-table-row">
                  <span>R²</span>
                  <span>{{ modelStatus.lastRSquared || '-' }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card abtest-card" v-loading="loading.abtest" :body-style="{ padding: '15px 20px', overflow: 'hidden' }">
          <div class="card-icon">
            <el-icon :size="36"><DataAnalysis /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">ABTest概览</div>
            <div class="stat-main">
              <div class="stat-big">{{ abtestSummary.totalExperiments || 0 }}</div>
              <div class="stat-sub">运行中: {{ abtestSummary.runningExperiments || 0 }} 个实验</div>
            </div>
            <div class="stat-charts">
              <div class="abtest-bars">
                <div class="abtest-bar-item">
                  <span class="ab-label running">运行中</span>
                  <el-progress :percentage="abtestPercent(abtestSummary.runningExperiments, abtestSummary.totalExperiments)" :color="'#67C23A'" :stroke-width="12" :show-text="false" style="flex:1;" />
                  <span class="ab-value">{{ abtestSummary.runningExperiments || 0 }}</span>
                </div>
                <div class="abtest-bar-item">
                  <span class="ab-label paused">暂停</span>
                  <el-progress :percentage="abtestPercent(abtestSummary.pausedExperiments, abtestSummary.totalExperiments)" :color="'#E6A23C'" :stroke-width="12" :show-text="false" style="flex:1;" />
                  <span class="ab-value">{{ abtestSummary.pausedExperiments || 0 }}</span>
                </div>
                <div class="abtest-bar-item">
                  <span class="ab-label completed">已完成</span>
                  <el-progress :percentage="abtestPercent(abtestSummary.completedExperiments, abtestSummary.totalExperiments)" :color="'#909399'" :stroke-width="12" :show-text="false" style="flex:1;" />
                  <span class="ab-value">{{ abtestSummary.completedExperiments || 0 }}</span>
                </div>
              </div>
              <div class="running-experiments" v-if="abtestSummary.experimentOverviews && abtestSummary.experimentOverviews.length > 0">
                <el-divider content-position="left" style="margin: 8px 0;">运行中实验</el-divider>
                <div class="exp-item" v-for="(exp, idx) in abtestSummary.experimentOverviews.slice(0, 3)" :key="idx">
                  <span class="exp-name">{{ exp.name || exp.experimentName || '实验' + (idx+1) }}</span>
                  <el-tag size="small" type="success" effect="plain">运行中</el-tag>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="bottom-section">
      <el-col :span="12">
        <el-card shadow="never" class="shortcut-card">
          <template #header>
            <span class="section-title">快捷入口</span>
          </template>
          <div class="shortcut-buttons">
            <div class="shortcut-item" @click="goTo('/info/calculate')">
              <div class="shortcut-icon pricing-bg">
                <el-icon :size="28"><Money /></el-icon>
              </div>
              <div class="shortcut-text">
                <div class="shortcut-name">实时定价</div>
                <div class="shortcut-desc">客户实时定价测算</div>
              </div>
            </div>
            <div class="shortcut-item" @click="goTo('/info/product')">
              <div class="shortcut-icon product-bg">
                <el-icon :size="28"><Goods /></el-icon>
              </div>
              <div class="shortcut-text">
                <div class="shortcut-name">产品设计</div>
                <div class="shortcut-desc">新产品设计查询</div>
              </div>
            </div>
            <div class="shortcut-item" @click="goTo('/info/strategy')">
              <div class="shortcut-icon strategy-bg">
                <el-icon :size="28"><DataLine /></el-icon>
              </div>
              <div class="shortcut-text">
                <div class="shortcut-name">策略模拟</div>
                <div class="shortcut-desc">回溯验证与策略模拟</div>
              </div>
            </div>
            <div class="shortcut-item" @click="goTo('/price/abtest')">
              <div class="shortcut-icon abtest-bg">
                <el-icon :size="28"><Histogram /></el-icon>
              </div>
              <div class="shortcut-text">
                <div class="shortcut-name">AB实验</div>
                <div class="shortcut-desc">AB测试实验管理</div>
              </div>
            </div>
            <div class="shortcut-item" @click="goTo('/price/params')">
              <div class="shortcut-icon param-bg">
                <el-icon :size="28"><Setting /></el-icon>
              </div>
              <div class="shortcut-text">
                <div class="shortcut-name">参数配置</div>
                <div class="shortcut-desc">模型参数管理</div>
              </div>
            </div>
            <div class="shortcut-item" @click="goTo('/price/model')">
              <div class="shortcut-icon model-bg">
                <el-icon :size="28"><Box /></el-icon>
              </div>
              <div class="shortcut-text">
                <div class="shortcut-name">模型管理</div>
                <div class="shortcut-desc">版本与模型管理</div>
              </div>
            </div>
            <div class="shortcut-item" @click="goTo('/info/query')">
              <div class="shortcut-icon market-bg">
                <el-icon :size="28"><Document /></el-icon>
              </div>
              <div class="shortcut-text">
                <div class="shortcut-name">营销报告</div>
                <div class="shortcut-desc">营销报告查询下载</div>
              </div>
            </div>
            <div class="shortcut-item" @click="goTo('/info/cust')">
              <div class="shortcut-icon cust-bg">
                <el-icon :size="28"><UserFilled /></el-icon>
              </div>
              <div class="shortcut-text">
                <div class="shortcut-name">客户报告</div>
                <div class="shortcut-desc">客户报告查询下载</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="never" class="search-card">
          <template #header>
            <span class="section-title">客户搜索</span>
          </template>
          <div class="customer-search">
            <el-input
              v-model="searchKeyword"
              placeholder="输入客户姓名搜索"
              size="large"
              clearable
              @keyup.enter="handleSearch"
              style="margin-bottom: 12px;"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
              <template #append>
                <el-button type="primary" @click="handleSearch" :loading="searchLoading">
                  搜索
                </el-button>
              </template>
            </el-input>
            <div v-loading="searchLoading" class="search-result">
              <el-empty v-if="!searchDone" description="输入客户姓名快速查询客户信息" :image-size="80" />
              <el-empty v-else-if="searchResult.length === 0" description="未找到匹配客户" />
              <div v-else class="customer-table">
                <el-table :data="searchResult" size="small" border style="width: 100%">
                  <el-table-column prop="customerId" label="客户号" min-width="120" show-overflow-tooltip />
                  <el-table-column prop="customerName" label="客户姓名" min-width="80" />
                  <el-table-column prop="occupation" label="职业" min-width="100" show-overflow-tooltip />
                  <el-table-column prop="education" label="学历" min-width="80" />
                  <el-table-column prop="industry" label="行业" min-width="100" show-overflow-tooltip />
                  <el-table-column prop="region" label="区域" min-width="80" />
                  <el-table-column label="操作" width="80" align="center" fixed="right">
                    <template #default="scope">
                      <el-button type="primary" link size="small" @click.stop="goToCustomerPricing(scope.row.customerId)">测算</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Money, Document, Cpu, DataAnalysis, Goods, DataLine, Histogram, Setting, Box, Search, User, ArrowRight, UserFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getPricingSummary, getReportSummary, getModelStatus, getAbtestSummary } from '@/api/dashboard'
import { listCustomers } from '@/api/info/customer'

const router = useRouter()

const loading = reactive({
  pricing: false,
  report: false,
  model: false,
  abtest: false
})

const pricingSummary = ref({})
const reportSummary = ref({})
const modelStatus = ref({})
const abtestSummary = ref({})

const searchKeyword = ref('')
const searchLoading = ref(false)
const searchDone = ref(true)
const searchResult = ref([])

function formatTime(timeStr) {
  if (!timeStr) return '-'
  try {
    if (typeof timeStr === 'string') {
      return timeStr.replace('T', ' ').substring(0, 16)
    }
    return timeStr
  } catch (e) {
    return timeStr
  }
}

async function fetchPricing() {
  loading.pricing = true
  try {
    pricingSummary.value = await getPricingSummary()
  } catch (e) {
    console.error('获取定价统计失败', e)
  } finally {
    loading.pricing = false
  }
}

async function fetchReport() {
  loading.report = true
  try {
    reportSummary.value = await getReportSummary()
  } catch (e) {
    console.error('获取报告统计失败', e)
  } finally {
    loading.report = false
  }
}

async function fetchModel() {
  loading.model = true
  try {
    modelStatus.value = await getModelStatus()
  } catch (e) {
    console.error('获取模型状态失败', e)
  } finally {
    loading.model = false
  }
}

async function fetchAbtest() {
  loading.abtest = true
  try {
    abtestSummary.value = await getAbtestSummary()
  } catch (e) {
    console.error('获取ABTest统计失败', e)
  } finally {
    loading.abtest = false
  }
}

function fetchAllData() {
  fetchPricing()
  fetchReport()
  fetchModel()
  fetchAbtest()
}

async function fetchDefaultCustomers() {
  searchLoading.value = true
  searchDone.value = true
  try {
    const response = await listCustomers({
      pageNum: 1,
      pageSize: 5
    })
    searchResult.value = response.rows || response.list || response || []
  } catch (e) {
    console.error('获取默认客户列表失败', e)
    searchResult.value = []
  } finally {
    searchLoading.value = false
  }
}

async function handleSearch() {
  const kw = searchKeyword.value.trim()
  if (!kw) {
    fetchDefaultCustomers()
    return
  }
  searchLoading.value = true
  searchDone.value = true
  try {
    const response = await listCustomers({
      pageNum: 1,
      pageSize: 20,
      customerName: kw
    })
    searchResult.value = response.rows || response.list || response || []
  } catch (e) {
    console.error('搜索客户失败', e)
    searchResult.value = []
  } finally {
    searchLoading.value = false
  }
}

function goTo(path) {
  router.push(path)
}

function reportBarWidth(count, total) {
  if (!total || total === 0) return '0%'
  return Math.round((count / total) * 100) + '%'
}

function abtestPercent(count, total) {
  if (!total || total === 0) return 0
  return Math.round((count / total) * 100)
}

function goToCustomerPricing(customerId) {
  if (customerId) {
    sessionStorage.setItem('dashboard_customer_id', customerId)
  }
  router.push('/info/calculate')
}

function handleRowClick(row) {
  goToCustomerPricing(row.customerId)
}

onMounted(() => {
  fetchAllData()
  fetchDefaultCustomers()
})
</script>

<style lang="scss" scoped>
.dashboard-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
  
  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    .page-title {
      font-size: 22px;
      font-weight: 600;
      color: #303133;
      margin: 0;
    }
  }
  
  .stat-cards-row {
    margin-bottom: 20px;
    
    .stat-card {
      border-radius: 10px;
      position: relative;
      overflow: hidden;
      height: 300px;
      
      :deep(.el-card__body) {
        overflow: hidden;
        height: 100%;
      }
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
      }
      
      .card-icon {
        position: absolute;
        top: 20px;
        right: 20px;
        opacity: 0.3;
        color: inherit;
      }
      
      &.pricing-card {
        &::before { background: linear-gradient(90deg, #409EFF, #66b1ff); }
        .card-icon { color: #409EFF; }
      }
      
      &.report-card {
        &::before { background: linear-gradient(90deg, #67C23A, #85ce61); }
        .card-icon { color: #67C23A; }
      }
      
      &.model-card {
        &::before { background: linear-gradient(90deg, #E6A23C, #ebb563); }
        .card-icon { color: #E6A23C; }
      }
      
      &.abtest-card {
        &::before { background: linear-gradient(90deg, #F56C6C, #f78989); }
        .card-icon { color: #F56C6C; }
      }
      
      .card-content {
        padding-top: 10px;
      }
      
      .card-title {
        font-size: 16px;
        color: #303133;
        margin-bottom: 12px;
        font-weight: 700;
        letter-spacing: 0.5px;
      }
      
      .stat-main {
        margin-bottom: 16px;
        
        &.model-stat-main {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        
        .stat-big {
          font-size: 32px;
          font-weight: 700;
          color: #303133;
          line-height: 1.2;
          margin-bottom: 4px;
        }
        
        .stat-sub {
          font-size: 13px;
          color: #909399;
        }
      }
      
      .dashboard-progress-inner {
        display: flex;
        flex-direction: column;
        align-items: center;
        
        .progress-num {
          font-size: 16px;
          font-weight: 700;
          color: #303133;
        }
        
        .progress-text {
          font-size: 11px;
          color: #909399;
        }
      }
      
      .stat-charts {
        .chart-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          
          .chart-label {
            font-size: 12px;
            color: #606266;
            width: 48px;
            flex-shrink: 0;
          }
          
          .chart-value {
            font-size: 12px;
            font-weight: 600;
            width: 40px;
            text-align: right;
            flex-shrink: 0;
            
            &.success { color: #67C23A; }
            &.warning { color: #E6A23C; }
          }
        }
        
        .mini-table {
          margin-top: 8px;
          
          .mini-table-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 5px 0;
            font-size: 12px;
            border-top: 1px solid #f0f2f5;
            color: #606266;
            
            span:last-child {
              font-weight: 500;
              color: #303133;
              
              &.primary { color: #409EFF; }
            }
          }
        }
        
        .report-bars {
          .report-bar-item {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
            
            .bar-label {
              font-size: 12px;
              color: #606266;
              width: 56px;
              flex-shrink: 0;
            }
            
            .bar-track {
              flex: 1;
              height: 14px;
              background: #f0f2f5;
              border-radius: 7px;
              overflow: hidden;
              
              .bar-fill {
                height: 100%;
                border-radius: 7px;
                transition: width 0.3s;
                
                &.customer-bar { background: linear-gradient(90deg, #67C23A, #85ce61); }
                &.decision-bar { background: linear-gradient(90deg, #409EFF, #66b1ff); }
              }
            }
            
            .bar-value {
              font-size: 12px;
              font-weight: 600;
              color: #303133;
              width: 30px;
              text-align: right;
              flex-shrink: 0;
            }
          }
        }
        
        .abtest-bars {
          .abtest-bar-item {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
            
            .ab-label {
              font-size: 12px;
              width: 48px;
              flex-shrink: 0;
              
              &.running { color: #67C23A; }
              &.paused { color: #E6A23C; }
              &.completed { color: #909399; }
            }
            
            .ab-value {
              font-size: 12px;
              font-weight: 600;
              color: #303133;
              width: 24px;
              text-align: right;
              flex-shrink: 0;
            }
          }
        }
      }
      
      .running-experiments {
        margin-top: 4px;
        
        .exp-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 0;
          font-size: 12px;
          
          .exp-name {
            color: #606266;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 150px;
          }
        }
      }
    }
  }
  
  .bottom-section {
    .shortcut-card, .search-card {
      border-radius: 10px;
      height: 100%;
      
      .section-title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }
    
    .shortcut-buttons {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      
      .shortcut-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        border-radius: 8px;
        background: #f5f7fa;
        cursor: pointer;
        transition: all 0.2s;
        
        &:hover {
          background: #ecf5ff;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
        }
        
        .shortcut-icon {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
          
          &.pricing-bg { background: linear-gradient(135deg, #409EFF, #66b1ff); }
          &.product-bg { background: linear-gradient(135deg, #67C23A, #85ce61); }
          &.strategy-bg { background: linear-gradient(135deg, #E6A23C, #ebb563); }
          &.abtest-bg { background: linear-gradient(135deg, #F56C6C, #f78989); }
          &.param-bg { background: linear-gradient(135deg, #909399, #a6a9ad); }
          &.model-bg { background: linear-gradient(135deg, #9b59b6, #be90d4); }
          &.market-bg { background: linear-gradient(135deg, #e67e22, #f39c12); }
          &.cust-bg { background: linear-gradient(135deg, #1abc9c, #48c9b0); }
        }
        
        .shortcut-text {
          .shortcut-name {
            font-size: 15px;
            font-weight: 600;
            color: #303133;
            margin-bottom: 2px;
          }
          
          .shortcut-desc {
            font-size: 12px;
            color: #909399;
          }
        }
      }
    }
    
    .customer-search {
      .search-result {
        min-height: 280px;
        max-height: 320px;
        overflow-y: auto;
        
        .customer-list {
          .customer-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            border-radius: 8px;
            cursor: pointer;
            transition: background 0.2s;
            
            &:hover {
              background: #f5f7fa;
              
              .cust-arrow {
                color: #409EFF;
                transform: translateX(4px);
              }
            }
            
            .cust-avatar {
              width: 40px;
              height: 40px;
              border-radius: 50%;
              background: linear-gradient(135deg, #409EFF, #66b1ff);
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
            }
            
            .cust-info {
              flex: 1;
              min-width: 0;
              
              .cust-name {
                font-size: 14px;
                font-weight: 600;
                color: #303133;
                margin-bottom: 2px;
              }
              
              .cust-meta {
                font-size: 12px;
                color: #909399;
                
                .split {
                  margin: 0 6px;
                  color: #dcdfe6;
                }
              }
            }
            
            .cust-arrow {
              color: #c0c4cc;
              transition: all 0.2s;
            }
          }
        }
      }
    }
  }
}
</style>
