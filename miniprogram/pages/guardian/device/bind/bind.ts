import { post } from '../../../../../utils/request'

const app = getApp<any>()

Page({
  data: {
    statusH: 0,
    deviceId: '',
    loading: false
  },

  onLoad() {
    this.setData({ statusH: app.globalData.statusBarHeight || 0 })
  },

  goBack() {
    wx.navigateBack()
  },

  onDeviceIdInput(e: any) {
    this.setData({ deviceId: e.detail.value })
  },

  clearInput() {
    this.setData({ deviceId: '' })
  },

  scanQR() {
    wx.scanCode({
      success: (res) => {
        const code = res.result || ''
        this.setData({ deviceId: code })
      },
      fail: () => {
        wx.showToast({ title: '扫码失败', icon: 'none' })
      }
    })
  },

  async onConfirm() {
    const { deviceId, loading } = this.data
    if (!deviceId || loading) return

    this.setData({ loading: true })
    wx.showLoading({ title: '绑定中...' })
    try {
      const result = await post('/guardian/device/bind', { deviceId })
      wx.hideLoading()
      wx.setStorageSync('bindResult', { success: true, device: result, deviceId })
      wx.redirectTo({ url: '/pages/guardian/device/bindResult/bindResult?status=success' })
    } catch (e: any) {
      wx.hideLoading()
      wx.setStorageSync('bindResult', { success: false, error: e.message, deviceId })
      wx.redirectTo({ url: '/pages/guardian/device/bindResult/bindResult?status=fail' })
    } finally {
      this.setData({ loading: false })
    }
  }
})
