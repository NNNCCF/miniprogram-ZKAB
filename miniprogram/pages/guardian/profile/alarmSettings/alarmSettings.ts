import { getGuardianAlarmSettings, updateGuardianAlarmSettings } from '../../../../utils/api'

Page({
  data: {
    statusH: 0,
    settings: [
      { key: 'hrAlert', label: '心率异常提醒', desc: '心率超出正常范围时通知', value: true },
      { key: 'bpAlert', label: '血压异常提醒', desc: '血压异常时通知', value: true },
      { key: 'fallAlert', label: '跌倒检测提醒', desc: '检测到跌倒事件时通知', value: true },
      { key: 'bedAlert', label: '离床提醒', desc: '夜间长时间离床时通知', value: false }
    ] as Array<{ key: string; label: string; desc: string; value: boolean }>
  },

  onLoad() {
    const app = getApp<any>()
    this.setData({ statusH: app.globalData.statusBarHeight || 0 })
    this.load()
  },

  async load() {
    try {
      const res: any = await getGuardianAlarmSettings()
      const settings = this.data.settings.map((item) => ({
        ...item,
        value: res?.[item.key] ?? item.value
      }))
      this.setData({ settings })
    } catch (err: any) {
      wx.showToast({
        title: err.message || '加载失败',
        icon: 'none'
      })
    }
  },

  async onChange(e: any) {
    const key = e.currentTarget.dataset.key as string
    const value = !!e.detail.value
    const settings = this.data.settings.map((item) => item.key === key ? { ...item, value } : item)
    this.setData({ settings })

    const payload: Record<string, boolean> = {}
    settings.forEach((item) => {
      payload[item.key] = item.value
    })

    try {
      await updateGuardianAlarmSettings(payload)
      wx.showToast({ title: '已保存', icon: 'success' })
    } catch (err: any) {
      wx.showToast({
        title: err.message || '保存失败',
        icon: 'none'
      })
      this.load()
    }
  },

  goBack() {
    wx.navigateBack()
  }
})