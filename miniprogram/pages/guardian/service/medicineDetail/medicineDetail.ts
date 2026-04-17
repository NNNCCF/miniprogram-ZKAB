import { createMedicineOrder } from '../../../../utils/api'

const app = getApp<any>()

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function nowTimeStr() {
  const d = new Date()
  d.setMinutes(d.getMinutes() + 30) // 默认30分钟后
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

Page({
  data: {
    statusH: 0,
    submitting: false,
    // 地址
    locating: false,
    approxAddress: '',    // GPS 自动获取的大致位置
    addressDetail: '',    // 用户手动填写的门牌/楼层等细节
    latitude: 0,
    longitude: 0,
    // 联系信息
    contactName: '',
    contactPhone: '',
    // 时间（date + time 双 picker）
    deliveryDate: todayStr(),
    deliveryTime: nowTimeStr(),
    minDate: todayStr(),
    // 付款
    payMethod: '上门送货时支付',
    // 药物与备注
    medicines: '',
    notes: '',
    // 图片
    images: [] as string[]
  },

  onLoad() {
    this.setData({ statusH: app.globalData.statusBarHeight || 0 })
    this.loadUserInfo()
    this.autoLocate()
  },

  loadUserInfo() {
    try {
      let info = wx.getStorageSync('userInfo') || {}
      if (typeof info === 'string') info = JSON.parse(info)
      this.setData({
        contactName: info.name || '',
        contactPhone: info.mobile || info.phone || ''
      })
    } catch {}
  },

  // ── 自动定位（大致位置）──
  autoLocate() {
    this.setData({ locating: true })
    wx.getSetting({
      success: (res) => {
        const auth = res.authSetting['scope.userLocation']
        if (auth === false) {
          this.setData({ locating: false })
          return
        }
        const doLocate = () => {
          wx.getLocation({
            type: 'gcj02',
            success: (loc) => {
              this.setData({ latitude: loc.latitude, longitude: loc.longitude })
              // 用腾讯地图逆地理编码（失败直接用坐标）
              wx.request({
                url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${loc.latitude},${loc.longitude}&key=YOUR_KEY&output=json`,
                success: (r: any) => {
                  const addr = r.data?.result?.address || `${loc.latitude.toFixed(4)},${loc.longitude.toFixed(4)}`
                  this.setData({ approxAddress: addr, locating: false })
                },
                fail: () => {
                  this.setData({ approxAddress: `${loc.latitude.toFixed(4)},${loc.longitude.toFixed(4)}`, locating: false })
                }
              })
            },
            fail: () => { this.setData({ locating: false }) }
          })
        }
        if (!auth) {
          wx.authorize({ scope: 'scope.userLocation', success: doLocate, fail: () => this.setData({ locating: false }) })
        } else {
          doLocate()
        }
      }
    })
  },

  // ── 点击重新定位 ──
  reLocate() { this.autoLocate() },

  // ── 日期选择 ──
  onDateChange(e: any) {
    this.setData({ deliveryDate: e.detail.value })
  },

  // ── 时间选择（精确到分钟）──
  onTimeChange(e: any) {
    this.setData({ deliveryTime: e.detail.value })
  },

  onInput(e: any) {
    const field = e.currentTarget.dataset.field as string
    this.setData({ [field]: e.detail.value })
  },

  chooseImage() {
    const { images } = this.data
    if (images.length >= 4) return wx.showToast({ title: '最多4张', icon: 'none' })
    wx.chooseMedia({
      count: 4 - images.length,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({ images: [...images, ...res.tempFiles.map(f => f.tempFilePath)] })
      }
    })
  },

  removeImage(e: any) {
    const idx = e.currentTarget.dataset.index as number
    this.setData({ images: this.data.images.filter((_, i) => i !== idx) })
  },

  async submit() {
    const { approxAddress, addressDetail, contactName, contactPhone, medicines, deliveryDate, deliveryTime, notes, submitting } = this.data
    if (!approxAddress && !addressDetail) return wx.showToast({ title: '请完成地址定位或填写地址', icon: 'none' })
    if (!contactName.trim()) return wx.showToast({ title: '请填写联系人', icon: 'none' })
    if (!contactPhone.trim()) return wx.showToast({ title: '请填写联系电话', icon: 'none' })
    if (!medicines.trim()) return wx.showToast({ title: '请填写所需药物', icon: 'none' })
    if (submitting) return

    const fullAddress = addressDetail ? `${approxAddress} ${addressDetail}` : approxAddress
    const fullTime = `${deliveryDate} ${deliveryTime}`
    this.setData({ submitting: true })
    wx.showLoading({ title: '提交中...' })
    try {
      const medicineList = medicines.split(/[,，、\n]+/).map(s => s.trim()).filter(Boolean)
      await createMedicineOrder({
        medicines: medicineList.map(name => ({ name, spec: '', qty: 1 })),
        address: `${fullAddress} 联系人：${contactName} 电话：${contactPhone} 送药时间：${fullTime}`,
        notes: notes || ''
      })
      wx.hideLoading()
      wx.showToast({ title: '订单已提交', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
    } catch (e: any) {
      wx.hideLoading()
      wx.showToast({ title: e.message || '提交失败', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  },

  goBack() { wx.navigateBack() }
})
