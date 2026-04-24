import { acceptAppointment, submitVisitRecord, uploadPhoto } from '../../../../utils/api'

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const SERVICE_RESULTS = ['服务完成', '部分完成', '无法完成']
const ELDER_STATUSES = ['良好', '一般', '需关注', '紧急']

Page({
  data: {
    submitting: false,
    id: '',
    needAccept: false,
    form: {
      visitDate: todayStr(),
      serviceResult: '',
      elderStatus: '',
      elderStatusNote: '',
      medication: '',
      suggestion: '',
      payAmount: '',
      payStatus: 'unpaid'
    },
    photos: [] as string[],
    serviceResults: SERVICE_RESULTS,
    elderStatuses: ELDER_STATUSES
  },

  onLoad(options: Record<string, string>) {
    this.setData({
      id: options.id || '',
      needAccept: options.status === 'pending'
    })
  },

  onVisitDateChange(e: WechatMiniprogram.PickerChange) {
    this.setData({ 'form.visitDate': e.detail.value as string })
  },

  selectServiceResult(e: WechatMiniprogram.TouchEvent) {
    this.setData({ 'form.serviceResult': e.currentTarget.dataset.value })
  },

  selectElderStatus(e: WechatMiniprogram.TouchEvent) {
    this.setData({ 'form.elderStatus': e.currentTarget.dataset.value })
  },

  onInput(e: WechatMiniprogram.Input) {
    const field = e.currentTarget.dataset.field as string
    this.setData({ [field]: e.detail.value })
  },

  onPayStatusChange(e: WechatMiniprogram.TouchEvent) {
    this.setData({ 'form.payStatus': e.currentTarget.dataset.status })
  },

  async selectPhoto() {
    if (this.data.photos.length >= 9) {
      wx.showToast({ title: '最多上传9张照片', icon: 'none' })
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
    wx.previewImage({
      current: this.data.photos[index],
      urls: this.data.photos
    })
  },

  buildRemark(): string {
    const { form } = this.data
    const lines: string[] = []
    if (form.serviceResult) lines.push(`服务结果：${form.serviceResult}`)
    if (form.elderStatus) {
      const note = form.elderStatusNote.trim()
      lines.push(`长辈状态：${form.elderStatus}${note ? `（${note}）` : ''}`)
    }
    if (form.medication.trim()) lines.push(`用药情况：${form.medication.trim()}`)
    if (form.suggestion.trim()) lines.push(`后续建议：${form.suggestion.trim()}`)
    return lines.join('\n')
  },

  async handleSubmit() {
    const { form, id, needAccept, photos } = this.data
    if (this.data.submitting) return

    if (!form.visitDate) {
      wx.showToast({ title: '请选择实际上门日期', icon: 'none' }); return
    }
    if (!form.serviceResult) {
      wx.showToast({ title: '请选择服务结果', icon: 'none' }); return
    }
    if (!form.elderStatus) {
      wx.showToast({ title: '请选择长辈状态', icon: 'none' }); return
    }
    if (!id) {
      wx.showToast({ title: '预约ID缺失', icon: 'none' }); return
    }

    this.setData({ submitting: true })
    wx.showLoading({ title: '提交中...' })

    try {
      // 上传照片（逐个上传，失败则跳过）
      const photoUrls: string[] = []
      for (const path of photos) {
        try {
          const url = await uploadPhoto(path)
          if (url) photoUrls.push(url)
        } catch {}
      }

      // 若订单仍为 pending 状态，先接受
      if (needAccept) {
        await acceptAppointment(id)
      }

      await submitVisitRecord(id, {
        visitTime: form.visitDate + ' 00:00:00',
        remark: this.buildRemark(),
        payAmount: form.payAmount || undefined,
        payStatus: form.payStatus,
        photos: photoUrls.length > 0 ? photoUrls : undefined
      })

      wx.hideLoading()
      wx.showToast({ title: '记录已提交', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
    } catch (err: any) {
      wx.hideLoading()
      wx.showToast({ title: err.message || '提交失败', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  }
})
