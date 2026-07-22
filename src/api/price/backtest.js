import axios from 'axios'

const XZC_API = '/xzc'
const BASE_URL_RESULTS = `${XZC_API}/api/admin/backtest/results`
const BASE_URL_ADJUSTMENTS = `${XZC_API}/api/admin/backtest`

const xzcService = axios.create({
  timeout: 10000,
  validateStatus: function (status) {
    return status >= 200 && status < 500
  }
})

export function listBacktestResults(query) {
  return xzcService.get(BASE_URL_RESULTS, { params: query }).then(res => res.data)
}

export function getBacktestResult(validationId) {
  return xzcService.get(`${BASE_URL_RESULTS}/${validationId}`).then(res => res.data)
}

export function triggerBacktestValidate(data) {
  return xzcService.post(`${BASE_URL_ADJUSTMENTS}/validate`, data).then(res => res.data)
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
