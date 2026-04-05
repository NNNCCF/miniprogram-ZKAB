import { post } from '../../../../../utils/request'

const app = getApp<any>()

Page({
  data: {
    statusH: 0,
    loading: false,
    relationships: ['父亲', '母亲', '祖父', '祖母', '外祖父', '外祖母', '其他'],
    relIndex: 0,
    form: {
      name: '',
      age: '',
      gender: 'male',
      relationship: '',
      medicalHistory: '',
      phone: ''
    }
  },

  onLoad() {
    this.setData({ statusH: app.globalData.statusBarHeight || 0 })
  },

  goBack() {
    wx.navigateBack()
  },

  onInput(e: any) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`form.${field}`]: e.detail.value })
  },

  setGender(e: any) {
    this.setData({ 'form.gender': e.currentTarget.dataset.val })
  },

  onRelChange(e: any) {
    const idx = parseInt(e.detail.value)
    this.setData({
      relIndex: idx,
      'form.relationship': this.data.relationships[idx]
    })
  },

  async onSubmit() {
    const { form, loading } = this.data
    if (loading) return
    if (!form.name || !form.age || !form.gender || !form.relationship) {
      wx.showToast({ title: '请填写必填项', icon: 'none' })
      return
    }
    this.setData({ loading: true })
    wx.showLoading({ title: '提交中...' })
    try {
      await post('/guardian/member/create', {
        ...form,
        age: parseInt(form.age)
      })
      wx.hideLoading()
      wx.showToast({ title: '添加成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
    } catch (e: any) {
      wx.hideLoading()
      wx.showToast({ title: e.message || '提交失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  }
})
