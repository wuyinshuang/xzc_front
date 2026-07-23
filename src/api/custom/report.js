import { XZC_API, xzcService } from '../xzc'

export function generateCustomerReport(customerId, params) {
  return xzcService.get(`${XZC_API}/api/pricing/customer-report/${customerId}`, { params }).then(res => {
    const data = res.data
    if (data && data.data) {
      return data.data
    }
    return data
  })
}
