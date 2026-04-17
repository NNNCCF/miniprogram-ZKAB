import { bindDevice } from '../../../../utils/api'

const app = getApp<any>()

Page({
  data: {
    statusH: 0,
    deviceCode: '',
    location: '',       // "lat,lng" 字符串（可选，定位失败允许继续）
    locationText: '',   // 显示给用户的地址文字
    latitude: 0,
    longitude: 0,
    locating: false,    // 定位中状态
    locationFailed: false, // 定位失败标记（仅提示，不阻塞提交）
    address: '',
    roomLocation: '',
    loading: false,
    canSubmit: false
  },

  onLoad() {
    this.setData({ statusH: app.globalData.statusBarHeight || 0 })
    // 进页自动定位（失败不阻塞）
    this.getLocation()
  },

  goBack() {
    wx.navigateBack()
  },

  onMore() {},

  onScan() {
    wx.scanCode({
      onlyFromCamera: false,
      success: (res) => {
        if (res.result) {
          this.setData({ deviceCode: res.result })
          this.checkSubmit()
        }
      },
      fail: () => {
        wx.showToast({ title: '扫码失败', icon: 'none' })
      }
    })
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

  // 只要有设备号、门牌号、居家位置就可提交（定位可选）
  checkSubmit() {
    const { deviceCode, address, roomLocation } = this.data
    this.setData({ canSubmit: !!(deviceCode && address && roomLocation) })
  },

  getLocation() {
    this.setData({ locating: true, locationFailed: false })

    // 先检查当前权限状态
    wx.getSetting({
      success: (settingRes) => {
        const authorized = settingRes.authSetting['scope.userLocation']

        if (authorized === false) {
          // 用户曾经拒绝过，无法再次弹窗，引导去设置中开启
          this.setData({ locating: false, locationFailed: true })
          wx.showModal({
            title: '需要位置权限',
            content: '请前往手机"设置 → 隐私 → 位置信息"中允许该小程序访问位置，以便自动填写设备安装位置',
            confirmText: '去设置',
            cancelText: '暂不',
            success: (modalRes) => {
              if (modalRes.confirm) wx.openSetting({})
            }
          })
          return
        }

        if (!authorized) {
          // 未授权也未拒绝（第一次），主动弹出系统权限对话框
          wx.authorize({
            scope: 'scope.userLocation',
            success: () => {
              this.doGetLocation()
            },
            fail: () => {
              // 用户在系统弹窗中拒绝了
              this.setData({ locating: false, locationFailed: true })
              this.checkSubmit()
            }
          })
          return
        }

        // 已授权，直接定位
        this.doGetLocation()
      },
      fail: () => {
        this.doGetLocation()
      }
    })
  },

  doGetLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const { latitude, longitude } = res
        const locStr = `${latitude},${longitude}`
        this.setData({
          location: locStr,
          locationText: locStr,
          latitude,
          longitude,
          locating: false,
          locationFailed: false
        })
        this.checkSubmit()
      },
      fail: () => {
        this.setData({ locating: false, locationFailed: true })
        this.checkSubmit()
      }
    })
  },

  async onConfirm() {
    const { deviceCode, location, latitude, longitude, address, roomLocation, loading, canSubmit } = this.data
    if (!canSubmit || loading) return

    this.setData({ loading: true })
    wx.showLoading({ title: '绑定中...' })
    try {
      const payload: any = {
        deviceCode,
        address: `${address} ${roomLocation}`.trim(),
      }
      // 有坐标就带上，没有也能绑定
      if (location) payload.location = location
      if (latitude) payload.latitude = latitude
      if (longitude) payload.longitude = longitude

      await bindDevice(payload)
      wx.hideLoading()
      wx.setStorageSync('bindResult', { deviceId: deviceCode })
      wx.navigateTo({ url: '../bindResult/bindResult?status=success' })
    } catch (e: any) {
      wx.hideLoading()
      wx.setStorageSync('bindResult', { error: e.message || '绑定失败' })
      wx.navigateTo({ url: '../bindResult/bindResult?status=fail' })
    } finally {
      this.setData({ loading: false })
    }
  }
})
