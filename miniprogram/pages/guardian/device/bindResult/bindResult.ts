const appInstance = getApp<any>()

Page({
  data: {
    statusH: 0,
    isSuccess: false,
    errorMsg: ''
  },

  onLoad(options: any) {
    this.setData({ statusH: appInstance.globalData.statusBarHeight || 0 })
    const status = options.status || 'fail'
    const result = wx.getStorageSync('bindResult') || {}
    this.setData({
      isSuccess: status === 'success',
      errorMsg: result.error || '未找到该设备，请确认设备号！'
    })
    wx.removeStorageSync('bindResult')
  },

  goBack() {
    wx.navigateBack()
  },

  onCreateMember() {
    wx.navigateTo({ url: '/pages/guardian/member/create/create' })
  },

  goRetry() {
    wx.navigateBack()
  }
})
