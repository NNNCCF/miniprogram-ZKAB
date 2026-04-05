import { post } from '../../../../utils/request'

Page({
  data: {
    submitting: false,
    id: '',
    form: {
      description: '',
      result: 'resolved'
    }
  },

  onLoad(options: Record<string, string>) {
    this.setData({ id: options.id || '' })
  },

  selectResult(e: WechatMiniprogram.TouchEvent) {
    const result = e.currentTarget.dataset.result as string
    this.setData({ 'form.result': result })
  },

  onDescInput(e: WechatMiniprogram.Input) {
    this.setData({ 'form.description': e.detail.value })
  },

  async handleSubmit() {
    const { form, id } = this.data
    if (!form.description.trim()) {
      return wx.showToast({ title: '请填写处理描述', icon: 'none' })
    }
    if (!id) {
      return wx.showToast({ title: '报警ID缺失', icon: 'none' })
    }

    this.setData({ submitting: true })
    wx.showLoading({ title: '提交中...' })

    try {
      await post('/alarms/' + id + '/handle', {
        description: form.description.trim(),
        result: form.result
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
