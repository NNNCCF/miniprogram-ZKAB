import { getServiceDoctor, getNewsList } from '../../../../utils/api'

const app = getApp<any>()

Page({
  data: {
    statusH: 0,
    doctor: null as any,   // null 表示未绑定家庭医生
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
      const doctor = await getServiceDoctor() as any
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
    const { doctor } = this.data
    if (!doctor) {
      wx.showToast({ title: '暂未绑定家庭医生', icon: 'none' })
      return
    }
    wx.navigateTo({ url: `/pages/guardian/service/doctorDetail/doctorDetail?id=${doctor.id}` })
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
