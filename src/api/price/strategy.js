import { XZC_API, xzcService } from '../xzc'

export function strategySimulate(data) {
  return xzcService.post(`${XZC_API}/api/admin/simulate`, data).then(res => {
    const responseData = res.data
    if (responseData && responseData.data) {
      return responseData.data
    }
    return responseData
  })
}
