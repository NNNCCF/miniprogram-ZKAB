const DEFAULT_API_ORIGIN = 'http://223.4.249.209:8080'

export function getBaseUrl() {
  const customOrigin = wx.getStorageSync('apiBaseUrl')
  const origin = customOrigin || DEFAULT_API_ORIGIN
  return `${origin}/api`
}
