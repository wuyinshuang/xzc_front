import { XZC_API, xzcService } from '../xzc'

export function listReports(params) {
  return xzcService({
    url: `${XZC_API}/api/admin/reports`,
    method: 'get',
    params: params
  }).then(res => {
    const responseData = res.data
    if (responseData && responseData.data) {
      return responseData.data
    }
    return responseData
  })
}

export function deleteReport(reportId) {
  return xzcService.delete(`${XZC_API}/api/admin/reports/${reportId}`).then(res => res.data)
}

export function exportReport(reportId) {
  return xzcService({
    url: `${XZC_API}/api/admin/reports/${reportId}/export`,
    method: 'get',
    responseType: 'blob'
  }).then(res => res)
}
