import request from '@/utils/request'

// 查询定价参数配置列表
export function listParams(query) {
  return request({
    url: '/price/params/list',
    method: 'get',
    params: query
  })
}

// 查询定价参数配置详细
export function getParams(id) {
  return request({
    url: '/price/params/' + id,
    method: 'get'
  })
}

// 新增定价参数配置
export function addParams(data) {
  return request({
    url: '/price/params',
    method: 'post',
    data: data
  })
}

// 修改定价参数配置
export function updateParams(data) {
  return request({
    url: '/price/params',
    method: 'put',
    data: data
  })
}

// 删除定价参数配置
export function delParams(id) {
  return request({
    url: '/price/params/' + id,
    method: 'delete'
  })
}
