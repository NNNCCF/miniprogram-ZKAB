import { getAlarmDetail, getAlarms, getMemberList, ignoreAlarm } from '../../../../utils/api'

const app = getApp<any>()

Page({
  data: {
    statusH: 0,
    alarm: null as any,
    loading: true
  },

  onLoad(options: any) {
    this.setData({ statusH: app.globalData.statusBarHeight || 0 })
    if (options?.id && options.id !== 'latest') {
      this.loadAlarm(options.id)
      return
    }
    this.loadLatestAlarm(options?.memberId)
  },

  async loadLatestAlarm(memberId?: string) {
    this.setData({ loading: true })
    try {
      let targetMemberId = memberId || wx.getStorageSync('currentMemberId')
      if (!targetMemberId) {
        const members = await getMemberList()
        targetMemberId = members[0]?.id
      }
      if (!targetMemberId) {
        this.setData({ alarm: null })
        return
      }

      let alarms = await getAlarms({ memberId: String(targetMemberId), status: 'unhandled' })
      if (!alarms.length) {
        alarms = await getAlarms({ memberId: String(targetMemberId) })
      }
      this.setData({ alarm: alarms[0] || null })
    } catch {
      this.setData({ alarm: null })
    } finally {
      this.setData({ loading: false })
    }
  },

  async loadAlarm(id: string) {
    this.setData({ loading: true })
    try {
      const alarm = await getAlarmDetail(id)
      this.setData({ alarm })
    } catch (err: any) {
      wx.showToast({ title: err.message || '加载失败', icon: 'none' })
      this.setData({ alarm: null })
    } finally {
      this.setData({ loading: false })
    }
  },

  async markIgnored() {
    const alarm = this.data.alarm
    if (!alarm) return
    wx.showLoading({ title: '处理中...' })
    try {
      await ignoreAlarm(alarm.id)
      this.setData({ alarm: { ...alarm, status: 'ignored', handleResultLabel: '已忽略' } })
      wx.hideLoading()
      wx.showToast({ title: '已忽略', icon: 'success' })
    } catch (err: any) {
      wx.hideLoading()
      wx.showToast({ title: err.message || '操作失败', icon: 'none' })
    }
  },

  callEmergency() {
    wx.navigateTo({ url: '/pages/guardian/emergency/emergency' })
  },

  goBack() { wx.navigateBack() }
})
