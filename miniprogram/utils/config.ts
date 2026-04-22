const DEFAULT_API_ORIGIN = 'https://116.204.127.178'
const DEFAULT_MINI_APP_CLIENT_ID = 'zkab-miniapp'
const DEFAULT_MINI_APP_SHARED_SECRET = 'change-me-miniapp-shared-secret'

export function getBaseUrl() {
  const customOrigin = wx.getStorageSync('apiBaseUrl')
  const origin = customOrigin || DEFAULT_API_ORIGIN
  return `${origin}/api`
}

export function getMiniAppClientId() {
  return wx.getStorageSync('miniAppClientId') || DEFAULT_MINI_APP_CLIENT_ID
}

export function getMiniAppSharedSecret() {
  return wx.getStorageSync('miniAppSharedSecret') || DEFAULT_MINI_APP_SHARED_SECRET
}
