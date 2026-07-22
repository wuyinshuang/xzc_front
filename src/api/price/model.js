import { XZC_API, xzcService } from '../xzc'

export function listModels(query) {
  return xzcService.get(`${XZC_API}/api/admin/models`, { params: query }).then(res => res.data)
}

export function getSensitivityStatus() {
  return xzcService.get(`${XZC_API}/api/admin/sensitivity/status`).then(res => res.data)
}

export function getSensitivityModel() {
  return xzcService.get(`${XZC_API}/api/admin/sensitivity/model`).then(res => res.data)
}

export function trainSensitivityModel(data) {
  return xzcService.post(`${XZC_API}/api/admin/sensitivity/train`, data || {}).then(res => res.data)
}

export function validateModel(data) {
  return xzcService.post(`${XZC_API}/api/admin/models/validate`, data).then(res => res.data)
}

export function switchSensitivityVersion(version) {
  return xzcService.put(`${XZC_API}/api/admin/sensitivity/version`, { version }).then(res => res.data)
}
