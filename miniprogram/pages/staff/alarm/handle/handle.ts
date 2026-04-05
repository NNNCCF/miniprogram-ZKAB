import { handleAlarm } from '../../../../utils/api'

Page({
  data: {
    submitting: false,
    id: '',
    form: {
      calledGuardian: false,
      memberDanger: false,
      remark: ''
    }
  },

  onLoad(options: Record<string, string>) {
    this.setData({ id: options.id || '' })
  },

  onCalledGuardianChange(e: WechatMiniprogram.SwitchChange) {
    this.setData({ 'form.calledGuardian': e.detail.value })
  },

  onMemberDangerChange(e: WechatMiniprogram.SwitchChange) {
    this.setData({ 'form.memberDanger': e.detail.value })
  },

  onRemarkInput(e: WechatMiniprogram.Input) {
    this.setData({ 'form.remark': e.detail.value })
  },

  async handleSubmit() {
    const { form, id } = this.data
    if (!form.remark.trim()) {
      return wx.showToast({ title: '请填写处理备注', icon: 'none' })
    }
    if (!id) {
      return wx.showToast({ title: '报警ID缺失', icon: 'none' })
    }

    this.setData({ submitting: true })
    wx.showLoading({ title: '提交中...' })

    try {
      await handleAlarm(id, {
        calledGuardian: form.calledGuardian,
        memberDanger: form.memberDanger,
        handled: true,
        remark: form.remark.trim()
      })
      wx.hideLoading()
      wx.showToast({ title: '处理成功', icon: 'success' })
      setTimeout(() => {
        wx.navigateBack({ delta: 2 })
      }, 1500)
    } catch (err: any) {
      wx.hideLoading()
      wx.showToast({ title: err.message || '提交失败', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  }
})
