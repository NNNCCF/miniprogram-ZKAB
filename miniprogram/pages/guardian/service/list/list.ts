import { getNewsList, getServiceDoctor } from '../../../../utils/api'

const app = getApp<any>()

Page({
  data: {
    statusH: 0,
    doctor: null as any,
    news: [] as any[],
    loadingDoctor: true,
    loadingNews: true
  },

  onLoad() {
    this.setData({ statusH: app.globalData.statusBarHeight || 0 })
  },

  onShow() {
    this.loadDoctor()
    this.loadNews()
  },

  async loadDoctor() {
    this.setData({ loadingDoctor: true })
    try {
      const doctor = await getServiceDoctor()
      this.setData({ doctor: doctor || null })
    } catch {
      this.setData({ doctor: null })
    } finally {
      this.setData({ loadingDoctor: false })
    }
  },

  async loadNews() {
    this.setData({ loadingNews: true })
    try {
      const list = await getNewsList() as any[]
      this.setData({ news: (list || []).slice(0, 5) })
    } catch {
      this.setData({ news: [] })
    } finally {
      this.setData({ loadingNews: false })
    }
  },

  goDoctor() {
    if (!this.data.doctor) {
      wx.showToast({ title: '暂未绑定服务医生', icon: 'none' })
      return
    }
    wx.navigateTo({ url: '/pages/guardian/service/doctorDetail/doctorDetail' })
  },

  goCommunity() {
    wx.navigateTo({ url: '/pages/guardian/serviceCenter/serviceCenter' })
  },

  goHospital() {
    wx.navigateTo({ url: '/pages/guardian/serviceCenter/serviceCenter' })
  },

  goQuick(e: any) {
    const type = e.currentTarget.dataset.type
    const urlMap: Record<string, string> = {
      medicine: '/pages/guardian/service/medicineDetail/medicineDetail',
      visit: '/pages/guardian/service/doctorDetail/doctorDetail?type=visit',
      checkup: '/pages/guardian/service/doctorDetail/doctorDetail?type=checkup',
      nursing: '/pages/guardian/service/doctorDetail/doctorDetail?type=nursing'
    }
    if (urlMap[type]) {
      wx.navigateTo({ url: urlMap[type] })
    }
  },

  goNews(e: any) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/guardian/service/newsDetail/newsDetail?id=${id}` })
  }
})