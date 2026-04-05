import { get, put } from '../../../../utils/request'
Page({
  data: {
    statusH: 0,
    settings: [
      { key: 'hrAlert',   label: '心率异常提醒',   desc: '心率超出正常范围时通知', value: true },
      { key: 'bpAlert',   label: '血压异常提醒',   desc: '血压超出正常范围时通知', value: true },
      { key: 'fallAlert', label: '跌倒检测提醒',   desc: '检测到跌倒事件时通知', value: true },
      { key: 'bedAlert',  label: '离床提醒',       desc: '夜间长时间离床时通知',  value: false }
    ]
  },
  onLoad() {
    const app = getApp<any>()
    this.setData({ statusH: app.globalData.statusBarHeight || 0 })
    this.load()
  },
  async load() {
    try {
      const res: any = await get('/guardian/alarm-settings')
      const settings = this.data.settings.map((s: any) => ({ ...s, value: res[s.key] ?? s.value }))
      this.setData({ settings })
    } catch {}
  },
  async onChange(e: any) {
    const key = e.currentTarget.dataset.key
    const value = e.detail.value
    const settings = this.data.settings.map((s: any) => s.key === key ? { ...s, value } : s)
    this.setData({ settings })
    try {
      const payload: any = {}
      settings.forEach((s: any) => { payload[s.key] = s.value })
      await put('/guardian/alarm-settings', payload)
    } catch {}
  },
  goBack() { wx.navigateBack() }
})
