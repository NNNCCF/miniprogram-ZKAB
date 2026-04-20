import { createMember } from '../../../../utils/api'

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
    wx.navigateBack({
      fail: () => wx.navigateTo({ url: '/pages/guardian/member/switch/switch' })
    })
  },

  onInput(e: any) {
    const field = e.currentTarget.dataset.field
    this.setData({ ['form.' + field]: e.detail.value })
  },

  setGender(e: any) {
    this.setData({ 'form.gender': e.currentTarget.dataset.val })
  },

  onRelChange(e: any) {
    const idx = Number(e.detail.value)
    this.setData({
      relIndex: idx,
      'form.relationship': this.data.relationships[idx]
    })
  },

  async onSubmit() {
    const { form, loading } = this.data
    if (loading) return

    const age = Number(form.age)
    if (!form.name.trim() || !form.relationship || !form.gender || !Number.isFinite(age)) {
      wx.showToast({ title: '请填写必填项', icon: 'none' })
      return
    }

    if (age <= 0 || age > 130) {
      wx.showToast({ title: '请输入正确年龄', icon: 'none' })
      return
    }

    const currentYear = new Date().getFullYear()
    const birthday = `${currentYear - age}-01-01`

    this.setData({ loading: true })
    wx.showLoading({ title: '提交中...' })
    try {
      const result: any = await createMember({
        name: form.name.trim(),
        gender: form.gender.toUpperCase(),
        birthday,
        mobile: form.phone.trim() || undefined,
        chronicDisease: form.medicalHistory.trim() || undefined,
        remark: form.relationship
      })

      if (result?.id) {
        wx.setStorageSync('currentMemberId', result.id)
      }

      wx.hideLoading()
      wx.showToast({ title: '添加成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1200)
    } catch (e: any) {
      wx.hideLoading()
      wx.showToast({ title: e.message || '提交失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  }
})