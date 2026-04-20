export function readStorageObject<T = any>(key: string): T | null {
  const raw = wx.getStorageSync(key)
  if (!raw) return null
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  }
  return raw as T
}

export function normalizeUserInfo<T extends Record<string, any> = any>(userInfo?: T | null): T | Record<string, any> {
  const info = { ...(userInfo || {}) } as Record<string, any>
  if (info.institutionName && !info.orgName) info.orgName = info.institutionName
  if (info.institutionId && !info.orgId) info.orgId = info.institutionId
  if (info.mobile && !info.phone) info.phone = info.mobile
  return info
}

export function getStoredUserInfo<T extends Record<string, any> = Record<string, any>>(): T {
  return normalizeUserInfo(readStorageObject<T>('userInfo')) as T
}

export function setStoredUserInfo(userInfo: any) {
  const normalized = normalizeUserInfo(userInfo)
  wx.setStorageSync('userInfo', normalized)
  try {
    const app = getApp<any>()
    app.globalData.userInfo = normalized
  } catch {}
  return normalized
}

export function clearSession(preserveKeys: string[] = []) {
  const preserved: Record<string, any> = {}
  preserveKeys.forEach((key) => {
    const value = wx.getStorageSync(key)
    if (value !== '' && value !== undefined && value !== null) {
      preserved[key] = value
    }
  })
  wx.clearStorageSync()
  Object.keys(preserved).forEach((key) => wx.setStorageSync(key, preserved[key]))
  try {
    const app = getApp<any>()
    app.globalData.token = preserved.token || ''
    app.globalData.role = preserved.role || ''
    app.globalData.userInfo = preserved.userInfo ? normalizeUserInfo(preserved.userInfo) : null
  } catch {}
}
