const app = getApp<any>()

Page({
  data: {
    statusH: 0,
    longitude: 112.5488,
    latitude: 37.8706,
    scale: 15,
    markers: [
      {
        id: 1,
        longitude: 112.5488,
        latitude: 37.8706,
        title: '卓凯安伴服务中心',
        iconPath: '/images/marker_center.png',
        width: 40,
        height: 40,
        callout: {
          content: '卓凯安伴服务中心',
          color: '#0F1C38',
          fontSize: 13,
          borderRadius: 8,
          bgColor: '#ffffff',
          padding: 6,
          display: 'ALWAYS'
        }
      }
    ] as any[],
    notices: [
      { id: 1, title: '关于春节期间服务调整的通知', date: '2024-02-01' },
      { id: 2, title: '新增家庭医生签约服务说明', date: '2024-01-20' },
      { id: 3, title: '健康监测设备使用规范更新', date: '2024-01-10' },
      { id: 4, title: '2024年度服务计划公告', date: '2024-01-01' }
    ] as any[]
  },

  onLoad() {
    this.setData({ statusH: app.globalData.statusBarHeight || 0 })
  },

  goIntro() {
    wx.showToast({ title: '中心介绍', icon: 'none' })
  },

  callService() {
    wx.makePhoneCall({ phoneNumber: '03511234567' })
  },

  goWeChat() {
    wx.showToast({ title: '请关注微信公众号', icon: 'none' })
  },

  goFeedback() {
    wx.navigateTo({ url: '/pages/guardian/profile/feedback/feedback' })
  },

  goNotice(e: any) {
    wx.showToast({ title: '公告详情', icon: 'none' })
  }
})
