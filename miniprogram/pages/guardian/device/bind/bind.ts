import { bindDevice } from '../../../../../utils/api'

const app = getApp<any>()

Page({
  data: {
    statusH: 0,
    deviceCode: '',
    loading: false
  },

  onLoad() {
    this.setData({ statusH: app.globalData.statusBarHeight || 0 })
  },

  goBack() {
    wx.navigateBack()
  },

  onDeviceCodeInput(e: any) {
    this.setData({ deviceCode: e.detail.value })
  },

  clearInput() {
    this.setData({ deviceCode: '' })
  },

  scanQR() {
    wx.scanCode({
      success: (res) => {
        const code = res.result || ''
        this.setData({ deviceCode: code })
      },
      fail: () => {
        wx.showToast({ title: '扫码失败', icon: 'none' })
      }
    })
  },

  async onConfirm() {
    const { deviceCode, loading } = this.data
    if (!deviceCode || loading) return

    this.setData({ loading: true })
    wx.showLoading({ title: '绑定中...' })
    try {
      const result = await bindDevice({ deviceCode })
      wx.hideLoading()
      wx.setStorageSync('bindResult', { success: true, device: result, deviceCode })
      wx.redirectTo({ url: '/pages/guardian/device/bindResult/bindResult?status=success' })
    } catch (e: any) {
      wx.hideLoading()
      wx.setStorageSync('bindResult', { success: false, error: e.message, deviceCode })
      wx.redirectTo({ url: '/pages/guardian/device/bindResult/bindResult?status=fail' })
    } finally {
      this.setData({ loading: false })
    }
  }
})
