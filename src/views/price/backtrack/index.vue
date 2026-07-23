<template>
  <div class="app-container">
    <el-form ref="queryRef" :model="queryParams" :inline="true" size="default">
      <el-form-item label="模型版本" prop="modelVersion">
        <el-input v-model="queryParams.modelVersion" placeholder="请输入模型版本" clearable :style="{width: '200px'}" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="验证日期" prop="validationDate">
        <el-date-picker
          v-model="queryParams.validationDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择验证日期"
          :style="{width: '200px'}"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        <el-button type="success" icon="VideoPlay" @click="handleTrigger">手动触发验证</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="backtestList" border style="width: 100%">
      <el-table-column label="验证ID" align="center" prop="validationId" min-width="120" />
      <el-table-column label="模型版本" align="center" prop="modelVersion" min-width="120" />
      <el-table-column label="时间范围" align="center" min-width="220">
        <template #default="scope">
          {{ scope.row.dataStartDate }} ~ {{ scope.row.dataEndDate }}
        </template>
      </el-table-column>
      <el-table-column label="验证日期" align="center" prop="validationDate" min-width="120" />
      <el-table-column label="通过率" align="center" prop="overallPassed" min-width="120">
        <template #default="scope">
          <el-tag :type="scope.row.overallPassed === 3 || scope.row.overallPassed === true ? 'success' : 'danger'">
            {{ scope.row.overallPassed === 3 || scope.row.overallPassed === true ? '通过' : '未通过' }}
          </el-tag>
        </template>
      </el-table-column>
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
            <el-form-item label="数据时间范围">
              <span>{{ detailData.dataStartDate }} ~ {{ detailData.dataEndDate }}</span>
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

        <el-divider content-position="left">精度指标</el-divider>
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
            <el-form-item label="精度是否通过">
              <el-tag :type="detailData.accuracyPassed === 3 || detailData.accuracyPassed === true ? 'success' : 'danger'">
                {{ detailData.accuracyPassed === 3 || detailData.accuracyPassed === true ? '通过' : '未通过' }}
              </el-tag>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">风险区分度</el-divider>
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
              <el-tag :type="detailData.riskDiscriminationPassed === 3 || detailData.riskDiscriminationPassed === true ? 'success' : 'danger'">
                {{ detailData.riskDiscriminationPassed === 3 || detailData.riskDiscriminationPassed === true ? '通过' : '未通过' }}
              </el-tag>
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
              <el-tag :type="detailData.profitabilityPassed === 3 || detailData.profitabilityPassed === true ? 'success' : 'danger'">
                {{ detailData.profitabilityPassed === 3 || detailData.profitabilityPassed === true ? '通过' : '未通过' }}
              </el-tag>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">稳定性</el-divider>
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
            <el-form-item label="建议">
              <span>{{ detailData.recommendation }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="稳定性是否通过">
              <el-tag :type="detailData.stabilityPassed === 3 || detailData.stabilityPassed === true ? 'success' : 'danger'">
                {{ detailData.stabilityPassed === 3 || detailData.stabilityPassed === true ? '通过' : '未通过' }}
              </el-tag>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="整体是否通过">
              <el-tag :type="detailData.overallPassed === 3 || detailData.overallPassed === true ? 'success' : 'danger'">
                {{ detailData.overallPassed === 3 || detailData.overallPassed === true ? '通过' : '未通过' }}
              </el-tag>
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

    <el-dialog title="手动触发验证" v-model="triggerOpen" width="500px" append-to-body>
      <el-form ref="triggerFormRef" :model="triggerForm" :rules="triggerRules" label-width="100px">
        <el-form-item label="模型版本" prop="modelVersion">
          <el-input v-model="triggerForm.modelVersion" placeholder="请输入模型版本，如V1" />
        </el-form-item>
        <el-form-item label="数据日期范围">
          <el-date-picker
            v-model="triggerDateRange"
            type="daterange"
            value-format="YYYY-MM-DD"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :style="{width: '100%'}"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" :loading="triggerLoading" @click="submitTrigger">确 定</el-button>
          <el-button @click="triggerOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup name="Backtrack">
import { listBacktestResults, getBacktestResult, triggerBacktestValidate } from "@/api/price/backtest"

const { proxy } = getCurrentInstance()
const queryRef = ref()
const triggerFormRef = ref()

const loading = ref(false)
const backtestList = ref([])
const queryParams = ref({
  modelVersion: undefined,
  validationDate: undefined
})

const detailOpen = ref(false)
const detailLoading = ref(false)
const detailData = ref({})

const triggerOpen = ref(false)
const triggerLoading = ref(false)
const triggerDateRange = ref([])
const triggerForm = ref({
  modelVersion: '',
  startDate: '',
  endDate: ''
})
const triggerRules = {
  modelVersion: [{ required: true, message: "模型版本不能为空", trigger: "blur" }]
}

function getList() {
  loading.value = true
  const params = {}
  if (queryParams.value.modelVersion && queryParams.value.modelVersion.trim()) {
    params.modelVersion = queryParams.value.modelVersion.trim()
  }
  if (queryParams.value.validationDate) {
    params.validationDate = queryParams.value.validationDate
  }
  listBacktestResults(params).then(response => {
    let list = []
    if (Array.isArray(response)) {
      list = response
    } else if (response && Array.isArray(response.list)) {
      list = response.list
    }
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
  queryParams.value.validationDate = undefined
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

function handleTrigger() {
  triggerForm.value = {
    modelVersion: queryParams.value.modelVersion || '',
    startDate: '',
    endDate: ''
  }
  triggerDateRange.value = []
  triggerOpen.value = true
}

function submitTrigger() {
  triggerFormRef.value.validate(valid => {
    if (valid) {
      if (!triggerDateRange.value || triggerDateRange.value.length !== 2) {
        proxy.$modal.msgWarning("请选择数据日期范围")
        return
      }
      triggerForm.value.startDate = triggerDateRange.value[0]
      triggerForm.value.endDate = triggerDateRange.value[1]
      triggerLoading.value = true
      triggerBacktestValidate(triggerForm.value).then(response => {
        triggerLoading.value = false
        if (response.success) {
          proxy.$modal.msgSuccess(response.message || "验证触发成功")
          triggerOpen.value = false
          getList()
        } else {
          proxy.$modal.msgError(response.error || response.message || "验证触发失败")
        }
      }).catch(() => {
        triggerLoading.value = false
      })
    }
  })
}

getList()
</script>
<style>
</style>
