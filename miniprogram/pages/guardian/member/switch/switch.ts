import { get, post } from '../../../../../utils/request'

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
      const [members, current] = await Promise.all([
        get('/guardian/members'),
        get('/guardian/member/current')
      ])
      this.setData({
        members: members || [],
        currentId: current?.id || null
      })
    } catch {
      // Placeholder data
      this.setData({
        members: [
          { id: 1, name: '张奶奶', age: 72, relationship: '祖母', status: 'normal' },
          { id: 2, name: '李爷爷', age: 75, relationship: '祖父', status: 'warn' }
        ],
        currentId: 1
      })
    }
  },

  async switchMember(e: any) {
    const memberId = e.currentTarget.dataset.id
    if (memberId === this.data.currentId) return
    wx.showLoading({ title: '切换中...' })
    try {
      await post('/guardian/member/switch', { memberId })
      this.setData({ currentId: memberId })
      wx.setStorageSync('currentMemberId', memberId)
      wx.hideLoading()
      wx.showToast({ title: '切换成功', icon: 'success' })
    } catch (e: any) {
      wx.hideLoading()
      wx.showToast({ title: e.message || '切换失败', icon: 'none' })
    }
  },

  goBack() {
    wx.navigateBack()
  },

  goCreate() {
    wx.navigateTo({ url: '/pages/guardian/member/create/create/create' })
  }
})
