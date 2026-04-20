import { createNewsPost } from '../../../../utils/api'
import { getStoredUserInfo } from '../../../../utils/session'

Page({
  data: {
    types: [
      { label: '健康提示', value: 'health' },
      { label: '活动通知', value: 'activity' },
      { label: '紧急通知', value: 'urgent' }
    ],
    form: {
      title: '',
      type: 'health',
      content: '',
      target: 'all',
      familyName: ''
    },
    submitting: false
  },

  onInput(e: WechatMiniprogram.Input) {
    const field = e.currentTarget.dataset.field as string
    const update: any = {}
    update['form.' + field] = e.detail.value
    this.setData(update)
  },

  onTypeChange(e: WechatMiniprogram.RadioGroupChange) {
    this.setData({ 'form.type': e.detail.value })
  },

  onContentInput(e: WechatMiniprogram.Input) {
    this.setData({ 'form.content': e.detail.value })
  },

  onTargetChange(e: WechatMiniprogram.RadioGroupChange) {
    this.setData({ 'form.target': e.detail.value })
  },

  async onSubmit() {
    const { form } = this.data

    if (!form.title.trim()) {
      wx.showToast({ title: '请输入标题', icon: 'none' })
      return
    }
    if (form.content.trim().length < 10) {
      wx.showToast({ title: '内容至少10字', icon: 'none' })
      return
    }
    if (form.target === 'specific' && !form.familyName.trim()) {
      wx.showToast({ title: '请输入目标家庭姓名', icon: 'none' })
      return
    }

    this.setData({ submitting: true })
    try {
      const userInfo = getStoredUserInfo<any>()
      await createNewsPost({
        title: form.title.trim(),
        content: form.content.trim(),
        category: form.type,
        targetScope: form.target === 'specific' ? 'FAMILY' : 'ALL',
        targetFamilyName: form.target === 'specific' ? form.familyName.trim() : undefined,
        publisherId: userInfo.id,
        publisherName: userInfo.name
      })
      wx.showToast({ title: '发布成功', icon: 'success' })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (err: any) {
      wx.showToast({
        title: err.message || '发布失败',
        icon: 'none'
      })
    } finally {
      this.setData({ submitting: false })
    }
  }
})
