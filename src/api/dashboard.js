import { XZC_API, xzcService } from './xzc'

export function getPricingScreen(params) {
  return xzcService.post(`${XZC_API}/api/admin/dashboard/pricing-screen`, params || {}).then(res => {
    const data = res.data
    if (data && data.data) {
      return data.data
    }
    return data
  })
}

export function getPricingSummary() {
  return xzcService.get(`${XZC_API}/api/admin/dashboard/pricing-summary`).then(res => {
    const data = res.data
    if (data && data.data) {
      return data.data
    }
    return data
  })
}

export function getReportSummary() {
  return xzcService.get(`${XZC_API}/api/admin/dashboard/report-summary`).then(res => {
    const data = res.data
    if (data && data.data) {
      return data.data
    }
    return data
  })
}

export function getModelStatus() {
  return xzcService.get(`${XZC_API}/api/admin/dashboard/model-status`).then(res => {
    const data = res.data
    if (data && data.data) {
      return data.data
    }
    return data
  })
}

export function getAbtestSummary() {
  return xzcService.get(`${XZC_API}/api/admin/dashboard/abtest-summary`).then(res => {
    const data = res.data
    if (data && data.data) {
      return data.data
    }
    return data
  })
}

export function getLoanDisbursementsSummary(params) {
  return xzcService.get(`${XZC_API}/api/admin/loan-disbursements/summary`, { params }).then(res => {
    const data = res.data
    console.log('loan-disbursements/summary 原始响应:', JSON.stringify(data))
    // 递归遍历整个响应对象，收集所有 totalAmount 字段的值并求和
    let total = 0
    const collect = (obj) => {
      if (obj === null || obj === undefined) return
      if (Array.isArray(obj)) {
        obj.forEach(collect)
        return
      }
      if (typeof obj === 'object') {
        // 如果当前对象有 totalAmount 字段，累加它
        if (obj.totalAmount !== undefined && obj.totalAmount !== null) {
          total += Number(obj.totalAmount) || 0
        }
        // 继续递归遍历所有属性
        Object.values(obj).forEach(collect)
        return
      }
    }
    collect(data)
    console.log('所有 totalAmount 之和 =', total)
    return total
  })
}

export function getCustomersStatsByProvince(params) {
  return xzcService.get(`${XZC_API}/api/admin/customers/stats-by-province`, { params }).then(res => {
    const data = res.data
    if (Array.isArray(data)) {
      return data
    }
    if (data && Array.isArray(data.data)) {
      return data.data
    }
    if (data && Array.isArray(data.rows)) {
      return data.rows
    }
    return []
  })
}

export function getCustomersTopCities(params) {
  return xzcService.get(`${XZC_API}/api/admin/customers/top-cities`, { params }).then(res => {
    const data = res.data
    if (Array.isArray(data)) {
      return data
    }
    if (data && Array.isArray(data.data)) {
      return data.data
    }
    if (data && Array.isArray(data.rows)) {
      return data.rows
    }
    return []
  })
}

export function searchCustomers(keyword) {
  return xzcService.get(`${XZC_API}/api/admin/customers`, { params: { keyword } }).then(res => {
    const data = res.data
    if (data && data.data) {
      return data.data
    }
    if (data && data.rows) {
      return data.rows
    }
    return data
  })
}
