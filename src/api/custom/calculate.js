import { XZC_API, xzcService } from '../xzc'

export function checkCustomerFeature(customerId) {
  return xzcService.get(`${XZC_API}/api/pricing/customer-feature-check/${customerId}`).then(res => {
    const data = res.data
    if (data && data.data) {
      return data.data
    }
    return data
  })
}

export function realtimePricing(data) {
  return xzcService.post(`${XZC_API}/api/pricing/realtime`, data).then(res => res.data)
}

export function realtimeAdvancedPricing(data) {
  return xzcService.post(`${XZC_API}/api/pricing/realtime-advanced`, data).then(res => res.data)
}

export function getConversionCurve(customerId) {
  return xzcService.get(`${XZC_API}/api/pricing/conversion-curve/${customerId}`).then(res => {
    const data = res.data
    if (data && data.data) {
      return data.data
    }
    return data
  })
}
