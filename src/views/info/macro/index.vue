<template>
  <div class="app-container">
    <el-card shadow="never" class="header-card">
      <div class="header-content">
        <div class="header-title">
          <span class="title-text">宏观经济指标</span>
          <el-tag v-if="data?.dataDate" type="info" size="large">数据日期：{{ data.dataDate }}</el-tag>
        </div>
        <el-button type="primary" icon="Refresh" @click="loadData" :loading="loading">
          刷新数据
        </el-button>
      </div>
    </el-card>

    <el-row :gutter="20" v-loading="loading">
      <el-col :span="8" v-for="item in indicators" :key="item.key">
        <div class="indicator-card" :style="{ borderLeftColor: item.color }">
          <div class="indicator-label">{{ item.label }}</div>
          <div class="indicator-value">
            <span class="value-number">{{ formatValue(data?.[item.key]) }}</span>
            <span class="value-unit">%</span>
          </div>
          <div class="indicator-desc">{{ item.desc }}</div>
        </div>
      </el-col>
    </el-row>

    <el-card shadow="never" class="detail-card" v-if="data">
      <template #header>
        <span>指标详情</span>
      </template>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="5年期LPR">
          {{ formatValue(data.lpr5y) }}%
        </el-descriptions-item>
        <el-descriptions-item label="资金成本">
          {{ formatValue(data.fundCost) }}%
        </el-descriptions-item>
        <el-descriptions-item label="GDP增速">
          {{ formatValue(data.gdpGrowth) }}%
        </el-descriptions-item>
        <el-descriptions-item label="CPI">
          {{ formatValue(data.cpi) }}%
        </el-descriptions-item>
        <el-descriptions-item label="存款准备金率">
          {{ formatValue(data.reserveRatio) }}%
        </el-descriptions-item>
        <el-descriptions-item label="数据日期">
          {{ data.dataDate || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup name="InfoMacro">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getMacroIndicators } from '@/api/info/macro'

const loading = ref(false)
const data = ref(null)

const indicators = [
  { key: 'lpr5y', label: '5年期LPR', desc: '贷款市场报价利率', color: '#409eff' },
  { key: 'fundCost', label: '资金成本', desc: '银行资金成本率', color: '#67c23a' },
  { key: 'gdpGrowth', label: 'GDP增速', desc: '国内生产总值同比增速', color: '#e6a23c' },
  { key: 'cpi', label: 'CPI', desc: '居民消费价格指数', color: '#f56c6c' },
  { key: 'reserveRatio', label: '存款准备金率', desc: '金融机构存款准备金率', color: '#909399' }
]

function formatValue(val) {
  if (val === null || val === undefined) return '-'
  return Number(val).toFixed(4).replace(/\.?0+$/, '') || '0'
}

async function loadData() {
  loading.value = true
  try {
    const res = await getMacroIndicators()
    if (res.error) {
      ElMessage.error(res.error)
      return
    }
    data.value = res
  } catch (e) {
    console.error('获取宏观指标失败', e)
    ElMessage.error('获取宏观指标失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.header-card {
  margin-bottom: 20px;
}
.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.header-title {
  display: flex;
  align-items: center;
  gap: 16px;
}
.title-text {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}
.indicator-card {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 20px;
  border-left: 4px solid #409eff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
}
.indicator-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 12px;
}
.indicator-value {
  display: flex;
  align-items: baseline;
  margin-bottom: 8px;
}
.value-number {
  font-size: 36px;
  font-weight: bold;
  color: #303133;
}
.value-unit {
  font-size: 18px;
  color: #909399;
  margin-left: 4px;
}
.indicator-desc {
  font-size: 12px;
  color: #909399;
}
.detail-card {
  margin-top: 20px;
}
</style>
