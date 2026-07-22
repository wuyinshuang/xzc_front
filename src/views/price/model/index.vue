<template>
  <div class="app-container">
    <el-card shadow="never" class="mb8">
      <template #header>
        <div class="card-header">
          <span class="card-title">模型版本列表</span>
        </div>
      </template>
      <el-form :model="queryParams" :inline="true" size="default" class="mb8">
        <el-form-item label="模型版本" prop="modelVersion">
          <el-input v-model="queryParams.modelVersion" placeholder="请输入模型版本" clearable @keyup.enter="getModelList" style="width: 200px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="getModelList">查询</el-button>
          <el-button icon="Refresh" @click="resetModelQuery">重置</el-button>
          <el-button type="primary" plain icon="Cpu" @click="handleTrain">训练V1模型</el-button>
          <el-button type="success" plain icon="VideoPlay" @click="handleValidate">触发验证</el-button>
          <el-button type="warning" plain icon="Switch" @click="handleSwitchVersion">版本切换</el-button>
        </el-form-item>
      </el-form>
      <el-table v-loading="modelListLoading" :data="modelList" border style="width: 100%">
        <el-table-column label="验证ID" align="center" prop="validationId" min-width="80" />
        <el-table-column label="模型版本" align="center" prop="modelVersion" min-width="100" />
        <el-table-column label="验证日期" align="center" prop="validationDate" min-width="120" />
        <el-table-column label="训练样本数" align="center" prop="trainSampleCount" min-width="110" />
        <el-table-column label="验证样本数" align="center" prop="validSampleCount" min-width="110" />
        <el-table-column label="MAE" align="center" prop="mae" min-width="100" :formatter="formatNumber" />
        <el-table-column label="MAE标准差" align="center" prop="maeStdByGroup" min-width="120" :formatter="formatNumber" />
        <el-table-column label="R²" align="center" prop="rsquared" min-width="100" :formatter="formatNumber" />
        <el-table-column label="AUC" align="center" prop="auc" min-width="100" :formatter="formatNullableNumber" />
        <el-table-column label="Brier分数" align="center" prop="brierScore" min-width="110" :formatter="formatNullableNumber" />
        <el-table-column label="是否通过" align="center" prop="passed" min-width="90">
          <template #default="scope">
            <el-tag :type="scope.row.passed === 1 ? 'success' : 'danger'">
              {{ scope.row.passed === 1 ? '通过' : '未通过' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="验证结果说明" align="center" prop="remark" min-width="300" show-overflow-tooltip />
        <el-table-column label="创建时间" align="center" prop="createTime" min-width="180" />
      </el-table>
    </el-card>

    <el-card shadow="never" class="mb8">
      <template #header>
        <div class="card-header">
          <span class="card-title">敏感度模型状态</span>
          <el-button type="primary" link icon="Refresh" @click="getSensitivityStatus" style="margin-left: auto">刷新</el-button>
        </div>
      </template>
      <div v-loading="statusLoading">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-statistic title="当前使用版本" :value="sensitivityStatus.currentVersion || '-'">
              <template #suffix>
                <el-tag size="small" type="primary" style="margin-left: 8px;">引擎版本</el-tag>
              </template>
            </el-statistic>
          </el-col>
          <el-col :span="8">
            <el-statistic title="V1模型可用" :value="sensitivityStatus.v1Available ? '是' : '否'">
              <template #suffix>
                <el-tag size="small" :type="sensitivityStatus.v1Available ? 'success' : 'info'" style="margin-left: 8px;">
                  {{ sensitivityStatus.v1Available ? '可用' : '不可用' }}
                </el-tag>
              </template>
            </el-statistic>
          </el-col>
          <el-col :span="8">
            <el-statistic title="AUC阈值" :value="sensitivityStatus.aucThreshold" :precision="2" />
          </el-col>
        </el-row>
        <el-divider />
        <el-row :gutter="20">
          <el-col :span="8">
            <el-statistic title="V1模型AUC" :value="sensitivityStatus.v1Auc ?? '-'" :precision="sensitivityStatus.v1Auc != null ? 4 : 0" />
          </el-col>
          <el-col :span="8">
            <el-statistic title="自动回退" :value="sensitivityStatus.fallbackEnabled ? '已启用' : '已禁用'">
              <template #suffix>
                <el-tag size="small" :type="sensitivityStatus.fallbackEnabled ? 'warning' : 'info'" style="margin-left: 8px;">
                  {{ sensitivityStatus.fallbackEnabled ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-statistic>
          </el-col>
        </el-row>
        <el-divider />
        <el-alert :title="sensitivityStatus.description" type="info" :closable="false" show-icon />
      </div>
    </el-card>

    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">V1模型信息与历史</span>
          <el-button type="primary" link icon="Refresh" @click="getSensitivityModel" style="margin-left: auto">刷新</el-button>
        </div>
      </template>
      <div v-loading="modelInfoLoading">
        <el-row :gutter="20" class="mb8">
          <el-col :span="8">
            <el-statistic title="当前版本" :value="v1modelInfo.currentVersion || '-'" />
          </el-col>
          <el-col :span="8">
            <el-statistic title="AUC阈值" :value="v1modelInfo.aucThreshold" :precision="2" />
          </el-col>
          <el-col :span="8">
            <el-statistic title="激活模型" :value="v1modelInfo.activeModel ? '存在' : '无'" />
          </el-col>
        </el-row>
        <el-divider v-if="v1modelInfo.message || v1modelInfo.modelHistory?.length" />
        <el-alert v-if="v1modelInfo.message" :title="v1modelInfo.message" :type="v1modelInfo.activeModel ? 'success' : 'warning'" :closable="false" show-icon class="mb8" />
        <div v-if="v1modelInfo.modelHistory && v1modelInfo.modelHistory.length > 0">
          <h4 style="margin: 16px 0 12px 0;">模型历史</h4>
          <el-table :data="v1modelInfo.modelHistory" border size="small">
            <el-table-column label="模型ID" align="center" prop="modelId" min-width="100" />
            <el-table-column label="版本" align="center" prop="version" min-width="80" />
            <el-table-column label="训练日期" align="center" prop="trainDate" min-width="120" />
            <el-table-column label="AUC" align="center" prop="auc" min-width="100" :formatter="formatNumber" />
            <el-table-column label="状态" align="center" prop="status" min-width="100">
              <template #default="scope">
                <el-tag :type="scope.row.status === 'ACTIVE' ? 'success' : 'info'">
                  {{ scope.row.status === 'ACTIVE' ? '激活' : scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="训练样本数" align="center" prop="trainSampleCount" min-width="110" />
            <el-table-column label="备注" align="center" prop="remark" min-width="200" show-overflow-tooltip />
          </el-table>
        </div>
      </div>
    </el-card>

    <el-dialog title="训练V1敏感度模型" v-model="trainOpen" width="500px" append-to-body>
      <el-form ref="trainFormRef" :model="trainForm" :rules="trainRules" label-width="120px">
        <el-form-item label="数据源" prop="dataSource">
          <el-radio-group v-model="trainForm.dataSource">
            <el-radio label="simulated">模拟数据（默认，用于链路验证）</el-radio>
            <el-radio label="real">真实数据（从业务表获取样本）</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="训练集客户ID" prop="customerIds">
          <el-input v-model="trainForm.customerIdsText" type="textarea" placeholder="仅模拟模式有效，多个ID用逗号分隔，留空使用全量客户" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitTrain" :loading="trainLoading">开始训练</el-button>
          <el-button @click="trainOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog title="触发模型验证" v-model="validateOpen" width="500px" append-to-body>
      <el-form ref="validateFormRef" :model="validateForm" :rules="validateRules" label-width="120px">
        <el-form-item label="模型版本" prop="modelVersion">
          <el-select v-model="validateForm.modelVersion" placeholder="请选择模型版本" :style="{width: '100%'}">
            <el-option label="V3" value="V3" />
            <el-option label="V1" value="V1" />
            <el-option label="V0" value="V0" />
          </el-select>
        </el-form-item>
        <el-form-item label="验证集客户ID" prop="validIdsText">
          <el-input v-model="validateForm.validIdsText" type="textarea" placeholder="多个ID用逗号分隔" :rows="3" />
        </el-form-item>
        <el-form-item label="训练集客户ID" prop="trainIdsText">
          <el-input v-model="validateForm.trainIdsText" type="textarea" placeholder="选填，多个ID用逗号分隔" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitValidate" :loading="validateLoading">触发验证</el-button>
          <el-button @click="validateOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog title="版本切换" v-model="switchOpen" width="400px" append-to-body>
      <el-form ref="switchFormRef" :model="switchForm" :rules="switchRules" label-width="100px">
        <el-form-item label="目标版本" prop="version">
          <el-radio-group v-model="switchForm.version">
            <el-radio label="V0">V0 - 规则引擎（敏感度分群+线性衰减）</el-radio>
            <el-radio label="V1">V1 - Logistic回归敏感度模型</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-alert title="切换到V1前会自动检查是否有ACTIVE状态的V1模型，切换后会同步更新数据库和内存缓存" type="warning" :closable="false" show-icon />
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitSwitch" :loading="switchLoading">确认切换</el-button>
          <el-button @click="switchOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog title="训练结果" v-model="trainResultOpen" width="600px" append-to-body>
      <el-descriptions :column="2" border v-loading="trainResultLoading">
        <el-descriptions-item label="模型版本">{{ trainResult.modelVersion }}</el-descriptions-item>
        <el-descriptions-item label="数据源">{{ trainResult.dataSource }}</el-descriptions-item>
        <el-descriptions-item label="训练样本数">{{ trainResult.trainSampleCount }}</el-descriptions-item>
        <el-descriptions-item label="训练耗时">{{ trainResult.durationMs }}ms</el-descriptions-item>
        <el-descriptions-item label="AUC值">
          <el-tag :type="trainResult.passed ? 'success' : 'danger'">
            {{ trainResult.auc != null ? Number(trainResult.auc).toFixed(4) : '-' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Brier分数">{{ trainResult.brierScore != null ? Number(trainResult.brierScore).toFixed(4) : '-' }}</el-descriptions-item>
        <el-descriptions-item label="是否达标">
          <el-tag :type="trainResult.passed ? 'success' : 'danger'">
            {{ trainResult.passed ? '达标' : '未达标' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="模型状态">
          <el-tag :type="trainResult.status === 'ACTIVE' ? 'success' : 'info'">
            {{ trainResult.status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="AUC阈值">{{ trainResult.aucThreshold }}</el-descriptions-item>
        <el-descriptions-item label="当前版本">{{ trainResult.currentVersion }}</el-descriptions-item>
        <el-descriptions-item label="偏置项">{{ trainResult.bias }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ trainResult.remark }}</el-descriptions-item>
        <el-descriptions-item v-if="trainResult.warning" label="警告" :span="2">
          <el-alert :title="trainResult.warning" type="warning" :closable="false" />
        </el-descriptions-item>
        <el-descriptions-item v-if="trainResult.nextStep" label="下一步" :span="2">
          <el-alert :title="trainResult.nextStep" type="success" :closable="false" />
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="trainResultOpen = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="PriceModel">
import { listModels, getSensitivityStatus as fetchSensitivityStatus, getSensitivityModel as fetchSensitivityModel, trainSensitivityModel, validateModel, switchSensitivityVersion } from "@/api/price/model"

const { proxy } = getCurrentInstance()
const trainFormRef = ref()
const validateFormRef = ref()
const switchFormRef = ref()

const modelListLoading = ref(false)
const modelList = ref([])
const queryParams = ref({
  modelVersion: undefined
})

const statusLoading = ref(false)
const sensitivityStatus = ref({})

const modelInfoLoading = ref(false)
const v1modelInfo = ref({})

const trainOpen = ref(false)
const trainLoading = ref(false)
const trainForm = ref({
  dataSource: 'simulated',
  customerIdsText: ''
})
const trainRules = {
  dataSource: [{ required: true, message: "请选择数据源", trigger: "change" }]
}
const trainResultOpen = ref(false)
const trainResultLoading = ref(false)
const trainResult = ref({})

const validateOpen = ref(false)
const validateLoading = ref(false)
const validateForm = ref({
  modelVersion: 'V3',
  trainIdsText: '',
  validIdsText: ''
})
const validateRules = {
  modelVersion: [{ required: true, message: "请选择模型版本", trigger: "change" }],
  validIdsText: [{ required: true, message: "请输入验证集客户ID", trigger: "blur" }]
}

const switchOpen = ref(false)
const switchLoading = ref(false)
const switchForm = ref({
  version: 'V0'
})
const switchRules = {
  version: [{ required: true, message: "请选择目标版本", trigger: "change" }]
}

function formatNumber(row, column, cellValue) {
  if (cellValue == null || cellValue === undefined || isNaN(cellValue)) return '-'
  return Number(cellValue).toFixed(4)
}

function formatNullableNumber(row, column, cellValue) {
  if (cellValue == null || cellValue === undefined || isNaN(cellValue)) return '-'
  return Number(cellValue).toFixed(4)
}

function parseIds(text) {
  if (!text || !text.trim()) return []
  return text.split(/[,，\s]+/).map(id => id.trim()).filter(id => id)
}

function getModelList() {
  modelListLoading.value = true
  const params = {}
  if (queryParams.value.modelVersion) {
    params.modelVersion = queryParams.value.modelVersion
  }
  listModels(params).then(response => {
    let list = []
    if (Array.isArray(response)) {
      list = response
    } else if (response && Array.isArray(response.list)) {
      list = response.list
    }
    list.sort((a, b) => (b.validationId ?? 0) - (a.validationId ?? 0))
    modelList.value = list
    modelListLoading.value = false
  }).catch(() => {
    modelListLoading.value = false
  })
}

function resetModelQuery() {
  queryParams.value.modelVersion = undefined
  getModelList()
}

function getSensitivityStatus() {
  statusLoading.value = true
  fetchSensitivityStatus().then(response => {
    sensitivityStatus.value = response || {}
    statusLoading.value = false
  }).catch(() => {
    statusLoading.value = false
  })
}

function getSensitivityModel() {
  modelInfoLoading.value = true
  fetchSensitivityModel().then(response => {
    v1modelInfo.value = response || {}
    modelInfoLoading.value = false
  }).catch(() => {
    modelInfoLoading.value = false
  })
}

function handleTrain() {
  trainForm.value = {
    dataSource: 'simulated',
    customerIdsText: ''
  }
  trainOpen.value = true
}

function submitTrain() {
  trainFormRef.value.validate(valid => {
    if (valid) {
      trainLoading.value = true
      const data = {
        dataSource: trainForm.value.dataSource
      }
      const customerIds = parseIds(trainForm.value.customerIdsText)
      if (customerIds.length > 0 && trainForm.value.dataSource === 'simulated') {
        data.customerIds = customerIds
      }
      trainSensitivityModel(data).then(response => {
        trainLoading.value = false
        if (response.error || response.message && response.message.includes('失败')) {
          proxy.$modal.msgError(response.error || response.message)
          return
        }
        trainOpen.value = false
        trainResult.value = response
        trainResultOpen.value = true
        proxy.$modal.msgSuccess("训练完成")
        getModelList()
        getSensitivityStatus()
        getSensitivityModel()
      }).catch(() => {
        trainLoading.value = false
      })
    }
  })
}

function handleValidate() {
  validateForm.value = {
    modelVersion: 'V3',
    trainIdsText: '',
    validIdsText: ''
  }
  validateOpen.value = true
}

function submitValidate() {
  validateFormRef.value.validate(valid => {
    if (valid) {
      validateLoading.value = true
      const data = {
        modelVersion: validateForm.value.modelVersion,
        validIds: parseIds(validateForm.value.validIdsText)
      }
      const trainIds = parseIds(validateForm.value.trainIdsText)
      if (trainIds.length > 0) {
        data.trainIds = trainIds
      }
      validateModel(data).then(response => {
        validateLoading.value = false
        validateOpen.value = false
        if (response.message) {
          proxy.$modal.msgSuccess(response.message)
        } else if (response.error) {
          proxy.$modal.msgError(response.error)
          return
        } else {
          proxy.$modal.msgSuccess("验证触发成功")
        }
        getModelList()
      }).catch(() => {
        validateLoading.value = false
      })
    }
  })
}

function handleSwitchVersion() {
  switchForm.value.version = sensitivityStatus.value.currentVersion === 'V1' ? 'V0' : 'V1'
  switchOpen.value = true
}

function submitSwitch() {
  switchFormRef.value.validate(valid => {
    if (valid) {
      switchLoading.value = true
      switchSensitivityVersion(switchForm.value.version).then(response => {
        switchLoading.value = false
        if (response.error) {
          proxy.$modal.msgError(response.error)
          return
        }
        switchOpen.value = false
        proxy.$modal.msgSuccess(response.message || `已从${response.previousVersion}切换到${response.currentVersion}`)
        getSensitivityStatus()
        getSensitivityModel()
      }).catch(() => {
        switchLoading.value = false
      })
    }
  })
}

onMounted(() => {
  getModelList()
  getSensitivityStatus()
  getSensitivityModel()
})
</script>

<style scoped>
.card-header {
  display: flex;
  align-items: center;
}
.card-title {
  font-size: 16px;
  font-weight: 600;
}
.mb8 {
  margin-bottom: 16px;
}
</style>
