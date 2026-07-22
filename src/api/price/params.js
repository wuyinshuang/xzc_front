import request from '@/utils/request'
import axios from 'axios'

const XZC_API = '/xzc'

const xzcService = axios.create({
  timeout: 10000,
  validateStatus: function (status) {
    return status >= 200 && status < 500
  }
})

// 查询定价参数配置列表（xzc接口）
export function listPricingParams() {
  return xzcService.get(`${XZC_API}/api/admin/pricing-params`).then(res => res.data)
}

// 查询参数分类列表（xzc接口）
export function listPricingParamCategories() {
  return xzcService.get(`${XZC_API}/api/admin/pricing-params/categories`).then(res => res.data)
}

// 新增参数（xzc接口）
export function addPricingParam(data) {
  return xzcService.post(`${XZC_API}/api/admin/pricing-params`, data).then(res => res.data)
}

// 更新参数（xzc接口）
export function updatePricingParam(key, data) {
  return xzcService.put(`${XZC_API}/api/admin/pricing-params/${key}`, data).then(res => res.data)
}

// 删除参数（xzc接口）
export function deletePricingParam(key) {
  return xzcService.delete(`${XZC_API}/api/admin/pricing-params/${key}`).then(res => res.data)
}

// 重置参数到默认值（xzc接口）
export function resetPricingParam(key) {
  return xzcService.post(`${XZC_API}/api/admin/pricing-params/${key}/reset`).then(res => res.data)
}

// 全量刷新参数缓存（xzc接口）
export function refreshPricingParams() {
  return xzcService.post(`${XZC_API}/api/admin/pricing-params/refresh`).then(res => res.data)
}

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
