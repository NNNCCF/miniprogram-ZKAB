import { getMemberList } from '../../../../utils/api'

const app = getApp<any>()

function calcAge(birthday?: string) {
  if (!birthday) return '--'
  const year = Number(String(birthday).slice(0, 4))
  const currentYear = new Date().getFullYear()
  if (!Number.isFinite(year) || year <= 1900 || year > currentYear) return '--'
  return currentYear - year
}

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
      const rawMembers: any[] = (await getMemberList()) || []
      const members = rawMembers.map((item: any) => ({
        ...item,
        name: item.name || '未命名成员',
        age: item.age ?? calcAge(item.birthday),
        relationship: item.relationship || item.remark || '家庭成员',
        status: item.status || 'normal'
      }))

      const savedId = wx.getStorageSync('currentMemberId')
      const hasSaved = members.some((item: any) => String(item.id) === String(savedId))
      const currentId = hasSaved ? savedId : (members[0]?.id ?? null)

      if (currentId) {
        wx.setStorageSync('currentMemberId', currentId)
      } else {
        wx.removeStorageSync('currentMemberId')
      }

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
    wx.navigateBack({
      fail: () => wx.reLaunch({ url: '/pages/guardian/index/index' })
    })
  },

  goCreate() {
    wx.navigateTo({ url: '/pages/guardian/member/create/create' })
  }
})