import { get } from '../../../../utils/request'

interface OrgInfo {
  name: string
  type: string
  region: string
  address: string
  phone: string
  license: string
}

Page({
  data: {
    orgInfo: {} as OrgInfo,
    loading: false
  },

  onLoad() {
    this.loadOrgInfo()
  },

  async loadOrgInfo() {
    this.setData({ loading: true })
    try {
      const data = await get<OrgInfo>('/staff/org-info')
      this.setData({ orgInfo: data })
    } catch (err: any) {
      wx.showToast({
        title: err.message || '加载失败',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  }
})
