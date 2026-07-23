import { XZC_API, xzcService } from '../xzc'

export function queryRiskTier(customerIds) {
  return xzcService.post(`${XZC_API}/api/query/risk-tier`, customerIds).then(res => {
    const responseData = res.data
    if (responseData && responseData.data) {
      return responseData.data
    }
    return responseData
  })
}

export function queryCustomerStats(customerIds) {
  return xzcService.post(`${XZC_API}/api/query/customers/stats`, customerIds).then(res => {
    const responseData = res.data
    if (responseData && responseData.data) {
      return responseData.data
    }
    return responseData
  })
}
