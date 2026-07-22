import request from '@/utils/request'
import { XZC_API, xzcService } from '../xzc'

export function listPricingParams() {
  return xzcService.get(`${XZC_API}/api/admin/pricing-params`).then(res => res.data)
}

export function listPricingParamCategories() {
  return xzcService.get(`${XZC_API}/api/admin/pricing-params/categories`).then(res => res.data)
}

export function addPricingParam(data) {
  return xzcService.post(`${XZC_API}/api/admin/pricing-params`, data).then(res => res.data)
}

export function updatePricingParam(key, data) {
  return xzcService.put(`${XZC_API}/api/admin/pricing-params/${key}`, data).then(res => res.data)
}

export function deletePricingParam(key) {
  return xzcService.delete(`${XZC_API}/api/admin/pricing-params/${key}`).then(res => res.data)
}

export function resetPricingParam(key) {
  return xzcService.post(`${XZC_API}/api/admin/pricing-params/${key}/reset`).then(res => res.data)
}

export function refreshPricingParams() {
  return xzcService.post(`${XZC_API}/api/admin/pricing-params/refresh`).then(res => res.data)
}

export function listParams(query) {
  return request({
    url: '/price/params/list',
    method: 'get',
    params: query
  })
}

export function getParams(id) {
  return request({
    url: '/price/params/' + id,
    method: 'get'
  })
}

export function addParams(data) {
  return request({
    url: '/price/params',
    method: 'post',
    data: data
  })
}

export function updateParams(data) {
  return request({
    url: '/price/params',
    method: 'put',
    data: data
  })
}

export function delParams(id) {
  return request({
    url: '/price/params/' + id,
    method: 'delete'
  })
}
