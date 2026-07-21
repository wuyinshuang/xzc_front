import axios from 'axios'

const BASE_URL_RESULTS = '/xzc-api/xzc/api/admin/backtest/results'
const BASE_URL_ADJUSTMENTS = '/xzc-api/xzc/api/admin/backtest'

const xzcService = axios.create({
  timeout: 10000
})

export function listBacktestResults(query) {
  return xzcService.get(BASE_URL_RESULTS, { params: query }).then(res => res.data)
}

export function getBacktestResult(validationId) {
  return xzcService.get(`${BASE_URL_RESULTS}/${validationId}`).then(res => res.data)
}

export function listAdjustments(query) {
  return xzcService.get(`${BASE_URL_ADJUSTMENTS}/adjustments`, { params: query }).then(res => res.data)
}

export function applyAdjustment(data) {
  return xzcService.post(`${BASE_URL_ADJUSTMENTS}/adjust`, data).then(res => res.data)
}

export function rollbackAdjustment(adjustmentId, data) {
  return xzcService.post(`${BASE_URL_ADJUSTMENTS}/rollback/${adjustmentId}`, data).then(res => res.data)
}
