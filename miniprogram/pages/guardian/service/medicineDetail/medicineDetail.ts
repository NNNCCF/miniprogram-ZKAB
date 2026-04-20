import { createMedicineOrder } from '../../../../utils/api'
import { getStoredUserInfo } from '../../../../utils/session'

const app = getApp<any>()

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function nowTimeStr() {
  const d = new Date()
  d.setMinutes(d.getMinutes() + 30)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

Page({
  data: {
    statusH: 0,
    submitting: false,
    selectedAddress: '',
    addressDetail: '',
    contactName: '',
    contactPhone: '',
    deliveryDate: todayStr(),
    deliveryTime: nowTimeStr(),
    minDate: todayStr(),
    payMethod: '送达后支付',
    medicines: '',
    notes: ''
  },

  onLoad() {
    this.setData({ statusH: app.globalData.statusBarHeight || 0 })
    const info: any = getStoredUserInfo() || {}
    this.setData({ contactName: info.name || '', contactPhone: info.phone || info.mobile || '' })
  },

  chooseLocation() {
    wx.chooseLocation({
      success: (res) => {
        const title = [res.name, res.address].filter(Boolean).join(' ')
        this.setData({ selectedAddress: title })
      }
    })
  },

  onDateChange(e: any) { this.setData({ deliveryDate: e.detail.value }) },
  onTimeChange(e: any) { this.setData({ deliveryTime: e.detail.value }) },
  onInput(e: any) {
    const field = e.currentTarget.dataset.field as string
    this.setData({ [field]: e.detail.value })
  },

  async submit() {
    if (this.data.submitting) return
    if (!this.data.selectedAddress && !this.data.addressDetail.trim()) {
      wx.showToast({ title: '请先选择地址或补充地址', icon: 'none' })
      return
    }
    if (!this.data.contactName.trim()) {
      wx.showToast({ title: '请填写联系人', icon: 'none' })
      return
    }
    if (!this.data.contactPhone.trim()) {
      wx.showToast({ title: '请填写联系电话', icon: 'none' })
      return
    }
    if (!this.data.medicines.trim()) {
      wx.showToast({ title: '请填写所需药品', icon: 'none' })
      return
    }

    const medicineList = this.data.medicines.split(/[，,\n]+/).map((item) => item.trim()).filter(Boolean)
    if (!medicineList.length) {
      wx.showToast({ title: '请填写有效药品名称', icon: 'none' })
      return
    }

    const fullAddress = [this.data.selectedAddress, this.data.addressDetail.trim()].filter(Boolean).join(' ')
    const addressDesc = [
      `地址：${fullAddress}`,
      `联系人：${this.data.contactName.trim()}`,
      `电话：${this.data.contactPhone.trim()}`,
      `送达时间：${this.data.deliveryDate} ${this.data.deliveryTime}`
    ].join('；')

    this.setData({ submitting: true })
    wx.showLoading({ title: '提交中...' })
    try {
      await createMedicineOrder({
        medicines: medicineList.map((name) => ({ name, spec: '', qty: 1 })),
        address: addressDesc,
        notes: this.data.notes.trim()
      })
      wx.hideLoading()
      wx.showToast({ title: '订单已提交', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1200)
    } catch (err: any) {
      wx.hideLoading()
      wx.showToast({ title: err.message || '提交失败', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  },

  goBack() { wx.navigateBack() }
})
