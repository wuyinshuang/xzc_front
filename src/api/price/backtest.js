import { XZC_API, xzcService } from '../xzc'

const BASE_URL_RESULTS = `${XZC_API}/api/admin/backtest/results`
const BASE_URL_ADJUSTMENTS = `${XZC_API}/api/admin/backtest`

export function listBacktestResults(query) {
  return xzcService.get(BASE_URL_RESULTS, { params: query }).then(res => {
    const responseData = res.data
    if (responseData && responseData.data) {
      return responseData.data
    }
    return responseData
  })
}

export function getBacktestResult(validationId) {
  return xzcService.get(`${BASE_URL_RESULTS}/${validationId}`).then(res => {
    const responseData = res.data
    if (responseData && responseData.data) {
      return responseData.data
    }
    return responseData
  })
}

export function triggerBacktestValidate(data) {
  return xzcService.post(`${BASE_URL_ADJUSTMENTS}/validate`, data).then(res => {
    const responseData = res.data
    if (responseData && responseData.data) {
      return responseData.data
    }
    return responseData
  })
}

export function listAdjustments(query) {
  return xzcService.get(`${BASE_URL_ADJUSTMENTS}/adjustments`, { params: query }).then(res => {
    const responseData = res.data
    if (responseData && responseData.data) {
      return responseData.data
    }
    return responseData
  })
}

export function applyAdjustment(data) {
  return xzcService.post(`${BASE_URL_ADJUSTMENTS}/adjust`, data).then(res => {
    const responseData = res.data
    if (responseData && responseData.data) {
      return responseData.data
    }
    return responseData
  })
}

export function rollbackAdjustment(adjustmentId, data) {
  return xzcService.post(`${BASE_URL_ADJUSTMENTS}/rollback/${adjustmentId}`, data).then(res => {
    const responseData = res.data
    if (responseData && responseData.data) {
      return responseData.data
    }
    return responseData
  })
}
