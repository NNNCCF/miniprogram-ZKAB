const DEFAULT_API_ORIGIN = 'http://116.204.127.178:8080'

export function getBaseUrl() {
  const customOrigin = wx.getStorageSync('apiBaseUrl')
  const origin = customOrigin || DEFAULT_API_ORIGIN
  return `${origin}/api`
}
