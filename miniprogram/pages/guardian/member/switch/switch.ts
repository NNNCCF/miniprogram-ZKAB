import { getMemberList } from '../../../../utils/api'

const app = getApp<any>()

Page({
  data: {
    statusH: 0,
    members: [] as any[],
    currentId: null as any
  },

  onLoad() {
    this.setData({ statusH: app.globalData.statusBarHeight || 0 })
  },

  onShow() {
    this.loadMembers()
  },

  async loadMembers() {
    try {
      const members: any[] = (await getMemberList()) || []
      const savedId = wx.getStorageSync('currentMemberId')
      const currentId = savedId || (members[0]?.id ?? null)
      if (!savedId && currentId) wx.setStorageSync('currentMemberId', currentId)
      this.setData({ members, currentId })
    } catch (e: any) {
      wx.showToast({ title: e.message || '加载失败', icon: 'none' })
    }
  },

  switchMember(e: any) {
    const memberId = e.currentTarget.dataset.id
    if (String(memberId) === String(this.data.currentId)) return
    wx.setStorageSync('currentMemberId', memberId)
    this.setData({ currentId: memberId })
    wx.showToast({ title: '切换成功', icon: 'success' })
  },

  goBack() {
    wx.navigateBack()
  },

  goCreate() {
    wx.navigateTo({ url: '/pages/guardian/member/create/create' })
  }
})
