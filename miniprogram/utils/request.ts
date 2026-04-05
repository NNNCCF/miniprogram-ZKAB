import { BASE_URL } from './config'

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

export function request<T = any>(
  url: string,
  method: Method = 'GET',
  data?: any
): Promise<T> {
  const app = getApp<{ globalData: { token: string } }>()
  const token = app.globalData.token || wx.getStorageSync('token') || ''

  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE_URL + url,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : ''
      },
      success(res: any) {
        if (res.statusCode === 200) {
          resolve(res.data as T)
        } else if (res.statusCode === 401) {
          wx.removeStorageSync('token')
          wx.reLaunch({ url: '/pages/login/login' })
          reject(new Error('未授权'))
        } else {
          reject(new Error((res.data as any)?.msg || '请求失败'))
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
