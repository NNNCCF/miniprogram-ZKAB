import { getGuardianProfile, updateGuardianProfile } from '../../../../utils/api'
import { setStoredUserInfo } from '../../../../utils/session'

interface ProfileForm {
  name: string
  phone: string
}

Page({
  data: {
    statusH: 0,
    form: {
      name: '',
      phone: ''
    } as ProfileForm,
    saving: false
  },

  onLoad() {
    const app = getApp<any>()
    this.setData({ statusH: app.globalData.statusBarHeight || 0 })
    this.loadProfile()
  },

  async loadProfile() {
    try {
      const profile = await getGuardianProfile() as ProfileForm
      this.setData({ form: profile })
    } catch (err: any) {
      wx.showToast({
        title: err.message || '加载失败',
        icon: 'none'
      })
    }
  },

  onInput(e: any) {
    const field = e.currentTarget.dataset.field as string
    this.setData({
      [`form.${field}`]: e.detail.value
    })
  },

  async onSave() {
    const name = this.data.form.name.trim()
    const phone = this.data.form.phone.trim()

    if (!name) {
      wx.showToast({ title: '请输入姓名', icon: 'none' })
      return
    }
    if (!phone) {
      wx.showToast({ title: '请输入手机号', icon: 'none' })
      return
    }

    this.setData({ saving: true })
    try {
      const profile = await updateGuardianProfile({ name, phone })
      setStoredUserInfo(profile)
      wx.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 900)
    } catch (err: any) {
      wx.showToast({
        title: err.message || '保存失败',
        icon: 'none'
      })
    } finally {
      this.setData({ saving: false })
    }
  },

  goBack() {
    wx.navigateBack()
  }
})