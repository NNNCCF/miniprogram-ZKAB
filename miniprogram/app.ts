import { getStoredUserInfo } from './utils/session'
import { createGlobalAlarmManager } from './utils/global-alarm-manager'

interface AppOption {
  globalData: {
    token: string
    userInfo: any
    role: 'staff' | 'guardian' | 'institution' | ''
    statusBarHeight: number
    globalAlarmManager: ReturnType<typeof createGlobalAlarmManager> | null
  }
}

App<AppOption>({
  globalData: {
    token: '',
    userInfo: null,
    role: '',
    statusBarHeight: 0,
    globalAlarmManager: null,
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
    this.globalData.globalAlarmManager = createGlobalAlarmManager(this)

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
  },
  onShow() {
    this.globalData.globalAlarmManager?.start()
  },
  onHide() {
    this.globalData.globalAlarmManager?.stop()
  },
  startGlobalAlarmPolling() {
    this.globalData.globalAlarmManager?.start()
  },
  stopGlobalAlarmPolling() {
    this.globalData.globalAlarmManager?.stop()
  },
  getGlobalAlarmOverlayState() {
    return this.globalData.globalAlarmManager?.getOverlayState() ?? {
      visible: false,
      viewerRole: '',
      confirmOnly: false,
      actionText: '关闭',
      selectedResult: '',
      submitting: false,
      alarm: null,
    }
  },
  setGlobalAlarmResult(result: 'HANDLED' | 'IGNORED' | '') {
    this.globalData.globalAlarmManager?.selectResult(result)
  },
  submitGlobalAlarmResult() {
    return this.globalData.globalAlarmManager?.submit()
  },
  resetGlobalAlarmState() {
    this.globalData.globalAlarmManager?.reset()
  }
})
