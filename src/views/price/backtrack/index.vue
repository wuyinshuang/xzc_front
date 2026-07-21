<template>
  <div class="app-container">
    <el-form ref="queryRef" :model="queryParams" :inline="true" size="default">
      <el-form-item label="模型版本" prop="modelVersion">
        <el-input v-model="queryParams.modelVersion" placeholder="请输入模型版本" clearable :style="{width: '200px'}" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="backtestList" border style="width: 100%">
      <el-table-column label="验证ID" align="center" prop="validationId" min-width="120" />
      <el-table-column label="验证类型" align="center" prop="validationType" min-width="120" />
      <el-table-column label="模型版本" align="center" prop="modelVersion" min-width="120" />
      <el-table-column label="验证日期" align="center" prop="validationDate" min-width="120" />
      <el-table-column label="数据开始日期" align="center" prop="dataStartDate" min-width="140" />
      <el-table-column label="数据结束日期" align="center" prop="dataEndDate" min-width="140" />
      <el-table-column label="样本数量" align="center" prop="sampleCount" min-width="120" />
      <el-table-column label="MAE" align="center" prop="maeRate" min-width="100" />
      <el-table-column label="RMSE" align="center" prop="rmseRate" min-width="100" />
      <el-table-column label="偏差率" align="center" prop="biasRate" min-width="100" />
      <el-table-column label="准确率通过" align="center" prop="accuracyPassed" min-width="120" />
      <el-table-column label="KS统计量" align="center" prop="ksStatistic" min-width="120" />
      <el-table-column label="AUC" align="center" prop="aucRoc" min-width="100" />
      <el-table-column label="基尼系数" align="center" prop="giniCoefficient" min-width="120" />
      <el-table-column label="操作" align="center" width="100" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleDetail(scope.row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="回溯验证详情" v-model="detailOpen" width="1000px" append-to-body>
      <el-form ref="detailFormRef" :model="detailData" label-width="150px" v-loading="detailLoading">
        <el-divider content-position="left">基本信息</el-divider>
        <el-row>
          <el-col :span="12">
            <el-form-item label="验证ID">
              <span>{{ detailData.validationId }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="验证类型">
              <span>{{ detailData.validationType }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模型版本">
              <span>{{ detailData.modelVersion }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="验证日期">
              <span>{{ detailData.validationDate }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数据开始日期">
              <span>{{ detailData.dataStartDate }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数据结束日期">
              <span>{{ detailData.dataEndDate }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="样本数量">
              <span>{{ detailData.sampleCount }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备注">
              <span>{{ detailData.remark }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">准确性指标</el-divider>
        <el-row>
          <el-col :span="8">
            <el-form-item label="MAE">
              <span>{{ detailData.maeRate }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="RMSE">
              <span>{{ detailData.rmseRate }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="偏差率">
              <span>{{ detailData.biasRate }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="准确率是否通过">
              <span>{{ detailData.accuracyPassed }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">风险区分能力</el-divider>
        <el-row>
          <el-col :span="8">
            <el-form-item label="KS统计量">
              <span>{{ detailData.ksStatistic }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="AUC">
              <span>{{ detailData.aucRoc }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="基尼系数">
              <span>{{ detailData.giniCoefficient }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="低分组坏账率">
              <span>{{ detailData.badRateLowGroup }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="高分组坏账率">
              <span>{{ detailData.badRateHighGroup }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="风险区分是否通过">
              <span>{{ detailData.riskDiscriminationPassed }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">盈利能力</el-divider>
        <el-row>
          <el-col :span="8">
            <el-form-item label="实际利润">
              <span>{{ detailData.actualProfit }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="预期利润">
              <span>{{ detailData.expectedProfit }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="利润覆盖率">
              <span>{{ detailData.profitCoverageRatio }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="盈利能力是否通过">
              <span>{{ detailData.profitabilityPassed }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">稳定性与建议</el-divider>
        <el-row>
          <el-col :span="8">
            <el-form-item label="PSI分数">
              <span>{{ detailData.psiScore }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="PSI状态">
              <span>{{ detailData.psiStatus }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="稳定性是否通过">
              <span>{{ detailData.stabilityPassed }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="整体是否通过">
              <span>{{ detailData.overallPassed }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="建议">
              <span>{{ detailData.recommendation }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="调整措施">
              <span>{{ detailData.adjustmentActions }}</span>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailOpen = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup name="Backtest">
import { listBacktestResults, getBacktestResult } from "@/api/price/backtest"

const { proxy } = getCurrentInstance()
const queryRef = ref()

const loading = ref(false)
const backtestList = ref([])
const queryParams = ref({
  modelVersion: undefined
})

const detailOpen = ref(false)
const detailLoading = ref(false)
const detailData = ref({})

function getList() {
  loading.value = true
  const params = {
    limit: 20
  }
  if (queryParams.value.modelVersion) {
    params.modelVersion = queryParams.value.modelVersion
  }
  listBacktestResults(params).then(response => {
    let list = Array.isArray(response) ? response : []
    list = list.sort((a, b) => {
      if (!a.validationDate || !b.validationDate) return 0
      return new Date(b.validationDate) - new Date(a.validationDate)
    })
    backtestList.value = list
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

function handleQuery() {
  getList()
}

function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

function handleDetail(row) {
  detailOpen.value = true
  detailLoading.value = true
  getBacktestResult(row.validationId).then(response => {
    detailData.value = response || {}
    detailLoading.value = false
  }).catch(() => {
    detailLoading.value = false
  })
}

getList()
</script>
<style>
</style>
