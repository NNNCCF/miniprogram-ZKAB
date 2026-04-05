import { get } from '../../../../utils/request'
Page({
  data: { statusH: 0, loading: true, article: {} as any },
  onLoad(options: any) {
    const app = getApp<any>()
    this.setData({ statusH: app.globalData.statusBarHeight || 0 })
    this.load(options.id)
  },
  async load(id: string) {
    try {
      const res: any = await get('/news/' + id)
      this.setData({ article: res, loading: false })
    } catch {
      this.setData({ loading: false })
    }
  },
  goBack() { wx.navigateBack() }
})
