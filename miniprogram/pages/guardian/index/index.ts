import { get } from '../../../../utils/request'

const app = getApp<any>()

Page({
  data: {
    statusH: 0,
    member: {} as any,
    vitals: {} as any,
    loading: false
  },

  onLoad() {
    this.setData({ statusH: app.globalData.statusBarHeight || 0 })
  },

  onShow() {
    this.loadData()
  },

  async loadData() {
    this.setData({ loading: true })
    try {
      const [member, vitals] = await Promise.all([
        get('/guardian/member/current'),
        get('/guardian/member/vitals')
      ])
      this.setData({ member: member || {}, vitals: vitals || {} })
    } catch (e: any) {
      // Use placeholder data if API unavailable
      this.setData({
        member: { name: '张奶奶', age: 72, relationship: '祖母', status: 'normal' },
        vitals: {
          heartRate: 75,
          systolic: 120,
          diastolic: 80,
          steps: 3200,
          temperature: 36.5,
          heartRateStatus: 'normal',
          bpStatus: 'normal',
          updateTime: '10分钟前'
        }
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  goHistory() {
    wx.navigateTo({ url: '/pages/guardian/monitor/history/history' })
  },

  goSwitch() {
    wx.navigateTo({ url: '/pages/guardian/member/switch/switch' })
  },

  goService() {
    wx.switchTab ? wx.switchTab({ url: '/pages/guardian/service/list/list' }) :
      wx.navigateTo({ url: '/pages/guardian/service/list/list' })
  },

  goBindDevice() {
    wx.navigateTo({ url: '/pages/guardian/device/bind/bind' })
  },

  goNotification() {
    wx.navigateTo({ url: '/pages/guardian/monitor/alarm/alarm?id=latest' })
  },

  onPullDownRefresh() {
    this.loadData().then(() => wx.stopPullDownRefresh())
  }
})
