import axios from 'axios'

const XZC_API = '/xzc'
const BASE_URL = `${XZC_API}/api/admin/abtest`

const xzcService = axios.create({
  timeout: 10000,
  validateStatus: function (status) {
    return status >= 200 && status < 500
  }
})

export function listAbtest(query) {
  return xzcService.get(BASE_URL, { params: query }).then(res => res.data)
}

export function getAbtestMetrics(experimentId) {
  return xzcService.get(`${BASE_URL}/${experimentId}/metrics`).then(res => res.data)
}

export function addAbtest(data) {
  return xzcService.post(BASE_URL, data).then(res => res.data)
}

export function pauseAbtest(experimentId) {
  return xzcService.put(`${BASE_URL}/${experimentId}/pause`, { id: experimentId }).then(res => res.data)
}

export function startAbtest(experimentId) {
  return xzcService.put(`${BASE_URL}/${experimentId}/start`, { id: experimentId }).then(res => res.data)
}

export function terminateAbtest(experimentId) {
  return xzcService.put(`${BASE_URL}/${experimentId}/terminate`, { id: experimentId }).then(res => res.data)
}
