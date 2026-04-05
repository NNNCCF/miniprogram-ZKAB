const app = getApp<any>()

Page({
  data: {
    statusH: 0,
    isSuccess: false,
    device: null as any,
    deviceId: '',
    errorMsg: ''
  },

  onLoad(options: any) {
    this.setData({ statusH: app.globalData.statusBarHeight || 0 })
    const status = options.status || 'fail'
    const result = wx.getStorageSync('bindResult') || {}
    this.setData({
      isSuccess: status === 'success',
      device: result.device || null,
      deviceId: result.deviceId || '',
      errorMsg: result.error || ''
    })
    wx.removeStorageSync('bindResult')
  },

  goHome() {
    wx.reLaunch({ url: '/pages/guardian/index/index/index' })
  },

  goRetry() {
    wx.navigateBack()
  }
})
