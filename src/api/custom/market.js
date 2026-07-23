import { XZC_API, xzcService } from '../xzc'

export function generatePricingReport(data) {
  return xzcService.post(`${XZC_API}/api/pricing/report`, data).then(res => res.data)
}
