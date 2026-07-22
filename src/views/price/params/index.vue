<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="68px">
      <el-form-item label="参数分类" prop="category">
        <el-select v-model="queryParams.category" placeholder="请选择参数分类" clearable :style="{width: '200px'}">
          <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="参数键名" prop="paramKey">
        <el-input
          v-model="queryParams.paramKey"
          placeholder="请输入参数键名"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd">新增参数</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="!selectedRow" @click="handleUpdate">更新参数</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="!selectedRow" @click="handleDelete">删除参数</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="RefreshRight" :disabled="!selectedRow" @click="handleReset">重置到默认值</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="Refresh" @click="handleRefresh">全量刷新</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="paramsList" border style="width: 100%" @current-change="handleCurrentChange" highlight-current-row>
      <el-table-column label="ID" align="center" prop="id" min-width="80" />
      <el-table-column label="参数键名" align="center" prop="paramKey" min-width="220" />
      <el-table-column label="参数键值" align="center" prop="paramValue" min-width="120" />
      <el-table-column label="参数类型" align="center" prop="paramType" min-width="120" />
      <el-table-column label="参数分类" align="center" prop="category" min-width="120">
        <template #default="scope">
          <el-tag :type="getCategoryTagType(scope.row.category)">{{ getCategoryLabel(scope.row.category) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="默认值" align="center" prop="defaultValue" min-width="100" />
      <el-table-column label="参数描述" align="center" prop="description" min-width="300" show-overflow-tooltip />
      <el-table-column label="创建时间" align="center" prop="createTime" min-width="180" />
      <el-table-column label="操作" align="center" width="100" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleDetail(scope.row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="formTitle" v-model="formOpen" width="600px" append-to-body>
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="参数键名" prop="paramKey">
              <el-input v-model="formData.paramKey" placeholder="请输入参数键名(kebab-case格式)" :disabled="formType === 'update'" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="参数键值" prop="paramValue">
              <el-input v-model="formData.paramValue" placeholder="请输入参数键值" />
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="formType === 'add'">
            <el-form-item label="参数类型" prop="paramType">
              <el-select v-model="formData.paramType" placeholder="请选择参数类型" :style="{width: '100%'}">
                <el-option label="DOUBLE - 双精度浮点型" value="DOUBLE" />
                <el-option label="INTEGER - 整数型" value="INTEGER" />
                <el-option label="LONG - 长整数型" value="LONG" />
                <el-option label="STRING - 字符串型" value="STRING" />
                <el-option label="BOOLEAN - 布尔型" value="BOOLEAN" />
                <el-option label="LIST_DOUBLE - 双精度列表" value="LIST_DOUBLE" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="formType === 'add'">
            <el-form-item label="参数分类" prop="category">
              <el-select v-model="formData.category" placeholder="请选择参数分类" :style="{width: '100%'}">
                <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="默认值" prop="defaultValue">
              <el-input v-model="formData.defaultValue" placeholder="请输入默认值(选填，不填则使用参数键值)" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="参数说明" prop="description">
              <el-input v-model="formData.description" type="textarea" placeholder="请输入参数说明" :rows="3" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm" :loading="submitLoading">确 定</el-button>
          <el-button @click="formOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog title="参数详情" v-model="detailOpen" width="600px" append-to-body>
      <el-form ref="detailFormRef" :model="detailData" label-width="120px" v-loading="detailLoading">
        <el-row>
          <el-col :span="12">
            <el-form-item label="ID">
              <span>{{ detailData.id }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="参数键名">
              <span>{{ detailData.paramKey }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="参数键值">
              <span>{{ detailData.paramValue }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="参数类型">
              <span>{{ detailData.paramType }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="参数分类">
              <span>{{ getCategoryLabel(detailData.category) }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="默认值">
              <span>{{ detailData.defaultValue }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="参数描述">
              <span>{{ detailData.description }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="创建时间">
              <span>{{ detailData.createTime }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="更新时间">
              <span>{{ detailData.updateTime }}</span>
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

<script setup name="Params">
import { listPricingParams, listPricingParamCategories, addPricingParam, updatePricingParam, deletePricingParam, resetPricingParam, refreshPricingParams } from "@/api/price/params"

const { proxy } = getCurrentInstance()
const queryRef = ref()
const formRef = ref()

const loading = ref(false)
const submitLoading = ref(false)
const paramsList = ref([])
const allParamsList = ref([])
const selectedRow = ref(null)
const queryParams = ref({
  category: undefined,
  paramKey: undefined
})

const categoryOptions = ref([])

const categoryLabelMap = {
  'ABTEST': 'AB测试',
  'BACKTEST': '回溯验证',
  'BASIC': '基础配置',
  'MODEL_VALIDATION': '模型验证',
  'REPORT': '报表',
  'SCENARIO': '场景',
  'SENSITIVITY': '敏感性',
  'VALUE_ADJUST': '数值调整'
}

const categoryColorMap = {
  'ABTEST': 'primary',
  'BACKTEST': 'success',
  'BASIC': 'info',
  'MODEL_VALIDATION': 'warning',
  'REPORT': 'danger',
  'SCENARIO': '',
  'SENSITIVITY': '',
  'VALUE_ADJUST': ''
}

const formOpen = ref(false)
const formTitle = ref("")
const formType = ref("add")
const formData = ref({
  paramKey: "",
  paramValue: "",
  paramType: "DOUBLE",
  category: "",
  description: "",
  defaultValue: ""
})

const formRules = {
  paramKey: [{ required: true, message: "参数键名不能为空", trigger: "blur" }],
  paramValue: [{ required: true, message: "参数键值不能为空", trigger: "blur" }],
  paramType: [{ required: true, message: "请选择参数类型", trigger: "change" }],
  category: [{ required: true, message: "请选择参数分类", trigger: "change" }]
}

const detailOpen = ref(false)
const detailLoading = ref(false)
const detailData = ref({})

function getCategoryLabel(category) {
  return categoryLabelMap[category] || category
}

function getCategoryTagType(category) {
  return categoryColorMap[category] || 'info'
}

function handleCurrentChange(row) {
  selectedRow.value = row
}

function getCategories() {
  listPricingParamCategories().then(response => {
    if (Array.isArray(response)) {
      categoryOptions.value = response.map(cat => ({
        label: getCategoryLabel(cat),
        value: cat
      }))
    }
  }).catch(() => {})
}

function getList() {
  loading.value = true
  listPricingParams().then(response => {
    let list = []
    if (Array.isArray(response)) {
      list = response
    } else if (response && Array.isArray(response.list)) {
      list = response.list
    }
    allParamsList.value = list
    filterList()
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

function filterList() {
  let list = [...allParamsList.value]
  if (queryParams.value.category) {
    list = list.filter(item => item.category === queryParams.value.category)
  }
  if (queryParams.value.paramKey) {
    const keyword = queryParams.value.paramKey.toLowerCase()
    list = list.filter(item => item.paramKey && item.paramKey.toLowerCase().includes(keyword))
  }
  list.sort((a, b) => (a.id ?? 0) - (b.id ?? 0))
  paramsList.value = list
  selectedRow.value = null
}

function handleQuery() {
  filterList()
}

function resetQuery() {
  proxy.resetForm("queryRef")
  queryParams.value.category = undefined
  queryParams.value.paramKey = undefined
  filterList()
}

function resetForm() {
  formData.value = {
    paramKey: "",
    paramValue: "",
    paramType: "DOUBLE",
    category: "",
    description: "",
    defaultValue: ""
  }
  proxy.resetForm("formRef")
}

function handleAdd() {
  resetForm()
  formType.value = "add"
  formTitle.value = "新增参数"
  formOpen.value = true
}

function handleUpdate() {
  if (!selectedRow.value) {
    proxy.$modal.msgWarning("请先选择一条记录")
    return
  }
  resetForm()
  formType.value = "update"
  formTitle.value = "更新参数"
  formData.value = {
    paramKey: selectedRow.value.paramKey,
    paramValue: selectedRow.value.paramValue || "",
    description: selectedRow.value.description || "",
    defaultValue: selectedRow.value.defaultValue || ""
  }
  formOpen.value = true
}

function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      submitLoading.value = true
      if (formType.value === "add") {
        const data = { ...formData.value }
        if (!data.defaultValue) {
          delete data.defaultValue
        }
        addPricingParam(data).then(response => {
          submitLoading.value = false
          if (response.message) {
            proxy.$modal.msgSuccess(response.message)
          } else if (response.error) {
            proxy.$modal.msgError(response.error)
            return
          } else {
            proxy.$modal.msgSuccess("新增成功")
          }
          formOpen.value = false
          getList()
        }).catch(() => {
          submitLoading.value = false
        })
      } else {
        const data = {
          value: formData.value.paramValue,
          description: formData.value.description
        }
        updatePricingParam(formData.value.paramKey, data).then(response => {
          submitLoading.value = false
          if (response.message) {
            proxy.$modal.msgSuccess(response.message)
          } else if (response.error) {
            proxy.$modal.msgError(response.error)
            return
          } else {
            proxy.$modal.msgSuccess("更新成功")
          }
          formOpen.value = false
          getList()
        }).catch(() => {
          submitLoading.value = false
        })
      }
    }
  })
}

function handleDelete() {
  if (!selectedRow.value) {
    proxy.$modal.msgWarning("请先选择一条记录")
    return
  }
  const key = selectedRow.value.paramKey
  proxy.$modal.confirm('是否确认删除参数"' + key + '"？删除后内存缓存将回退到默认值').then(() => {
    return deletePricingParam(key)
  }).then(response => {
    if (response.message) {
      proxy.$modal.msgSuccess(response.message)
    } else if (response.error) {
      proxy.$modal.msgError(response.error)
      return
    } else {
      proxy.$modal.msgSuccess("删除成功")
    }
    getList()
  }).catch(() => {})
}

function handleReset() {
  if (!selectedRow.value) {
    proxy.$modal.msgWarning("请先选择一条记录")
    return
  }
  const key = selectedRow.value.paramKey
  proxy.$modal.confirm('是否确认将参数"' + key + '"重置到默认值？').then(() => {
    return resetPricingParam(key)
  }).then(response => {
    if (response.message) {
      proxy.$modal.msgSuccess(response.message)
    } else if (response.error) {
      proxy.$modal.msgError(response.error)
      return
    } else {
      proxy.$modal.msgSuccess("已重置到默认值")
    }
    getList()
  }).catch(() => {})
}

function handleRefresh() {
  proxy.$modal.confirm('确认从数据库全量加载参数到内存缓存？此操作用于手动刷新或异常恢复').then(() => {
    return refreshPricingParams()
  }).then(response => {
    if (response.message) {
      proxy.$modal.msgSuccess(response.message + (response.syncedCount !== undefined ? `，共同步${response.syncedCount}条参数` : ''))
    } else if (response.error) {
      proxy.$modal.msgError(response.error)
      return
    } else {
      proxy.$modal.msgSuccess("全量刷新完成")
    }
    getList()
  }).catch(() => {})
}

function handleDetail(row) {
  detailOpen.value = true
  detailLoading.value = true
  setTimeout(() => {
    detailData.value = { ...row }
    detailLoading.value = false
  }, 100)
}

getCategories()
getList()
</script>
