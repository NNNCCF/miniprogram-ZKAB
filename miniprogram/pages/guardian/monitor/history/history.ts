import { get } from '../../../../../utils/request'

const app = getApp<any>()

Page({
  data: {
    statusH: 0,
    startDate: '',
    endDate: '',
    activeType: 'all',
    types: [
      { key: 'all', label: '全部' },
      { key: 'heartRate', label: '心率' },
      { key: 'bloodPressure', label: '血压' },
      { key: 'steps', label: '步数' }
    ],
    list: [] as any[],
    loading: false
  },

  onLoad() {
    this.setData({ statusH: app.globalData.statusBarHeight || 0 })
    // Default to last 7 days
    const now = new Date()
    const end = now.toISOString().slice(0, 10)
    now.setDate(now.getDate() - 7)
    const start = now.toISOString().slice(0, 10)
    this.setData({ startDate: start, endDate: end })
    this.loadHistory()
  },

  onStartDateChange(e: any) {
    this.setData({ startDate: e.detail.value })
  },

  onEndDateChange(e: any) {
    this.setData({ endDate: e.detail.value })
  },

  switchType(e: any) {
    this.setData({ activeType: e.currentTarget.dataset.key })
    this.loadHistory()
  },

  async loadHistory() {
    this.setData({ loading: true })
    try {
      const { startDate, endDate, activeType } = this.data
      const list = await get('/guardian/member/history', { startDate, endDate, type: activeType })
      this.setData({ list: list || [] })
    } catch {
      // Placeholder data
      this.setData({
        list: [
          { id: 1, date: '2024-03-15', time: '09:30', heartRate: 72, systolic: 118, diastolic: 78, steps: 3500, temperature: 36.5, heartRateStatus: 'normal', overall: 'normal' },
          { id: 2, date: '2024-03-15', time: '14:00', heartRate: 115, systolic: 145, diastolic: 95, steps: 5200, temperature: 36.8, heartRateStatus: 'warn', overall: 'warn' },
          { id: 3, date: '2024-03-14', time: '10:15', heartRate: 68, systolic: 120, diastolic: 80, steps: 2800, temperature: 36.4, heartRateStatus: 'normal', overall: 'normal' }
        ]
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  goBack() {
    wx.navigateBack()
  }
})
