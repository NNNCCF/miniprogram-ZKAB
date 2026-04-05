import { getMemberList } from '../../../utils/api'
import { get } from '../../../utils/request'

const app = getApp<any>()

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
    loading: false
  },

  onLoad() {
    const { statusBarHeight, windowWidth } = wx.getSystemInfoSync()
    // 卡片内容宽度 = 屏幕宽 - 页面左右各24px内边距 - 卡片左右各24px内边距
    const chartW = windowWidth - 96
    this.setData({ statusH: statusBarHeight || 0, chartW })
  },

  onShow() {
    this.loadData()
  },

  async loadData() {
    this.setData({ loading: true })
    try {
      const members: any[] = (await getMemberList()) || []
      if (members.length === 0) {
        this.setData({ hasMember: false, member: {}, vitals: {} })
        return
      }

      const savedId = wx.getStorageSync('currentMemberId')
      const member = members.find((m: any) => String(m.id) === String(savedId)) || members[0]
      if (!savedId) wx.setStorageSync('currentMemberId', member.id)

      this.setData({ hasMember: true, member })

      // 并行拉取实时数据 + 今日历史
      const today = new Date().toISOString().slice(0, 10)
      const [vitalsRes, breathRes, heartRes] = await Promise.allSettled([
        get('/mini/monitor/realtime', { memberId: member.id }),
        get('/mini/monitor/history', { memberId: member.id, type: 'breathRate', startDate: today, endDate: today }),
        get('/mini/monitor/history', { memberId: member.id, type: 'heartRate', startDate: today, endDate: today })
      ])

      const vitals: any = vitalsRes.status === 'fulfilled' ? (vitalsRes.value || {}) : {}
      const isWarn = vitals.heartStatus === '异常' || vitals.breathStatus === '异常' || vitals.fallStatus === true
      member.status = isWarn ? 'warn' : 'normal'
      this.setData({ vitals, member })

      if (breathRes.status === 'fulfilled' && breathRes.value) {
        const bh = this.buildHistoryStat(breathRes.value as any, vitals.breathStatus)
        this.setData({ breathHistory: bh })
        setTimeout(() => this.drawChart('breathChart', bh.values, '#7B68EE'), 200)
      }

      if (heartRes.status === 'fulfilled' && heartRes.value) {
        const hh = this.buildHistoryStat(heartRes.value as any, vitals.heartStatus)
        this.setData({ heartHistory: hh })
        setTimeout(() => this.drawChart('heartChart', hh.values, '#7B68EE'), 200)
      }

    } catch (e: any) {
      wx.showToast({ title: e.message || '加载失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  buildHistoryStat(data: any, rawStatus?: string): HistoryStat {
    const values: number[] = (data.values || []).map(Number).filter((v: number) => !isNaN(v))
    const hours: string[] = data.hours || []

    if (!values.length) {
      return { avg: '--', max: '--', min: '--', startTime: '--', endTime: '--', status: rawStatus || '正常', isWarn: rawStatus === '异常', values: [], }
    }

    const sum = values.reduce((a, b) => a + b, 0)
    const avg = (sum / values.length).toFixed(1)
    const max = Math.max(...values).toFixed(1)
    const min = Math.min(...values).toFixed(1)

    const fmt = (ts: string) => {
      if (!ts) return '--'
      const d = new Date(ts)
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    }

    const status = rawStatus || '正常'
    return { avg, max, min, startTime: fmt(hours[0]), endTime: fmt(hours[hours.length - 1]), status, isWarn: status === '异常', values }
  },

  drawChart(canvasId: string, values: number[], strokeColor: string) {
    if (!values.length) return
    const { chartW } = this.data
    const W = chartW
    const H = 80
    const pad = { t: 6, r: 2, b: 6, l: 2 }
    const dW = W - pad.l - pad.r
    const dH = H - pad.t - pad.b

    const max = Math.max(...values)
    const min = Math.min(...values)
    const range = max - min || 1

    const ctx = wx.createCanvasContext(canvasId, this)

    // 渐变填充
    const grad = ctx.createLinearGradient(0, pad.t, 0, H)
    grad.addColorStop(0, 'rgba(123,104,238,0.20)')
    grad.addColorStop(1, 'rgba(123,104,238,0.00)')

    const pts = values.map((v, i) => ({
      x: pad.l + (i / Math.max(values.length - 1, 1)) * dW,
      y: pad.t + dH - ((v - min) / range) * dH
    }))

    // 填充区域
    ctx.beginPath()
    ctx.setFillStyle(grad)
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y))
    ctx.lineTo(pts[pts.length - 1].x, H)
    ctx.lineTo(pts[0].x, H)
    ctx.closePath()
    ctx.fill()

    // 折线
    ctx.beginPath()
    ctx.setStrokeStyle(strokeColor)
    ctx.setLineWidth(1.5)
    ctx.setLineCap('round')
    ctx.setLineJoin('round')
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y))
    ctx.stroke()
    ctx.draw()
  },

  goBreathHistory() {
    const { member } = this.data
    wx.navigateTo({ url: `/pages/guardian/monitor/history/history?memberId=${member.id}&type=breathRate` })
  },

  goHeartHistory() {
    const { member } = this.data
    wx.navigateTo({ url: `/pages/guardian/monitor/history/history?memberId=${member.id}&type=heartRate` })
  },

  goSwitch() {
    wx.navigateTo({ url: '/pages/guardian/member/switch/switch' })
  },

  goBindDevice() {
    wx.navigateTo({ url: '/pages/guardian/device/bind/bind' })
  },

  onPullDownRefresh() {
    this.loadData().then(() => wx.stopPullDownRefresh())
  }
})
