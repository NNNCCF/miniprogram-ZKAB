import { getBaseUrl } from './config'
import { buildCanonicalQuery, buildMiniAppSignatureHeaders, stableStringify } from './sign'

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

export function request<T = any>(
  url: string,
  method: Method = 'GET',
  data?: any
): Promise<T> {
  const app = getApp<any>()
  const token = app.globalData.token || wx.getStorageSync('token') || ''
  const baseUrl = getBaseUrl()
  const requestPath = `/api${url}`
  const query = method === 'GET' && data ? buildCanonicalQuery(data) : ''
  const requestUrl = query ? `${baseUrl}${url}?${query}` : `${baseUrl}${url}`
  const body = method === 'GET' || data === undefined ? '' : stableStringify(data)

  return new Promise((resolve, reject) => {
    wx.request({
      url: requestUrl,
      method,
      data: body || undefined,
      header: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
        ...buildMiniAppSignatureHeaders(method, requestPath, query, body)
      },
      success(res: any) {
        if (res.statusCode === 401) {
          app.resetGlobalAlarmState?.()
          wx.removeStorageSync('token')
          wx.reLaunch({ url: '/pages/login/login' })
          reject(new Error('未授权'))
          return
        }
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const body = res.data as any
          // 解包后端 ApiResponse<T> 包装 { code, message, data }
          if (body && typeof body === 'object' && 'code' in body) {
            if (body.code === 0) {
              resolve(body.data as T)
            } else {
              reject(new Error(body.message || '请求失败'))
            }
          } else {
            // 非标准包装，直接返回
            resolve(res.data as T)
          }
        } else {
          const body = res.data as any
          reject(new Error(body?.message || body?.msg || '请求失败'))
        }
      },
      fail(err: any) {
        reject(new Error(err.errMsg || '网络错误'))
      }
    })
  })
}

export const get = <T = any>(url: string, data?: any) => request<T>(url, 'GET', data)
export const post = <T = any>(url: string, data?: any) => request<T>(url, 'POST', data)
export const put = <T = any>(url: string, data?: any) => request<T>(url, 'PUT', data)
export const del = <T = any>(url: string, data?: any) => request<T>(url, 'DELETE', data)
