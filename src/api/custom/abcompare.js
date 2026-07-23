import { XZC_API, xzcService } from '../xzc'

export function abtestSplit(data) {
  return xzcService.post(`${XZC_API}/api/query/abtest-split`, data).then(res => res.data)
}
