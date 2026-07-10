<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" v-show="showSearch" label-width="120px" class="price-query-form">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="年龄" prop="age">
            <el-input-number v-model="queryParams.minAge" :min="0" :max="150" placeholder="最小" style="width: 140px;" />
            <span style="margin: 0 10px;">-</span>
            <el-input-number v-model="queryParams.maxAge" :min="0" :max="150" placeholder="最大" style="width: 140px;" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="收入" prop="income">
            <el-input-number v-model="queryParams.minIncome" :min="0" placeholder="最小" style="width: 140px;" />
            <span style="margin: 0 10px;">-</span>
            <el-input-number v-model="queryParams.maxIncome" :min="0" placeholder="最大" style="width: 140px;" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="公积金缴存额" prop="fund">
            <el-input-number v-model="queryParams.minFund" :min="0" placeholder="最小" style="width: 140px;" />
            <span style="margin: 0 10px;">-</span>
            <el-input-number v-model="queryParams.maxFund" :min="0" placeholder="最大" style="width: 140px;" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="学历" prop="education">
            <el-select v-model="queryParams.education" placeholder="请选择学历" clearable style="width: 200px;">
              <el-option label="小学" value="primary" />
              <el-option label="初中" value="junior" />
              <el-option label="高中/中专" value="senior" />
              <el-option label="大专" value="college" />
              <el-option label="本科" value="bachelor" />
              <el-option label="硕士" value="master" />
              <el-option label="博士" value="doctor" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="行业" prop="industry">
            <el-select v-model="queryParams.industry" placeholder="请选择行业" clearable style="width: 200px;">
              <el-option label="金融" value="finance" />
              <el-option label="IT/互联网" value="it" />
              <el-option label="制造业" value="manufacturing" />
              <el-option label="服务业" value="service" />
              <el-option label="教育" value="education" />
              <el-option label="医疗" value="medical" />
              <el-option label="房地产" value="real_estate" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="区域" prop="region">
            <el-select v-model="queryParams.region" placeholder="请选择区域" clearable style="width: 200px;">
              <el-option label="北京" value="beijing" />
              <el-option label="上海" value="shanghai" />
              <el-option label="广州" value="guangzhou" />
              <el-option label="深圳" value="shenzhen" />
              <el-option label="杭州" value="hangzhou" />
              <el-option label="成都" value="chengdu" />
              <el-option label="武汉" value="wuhan" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="婚姻状态" prop="maritalStatus">
            <el-select v-model="queryParams.maritalStatus" placeholder="请选择婚姻状态" clearable style="width: 200px;">
              <el-option label="未婚" value="single" />
              <el-option label="已婚" value="married" />
              <el-option label="离异" value="divorced" />
              <el-option label="丧偶" value="widowed" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <el-table v-loading="loading" :data="priceList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="客户ID" align="center" prop="id" />
      <el-table-column label="姓名" align="center" prop="name" />
      <el-table-column label="年龄" align="center" prop="age" />
      <el-table-column label="收入" align="center" prop="income" />
      <el-table-column label="公积金缴存额" align="center" prop="fund" />
      <el-table-column label="学历" align="center" prop="education" />
      <el-table-column label="行业" align="center" prop="industry" />
      <el-table-column label="区域" align="center" prop="region" />
      <el-table-column label="婚姻状态" align="center" prop="maritalStatus" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleView(scope.row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script setup name="PriceQuery">
import { listPrice } from "@/api/price/query"

const { proxy } = getCurrentInstance()

const priceList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    minAge: undefined,
    maxAge: undefined,
    minIncome: undefined,
    maxIncome: undefined,
    minFund: undefined,
    maxFund: undefined,
    education: undefined,
    industry: undefined,
    region: undefined,
    maritalStatus: undefined
  }
})

const { queryParams } = toRefs(data)

function getList() {
  loading.value = true
  listPrice(queryParams.value).then(response => {
    priceList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

function cancel() {
  reset()
}

function reset() {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    minAge: undefined,
    maxAge: undefined,
    minIncome: undefined,
    maxIncome: undefined,
    minFund: undefined,
    maxFund: undefined,
    education: undefined,
    industry: undefined,
    region: undefined,
    maritalStatus: undefined
  }
}

function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

function handleView(row) {
}

getList()
</script>

<style scoped>
.price-query-form :deep(.el-col:first-child) {
  padding-left: 20px;
}
.price-query-form :deep(.el-form-item__label) {
  font-size: 12px;
  white-space: nowrap;
}
.price-query-form :deep(.el-form-item) {
  margin-bottom: 15px;
}
</style>