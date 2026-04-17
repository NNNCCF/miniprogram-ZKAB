import { get } from '../../../../utils/request'

const app = getApp<any>()

Page({
  data: {
    statusH: 0,
    userInfo: {} as any,
    stats: { memberCount: 0, alarmCount: 0, serviceCount: 0 }
  },

  onLoad() {
    this.setData({ statusH: app.globalData.statusBarHeight || 0 })
  },

  onShow() {
    // Show cached data immediately
    const cached = wx.getStorageSync('userInfo') || {}
    if (cached.name) {
      this.setData({ userInfo: cached })
    }
    // Fetch fresh data from server
    get<any>('/mini/guardian/profile')
      .then((res: any) => {
        const info = { name: res.name || '', phone: res.phone || '' }
        this.setData({ userInfo: info })
        wx.setStorageSync('userInfo', info)
      })
      .catch(() => {
        // Keep cached values
      })
  },

  goEdit() {
    wx.navigateTo({ url: '/pages/guardian/member/create/create?mode=editProfile' })
  },

  goSwitchMember() {
    wx.navigateTo({ url: '/pages/guardian/member/switch/switch' })
  },

  goAlarmSettings() {
    wx.navigateTo({ url: '/pages/guardian/profile/alarmSettings/alarmSettings' })
  },

  goServiceCenter() {
    wx.navigateTo({ url: '/pages/guardian/profile/serviceCenter/serviceCenter' })
  },

  goFeedback() {
    wx.navigateTo({ url: '/pages/guardian/profile/feedback/feedback' })
  },

  goSettings() {
    wx.navigateTo({ url: '/pages/guardian/profile/settings/settings' })
  },

  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确认退出当前账号？',
      confirmColor: '#EF4444',
      success(res) {
        if (res.confirm) {
          wx.removeStorageSync('token')
          wx.removeStorageSync('userInfo')
          wx.reLaunch({ url: '/pages/login/login' })
        }
      }
    })
  }
})
