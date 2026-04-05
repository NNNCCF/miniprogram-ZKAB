import { post } from '../../../utils/request'

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
      await post('/guardian/emergency/call', { timestamp: Date.now() })
      wx.hideLoading()
      wx.showToast({ title: '求救信号已发送', icon: 'success' })
    } catch {
      wx.hideLoading()
    }
    wx.makePhoneCall({ phoneNumber: '03511234567' })
  },

  onCancel() {
    wx.reLaunch({ url: '/pages/guardian/index/index' })
  }
})
