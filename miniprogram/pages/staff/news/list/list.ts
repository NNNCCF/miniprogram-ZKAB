import { getNewsList } from '../../../../utils/api'

Page({
  data: {
    loading: false,
    news: [] as any[]
  },

  onLoad() {
    this.loadNews()
  },

  onPullDownRefresh() {
    this.loadNews().then(() => wx.stopPullDownRefresh())
  },

  async loadNews() {
    this.setData({ loading: true })
    try {
      const list = await getNewsList() as any[]
      this.setData({ news: list || [] })
    } catch {
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  goDetail(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/guardian/service/newsDetail/newsDetail?id=${id}` })
  }
})
