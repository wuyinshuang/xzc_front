<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" label-width="80px" class="query-form">
      <el-row :gutter="16">
        <el-col :span="6">
          <el-form-item label="报告编号" prop="reportId">
            <el-input v-model="queryParams.reportId" placeholder="请输入报告编号" clearable @keyup.enter="handleQuery" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="客户编号" prop="customerId">
            <el-input v-model="queryParams.customerId" placeholder="请输入客户编号" clearable @keyup.enter="handleQuery" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="客户姓名" prop="customerName">
            <el-input v-model="queryParams.customerName" placeholder="请输入客户姓名" clearable @keyup.enter="handleQuery" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24" style="text-align: center; padding-bottom: 12px;">
          <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          <el-button 
            type="success" 
            icon="Download" 
            @click="handleExport" 
            :disabled="!currentRow"
          >
            导出
          </el-button>
          <el-button 
            type="danger" 
            icon="Delete" 
            @click="handleDelete" 
            :disabled="!currentRow"
          >
            删除
          </el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-table 
      v-loading="loading" 
      :data="reportList" 
      border 
      style="width: 100%"
      highlight-current-row
      @current-change="handleCurrentChange"
    >
      <el-table-column label="报告ID" align="center" prop="id" width="80" />
      <el-table-column label="报告编号" align="center" prop="reportId" min-width="180" show-overflow-tooltip />
      <el-table-column label="客户ID" align="center" prop="customerId" min-width="260" show-overflow-tooltip />
      <el-table-column label="客户名称" align="center" prop="customerName" min-width="120" show-overflow-tooltip />
      <el-table-column label="产品类型" align="center" prop="productType" min-width="150" show-overflow-tooltip />
      <el-table-column label="报告标题" align="center" prop="title" min-width="250" show-overflow-tooltip />
      <el-table-column label="报告类型" align="center" prop="reportType" width="150">
        <template #default="scope">
          <el-tag :type="getReportTypeTag(scope.row.reportType)">{{ getReportTypeName(scope.row.reportType) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          {{ parseTime(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="100" fixed="right">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleDetail(scope.row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.current"
      v-model:limit="queryParams.size"
      @pagination="getList"
    />

    <el-dialog
      v-model="detailOpen"
      title="报告详情"
      width="80%"
      top="5vh"
      destroy-on-close
      append-to-body
    >
      <div class="report-preview" v-loading="detailLoading">
        <div v-if="currentReport" class="report-header">
          <el-descriptions :column="2" border class="report-meta">
            <el-descriptions-item label="报告编号">{{ strVal(currentReport.reportId) }}</el-descriptions-item>
            <el-descriptions-item label="客户名称">{{ strVal(currentReport.customerName) }}</el-descriptions-item>
            <el-descriptions-item label="产品类型">{{ strVal(currentReport.productType) }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ parseTime(currentReport.createTime) }}</el-descriptions-item>
          </el-descriptions>
        </div>
        <el-divider>报告内容</el-divider>
        <div class="html-wrapper" v-html="safeHtml"></div>
      </div>
      <template #footer>
        <el-button @click="detailOpen = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="InfoMarket">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listReports, deleteReport, exportReport } from '@/api/info/reports'
import { parseTime } from '@/utils/ruoyi'

const queryRef = ref(null)
const loading = ref(false)
const total = ref(0)
const reportList = ref([])
const detailOpen = ref(false)
const detailLoading = ref(false)
const currentReport = ref(null)
const currentRow = ref(null)

const queryParams = reactive({
  current: 1,
  size: 20,
  reportId: '',
  customerId: '',
  customerName: '',
  reportType: 'MARKETING_REPORT'
})

function strVal(val) {
  if (val === undefined || val === null || val === '') return '0'
  return String(val)
}

const safeHtml = computed(() => {
  if (!currentReport.value?.htmlContent) return ''
  return currentReport.value.htmlContent
})

const reportTypeMap = {
  'DECISION_REPORT': { name: '定价决策报告', type: 'primary' },
  'CUSTOMER_REPORT': { name: '客户定价报告', type: 'success' },
  'MARKETING_REPORT': { name: '营销报告', type: 'warning' },
  'RISK_REPORT': { name: '风险报告', type: 'danger' }
}

function getReportTypeName(type) {
  return reportTypeMap[type]?.name || type
}

function getReportTypeTag(type) {
  return reportTypeMap[type]?.type || 'info'
}

function handleCurrentChange(val) {
  currentRow.value = val
}

async function getList() {
  loading.value = true
  currentRow.value = null
  try {
    const params = {
      current: queryParams.current,
      size: queryParams.size,
      reportType: queryParams.reportType
    }
    if (queryParams.reportId && queryParams.reportId.trim()) {
      params.reportId = queryParams.reportId.trim()
    }
    if (queryParams.customerId && queryParams.customerId.trim()) {
      params.customerId = queryParams.customerId.trim()
    }
    if (queryParams.customerName && queryParams.customerName.trim()) {
      params.customerName = queryParams.customerName.trim()
    }
    const res = await listReports(params)
    if (res && res.list) {
      reportList.value = res.list
      total.value = res.total || 0
    } else if (Array.isArray(res)) {
      reportList.value = res
      total.value = res.length
    } else {
      reportList.value = []
      total.value = 0
    }
  } catch (e) {
    console.error('获取营销报告列表失败', e)
    ElMessage.error('获取营销报告列表失败：' + (e.message || ''))
    reportList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function handleQuery() {
  queryParams.current = 1
  getList()
}

function resetQuery() {
  queryRef.value?.resetFields()
  queryParams.reportId = ''
  queryParams.customerId = ''
  queryParams.customerName = ''
  queryParams.current = 1
  getList()
}

function handleDetail(row) {
  currentReport.value = row
  detailOpen.value = true
}

function handleExport() {
  if (!currentRow.value) {
    ElMessage.warning('请先选择一条报告记录')
    return
  }
  doExport(currentRow.value)
}

async function doExport(row) {
  try {
    const res = await exportReport(row.reportId)
    const blob = new Blob([res.data], { type: 'text/html;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    let filename = `${row.reportId}.html`
    const disposition = res.headers['content-disposition'] || res.headers['Content-Disposition']
    if (disposition) {
      const filenameMatch = disposition.match(/filename="?([^"]+)"?/)
      if (filenameMatch && filenameMatch[1]) {
        filename = decodeURIComponent(filenameMatch[1])
      }
    }
    
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (e) {
    console.error('导出失败', e)
    ElMessage.error('导出失败：' + (e.message || ''))
  }
}

function handleDelete() {
  if (!currentRow.value) {
    ElMessage.warning('请先选择一条报告记录')
    return
  }
  doDelete(currentRow.value)
}

async function doDelete(row) {
  try {
    await ElMessageBox.confirm(
      `确定要删除报告「${row.reportId}」吗？此操作不可恢复。`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const res = await deleteReport(row.reportId)
    if (res.deleted || res.message) {
      ElMessage.success(res.message || '删除成功')
      getList()
    } else if (res.error) {
      ElMessage.error(res.error)
    } else {
      ElMessage.success('删除成功')
      getList()
    }
  } catch (e) {
    if (e !== 'cancel') {
      console.error('删除失败', e)
      ElMessage.error('删除失败：' + (e.message || ''))
    }
  }
}

onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.query-form {
  background: #fff;
  padding: 18px 16px 0;
  margin-bottom: 12px;
  border-radius: 4px;
}
.query-form :deep(.el-form-item) {
  margin-bottom: 15px;
}
.report-preview {
  max-height: 75vh;
  overflow-y: auto;
}
.report-meta {
  margin-bottom: 10px;
}
.html-wrapper {
  padding: 10px;
  background: #fff;
  border-radius: 4px;
  overflow-x: auto;
}
.html-wrapper :deep(style) {
  display: none;
}
</style>
