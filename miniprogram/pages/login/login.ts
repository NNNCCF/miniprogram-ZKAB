import { nurseLogin, guardianLogin } from '../../utils/api'

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
const COLORS = ['#3B7EFF', '#FF5722', '#009688', '#9C27B0', '#F44336', '#2196F3']

function genCaptcha() {
  return Array.from({ length: 4 }, () => ({
    ch: CHARS[Math.floor(Math.random() * CHARS.length)],
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    angle: Math.floor(Math.random() * 30) - 15
  }))
}

Page({
  data: {
    activeTab: 'staff',
    roleText: '医护端',
    showPwd: false,
    form: { phone: '', password: '', captcha: '' },
    captcha: genCaptcha()
  },

  setTab(e: any) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      activeTab: tab,
      roleText: tab === 'staff' ? '医护端' : '家属端'
    })
  },

  onInput(e: any) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`form.${field}`]: e.detail.value })
  },

  togglePwd() { this.setData({ showPwd: !this.data.showPwd }) },

  refreshCaptcha() {
    this.setData({ captcha: genCaptcha(), 'form.captcha': '' })
  },

  async handleLogin() {
    const { form, captcha, activeTab } = this.data
    if (!form.phone || form.phone.length !== 11) {
      return wx.showToast({ title: '请输入正确手机号', icon: 'none' })
    }
    if (!form.password) {
      return wx.showToast({ title: '请输入密码', icon: 'none' })
    }
    const correctCode = captcha.map((c: any) => c.ch).join('')
    if (form.captcha.toLowerCase() !== correctCode.toLowerCase()) {
      this.refreshCaptcha()
      return wx.showToast({ title: '验证码错误', icon: 'none' })
    }

    wx.showLoading({ title: '登录中...' })
    try {
      const loginFn = activeTab === 'staff' ? nurseLogin : guardianLogin
      const res: any = await loginFn({ phone: form.phone, password: form.password })
      wx.hideLoading()
      if (res?.token) {
        const app = getApp<any>()
        app.globalData.token = res.token
        app.globalData.role = activeTab
        wx.setStorageSync('token', res.token)
        wx.setStorageSync('role', activeTab)
        wx.setStorageSync('userInfo', JSON.stringify(res.userInfo || {}))
        const url = activeTab === 'staff'
          ? '/pages/staff/home/home'
          : '/pages/guardian/index/index'
        wx.reLaunch({ url })
      } else {
        wx.showToast({ title: res?.msg || '登录失败', icon: 'none' })
      }
    } catch (e: any) {
      wx.hideLoading()
      wx.showToast({ title: e.message || '网络异常', icon: 'none' })
    }
  },

  goRegister() {
    wx.navigateTo({ url: '/pages/register/register' })
  },

  wechatLogin() {
    wx.showToast({ title: '微信登录开发中', icon: 'none' })
  }
})
