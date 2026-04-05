import { dispatchAppointment } from '../../../../utils/api'

Page({
  data: {
    submitting: false,
    id: '',
    nurseName: ''
  },

  onLoad(options: Record<string, string>) {
    this.setData({ id: options.id || '' })
  },

  onNurseNameInput(e: WechatMiniprogram.Input) {
    this.setData({ nurseName: e.detail.value })
  },

  async handleSubmit() {
    const { id, nurseName, submitting } = this.data
    if (!nurseName.trim()) {
      return wx.showToast({ title: '请填写护士姓名', icon: 'none' })
    }
    if (!id || submitting) return

    this.setData({ submitting: true })
    wx.showLoading({ title: '提交中...' })

    try {
      await dispatchAppointment(id, { nurseName: nurseName.trim() })
      wx.hideLoading()
      wx.showToast({ title: '指派成功', icon: 'success' })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (err: any) {
      wx.hideLoading()
      wx.showToast({ title: err.message || '提交失败', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  }
})
