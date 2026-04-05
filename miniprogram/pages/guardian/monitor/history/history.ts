import { getMemberHistory } from '../../../../utils/api'

const app = getApp<any>()

function genMockPoints(base: number, spread: number, count = 10) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (count - 1 - i))
    return {
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      value: base + Math.round((Math.random() - 0.5) * spread * 2)
    }
  })
}

Page({
  data: {
    statusH: 0,
    currentHeartRate: 78,
    heartRateWarn: false,
    currentBreath: 17,
    breathWarn: false,
    chartType: 'heartRate',
    yLabels: [] as string[],
    xLabels: [] as string[],
    canvasW: 280,
    canvasH: 160,
    loading: false,
    historyList: [] as any[],
    heartRatePoints: [] as { date: string; value: number }[],
    breathPoints: [] as { date: string; value: number }[],
  },

  onLoad() {
    const info = wx.getSystemInfoSync()
    const canvasW = Math.floor(info.windowWidth - 56)
    const canvasH = 160
    this.setData({ statusH: app.globalData.statusBarHeight || 0, canvasW, canvasH })

    const heartRatePoints = genMockPoints(75, 12)
    const breathPoints = genMockPoints(17, 4)
    const last = heartRatePoints[heartRatePoints.length - 1]
    const lastBreath = breathPoints[breathPoints.length - 1]
    this.setData({
      heartRatePoints,
      breathPoints,
      currentHeartRate: last.value,
      heartRateWarn: last.value > 85 || last.value < 60,
      currentBreath: lastBreath.value,
      breathWarn: lastBreath.value > 20 || lastBreath.value < 12,
    })
    this.buildChart('heartRate')
    this.buildHistoryList()
  },

  onReady() {
    this.drawChart()
  },

  buildChart(type: string) {
    const pts = type === 'heartRate' ? this.data.heartRatePoints : this.data.breathPoints
    const values = pts.map(p => p.value)
    const minV = Math.min(...values)
    const maxV = Math.max(...values)
    const pad = Math.max(3, Math.ceil((maxV - minV) * 0.2))
    const yMax = maxV + pad
    const yMin = minV - pad
    const step = Math.ceil((yMax - yMin) / 3)
    const yLabels = [yMax, yMax - step, yMax - 2 * step, yMin].map(v => String(Math.round(v)))
    // Show every other date label to avoid crowding
    const xLabels = pts
      .filter((_, i) => i === 0 || i === 4 || i === pts.length - 1)
      .map(p => p.date)
    this.setData({ yLabels, xLabels, chartType: type })
  },

  drawChart() {
    const { chartType, heartRatePoints, breathPoints, canvasW, canvasH } = this.data
    const pts = chartType === 'heartRate' ? heartRatePoints : breathPoints
    if (!pts || pts.length === 0) return

    const values = pts.map(p => p.value)
    const minV = Math.min(...values)
    const maxV = Math.max(...values)
    const pad = Math.max(3, Math.ceil((maxV - minV) * 0.2))
    const dataMin = minV - pad
    const dataMax = maxV + pad
    const range = dataMax - dataMin || 1

    const W = canvasW, H = canvasH
    const pL = 8, pR = 12, pT = 16, pB = 8
    const cW = W - pL - pR
    const cH = H - pT - pB

    const toX = (i: number) => pL + (i / (pts.length - 1)) * cW
    const toY = (v: number) => pT + (1 - (v - dataMin) / range) * cH

    const color = chartType === 'heartRate' ? '#3B7EFF' : '#10B981'
    const fillColor = chartType === 'heartRate' ? 'rgba(59,126,255,0.10)' : 'rgba(16,185,129,0.10)'

    const ctx = wx.createCanvasContext('lineChart', this)
    ctx.clearRect(0, 0, W, H)

    // Grid lines
    ctx.setStrokeStyle('rgba(200,215,240,0.5)')
    ctx.setLineWidth(0.5)
    for (let i = 0; i <= 3; i++) {
      const y = pT + (i / 3) * cH
      ctx.beginPath(); ctx.moveTo(pL, y); ctx.lineTo(W - pR, y); ctx.stroke()
    }

    const coordPts = values.map((v, i) => ({ x: toX(i), y: toY(v) }))

    // Fill area
    ctx.setFillStyle(fillColor)
    ctx.beginPath()
    ctx.moveTo(coordPts[0].x, pT + cH)
    coordPts.forEach(p => ctx.lineTo(p.x, p.y))
    ctx.lineTo(coordPts[coordPts.length - 1].x, pT + cH)
    ctx.closePath()
    ctx.fill()

    // Line
    ctx.setStrokeStyle(color)
    ctx.setLineWidth(2)
    ctx.setLineCap('round')
    ctx.setLineJoin('round')
    ctx.beginPath()
    coordPts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y))
    ctx.stroke()

    // Dots + value labels at peak/ends
    const peakIdx = values.indexOf(Math.max(...values))
    const troughIdx = values.indexOf(Math.min(...values))
    coordPts.forEach((p, i) => {
      ctx.setFillStyle('#fff')
      ctx.setStrokeStyle(color)
      ctx.setLineWidth(2)
      ctx.beginPath(); ctx.arc(p.x, p.y, 3.5, 0, 2 * Math.PI)
      ctx.fill(); ctx.stroke()

      if (i === 0 || i === pts.length - 1 || i === peakIdx || i === troughIdx) {
        ctx.setFontSize(10)
        ctx.setFillStyle(color)
        ctx.fillText(String(values[i]), p.x - 8, p.y - 8)
      }
    })

    ctx.draw()
  },

  switchChart(e: any) {
    const type = e.currentTarget.dataset.type
    this.buildChart(type)
    setTimeout(() => this.drawChart(), 50)
  },

  buildHistoryList() {
    const { heartRatePoints, breathPoints } = this.data
    const list = heartRatePoints.map((h, i) => ({
      id: i,
      date: h.date,
      time: '08:00',
      heartRate: h.value,
      breath: breathPoints[i]?.value ?? '--',
      heartRateWarn: h.value > 85 || h.value < 60,
      warn: h.value > 85 || h.value < 60 ||
            (breathPoints[i]?.value > 20 || breathPoints[i]?.value < 12)
    })).reverse()
    this.setData({ historyList: list })
  },

  goBack() {
    wx.navigateBack()
  }
})
