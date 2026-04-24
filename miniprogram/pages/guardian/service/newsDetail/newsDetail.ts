import { get } from '../../../../utils/request'

Page({
  data: {
    statusH: 0,
    loading: true,
    article: {} as any,
    attachments: [] as string[]
  },

  onLoad(options: any) {
    const app = getApp<any>()
    this.setData({ statusH: app.globalData.statusBarHeight || 0 })
    this.load(options.id)
  },

  async load(id: string) {
    try {
      const res: any = await get('/news/' + id)
      let attachments: string[] = []
      if (Array.isArray(res.attachments)) {
        attachments = res.attachments.filter(Boolean)
      } else if (typeof res.attachments === 'string' && res.attachments) {
        attachments = [res.attachments]
      }
      this.setData({ article: res, attachments, loading: false })
    } catch {
      this.setData({ loading: false })
    }
  },

  previewImg(e: any) {
    const index = Number(e.currentTarget.dataset.index)
    wx.previewImage({
      current: this.data.attachments[index],
      urls: this.data.attachments
    })
  },

  goBack() { wx.navigateBack() }
})
