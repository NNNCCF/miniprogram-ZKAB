import { get } from '../../../utils/request'

const WEEK_LABELS = ['日', '一', '二', '三', '四', '五', '六']

interface SummaryData {
  handledAlarms: number
  totalAppointments: number
  completionRate: number
  pendingAppointments: number
  acceptedAppointments: number
  completedAppointments: number
  weekAlarms: Array<{ day: string; count: number }>
  weekAppts: Array<{ day: string; count: number }>
}

interface WeekBarItem {
  day: string
  count: number
  percent: number
}

Page({
  data: {
    loading: false,
    stats: {
      handledAlarms: 0,
      totalAppointments: 0,
      completionRate: 0,
      pendingAppointments: 0,
      acceptedAppointments: 0,
      completedAppointments: 0
    },
    weekAlarms: [] as WeekBarItem[],
    weekAppts: [] as WeekBarItem[]
  },

  onLoad() {
    this.loadSummary()
  },

  onShow() {
    this.loadSummary()
  },

  loadSummary() {
    this.setData({ loading: true })
    get<SummaryData>('/staff/summary')
      .then(res => {
        const weekAlarms = this.buildBarData(res.weekAlarms || [])
        const weekAppts = this.buildBarData(res.weekAppts || [])
        this.setData({
          stats: {
            handledAlarms: res.handledAlarms || 0,
            totalAppointments: res.totalAppointments || 0,
            completionRate: res.completionRate || 0,
            pendingAppointments: res.pendingAppointments || 0,
            acceptedAppointments: res.acceptedAppointments || 0,
            completedAppointments: res.completedAppointments || 0
          },
          weekAlarms,
          weekAppts,
          loading: false
        })
      })
      .catch(() => {
        const now = new Date()
        const mockData = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(now)
          d.setDate(d.getDate() - (6 - i))
          return { day: WEEK_LABELS[d.getDay()], count: 0 }
        })
        this.setData({
          weekAlarms: this.buildBarData(mockData),
          weekAppts: this.buildBarData(mockData),
          loading: false
        })
        wx.showToast({ title: '数据加载失败', icon: 'none' })
      })
  },

  buildBarData(raw: Array<{ day: string; count: number }>): WeekBarItem[] {
    const max = Math.max(...raw.map(r => r.count), 1)
    return raw.map(r => ({
      ...r,
      percent: Math.round((r.count / max) * 100)
    }))
  }
})
