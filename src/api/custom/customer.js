import { XZC_API, xzcService } from '../xzc'

export function listCustomers(query) {
  return xzcService.get(`${XZC_API}/api/admin/customers`, { params: query }).then(res => {
    const responseData = res.data
    if (responseData && responseData.data) {
      return responseData.data
    }
    return responseData
  })
}
