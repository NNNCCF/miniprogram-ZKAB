import { post } from '../../../../utils/request'

Page({
  data: {
    submitting: false,
    id: '',
    form: {
      visitDate: '',
      visitTime: '',
      notes: ''
    }
  },

  onLoad(options: Record<string, string>) {
    this.setData({ id: options.id || '' })
  },

  onDateChange(e: WechatMiniprogram.PickerChange) {
    this.setData({ 'form.visitDate': e.detail.value as string })
  },

  onTimeChange(e: WechatMiniprogram.PickerChange) {
    this.setData({ 'form.visitTime': e.detail.value as string })
  },

  onNotesInput(e: WechatMiniprogram.Input) {
    this.setData({ 'form.notes': e.detail.value })
  },

  async handleSubmit() {
    const { form, id } = this.data
    if (!form.visitDate) {
      return wx.showToast({ title: '请选择上门日期', icon: 'none' })
    }
    if (!id) {
      return wx.showToast({ title: '预约ID缺失', icon: 'none' })
    }

    this.setData({ submitting: true })
    wx.showLoading({ title: '提交中...' })

    try {
      await post('/appointments/' + id + '/accept', {
        visitDate: form.visitDate,
        visitTime: form.visitTime,
        notes: form.notes.trim()
      })
      wx.hideLoading()
      wx.showToast({ title: '接受成功', icon: 'success' })
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
