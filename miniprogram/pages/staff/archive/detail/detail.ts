import { getFamilyDetail } from '../../../../utils/api'

Page({
  data: {
    loading: false,
    id: '',
    archive: null as any
  },

  onLoad(options: Record<string, string>) {
    const id = options.id || ''
    this.setData({ id })
    this.load(id)
  },

  async load(id: string) {
    if (!id) return
    this.setData({ loading: true })
    try {
      const archive = await getFamilyDetail(id)
      this.setData({
        archive: {
          ...archive,
          recentAlarms: (archive as any).recentAlarms || [],
          members: (archive as any).members || []
        },
        loading: false
      })
    } catch (err: any) {
      this.setData({ loading: false })
      wx.showToast({
        title: err.message || '加载失败',
        icon: 'none'
      })
    }
  }
})