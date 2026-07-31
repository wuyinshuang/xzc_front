import { XZC_API, xzcService } from '../xzc'

export function productDesign(data) {
  return xzcService.post(`${XZC_API}/api/pricing/product-design`, data).then(res => {
    console.log('【API调试】原始响应:', res)
    console.log('【API调试】res.data:', res.data)
    console.log('【API调试】res.data类型:', typeof res.data)
    
    const responseData = res.data
    
    // 检查是否有data包装层
    if (responseData && responseData.data) {
      console.log('【API调试】检测到data包装层，返回responseData.data:', responseData.data)
      return responseData.data
    }
    
    console.log('【API调试】无data包装层，直接返回responseData:', responseData)
    return responseData
  }).catch(err => {
    console.error('【API调试】请求失败:', err)
    throw err
  })
}
