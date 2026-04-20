import { submitMiniFeedback } from '../../../../utils/api'

Page({
  data: {
    types: [
      { label: '功能异常', value: 'bug' },
      { label: '体验问题', value: 'ux' },
      { label: '功能建议', value: 'suggestion' },
      { label: '其他', value: 'other' }
    ],
    form: {
      type: 'bug',
      content: ''
    },
    submitting: false
  },

  onTypeChange(e: WechatMiniprogram.RadioGroupChange) {
    this.setData({ 'form.type': e.detail.value })
  },

  onContentInput(e: WechatMiniprogram.Input) {
    this.setData({ 'form.content': e.detail.value })
  },

  async onSubmit() {
    const { form } = this.data
    if (form.content.trim().length < 10) {
      wx.showToast({ title: '问题描述至少10字', icon: 'none' })
      return
    }
    this.setData({ submitting: true })
    try {
      await submitMiniFeedback({
        type: form.type,
        content: form.content.trim()
      })
      wx.showToast({ title: '感谢反馈', icon: 'success' })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (err: any) {
      wx.showToast({
        title: err.message || '提交失败',
        icon: 'none'
      })
    } finally {
      this.setData({ submitting: false })
    }
  }
})
