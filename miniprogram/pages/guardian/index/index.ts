import { getAlarms, getMemberList, getMonitorHistory, getMonitorRealtime } from '../../../utils/api'

interface HistoryStat {
  avg: string
  max: string
  min: string
  startTime: string
  endTime: string
  status: string
  isWarn: boolean
  values: number[]
}

Page({
  data: {
    statusH: 0,
    hasMember: false,
    member: {} as any,
    vitals: {} as any,
    breathHistory: {} as Partial<HistoryStat>,
    heartHistory: {} as Partial<HistoryStat>,
    chartW: 300,
    loading: false,
    latestAlarmId: null as number | null
  },

  onLoad() {
    const { statusBarHeight, windowWidth } = wx.getSystemInfoSync()
    this.setData({ statusH: statusBarHeight || 0, chartW: windowWidth - 96 })
  },

  onShow() {
    this.loadData()
  },

  async loadData() {
    this.setData({ loading: true })
    try {
      const members = await getMemberList()
      if (members.length === 0) {
        this.setData({ hasMember: false, member: {}, vitals: {}, latestAlarmId: null })
        return
      }

      const savedId = wx.getStorageSync('currentMemberId')
      const member = members.find((item: any) => String(item.id) === String(savedId)) || members[0]
      wx.setStorageSync('currentMemberId', member.id)
      this.setData({ hasMember: true, member })

      const today = new Date().toISOString().slice(0, 10)
      const [vitalsRes, breathRes, heartRes, alarmRes] = await Promise.allSettled([
        getMonitorRealtime(member.id),
        getMonitorHistory({ memberId: member.id, type: 'breathRate', startDate: today, endDate: today }),
        getMonitorHistory({ memberId: member.id, type: 'heartRate', startDate: today, endDate: today }),
        getAlarms({ memberId: String(member.id), status: 'unhandled' })
      ])

      const vitals: any = vitalsRes.status === 'fulfilled' ? (vitalsRes.value || {}) : {}
      const isWarn = vitals.heartStatus === '异常' || vitals.breathStatus === '异常' || vitals.fallStatus === true
      member.status = isWarn ? 'warn' : 'normal'
      this.setData({ vitals, member })

      if (breathRes.status === 'fulfilled' && breathRes.value) {
        const breathHistory = this.buildHistoryStat(breathRes.value as any, vitals.breathStatus)
        this.setData({ breathHistory })
        setTimeout(() => this.drawChart('breathChart', breathHistory.values, '#7B68EE'), 80)
      }
      if (heartRes.status === 'fulfilled' && heartRes.value) {
        const heartHistory = this.buildHistoryStat(heartRes.value as any, vitals.heartStatus)
        this.setData({ heartHistory })
        setTimeout(() => this.drawChart('heartChart', heartHistory.values, '#7B68EE'), 80)
      }

      if (alarmRes.status === 'fulfilled' && alarmRes.value.length > 0) {
        this.setData({ latestAlarmId: alarmRes.value[0].id || null })
      } else {
        this.setData({ latestAlarmId: null })
      }
    } catch (err: any) {
      wx.showToast({ title: err.message || '加载失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  buildHistoryStat(data: any, rawStatus?: string): HistoryStat {
    const values: number[] = (data.values || []).map(Number).filter((value: number) => !Number.isNaN(value))
    const hours: string[] = data.hours || []
    if (!values.length) {
      const status = rawStatus || '正常'
      return { avg: '--', max: '--', min: '--', startTime: '--', endTime: '--', status, isWarn: status === '异常', values: [] }
    }
    const sum = values.reduce((total, value) => total + value, 0)
    const fmt = (ts: string) => {
      if (!ts) return '--'
      const d = new Date(ts)
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    }
    const status = rawStatus || '正常'
    return {
      avg: (sum / values.length).toFixed(1),
      max: Math.max(...values).toFixed(1),
      min: Math.min(...values).toFixed(1),
      startTime: fmt(hours[0]),
      endTime: fmt(hours[hours.length - 1]),
      status,
      isWarn: status === '异常',
      values
    }
  },

  drawChart(canvasId: string, values: number[], strokeColor: string) {
    if (!values.length) return
    const width = this.data.chartW
    const height = 80
    const padding = { t: 6, r: 2, b: 6, l: 2 }
    const drawWidth = width - padding.l - padding.r
    const drawHeight = height - padding.t - padding.b
    const max = Math.max(...values)
    const min = Math.min(...values)
    const range = max - min || 1
    const ctx = wx.createCanvasContext(canvasId, this)

    const gradient = ctx.createLinearGradient(0, padding.t, 0, height)
    gradient.addColorStop(0, 'rgba(123,104,238,0.20)')
    gradient.addColorStop(1, 'rgba(123,104,238,0.00)')

    const points = values.map((value, index) => ({
      x: padding.l + (index / Math.max(values.length - 1, 1)) * drawWidth,
      y: padding.t + drawHeight - ((value - min) / range) * drawHeight
    }))

    ctx.beginPath()
    ctx.setFillStyle(gradient)
    points.forEach((point, index) => index === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y))
    ctx.lineTo(points[points.length - 1].x, height)
    ctx.lineTo(points[0].x, height)
    ctx.closePath()
    ctx.fill()

    ctx.beginPath()
    ctx.setStrokeStyle(strokeColor)
    ctx.setLineWidth(1.5)
    ctx.setLineCap('round')
    ctx.setLineJoin('round')
    points.forEach((point, index) => index === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y))
    ctx.stroke()
    ctx.draw()
  },

  goBreathHistory() {
    wx.navigateTo({ url: `/pages/guardian/monitor/history/history?memberId=${this.data.member.id}&type=breathRate` })
  },

  goHeartHistory() {
    wx.navigateTo({ url: `/pages/guardian/monitor/history/history?memberId=${this.data.member.id}&type=heartRate` })
  },

  goLatestAlarm() {
    const memberId = this.data.member?.id
    if (!memberId) return
    if (this.data.latestAlarmId) {
      wx.navigateTo({ url: `/pages/guardian/monitor/alarm/alarm?id=${this.data.latestAlarmId}` })
      return
    }
    wx.navigateTo({ url: `/pages/guardian/monitor/alarm/alarm?id=latest&memberId=${memberId}` })
  },

  goSwitch() { wx.navigateTo({ url: '/pages/guardian/member/switch/switch' }) },
  goBindDevice() { wx.navigateTo({ url: '/pages/guardian/device/bind/bind' }) },
  onPullDownRefresh() { this.loadData().then(() => wx.stopPullDownRefresh()) }
})
