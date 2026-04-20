import { createEmergencyCall } from '../../../utils/api'

const app = getApp<any>()

Page({
  data: {
    statusH: 0
  },

  onLoad() {
    this.setData({ statusH: app.globalData.statusBarHeight || 0 })
  },

  async onCall() {
    wx.showLoading({ title: '正在连接...' })
    try {
      await createEmergencyCall()
      wx.hideLoading()
      wx.showToast({ title: '求救信号已发送', icon: 'success' })
    } catch (_) {
      wx.hideLoading()
    }
    wx.makePhoneCall({ phoneNumber: '03511234567' })
  },

  onCancel() {
    wx.reLaunch({ url: '/pages/guardian/index/index' })
  }
})
