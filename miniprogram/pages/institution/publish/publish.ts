import { createNewsPost, uploadPhoto } from '../../../utils/api'
import { getStoredUserInfo } from '../../../utils/session'

const TYPES = [
  { label: '健康提示', value: 'health' },
  { label: '活动通知', value: 'activity' },
  { label: '紧急通知', value: 'urgent' },
  { label: '机构公告', value: 'announcement' }
]

Page({
  data: {
    types: TYPES,
    form: {
      title: '',
      type: 'health',
      content: '',
      target: 'all',
      familyName: ''
    },
    photos: [] as string[],
    submitting: false
  },

  onInput(e: WechatMiniprogram.Input) {
    const field = e.currentTarget.dataset.field as string
    this.setData({ ['form.' + field]: e.detail.value })
  },

  onTypeChange(e: WechatMiniprogram.TouchEvent) {
    this.setData({ 'form.type': e.currentTarget.dataset.value })
  },

  onTargetChange(e: WechatMiniprogram.TouchEvent) {
    this.setData({ 'form.target': e.currentTarget.dataset.value })
  },

  selectPhoto() {
    if (this.data.photos.length >= 9) {
      wx.showToast({ title: '最多上传9张图片', icon: 'none' })
      return
    }
    wx.chooseMedia({
      count: 9 - this.data.photos.length,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newPaths = res.tempFiles.map(f => f.tempFilePath)
        this.setData({ photos: [...this.data.photos, ...newPaths] })
      }
    })
  },

  removePhoto(e: WechatMiniprogram.TouchEvent) {
    const index = Number(e.currentTarget.dataset.index)
    const photos = [...this.data.photos]
    photos.splice(index, 1)
    this.setData({ photos })
  },

  previewPhoto(e: WechatMiniprogram.TouchEvent) {
    const index = Number(e.currentTarget.dataset.index)
    wx.previewImage({ current: this.data.photos[index], urls: this.data.photos })
  },

  async onSubmit() {
    const { form, photos } = this.data
    if (!form.title.trim()) {
      wx.showToast({ title: '请输入标题', icon: 'none' }); return
    }
    if (form.content.trim().length < 10) {
      wx.showToast({ title: '内容至少10字', icon: 'none' }); return
    }
    if (form.target === 'specific' && !form.familyName.trim()) {
      wx.showToast({ title: '请输入目标家庭姓名', icon: 'none' }); return
    }

    this.setData({ submitting: true })
    wx.showLoading({ title: '发布中...' })

    try {
      // 上传图片
      const attachments: string[] = []
      for (const path of photos) {
        try {
          const url = await uploadPhoto(path)
          if (url) attachments.push(url)
        } catch {}
      }

      const userInfo = getStoredUserInfo<any>() || {}
      await createNewsPost({
        title: form.title.trim(),
        content: form.content.trim(),
        category: form.type,
        targetScope: form.target === 'specific' ? 'FAMILY' : 'ALL',
        targetFamilyName: form.target === 'specific' ? form.familyName.trim() : undefined,
        publisherId: userInfo.id,
        publisherName: userInfo.name || userInfo.orgName,
        attachments: attachments.length > 0 ? attachments : undefined
      })
      wx.hideLoading()
      wx.showToast({ title: '发布成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
    } catch (err: any) {
      wx.hideLoading()
      wx.showToast({ title: err.message || '发布失败', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  }
})
