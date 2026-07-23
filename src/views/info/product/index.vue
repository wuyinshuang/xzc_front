<template>
  <div class="app-container product-design-page">
    <el-card shadow="never" class="input-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">新产品设计定价</span>
        </div>
      </template>

      <el-form :model="form" ref="formRef" label-width="120px">
        <el-row :gutter="20">
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
            <el-form-item label="期限(月)" prop="termMonths" required>
              <el-input-number v-model="form.termMonths" :min="1" :max="60" placeholder="贷款期限" controls-position="right" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="客群标签" prop="customerTag">
              <el-select v-model="form.customerTag" placeholder="选择客群标签（可选）" clearable style="width: 100%;">
                <el-option label="新市民 (NEW)" value="NEW" />
                <el-option label="高敏感度 (HIGH)" value="HIGH" />
                <el-option label="中敏感度 (MID)" value="MID" />
                <el-option label="低敏感度 (LOW)" value="LOW" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">客群筛选条件（选填，不填则全量客群）</el-divider>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="年龄范围">
              <div class="range-input">
                <el-input-number v-model="form.minAge" :min="18" :max="70" placeholder="最小" controls-position="right" style="width: 48%;" />
                <span class="range-sep">-</span>
                <el-input-number v-model="form.maxAge" :min="18" :max="70" placeholder="最大" controls-position="right" style="width: 48%;" />
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="月收入范围(元)">
              <div class="range-input">
                <el-input-number v-model="form.minIncome" :min="0" :precision="2" placeholder="最低" controls-position="right" style="width: 48%;" />
                <span class="range-sep">-</span>
                <el-input-number v-model="form.maxIncome" :min="0" :precision="2" placeholder="最高" controls-position="right" style="width: 48%;" />
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="公积金范围(元)">
              <div class="range-input">
                <el-input-number v-model="form.minHousingFund" :min="0" :precision="2" placeholder="最低" controls-position="right" style="width: 48%;" />
                <span class="range-sep">-</span>
                <el-input-number v-model="form.maxHousingFund" :min="0" :precision="2" placeholder="最高" controls-position="right" style="width: 48%;" />
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="学历">
              <el-select v-model="form.education" placeholder="请选择学历" clearable style="width: 100%;">
                <el-option label="高中" value="高中" />
                <el-option label="大专" value="大专" />
                <el-option label="本科" value="本科" />
                <el-option label="硕士" value="硕士" />
                <el-option label="博士" value="博士" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="行业">
              <el-input v-model="form.industry" placeholder="如：互联网/金融/制造业" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="地区">
              <el-input v-model="form.region" placeholder="如：北京/上海/深圳" clearable />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="婚姻状况">
              <el-select v-model="form.maritalStatus" placeholder="请选择婚姻状况" clearable style="width: 100%;">
                <el-option label="未婚" value="未婚" />
                <el-option label="已婚" value="已婚" />
                <el-option label="离异" value="离异" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="16" style="text-align: right;">
            <el-form-item>
              <el-button @click="resetForm">重置</el-button>
              <el-button type="primary" icon="Goods" @click="handleDesign" :loading="loading">生成产品设计方案</el-button>
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
                <span class="section-title">方案概览</span>
                <div>
                  <el-tag type="primary">{{ strVal(productTypeMap[result.productType] || result.productType) }}</el-tag>
                  <el-tag type="info" style="margin-left: 8px;">期限 {{ numVal(result.termMonths) }} 个月</el-tag>
                  <el-tag type="success" style="margin-left: 8px;">样本数: {{ numVal(customerProfile.customerCount) }} 人</el-tag>
                </div>
              </div>
            </template>
            <div class="summary-info">
              <div class="info-item">
                <span class="label">客群描述：</span>
                <span class="value">{{ strVal(result.customerSegment) }}</span>
              </div>
              <div v-if="riskWarnings && riskWarnings.length > 0" class="risk-warnings">
                <el-alert
                  v-for="(warn, idx) in riskWarnings"
                  :key="idx"
                  :title="warn"
                  type="warning"
                  :closable="false"
                  show-icon
                  style="margin-bottom: 8px;"
                />
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="12">
          <el-card shadow="never" class="engine-card">
            <template #header>
              <span class="section-title"><el-icon><Cpu /></el-icon> 引擎一：基础定价</span>
            </template>
            <div class="engine-content">
              <el-descriptions :column="2" border size="small">
                <el-descriptions-item label="平均基础利率">
                  <span class="rate primary">{{ numVal(engine1Pricing.avgBaseRate) }}%</span>
                </el-descriptions-item>
                <el-descriptions-item label="典型风险等级">
                  <el-tag :type="riskLevelType(engine1Pricing.typicalRiskLevel)">{{ strVal(engine1Pricing.typicalRiskLevel) }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="最低基础利率">{{ numVal(engine1Pricing.minBaseRate) }}%</el-descriptions-item>
                <el-descriptions-item label="最高基础利率">{{ numVal(engine1Pricing.maxBaseRate) }}%</el-descriptions-item>
                <el-descriptions-item label="平均风险溢价">{{ numVal(engine1Pricing.avgRiskPremium) }}%</el-descriptions-item>
                <el-descriptions-item label="真实资金成本">{{ numVal(engine1Pricing.fundCost) }}%</el-descriptions-item>
              </el-descriptions>
              <div class="formula-note">
                <el-icon><InfoFilled /></el-icon>
                <span>平均风险溢价 = 平均基础利率 - 真实资金成本</span>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card shadow="never" class="engine-card">
            <template #header>
              <span class="section-title"><el-icon><DataAnalysis /></el-icon> 引擎二：增量利润优化</span>
            </template>
            <div class="engine-content">
              <el-descriptions :column="2" border size="small">
                <el-descriptions-item label="平均最优利率">
                  <span class="rate success">{{ numVal(engine2Optimization.avgOptimalRate) }}%</span>
                </el-descriptions-item>
                <el-descriptions-item label="平均最优上浮">
                  <span class="uplift">+{{ numVal(engine2Optimization.avgOptimalUplift) }}%</span>
                </el-descriptions-item>
                <el-descriptions-item label="平均预期增量利润">{{ numVal(engine2Optimization.avgIncrProfit) }}%</el-descriptions-item>
                <el-descriptions-item label="平均预期转化概率">{{ formatPercent(engine2Optimization.avgConvProb) }}</el-descriptions-item>
                <el-descriptions-item label="优化样本数">{{ numVal(engine2Optimization.sampleSize) }} 人</el-descriptions-item>
                <el-descriptions-item label="触发探索次数(ε-greedy)">{{ numVal(engine2Optimization.exploredCount) }} 次</el-descriptions-item>
              </el-descriptions>
              <div class="explore-rate" v-if="numVal(engine2Optimization.sampleSize) > 0">
                探索比例：<span :class="exploreRateLevel(numVal(engine2Optimization.exploredCount), numVal(engine2Optimization.sampleSize))">
                  {{ (numVal(engine2Optimization.exploredCount) / numVal(engine2Optimization.sampleSize) * 100).toFixed(1) }}%
                </span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="12">
          <el-card shadow="never" class="profile-card">
            <template #header>
              <span class="section-title"><el-icon><User /></el-icon> 客群画像</span>
            </template>
            <div class="profile-content">
              <el-row :gutter="12">
                <el-col :span="8">
                  <div class="profile-stat">
                    <div class="stat-number">{{ numVal(customerProfile.customerCount) }}</div>
                    <div class="stat-label">样本客户数</div>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="profile-stat">
                    <div class="stat-number">{{ numVal(customerProfile.avgAge) }}</div>
                    <div class="stat-label">平均年龄</div>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="profile-stat">
                    <div class="stat-number">¥{{ formatNumber(customerProfile.avgMonthlyIncome) }}</div>
                    <div class="stat-label">平均月收入</div>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="profile-stat">
                    <div class="stat-number">{{ numVal(customerProfile.avgCreditScore) }}</div>
                    <div class="stat-label">平均信用分</div>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="profile-stat">
                    <div class="stat-number">¥{{ formatNumber(customerProfile.avgHousingFund) }}</div>
                    <div class="stat-label">平均公积金</div>
                  </div>
                </el-col>
              </el-row>
              <el-collapse v-if="hasDistributions" class="distribution-collapse">
                <el-collapse-item title="查看客群分布详情" name="dist">
                  <div v-if="customerProfile.riskTierDistribution" class="dist-section">
                    <h5>风险档位分布</h5>
                    <div class="dist-tags">
                      <el-tag v-for="(count, tier) in parseJsonObj(customerProfile.riskTierDistribution)" :key="tier" size="small" style="margin: 2px;">
                        档位{{ tier }}: {{ numVal(count) }}人
                      </el-tag>
                    </div>
                  </div>
                  <div v-if="customerProfile.sensitivityGroupDistribution" class="dist-section">
                    <h5>敏感度分群分布</h5>
                    <div class="dist-tags">
                      <el-tag v-for="(count, group) in parseJsonObj(customerProfile.sensitivityGroupDistribution)" :key="group" type="info" size="small" style="margin: 2px;">
                        {{ sensitivityLabel(group) }}: {{ numVal(count) }}人
                      </el-tag>
                    </div>
                  </div>
                  <div v-if="customerProfile.educationDistribution" class="dist-section">
                    <h5>学历分布</h5>
                    <div class="dist-tags">
                      <el-tag v-for="(count, edu) in parseJsonObj(customerProfile.educationDistribution)" :key="edu" type="success" size="small" style="margin: 2px;">
                        {{ edu }}: {{ numVal(count) }}人
                      </el-tag>
                    </div>
                  </div>
                  <div v-if="customerProfile.industryDistribution" class="dist-section">
                    <h5>行业分布</h5>
                    <div class="dist-tags">
                      <el-tag v-for="(count, ind) in parseJsonObj(customerProfile.industryDistribution)" :key="ind" type="warning" size="small" style="margin: 2px;">
                        {{ ind }}: {{ numVal(count) }}人
                      </el-tag>
                    </div>
                  </div>
                  <div v-if="customerProfile.regionDistribution" class="dist-section">
                    <h5>地区分布</h5>
                    <div class="dist-tags">
                      <el-tag v-for="(count, reg) in parseJsonObj(customerProfile.regionDistribution)" :key="reg" type="danger" effect="plain" size="small" style="margin: 2px;">
                        {{ reg }}: {{ numVal(count) }}人
                      </el-tag>
                    </div>
                  </div>
                  <div v-if="customerProfile.maritalStatusDistribution" class="dist-section">
                    <h5>婚姻状况分布</h5>
                    <div class="dist-tags">
                      <el-tag v-for="(count, mar) in parseJsonObj(customerProfile.maritalStatusDistribution)" :key="mar" type="primary" effect="plain" size="small" style="margin: 2px;">
                        {{ mar }}: {{ numVal(count) }}人
                      </el-tag>
                    </div>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </div>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card shadow="never" class="recommend-card">
            <template #header>
              <span class="section-title"><el-icon><Star /></el-icon> 建议利率区间</span>
            </template>
            <div class="recommend-content">
              <div class="rate-range">
                <div class="rate-tier conservative">
                  <div class="tier-label">保守档</div>
                  <div class="tier-rate">{{ numVal(recommendedRateRange.conservativeRate) }}%</div>
                  <div class="tier-desc">低风险，低转化</div>
                </div>
                <div class="rate-tier balanced">
                  <div class="tier-label">稳健档 <el-tag type="success" size="small">推荐</el-tag></div>
                  <div class="tier-rate primary">{{ numVal(recommendedRateRange.moderateRate) }}%</div>
                  <div class="tier-desc">平衡利润与转化</div>
                </div>
                <div class="rate-tier aggressive">
                  <div class="tier-label">激进档</div>
                  <div class="tier-rate">{{ numVal(recommendedRateRange.aggressiveRate) }}%</div>
                  <div class="tier-desc">高利润，高风险</div>
                </div>
              </div>
              <div class="range-note" v-if="recommendedRateRange.rationale">
                <el-icon><InfoFilled /></el-icon> {{ recommendedRateRange.rationale }}
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="24">
          <el-card shadow="never" class="scenario-card">
            <template #header>
              <span class="section-title"><el-icon><DataLine /></el-icon> 情景模拟 <span class="sub-title">PricingService.simulate 真实计算</span></span>
            </template>
            <el-table :data="scenarios" size="small" border stripe>
              <el-table-column label="情景类型" prop="scenarioType" width="110" align="center">
                <template #default="{ row }">
                  <el-tag :type="scenarioType(row.scenarioType)">{{ strVal(scenarioNameMap[row.scenarioType] || row.scenarioType) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="情景描述" prop="description" min-width="160" show-overflow-tooltip>
                <template #default="{ row }">{{ strVal(row.description) }}</template>
              </el-table-column>
              <el-table-column label="预期利率(%)" prop="expectedRate" width="110" align="center">
                <template #default="{ row }">
                  <span class="rate">{{ numVal(row.expectedRate) }}%</span>
                </template>
              </el-table-column>
              <el-table-column label="平均违约概率" prop="avgPd" width="120" align="center">
                <template #default="{ row }">
                  {{ formatPercent(row.avgPd) }}
                </template>
              </el-table-column>
              <el-table-column label="预期损失率(%)" prop="expectedLossRate" width="120" align="center">
                <template #default="{ row }">{{ numVal(row.expectedLossRate) }}%</template>
              </el-table-column>
              <el-table-column label="净收益率(%)" prop="netProfitRate" width="110" align="center">
                <template #default="{ row }">
                  <span :class="profitClass(row.netProfitRate)">{{ numVal(row.netProfitRate) }}%</span>
                </template>
              </el-table-column>
            </el-table>
            <div v-if="scenarios.length === 0" class="empty-table-tip">暂无情景模拟数据</div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="24">
          <el-card shadow="never" class="competitor-card">
            <template #header>
              <span class="section-title"><el-icon><Histogram /></el-icon> 竞品对标</span>
            </template>
            <el-descriptions :column="4" border size="small">
              <el-descriptions-item label="竞品加权平均利率">{{ numVal(competitorBenchmark.weightedAvgRate) }}%</el-descriptions-item>
              <el-descriptions-item label="竞品最低利率">{{ numVal(competitorBenchmark.minRate) }}%</el-descriptions-item>
              <el-descriptions-item label="竞品最高利率">{{ numVal(competitorBenchmark.maxRate) }}%</el-descriptions-item>
              <el-descriptions-item label="对标竞品数量">{{ numVal(competitorBenchmark.competitorCount) }} 家</el-descriptions-item>
            </el-descriptions>
            <el-table v-if="competitorBenchmark.details && competitorBenchmark.details.length > 0" :data="competitorBenchmark.details" size="small" style="margin-top: 12px;" border>
              <el-table-column label="竞品名称" prop="competitorName">
                <template #default="{ row }">{{ strVal(row.competitorName) }}</template>
              </el-table-column>
              <el-table-column label="利率(%)" prop="rate" width="120" align="center">
                <template #default="{ row }">{{ numVal(row.rate) }}%</template>
              </el-table-column>
              <el-table-column label="市场份额(%)" prop="marketShare" width="120" align="center">
                <template #default="{ row }">{{ numVal(row.marketShare) }}%</template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="24">
          <el-card shadow="never" class="detail-card">
            <template #header>
              <span class="section-title"><el-icon><List /></el-icon> 单客户优化明细 (UpliftDetail) - 共{{ upliftDetails.length }}条，展示前{{ Math.min(upliftDetails.length, 10) }}条</span>
            </template>
            <el-table :data="upliftDetails.slice(0, 10)" size="small" border stripe max-height="400">
              <el-table-column label="客户ID" prop="customerId" width="150">
                <template #default="{ row }">{{ strVal(row.customerId) }}</template>
              </el-table-column>
              <el-table-column label="风控档位利率(%)" prop="baseRate" width="130" align="center">
                <template #default="{ row }">{{ numVal(row.baseRate) }}%</template>
              </el-table-column>
              <el-table-column label="最优利率(%)" prop="optimalRate" width="110" align="center">
                <template #default="{ row }">
                  <span class="rate success">{{ numVal(row.optimalRate) }}%</span>
                </template>
              </el-table-column>
              <el-table-column label="最优上浮(%)" prop="optimalUplift" width="110" align="center">
                <template #default="{ row }">
                  +{{ numVal(row.optimalUplift) }}%
                </template>
              </el-table-column>
              <el-table-column label="转化概率" prop="convProb" width="100" align="center">
                <template #default="{ row }">
                  {{ formatPercent(row.convProb) }}
                </template>
              </el-table-column>
              <el-table-column label="增量利润(%)" prop="incrProfit" width="110" align="center">
                <template #default="{ row }">{{ numVal(row.incrProfit) }}%</template>
              </el-table-column>
              <el-table-column label="是否触发探索" prop="explored" width="110" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.explored ? 'warning' : 'info'" size="small">{{ row.explored ? '是(探索)' : '否(利用)' }}</el-tag>
                </template>
              </el-table-column>
            </el-table>
            <div v-if="upliftDetails.length === 0" class="empty-table-tip">暂无客户优化明细</div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-empty v-else-if="!loading" description="选择客群条件后点击「生成产品设计方案」" :image-size="120" />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Goods, Cpu, DataAnalysis, User, Star, DataLine, Histogram, List, InfoFilled } from '@element-plus/icons-vue'
import { productDesign } from '@/api/price/product'

const formRef = ref()
const loading = ref(false)
const result = ref(null)

const productTypeMap = {
  CASH_LOAN: '现金贷',
  CONSUMER_INSTALLMENT: '消费分期',
  REVOLVING_CREDIT: '循环贷'
}

const scenarioNameMap = {
  BASELINE: '基准情景',
  OPTIMISTIC: '乐观情景',
  PESSIMISTIC: '悲观情景',
  EXTREME: '极端情景'
}

const scenarioColorMap = {
  BASELINE: 'info',
  OPTIMISTIC: 'success',
  PESSIMISTIC: 'warning',
  EXTREME: 'danger'
}

const sensitivityMap = {
  HIGH: '高敏感度',
  MID: '中敏感度',
  LOW: '低敏感度'
}

const form = reactive({
  productType: 'CASH_LOAN',
  termMonths: 12,
  minAge: undefined,
  maxAge: undefined,
  minIncome: undefined,
  maxIncome: undefined,
  customerTag: '',
  minHousingFund: undefined,
  maxHousingFund: undefined,
  education: '',
  industry: '',
  region: '',
  maritalStatus: ''
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

const customerProfile = computed(() => {
  if (!result.value || !result.value.customerProfile) return {}
  const p = result.value.customerProfile
  if (typeof p === 'string') {
    try { return JSON.parse(p) } catch (e) { return {} }
  }
  return p
})

const engine1Pricing = computed(() => {
  if (!result.value || !result.value.engine1Pricing) return {}
  const e = result.value.engine1Pricing
  if (typeof e === 'string') {
    try { return JSON.parse(e) } catch (err) { return {} }
  }
  return e
})

const engine2Optimization = computed(() => {
  if (!result.value || !result.value.engine2Optimization) return {}
  const e = result.value.engine2Optimization
  if (typeof e === 'string') {
    try { return JSON.parse(e) } catch (err) { return {} }
  }
  return e
})

const competitorBenchmark = computed(() => {
  if (!result.value || !result.value.competitorBenchmark) return {}
  const c = result.value.competitorBenchmark
  if (typeof c === 'string') {
    try { return JSON.parse(c) } catch (err) { return {} }
  }
  return c
})

const scenarios = computed(() => {
  if (!result.value || !result.value.scenarios) return []
  const s = result.value.scenarios
  if (typeof s === 'string') {
    try { return JSON.parse(s) } catch (err) { return [] }
  }
  return Array.isArray(s) ? s : []
})

const recommendedRateRange = computed(() => {
  if (!result.value) return {
    conservativeRate: 0,
    moderateRate: 0,
    aggressiveRate: 0
  }
  let r = result.value.recommendedRange || 
          result.value.recommendedRateRange || 
          result.value.rateRange ||
          result.value
  if (!r) return {
    conservativeRate: 0,
    moderateRate: 0,
    aggressiveRate: 0
  }
  if (typeof r === 'string') {
    try { r = JSON.parse(r) } catch (err) { 
      return { conservativeRate: 0, moderateRate: 0, aggressiveRate: 0 } 
    }
  }
  return {
    conservativeRate: r.conservativeRate ?? r.conservative ?? 0,
    moderateRate: r.moderateRate ?? r.moderate ?? r.balancedRate ?? r.balanced ?? 0,
    aggressiveRate: r.aggressiveRate ?? r.aggressive ?? 0,
    rationale: r.rationale || r.note || ''
  }
})

const riskWarnings = computed(() => {
  if (!result.value || !result.value.riskWarnings) return []
  const w = result.value.riskWarnings
  if (typeof w === 'string') {
    try { return JSON.parse(w) } catch (err) { return [] }
  }
  return Array.isArray(w) ? w : []
})

const upliftDetails = computed(() => {
  if (!engine2Optimization.value.upliftDetails) return []
  const d = engine2Optimization.value.upliftDetails
  if (typeof d === 'string') {
    try { return JSON.parse(d) } catch (err) { return [] }
  }
  return Array.isArray(d) ? d : []
})

const hasDistributions = computed(() => {
  const p = customerProfile.value
  return p.riskTierDistribution || p.sensitivityGroupDistribution || p.educationDistribution ||
         p.industryDistribution || p.regionDistribution || p.maritalStatusDistribution
})

function formatNumber(num) {
  const n = numVal(num)
  return n.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
}

function formatPercent(val) {
  const n = numVal(val)
  if (n <= 1) return (n * 100).toFixed(1) + '%'
  return n.toFixed(1) + '%'
}

function riskLevelType(level) {
  if (!level) return 'info'
  if (level.includes('极低') || level.includes('低')) return 'success'
  if (level.includes('中')) return 'warning'
  if (level.includes('高')) return 'danger'
  return 'info'
}

function scenarioType(type) {
  return scenarioColorMap[type] || 'info'
}

function sensitivityLabel(key) {
  return sensitivityMap[key] || key
}

function parseJsonObj(val) {
  if (!val) return {}
  if (typeof val === 'object') return val
  try { return JSON.parse(val) } catch (e) { return {} }
}

function exploreRateLevel(explored, total) {
  if (!total) return 'rate-success'
  const rate = explored / total
  if (rate > 0.3) return 'rate-danger'
  if (rate > 0.1) return 'rate-warning'
  return 'rate-success'
}

function profitClass(val) {
  const n = numVal(val)
  if (n > 0) return 'profit-positive'
  if (n < 0) return 'profit-negative'
  return ''
}

async function handleDesign() {
  if (!form.productType) {
    ElMessage.warning('请选择产品类型')
    return
  }
  if (!form.termMonths) {
    ElMessage.warning('请输入期限')
    return
  }
  
  loading.value = true
  result.value = null
  
  try {
    const params = {
      productType: form.productType,
      termMonths: form.termMonths
    }
    
    if (form.customerTag) params.customerTag = form.customerTag
    if (form.minAge) params.minAge = form.minAge
    if (form.maxAge) params.maxAge = form.maxAge
    if (form.minIncome) params.minIncome = form.minIncome
    if (form.maxIncome) params.maxIncome = form.maxIncome
    if (form.minHousingFund) params.minHousingFund = form.minHousingFund
    if (form.maxHousingFund) params.maxHousingFund = form.maxHousingFund
    if (form.education) params.education = form.education
    if (form.industry && form.industry.trim()) params.industry = form.industry.trim()
    if (form.region && form.region.trim()) params.region = form.region.trim()
    if (form.maritalStatus) params.maritalStatus = form.maritalStatus
    
    const res = await productDesign(params)
    result.value = res
    ElMessage.success('产品设计方案生成完成')
  } catch (e) {
    console.error('产品设计失败', e)
    ElMessage.error('生成方案失败：' + (e.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.productType = 'CASH_LOAN'
  form.termMonths = 12
  form.minAge = undefined
  form.maxAge = undefined
  form.minIncome = undefined
  form.maxIncome = undefined
  form.customerTag = ''
  form.minHousingFund = undefined
  form.maxHousingFund = undefined
  form.education = ''
  form.industry = ''
  form.region = ''
  form.maritalStatus = ''
  result.value = null
}
</script>

<style lang="scss" scoped>
.product-design-page {
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
    
    .range-input {
      display: flex;
      align-items: center;
      gap: 4px;
      
      .range-sep {
        color: #909399;
      }
    }
  }
  
  .result-container {
    .section-title {
      font-size: 15px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
      
      .sub-title {
        font-size: 12px;
        font-weight: normal;
        color: #909399;
      }
    }
    
    .summary-card {
      border-radius: 10px;
      
      .summary-info {
        .info-item {
          margin-bottom: 12px;
          
          .label {
            color: #606266;
            font-weight: 500;
          }
          
          .value {
            color: #303133;
          }
        }
        
        .risk-warnings {
          margin-top: 12px;
        }
      }
    }
    
    .engine-card, .profile-card, .recommend-card, .scenario-card, .competitor-card, .detail-card {
      border-radius: 10px;
      height: 100%;
    }
    
    .empty-table-tip {
      text-align: center;
      padding: 20px;
      color: #909399;
      font-size: 13px;
    }
    
    .engine-content {
      .rate {
        font-weight: 600;
        font-size: 15px;
        
        &.primary { color: #409EFF; }
        &.success { color: #67C23A; }
      }
      
      .uplift {
        color: #E6A23C;
        font-weight: 600;
      }
      
      .formula-note {
        margin-top: 12px;
        padding: 8px 12px;
        background: #f4f4f5;
        border-radius: 4px;
        font-size: 12px;
        color: #909399;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      
      .explore-rate {
        margin-top: 12px;
        font-size: 13px;
        color: #606266;
        
        .rate-success { color: #67C23A; font-weight: 600; }
        .rate-warning { color: #E6A23C; font-weight: 600; }
        .rate-danger { color: #F56C6C; font-weight: 600; }
      }
    }
    
    .profile-content {
      .profile-stat {
        text-align: center;
        padding: 12px;
        background: #f5f7fa;
        border-radius: 8px;
        margin-bottom: 12px;
        
        .stat-number {
          font-size: 20px;
          font-weight: 700;
          color: #409EFF;
          margin-bottom: 4px;
        }
        
        .stat-label {
          font-size: 12px;
          color: #909399;
        }
      }
      
      .distribution-collapse {
        margin-top: 8px;
        
        .dist-section {
          margin-bottom: 12px;
          
          h5 {
            margin: 0 0 8px 0;
            font-size: 13px;
            color: #606266;
            font-weight: 500;
          }
          
          .dist-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
          }
        }
      }
    }
    
    .recommend-content {
      .rate-range {
        display: flex;
        gap: 12px;
        
        .rate-tier {
          flex: 1;
          text-align: center;
          padding: 16px 8px;
          border-radius: 8px;
          background: #f5f7fa;
          border: 2px solid transparent;
          
          &.conservative {
            border-color: #909399;
            .tier-rate { color: #909399; }
          }
          
          &.balanced {
            background: linear-gradient(135deg, #f0f9eb 0%, #e1f3d8 100%);
            border-color: #67C23A;
            .tier-rate { color: #67C23A; font-size: 26px; }
          }
          
          &.aggressive {
            border-color: #E6A23C;
            .tier-rate { color: #E6A23C; }
          }
          
          .tier-label {
            font-size: 13px;
            font-weight: 600;
            color: #606266;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
          }
          
          .tier-rate {
            font-size: 22px;
            font-weight: 700;
            margin-bottom: 4px;
            
            &.primary { color: #409EFF; }
          }
          
          .tier-desc {
            font-size: 11px;
            color: #909399;
          }
        }
      }
      
      .range-note {
        margin-top: 12px;
        padding: 8px 12px;
        background: #fdf6ec;
        border-radius: 4px;
        font-size: 12px;
        color: #E6A23C;
        display: flex;
        align-items: flex-start;
        gap: 6px;
        line-height: 1.6;
      }
    }
    
    .rate {
      font-weight: 600;
      color: #409EFF;
      
      &.success { color: #67C23A; }
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
