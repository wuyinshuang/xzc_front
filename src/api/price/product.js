import { XZC_API, xzcService } from '../xzc'

export function productDesign(data) {
  return xzcService.post(`${XZC_API}/api/pricing/product-design`, data).then(res => {
    const responseData = res.data
    if (responseData && responseData.data) {
      return responseData.data
    }
    return responseData
  })
}
