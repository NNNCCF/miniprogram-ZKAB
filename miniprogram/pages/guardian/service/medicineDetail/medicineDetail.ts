import { post } from '../../../../utils/request'
Page({
  data: {
    statusH: 0,
    address: '',
    notes: '',
    medicines: [
      { name: '血压药', spec: '每盒30片', qty: 1 },
      { name: '血糖药', spec: '每盒60片', qty: 1 },
      { name: '心脏药', spec: '每盒20片', qty: 1 }
    ]
  },
  onLoad() {
    const app = getApp<any>()
    this.setData({ statusH: app.globalData.statusBarHeight || 0 })
  },
  goBack() { wx.navigateBack() },
  changeQty(e: any) {
    const { index, delta } = e.currentTarget.dataset
    const medicines = [...this.data.medicines]
    medicines[index].qty = Math.max(0, medicines[index].qty + delta)
    this.setData({ medicines })
  },
  onAddress(e: any) { this.setData({ address: e.detail.value }) },
  onNotes(e: any) { this.setData({ notes: e.detail.value }) },
  async submit() {
    if (!this.data.address) return wx.showToast({ title: '请填写配送地址', icon: 'none' })
    const selected = this.data.medicines.filter(m => m.qty > 0)
    if (!selected.length) return wx.showToast({ title: '请至少选择一种药品', icon: 'none' })
    wx.showLoading({ title: '提交中...' })
    try {
      await post('/services/medicine/order', { medicines: selected, address: this.data.address, notes: this.data.notes })
      wx.hideLoading()
      wx.showToast({ title: '订单已提交', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
    } catch (e: any) {
      wx.hideLoading()
      wx.showToast({ title: e.message || '提交失败', icon: 'none' })
    }
  }
})
