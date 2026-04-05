import { get, put } from '../../../../../utils/request'

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
    if (id) this.loadAlarm(id)
    else this.setData({ loading: false })
  },

  async loadAlarm(id: string) {
    this.setData({ loading: true })
    try {
      const alarm = await get('/alarms/' + id)
      this.setData({ alarm })
    } catch {
      // Placeholder
      this.setData({
        alarm: {
          id,
          type: '心率异常',
          level: 'medium',
          status: 'pending',
          time: '2024-03-15 14:32',
          location: '客厅',
          description: '检测到心率持续偏高，当前心率为110 bpm，超过正常范围。请注意关注被监护人状态，必要时联系医生。'
        }
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  async markResolved() {
    const { alarm } = this.data
    if (!alarm) return
    wx.showLoading({ title: '处理中...' })
    try {
      await put('/alarms/' + alarm.id + '/resolve')
      this.setData({ 'alarm.status': 'resolved' })
      wx.hideLoading()
      wx.showToast({ title: '已标记处理', icon: 'success' })
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
