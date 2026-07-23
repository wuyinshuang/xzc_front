import { XZC_API, xzcService } from '../xzc'

export function getMacroIndicators() {
  return xzcService.get(`${XZC_API}/api/query/macro`).then(res => res.data)
}
