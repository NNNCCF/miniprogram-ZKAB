const app = getApp<any>()

Page({
  data: {
    statusH: 0,
    services: [
      {
        id: 'doctor',
        icon: '👨‍⚕️',
        bgColor: '#EEF3FF',
        title: '家庭医生预约',
        desc: '专业家庭医生，上门服务',
        price: '¥99起',
        url: '/pages/guardian/service/doctorDetail/doctorDetail'
      },
      {
        id: 'medicine',
        icon: '💊',
        bgColor: '#ECFDF5',
        title: '送药服务',
        desc: '正品药品，快速配送',
        price: '免配送费',
        url: '/pages/guardian/service/medicineDetail/medicineDetail'
      },
      {
        id: 'checkup',
        icon: '🏥',
        bgColor: '#FFF7ED',
        title: '体检预约',
        desc: '三甲医院，专业检查',
        price: '¥199起',
        url: '/pages/guardian/service/doctorDetail/doctorDetail?type=checkup'
      },
      {
        id: 'nursing',
        icon: '🩺',
        bgColor: '#F5F3FF',
        title: '护理服务',
        desc: '专业护工，居家照护',
        price: '¥150/天',
        url: '/pages/guardian/service/doctorDetail/doctorDetail?type=nursing'
      }
    ],
    news: [
      { id: 1, title: '老年人高血压管理指南2024版', date: '2024-03-15', author: '健康中国' },
      { id: 2, title: '如何预防老年人跌倒意外', date: '2024-03-10', author: '安全健康' },
      { id: 3, title: '冬季老年人心脑血管疾病防护要点', date: '2024-03-05', author: '医学科普' }
    ] as any[]
  },

  onLoad() {
    this.setData({ statusH: app.globalData.statusBarHeight || 0 })
  },

  goDetail(e: any) {
    const item = e.currentTarget.dataset.item
    wx.navigateTo({ url: item.url })
  },

  goNews(e: any) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/guardian/service/newsDetail/newsDetail?id=${id}` })
  }
})
