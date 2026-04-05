import { getFamilyList, getMemberHistory } from '../../../../../utils/api'

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
    loading: false,
    familyId: '',
    memberId: ''
  },

  onLoad() {
    this.setData({ statusH: app.globalData.statusBarHeight || 0 })
    const now = new Date()
    const end = now.toISOString().slice(0, 10)
    now.setDate(now.getDate() - 7)
    const start = now.toISOString().slice(0, 10)
    this.setData({ startDate: start, endDate: end })
    this.initFamilyIds()
  },

  async initFamilyIds() {
    // Try to get cached familyId/memberId from storage first
    const cachedFamilyId = wx.getStorageSync('currentFamilyId')
    const cachedMemberId = wx.getStorageSync('currentMemberId')
    if (cachedFamilyId && cachedMemberId) {
      this.setData({ familyId: cachedFamilyId, memberId: cachedMemberId })
      this.loadHistory()
      return
    }
    // Otherwise load from family list
    try {
      const families: any = await getFamilyList()
      if (families && families.length > 0) {
        const family = families[0]
        const members = family.members || []
        const familyId = String(family.id)
        const memberId = members.length > 0 ? String(members[0].id) : ''
        this.setData({ familyId, memberId })
        this.loadHistory()
      }
    } catch {
      this.setData({ loading: false })
    }
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
    const { familyId, memberId } = this.data
    if (!familyId || !memberId) return
    this.setData({ loading: true })
    try {
      const { startDate, endDate, activeType } = this.data
      const list = await getMemberHistory(familyId, memberId, {
        startDate,
        endDate,
        type: activeType === 'all' ? undefined : activeType
      })
      this.setData({ list: (list as any) || [] })
    } catch {
      this.setData({ list: [] })
    } finally {
      this.setData({ loading: false })
    }
  },

  goBack() {
    wx.navigateBack()
  }
})
