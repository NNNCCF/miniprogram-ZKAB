import { post } from '../../../../utils/request'

Page({
  data: {
    submitting: false,
    id: '',
    form: {
      visitDate: '',
      serviceContent: '',
      healthObservation: '',
      followUpPlan: ''
    }
  },

  onLoad(options: Record<string, string>) {
    this.setData({ id: options.id || '' })
  },

  onVisitDateChange(e: WechatMiniprogram.PickerChange) {
    this.setData({ 'form.visitDate': e.detail.value as string })
  },

  onServiceContentInput(e: WechatMiniprogram.Input) {
    this.setData({ 'form.serviceContent': e.detail.value })
  },

  onHealthObservationInput(e: WechatMiniprogram.Input) {
    this.setData({ 'form.healthObservation': e.detail.value })
  },

  onFollowUpPlanInput(e: WechatMiniprogram.Input) {
    this.setData({ 'form.followUpPlan': e.detail.value })
  },

  async handleSubmit() {
    const { form, id } = this.data
    if (!form.visitDate) {
      return wx.showToast({ title: '请选择实际上门日期', icon: 'none' })
    }
    if (!form.serviceContent.trim()) {
      return wx.showToast({ title: '请填写服务内容摘要', icon: 'none' })
    }
    if (!id) {
      return wx.showToast({ title: '预约ID缺失', icon: 'none' })
    }

    this.setData({ submitting: true })
    wx.showLoading({ title: '提交中...' })

    try {
      await post('/appointments/' + id + '/record', {
        visitDate: form.visitDate,
        serviceContent: form.serviceContent.trim(),
        healthObservation: form.healthObservation.trim(),
        followUpPlan: form.followUpPlan.trim()
      })
      wx.hideLoading()
      wx.showToast({ title: '记录已提交', icon: 'success' })
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
