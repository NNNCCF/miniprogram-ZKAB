import { guardianRegister, nurseRegister } from '../../utils/api'

Page({
  data: {
    submitting: false,
    form: {
      phone: '',
      password: '',
      confirmPassword: '',
      name: '',
      role: 'staff',
      orgCode: ''
    }
  },

  onInput(e: WechatMiniprogram.Input) {
    const field = e.currentTarget.dataset.field as string
    this.setData({ [`form.${field}`]: e.detail.value })
  },

  selectRole(e: WechatMiniprogram.TouchEvent) {
    const role = e.currentTarget.dataset.role as string
    this.setData({ 'form.role': role, 'form.orgCode': '' })
  },

  goBack() {
    wx.navigateBack()
  },

  async handleRegister() {
    const { form } = this.data
    if (!form.phone || form.phone.length !== 11) {
      return wx.showToast({ title: '请输入正确手机号', icon: 'none' })
    }
    if (!form.password || form.password.length < 6) {
      return wx.showToast({ title: '密码不能少于6位', icon: 'none' })
    }
    if (form.password !== form.confirmPassword) {
      return wx.showToast({ title: '两次密码不一致', icon: 'none' })
    }
    if (!form.name.trim()) {
      return wx.showToast({ title: '请输入姓名', icon: 'none' })
    }
    if (form.role === 'staff' && !form.orgCode.trim()) {
      return wx.showToast({ title: '请输入机构码', icon: 'none' })
    }

    this.setData({ submitting: true })
    wx.showLoading({ title: '注册中...' })

    try {
      if (form.role === 'guardian') {
        await guardianRegister({
          name: form.name.trim(),
          phone: form.phone,
          password: form.password,
          smsCode: ''
        })
      } else {
        await nurseRegister({
          name: form.name.trim(),
          phone: form.phone,
          password: form.password,
          smsCode: '',
          role: 'NURSE',
          institutionName: form.orgCode.trim()
        })
      }
      wx.hideLoading()
      wx.showToast({ title: '注册成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
    } catch (err: any) {
      wx.hideLoading()
      wx.showToast({ title: err.message || '注册失败', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  }
})
