import { getAlarmDetail, ignoreAlarm } from '../../../../../utils/api'

const app = getApp<any>()

Page({
  data: {
    statusH: 0,
    alarm: null as any,
    loading: true
  },

  onLoad(options: any) {
    this.setData({ statusH: app.globalData.statusBarHeight || 0 })
    const id = options.id
    if (id && id !== 'latest') {
      this.loadAlarm(id)
    } else {
      this.setData({ loading: false })
    }
  },

  async loadAlarm(id: string) {
    this.setData({ loading: true })
    try {
      const alarm = await getAlarmDetail(id)
      this.setData({ alarm })
    } catch {
      this.setData({
        alarm: {
          id,
          alarmType: '心率异常',
          status: 'unhandled',
          alarmTime: new Date().toLocaleString(),
          location: '客厅',
          description: '检测到异常状态，请及时关注被监护人。'
        }
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  async markIgnored() {
    const { alarm } = this.data
    if (!alarm) return
    wx.showLoading({ title: '处理中...' })
    try {
      await ignoreAlarm(alarm.id)
      this.setData({ 'alarm.status': 'ignored' })
      wx.hideLoading()
      wx.showToast({ title: '已忽略', icon: 'success' })
    } catch {
      wx.hideLoading()
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  callEmergency() {
    wx.makePhoneCall({ phoneNumber: '120' })
  },

  goBack() {
    wx.navigateBack()
  }
})
