import axios from 'axios'

const XZC_API = import.meta.env.VITE_APP_XZC_API || '/xzc'

export { XZC_API }

export const xzcService = axios.create({
  timeout: 60000,
  validateStatus: function (status) {
    return status >= 200 && status < 500
  }
})
