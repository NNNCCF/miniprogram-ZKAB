import { unifiedLogin, nurseRegister, guardianRegister } from '../../utils/api'

Page({
  data: {
    activeTab: 'login' as 'login' | 'register',
    showPwd: false,
    showRegPwd: false,
    submitting: false,
    loginForm: { phone: '', password: '' },
    regForm: { phone: '', password: '', confirmPassword: '', name: '', role: 'staff', orgCode: '' }
  },


  setTab(e: any) {
    this.setData({ activeTab: e.currentTarget.dataset.tab })
  },

  onLoginInput(e: any) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`loginForm.${field}`]: e.detail.value })
  },

  onRegInput(e: any) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`regForm.${field}`]: e.detail.value })
  },

  togglePwd() { this.setData({ showPwd: !this.data.showPwd }) },
  toggleRegPwd() { this.setData({ showRegPwd: !this.data.showRegPwd }) },

  selectRole(e: any) {
    const role = e.currentTarget.dataset.role
    this.setData({ 'regForm.role': role, 'regForm.orgCode': '' })
  },

  // ─── 登录（自动识别角色）─────────────────────────────────────────────────────
  async handleLogin() {
    const { loginForm } = this.data

    if (!loginForm.phone || loginForm.phone.length !== 11) {
      return wx.showToast({ title: '请输入正确手机号', icon: 'none' })
    }
    if (!loginForm.password) {
      return wx.showToast({ title: '请输入密码', icon: 'none' })
    }

    this.setData({ submitting: true })
    wx.showLoading({ title: '登录中...' })

    try {
      const res: any = await unifiedLogin({ phone: loginForm.phone, password: loginForm.password })
      wx.hideLoading()

      if (res?.token) {
        const app = getApp<any>()
        // role: "caregiver" → staff 端；"guardian" → 家属端
        const role = res.role === 'caregiver' ? 'staff' : 'guardian'
        app.globalData.token = res.token
        app.globalData.role = role
        wx.setStorageSync('token', res.token)
        wx.setStorageSync('role', role)
        wx.setStorageSync('userInfo', JSON.stringify(res.userInfo || {}))

        const url = role === 'staff'
          ? '/pages/staff/home/home'
          : '/pages/guardian/index/index'
        wx.reLaunch({ url })
      } else {
        wx.showToast({ title: res?.msg || '登录失败', icon: 'none' })
      }
    } catch (e: any) {
      wx.hideLoading()
      wx.showToast({ title: e.message || '网络异常', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  },

  // ─── 注册 ──────────────────────────────────────────────────────────────────
  async handleRegister() {
    const { regForm } = this.data

    if (!regForm.phone || regForm.phone.length !== 11) {
      return wx.showToast({ title: '请输入正确手机号', icon: 'none' })
    }
    if (!regForm.name.trim()) {
      return wx.showToast({ title: '请输入真实姓名', icon: 'none' })
    }
    if (!regForm.password || regForm.password.length < 6) {
      return wx.showToast({ title: '密码不能少于6位', icon: 'none' })
    }
    if (regForm.password !== regForm.confirmPassword) {
      return wx.showToast({ title: '两次密码不一致', icon: 'none' })
    }
    if (regForm.role === 'staff' && !regForm.orgCode.trim()) {
      return wx.showToast({ title: '请输入机构码', icon: 'none' })
    }

    this.setData({ submitting: true })
    wx.showLoading({ title: '注册中...' })

    try {
      if (regForm.role === 'staff') {
        await nurseRegister({
          phone: regForm.phone,
          password: regForm.password,
          name: regForm.name.trim(),
          institutionName: regForm.orgCode.trim()
        })
      } else {
        await guardianRegister({
          phone: regForm.phone,
          password: regForm.password,
          name: regForm.name.trim()
        })
      }
      wx.hideLoading()
      wx.showToast({ title: '注册成功，请登录', icon: 'success' })
      setTimeout(() => {
        this.setData({
          activeTab: 'login',
          'loginForm.phone': regForm.phone,
          regForm: { phone: '', password: '', confirmPassword: '', name: '', role: 'staff', orgCode: '' }
        })
      }, 1500)
    } catch (err: any) {
      wx.hideLoading()
      wx.showToast({ title: err.message || '注册失败', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  },

  wechatLogin() {
    wx.showToast({ title: '微信登录开发中', icon: 'none' })
  }
})
