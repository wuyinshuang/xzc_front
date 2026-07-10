import request from '@/utils/request'

// 查询定价信息列表
export function listPrice(query) {
  return request({
    url: '/price/query/list',
    method: 'get',
    params: query
  })
}