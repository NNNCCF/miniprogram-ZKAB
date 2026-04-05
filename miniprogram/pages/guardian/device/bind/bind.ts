import { bindDevice } from '../../../../../utils/api'

const app = getApp<any>()

Page({
  data: {
    statusH: 0,
    deviceCode: '',
    location: '',
    locationText: '',
    address: '',
    roomLocation: '',
    loading: false,
    canSubmit: false
  },

  onLoad() {
    this.setData({ statusH: app.globalData.statusBarHeight || 0 })
  },

  goBack() {
    wx.navigateBack()
  },

  onDeviceCodeInput(e: any) {
    this.setData({ deviceCode: e.detail.value })
    this.checkSubmit()
  },

  onAddressInput(e: any) {
    this.setData({ address: e.detail.value })
    this.checkSubmit()
  },

  onRoomInput(e: any) {
    this.setData({ roomLocation: e.detail.value })
    this.checkSubmit()
  },

  checkSubmit() {
    const { deviceCode, location, address, roomLocation } = this.data
    this.setData({ canSubmit: !!(deviceCode && location && address && roomLocation) })
  },

  getLocation() {
    wx.showLoading({ title: '定位中...' })
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        wx.hideLoading()
        const loc = `${res.latitude},${res.longitude}`
        // 逆地理编码获取地址文字
        wx.request({
          url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${loc}&key=YOUR_KEY&output=json`,
          success: (r: any) => {
            const addr = r.data?.result?.address || loc
            this.setData({ location: loc, locationText: addr })
            this.checkSubmit()
          },
          fail: () => {
            this.setData({ location: loc, locationText: loc })
            this.checkSubmit()
          }
        })
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({ title: '定位失败，请检查权限', icon: 'none' })
      }
    })
  },

  async onConfirm() {
    const { deviceCode, location, address, roomLocation, loading, canSubmit } = this.data
    if (!canSubmit || loading) return

    this.setData({ loading: true })
    wx.showLoading({ title: '绑定中...' })
    try {
      await bindDevice({ deviceCode, location, address: `${address} ${roomLocation}`.trim() })
      wx.hideLoading()
      wx.showToast({ title: '绑定成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
    } catch (e: any) {
      wx.hideLoading()
      wx.showToast({ title: e.message || '绑定失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  }
})
