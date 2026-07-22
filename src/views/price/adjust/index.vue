<template>
  <div class="app-container">
    <el-form ref="queryRef" :model="queryParams" :inline="true" size="default">
      <el-form-item label="调整ID" prop="adjustmentId">
        <el-input v-model="queryParams.adjustmentId" placeholder="请输入调整ID" clearable :style="{width: '180px'}" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="调整类型" prop="adjustmentType">
        <el-input v-model="queryParams.adjustmentType" placeholder="请输入调整类型" clearable :style="{width: '180px'}" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable :style="{width: '180px'}">
          <el-option label="已应用" value="APPLIED" />
          <el-option label="已回滚" value="ROLLED_BACK" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleApply">应用调整</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="adjustmentList" border style="width: 100%">
      <el-table-column label="调整ID" align="center" prop="adjustmentId" min-width="100" />
      <el-table-column label="验证ID" align="center" prop="validationId" min-width="100" />
      <el-table-column label="调整类型" align="center" prop="adjustmentType" min-width="180" />
      <el-table-column label="参数键" align="center" prop="paramKey" min-width="180" />
      <el-table-column label="原值" align="center" prop="oldValue" min-width="120" />
      <el-table-column label="新值" align="center" prop="newValue" min-width="120" />
      <el-table-column label="调整原因" align="center" prop="adjustmentReason" min-width="200" />
      <el-table-column label="操作人" align="center" prop="operatorId" min-width="120" />
      <el-table-column label="操作时间" align="center" prop="operateTime" min-width="180" />
      <el-table-column label="状态" align="center" prop="status" min-width="120">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'APPLIED' ? 'success' : 'info'">
            {{ scope.row.status === 'APPLIED' ? '已应用' : '已回滚' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="120" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="warning" icon="RefreshLeft" @click="handleRollback(scope.row)" :disabled="scope.row.status !== 'APPLIED'">回滚</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="应用调整" v-model="applyOpen" width="600px" append-to-body>
      <el-form ref="applyFormRef" :model="applyForm" :rules="applyRules" label-width="100px">
        <el-form-item label="验证ID" prop="validationId">
          <el-input v-model="applyForm.validationId" placeholder="请输入验证ID" />
        </el-form-item>
        <el-form-item label="调整类型" prop="adjustmentType">
          <el-select v-model="applyForm.adjustmentType" placeholder="请选择调整类型" :style="{width: '100%'}">
            <el-option label="风险权重调整" value="RISK_WEIGHT" />
            <el-option label="利率调整" value="RATE_ADJUST" />
            <el-option label="策略阈值调整" value="STRATEGY_THRESHOLD" />
          </el-select>
        </el-form-item>
        <el-form-item label="参数键" prop="paramKey">
          <el-input v-model="applyForm.paramKey" placeholder="请输入参数键" />
        </el-form-item>
        <el-form-item label="原值" prop="oldValue">
          <el-input v-model="applyForm.oldValue" placeholder="请输入原值" />
        </el-form-item>
        <el-form-item label="新值" prop="newValue">
          <el-input v-model="applyForm.newValue" placeholder="请输入新值" />
        </el-form-item>
        <el-form-item label="调整原因" prop="reason">
          <el-input v-model="applyForm.reason" type="textarea" placeholder="请输入调整原因" />
        </el-form-item>
        <el-form-item label="操作人" prop="operatorId">
          <el-input v-model="applyForm.operatorId" placeholder="请输入操作人ID" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitApply">确 定</el-button>
          <el-button @click="applyOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog title="回滚调整" v-model="rollbackOpen" width="400px" append-to-body>
      <el-form ref="rollbackFormRef" :model="rollbackForm" :rules="rollbackRules" label-width="100px">
        <el-form-item label="调整ID">
          <span>{{ currentAdjustmentId }}</span>
        </el-form-item>
        <el-form-item label="操作人" prop="operatorId">
          <el-input v-model="rollbackForm.operatorId" placeholder="请输入操作人ID" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitRollback">确 定</el-button>
          <el-button @click="rollbackOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup name="Adjustment">
import { listAdjustments, applyAdjustment, rollbackAdjustment } from "@/api/price/backtest"

const { proxy } = getCurrentInstance()
const queryRef = ref()
const applyFormRef = ref()
const rollbackFormRef = ref()

const loading = ref(false)
const adjustmentList = ref([])
const queryParams = ref({
  adjustmentId: undefined,
  adjustmentType: undefined,
  status: undefined
})

const applyOpen = ref(false)
const applyForm = ref({
  validationId: '',
  adjustmentType: 'RISK_WEIGHT',
  paramKey: '',
  oldValue: '',
  newValue: '',
  reason: '',
  operatorId: 'admin'
})
const applyRules = {
  validationId: [{ required: true, message: "验证ID不能为空", trigger: "blur" }],
  adjustmentType: [{ required: true, message: "调整类型不能为空", trigger: "change" }],
  paramKey: [{ required: true, message: "参数键不能为空", trigger: "blur" }],
  oldValue: [{ required: true, message: "原值不能为空", trigger: "blur" }],
  newValue: [{ required: true, message: "新值不能为空", trigger: "blur" }],
  reason: [{ required: true, message: "调整原因不能为空", trigger: "blur" }],
  operatorId: [{ required: true, message: "操作人不能为空", trigger: "blur" }]
}

const rollbackOpen = ref(false)
const rollbackForm = ref({
  operatorId: 'admin'
})
const rollbackRules = {
  operatorId: [{ required: true, message: "操作人不能为空", trigger: "blur" }]
}
const currentAdjustmentId = ref(null)

function getList() {
  loading.value = true
  const params = {}
  if (queryParams.value.adjustmentId) {
    params.adjustmentId = queryParams.value.adjustmentId
  }
  if (queryParams.value.adjustmentType) {
    params.adjustmentType = queryParams.value.adjustmentType
  }
  if (queryParams.value.status) {
    params.status = queryParams.value.status
  }
  listAdjustments(params).then(response => {
    if (Array.isArray(response)) {
      adjustmentList.value = response
    } else if (response && Array.isArray(response.list)) {
      adjustmentList.value = response.list
    } else {
      adjustmentList.value = []
    }
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

function handleApply() {
  applyForm.value = {
    validationId: '',
    adjustmentType: 'RISK_WEIGHT',
    paramKey: '',
    oldValue: '',
    newValue: '',
    reason: '',
    operatorId: 'admin'
  }
  applyOpen.value = true
}

function submitApply() {
  applyFormRef.value.validate(valid => {
    if (valid) {
      applyAdjustment(applyForm.value).then(() => {
        proxy.$modal.msgSuccess("调整应用成功")
        applyOpen.value = false
        getList()
      })
    }
  })
}

function handleRollback(row) {
  currentAdjustmentId.value = row.adjustmentId
  rollbackForm.value = {
    operatorId: 'admin'
  }
  rollbackOpen.value = true
}

function submitRollback() {
  rollbackFormRef.value.validate(valid => {
    if (valid) {
      rollbackAdjustment(currentAdjustmentId.value, rollbackForm.value).then(() => {
        proxy.$modal.msgSuccess("回滚成功")
        rollbackOpen.value = false
        getList()
      })
    }
  })
}

getList()
</script>
<style>
</style>
