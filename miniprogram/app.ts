import { getStoredUserInfo } from './utils/session'

// app.ts
interface AppOption {
  globalData: {
    token: string
    userInfo: any
    role: 'staff' | 'guardian' | 'institution' | ''
    statusBarHeight: number
  }
}

App<AppOption>({
  globalData: {
    token: '',
    userInfo: null,
    role: '',
    statusBarHeight: 0
  },
  onLaunch() {
    const info = wx.getSystemInfoSync()
    this.globalData.statusBarHeight = info.statusBarHeight || 0

    const token = wx.getStorageSync('token')
    const role = wx.getStorageSync('role')
    if (token) {
      this.globalData.token = token
      this.globalData.role = role
    }
    this.globalData.userInfo = getStoredUserInfo()

    // 全局加载鸿蒙字体（Regular + Black 字重）
    const base = 'https://cdn.bootcdn.net/ajax/libs/HarmonyOS-Sans/2.0.0'
    wx.loadFontFace({
      family: 'HarmonyOS_Sans_SC',
      source: `url("${base}/HarmonyOS_Sans_SC_Regular.woff2")`,
      desc: { weight: '400' },
      scopes: ['webview', 'native'],
      fail: () => {}
    })
    wx.loadFontFace({
      family: 'HarmonyOS_Sans_SC',
      source: `url("${base}/HarmonyOS_Sans_SC_Black.woff2")`,
      desc: { weight: '900' },
      scopes: ['webview', 'native'],
      fail: () => {}
    })
  }
})
