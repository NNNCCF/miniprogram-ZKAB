import { getStaffSummary } from '../../../utils/api'

Page({
  data: {
    loading: false,
    familyCount: 0,
    totalAppt: 0,
    completedAppt: 0,
    handledAlarms: 0,
    alarmTypeBars: [] as Array<{ type: string; count: number; percent: number }>
  },

  onLoad() {
    this.loadSummary()
  },

  onShow() {
    this.loadSummary()
  },

  async loadSummary() {
    this.setData({ loading: true })
    try {
      const summary = await getStaffSummary() as any
      this.setData({
        familyCount: summary.familyCount || 0,
        totalAppt: summary.totalAppt || 0,
        completedAppt: summary.completedAppt || 0,
        handledAlarms: summary.handledAlarms || 0,
        alarmTypeBars: summary.alarmTypeBars || [],
        loading: false
      })
    } catch (err: any) {
      this.setData({ loading: false, alarmTypeBars: [] })
      wx.showToast({
        title: err.message || '加载失败',
        icon: 'none'
      })
    }
  }
})