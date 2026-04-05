const app = getApp<any>()

Page({
  data: {
    statusH: 0,
    news: [
      { id: 1, title: '老年人高血压管理指南2024版', date: '2024-03-15', author: '健康中国' },
      { id: 2, title: '如何预防老年人跌倒意外', date: '2024-03-10', author: '安全健康' },
      { id: 3, title: '冬季老年人心脑血管疾病防护要点', date: '2024-03-05', author: '医学科普' }
    ] as any[]
  },

  onLoad() {
    this.setData({ statusH: app.globalData.statusBarHeight || 0 })
  },

  goDoctor() {
    wx.navigateTo({ url: '/pages/guardian/service/doctorDetail/doctorDetail' })
  },

  goCommunity() {
    wx.showToast({ title: '小区物业服务', icon: 'none' })
  },

  goHospital() {
    wx.showToast({ title: '医疗机构预约', icon: 'none' })
  },

  goQuick(e: any) {
    const type = e.currentTarget.dataset.type
    const urlMap: Record<string, string> = {
      medicine: '/pages/guardian/service/medicineDetail/medicineDetail',
      visit: '/pages/guardian/service/doctorDetail/doctorDetail?type=visit',
      checkup: '/pages/guardian/service/doctorDetail/doctorDetail?type=checkup',
      nursing: '/pages/guardian/service/doctorDetail/doctorDetail?type=nursing',
    }
    if (urlMap[type]) wx.navigateTo({ url: urlMap[type] })
  },

  goNews(e: any) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/guardian/service/newsDetail/newsDetail?id=${id}` })
  }
})
