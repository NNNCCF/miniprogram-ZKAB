import { getMemberList, getMonitorHistory } from '../../../../utils/api'

const app = getApp<any>()

function formatDate(input: Date) {
  return `${input.getFullYear()}-${String(input.getMonth() + 1).padStart(2, '0')}-${String(input.getDate()).padStart(2, '0')}`
}

function warnHeart(value: number) {
  return value < 60 || value > 100
}

function warnBreath(value: number) {
  return value < 12 || value > 20
}

Page({
  data: {
    statusH: 0,
    memberId: null as number | null,
    memberName: '',
    currentHeartRate: '--',
    heartRateWarn: false,
    currentBreath: '--',
    breathWarn: false,
    chartType: 'heartRate',
    yLabels: [] as string[],
    xLabels: [] as string[],
    canvasW: 280,
    canvasH: 160,
    loading: false,
    historyList: [] as any[],
    heartRatePoints: [] as any[],
    breathPoints: [] as any[]
  },

  async onLoad(options: any) {
    const info = wx.getSystemInfoSync()
    this.setData({
      statusH: app.globalData.statusBarHeight || 0,
      canvasW: Math.floor(info.windowWidth - 56),
      canvasH: 160,
      chartType: options?.type === 'breathRate' ? 'breathRate' : 'heartRate'
    })
    await this.resolveMember(options?.memberId)
    this.loadData()
  },

  async resolveMember(memberId?: string) {
    try {
      const members = await getMemberList()
      if (!members.length) return
      const savedId = memberId || wx.getStorageSync('currentMemberId')
      const current = members.find((item: any) => String(item.id) === String(savedId)) || members[0]
      wx.setStorageSync('currentMemberId', current.id)
      this.setData({ memberId: current.id, memberName: current.name || '' })
    } catch {}
  },

  async loadData() {
    if (!this.data.memberId) {
      this.setData({ loading: false, historyList: [], heartRatePoints: [], breathPoints: [] })
      return
    }

    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - 6)

    this.setData({ loading: true })
    try {
      const [heartRaw, breathRaw] = await Promise.all([
        getMonitorHistory({ memberId: this.data.memberId, type: 'heartRate', startDate: formatDate(start), endDate: formatDate(end) }),
        getMonitorHistory({ memberId: this.data.memberId, type: 'breathRate', startDate: formatDate(start), endDate: formatDate(end) })
      ])

      const heartRatePoints = this.buildPoints(heartRaw)
      const breathPoints = this.buildPoints(breathRaw)
      const latestHeart = heartRatePoints[heartRatePoints.length - 1]
      const latestBreath = breathPoints[breathPoints.length - 1]

      this.setData({
        heartRatePoints,
        breathPoints,
        currentHeartRate: latestHeart ? latestHeart.value : '--',
        heartRateWarn: latestHeart ? warnHeart(latestHeart.value) : false,
        currentBreath: latestBreath ? latestBreath.value : '--',
        breathWarn: latestBreath ? warnBreath(latestBreath.value) : false
      })

      this.buildChart(this.data.chartType)
      this.buildHistoryList()
      setTimeout(() => this.drawChart(), 80)
    } catch (err: any) {
      wx.showToast({ title: err.message || '加载失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  buildPoints(data: any) {
    const hours = data?.hours || []
    const values = data?.values || []
    const startIndex = Math.max(values.length - 24, 0)
    return values.slice(startIndex).map((value: any, offset: number) => {
      const index = startIndex + offset
      const raw = hours[index]
      const time = raw ? new Date(raw) : null
      return {
        id: index,
        raw,
        date: time ? `${String(time.getMonth() + 1).padStart(2, '0')}/${String(time.getDate()).padStart(2, '0')}` : '--',
        time: time ? `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}` : '--',
        label: time ? `${String(time.getMonth() + 1).padStart(2, '0')}/${String(time.getDate()).padStart(2, '0')}` : '--',
        value: Number(value) || 0
      }
    })
  },

  buildChart(type: string) {
    const points = type === 'heartRate' ? this.data.heartRatePoints : this.data.breathPoints
    if (!points.length) {
      this.setData({ yLabels: [], xLabels: [], chartType: type })
      return
    }

    const values = points.map((item: any) => item.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const pad = Math.max(3, Math.ceil((max - min) * 0.2) || 3)
    const yMax = max + pad
    const yMin = min - pad
    const step = Math.max(1, Math.ceil((yMax - yMin) / 3))
    const xLabels = [points[0]?.label, points[Math.floor(points.length / 2)]?.label, points[points.length - 1]?.label].filter(Boolean)

    this.setData({
      chartType: type,
      yLabels: [yMax, yMax - step, yMax - step * 2, yMin].map((item) => String(Math.round(item))),
      xLabels
    })
  },

  drawChart() {
    const points = this.data.chartType === 'heartRate' ? this.data.heartRatePoints : this.data.breathPoints
    if (!points.length) return

    const values = points.map((item: any) => item.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const pad = Math.max(3, Math.ceil((max - min) * 0.2) || 3)
    const dataMin = min - pad
    const dataMax = max + pad
    const range = dataMax - dataMin || 1

    const width = this.data.canvasW
    const height = this.data.canvasH
    const paddingLeft = 8
    const paddingRight = 12
    const paddingTop = 16
    const paddingBottom = 8
    const chartWidth = width - paddingLeft - paddingRight
    const chartHeight = height - paddingTop - paddingBottom

    const toX = (index: number) => paddingLeft + (index / Math.max(points.length - 1, 1)) * chartWidth
    const toY = (value: number) => paddingTop + (1 - (value - dataMin) / range) * chartHeight
    const color = this.data.chartType === 'heartRate' ? '#3B7EFF' : '#10B981'
    const fillColor = this.data.chartType === 'heartRate' ? 'rgba(59,126,255,0.10)' : 'rgba(16,185,129,0.10)'
    const ctx = wx.createCanvasContext('lineChart', this)
    const coordPoints = values.map((value: number, index: number) => ({ x: toX(index), y: toY(value) }))

    ctx.clearRect(0, 0, width, height)
    ctx.setStrokeStyle('rgba(200,215,240,0.5)')
    ctx.setLineWidth(0.5)
    for (let index = 0; index <= 3; index += 1) {
      const y = paddingTop + (index / 3) * chartHeight
      ctx.beginPath(); ctx.moveTo(paddingLeft, y); ctx.lineTo(width - paddingRight, y); ctx.stroke()
    }

    ctx.setFillStyle(fillColor)
    ctx.beginPath(); ctx.moveTo(coordPoints[0].x, paddingTop + chartHeight)
    coordPoints.forEach((point: any) => ctx.lineTo(point.x, point.y))
    ctx.lineTo(coordPoints[coordPoints.length - 1].x, paddingTop + chartHeight)
    ctx.closePath(); ctx.fill()

    ctx.setStrokeStyle(color)
    ctx.setLineWidth(2)
    ctx.setLineCap('round')
    ctx.setLineJoin('round')
    ctx.beginPath()
    coordPoints.forEach((point: any, index: number) => index === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y))
    ctx.stroke(); ctx.draw()
  },

  buildHistoryList() {
    const heartPoints = this.data.heartRatePoints
    const breathPoints = this.data.breathPoints
    const total = Math.max(heartPoints.length, breathPoints.length)
    const historyList = [] as any[]

    for (let index = total - 1; index >= 0; index -= 1) {
      const heart = heartPoints[index]
      const breath = breathPoints[index]
      if (!heart && !breath) continue
      const heartValue = heart?.value
      const breathValue = breath?.value
      historyList.push({
        id: index,
        date: heart?.date || breath?.date || '--',
        time: heart?.time || breath?.time || '--',
        heartRate: heartValue ?? '--',
        breath: breathValue ?? '--',
        heartRateWarn: typeof heartValue === 'number' ? warnHeart(heartValue) : false,
        warn: (typeof heartValue === 'number' && warnHeart(heartValue)) || (typeof breathValue === 'number' && warnBreath(breathValue))
      })
    }

    this.setData({ historyList })
  },

  switchChart(e: any) {
    const type = e.currentTarget.dataset.type
    this.buildChart(type)
    setTimeout(() => this.drawChart(), 50)
  },

  goBack() { wx.navigateBack() },
  onPullDownRefresh() { this.loadData().then(() => wx.stopPullDownRefresh()) }
})