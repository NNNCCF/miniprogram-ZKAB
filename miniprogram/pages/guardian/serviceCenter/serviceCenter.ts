import { getNewsList, getServiceCenterInfo } from '../../../utils/api'

const app = getApp<any>()
const DEFAULT_COORDINATE = { longitude: 112.5488, latitude: 37.8706 }

Page({
  data: {
    statusH: 0,
    longitude: DEFAULT_COORDINATE.longitude,
    latitude: DEFAULT_COORDINATE.latitude,
    scale: 15,
    markers: [] as any[],
    center: {
      name: '卓凯安伴服务中心',
      address: '山西省太原市',
      phone: '03511234567'
    },
    notices: [] as any[]
  },

  onLoad() {
    this.setData({ statusH: app.globalData.statusBarHeight || 0 })
    this.refreshMarker(this.data.center.name)
  },

  onShow() {
    this.loadData()
  },

  async loadData() {
    const [centerRes, newsRes] = await Promise.allSettled([getServiceCenterInfo(), getNewsList()])

    if (centerRes.status === 'fulfilled' && centerRes.value) {
      this.setData({ center: centerRes.value })
      this.refreshMarker(centerRes.value.name || '卓凯安伴服务中心')
    }
    if (newsRes.status === 'fulfilled') {
      const notices = (newsRes.value || []).slice(0, 6).map((item: any) => ({ id: item.id, title: item.title, date: item.createdAt || item.date || '' }))
      this.setData({ notices })
    }
  },

  refreshMarker(title: string) {
    this.setData({
      markers: [{
        id: 1,
        longitude: this.data.longitude,
        latitude: this.data.latitude,
        title,
        iconPath: '/images/marker_center.png',
        width: 40,
        height: 40,
        callout: { content: title, color: '#0F1C38', fontSize: 13, borderRadius: 8, bgColor: '#ffffff', padding: 6, display: 'ALWAYS' }
      }]
    })
  },

  showIntro() {
    const center = this.data.center
    wx.showModal({ title: center.name || '服务中心', content: `地址：${center.address || '暂无'}\n电话：${center.phone || '暂无'}`, showCancel: false })
  },

  callService() {
    if (!this.data.center.phone) {
      wx.showToast({ title: '暂无联系电话', icon: 'none' })
      return
    }
    wx.makePhoneCall({ phoneNumber: this.data.center.phone })
  },

  showFaq() {
    wx.showModal({
      title: '常见问题',
      content: '1. 设备绑定后可查看监测数据和报警。\n2. SOS 会直接生成紧急报警记录。\n3. 服务预约、送药订单提交后可在服务页查看进度。',
      showCancel: false
    })
  },

  goFeedback() {
    wx.navigateTo({ url: '/pages/guardian/profile/feedback/feedback' })
  },

  goNotice(e: any) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/guardian/service/newsDetail/newsDetail?id=${id}` })
  }
})
