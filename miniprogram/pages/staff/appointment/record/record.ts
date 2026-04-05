import { submitVisitRecord } from '../../../../utils/api'

Page({
  data: {
    submitting: false,
    id: '',
    form: {
      visitDate: '',
      remark: '',
      payAmount: '',
      payStatus: 'unpaid'
    }
  },

  onLoad(options: Record<string, string>) {
    this.setData({ id: options.id || '' })
  },

  onVisitDateChange(e: WechatMiniprogram.PickerChange) {
    this.setData({ 'form.visitDate': e.detail.value as string })
  },

  onRemarkInput(e: WechatMiniprogram.Input) {
    this.setData({ 'form.remark': e.detail.value })
  },

  onPayAmountInput(e: WechatMiniprogram.Input) {
    this.setData({ 'form.payAmount': e.detail.value })
  },

  onPayStatusChange(e: WechatMiniprogram.TouchEvent) {
    this.setData({ 'form.payStatus': e.currentTarget.dataset.status })
  },

  async handleSubmit() {
    const { form, id } = this.data
    if (!form.visitDate) {
      return wx.showToast({ title: '请选择实际上门日期', icon: 'none' })
    }
    if (!form.remark.trim()) {
      return wx.showToast({ title: '请填写服务备注', icon: 'none' })
    }
    if (!id) {
      return wx.showToast({ title: '预约ID缺失', icon: 'none' })
    }

    this.setData({ submitting: true })
    wx.showLoading({ title: '提交中...' })

    try {
      await submitVisitRecord(id, {
        visitTime: form.visitDate + ' 00:00:00',
        remark: form.remark.trim(),
        payAmount: form.payAmount || undefined,
        payStatus: form.payStatus
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
