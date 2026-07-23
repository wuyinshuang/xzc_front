import { XZC_API, xzcService } from './xzc'

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
