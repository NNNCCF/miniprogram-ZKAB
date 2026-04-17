import { get } from '../../../../utils/request'

interface StaffProfile {
  name: string
  orgName: string
  role: string
}

Page({
  data: {
    doctorName: '',
    orgName: '',
    roleName: '',
    avatarText: ''
  },

  onLoad() {
    this.loadProfile()
  },

  onShow() {
    this.loadProfile()
  },

  loadProfile() {
    // Try from cache first for fast render
    const cached = wx.getStorageSync('userInfo') || {}
    if (cached.name) {
      this.setData({
        doctorName: cached.name,
        orgName: cached.orgName || '',
        roleName: cached.role || '医护人员',
        avatarText: (cached.name as string).slice(-2)
      })
    }

    get<StaffProfile>('/mini/staff/profile')
      .then(res => {
        const name = res.name || '医护人员'
        this.setData({
          doctorName: name,
          orgName: res.orgName || '',
          roleName: res.role || '医护人员',
          avatarText: name.slice(-2)
        })
        wx.setStorageSync('userInfo', res)
      })
      .catch(() => {
        // Keep cached values, no-op
      })
  },

  goToOrgInfo() {
    wx.navigateTo({ url: '/pages/staff/profile/orgInfo/orgInfo' })
  },

  goToPersonalInfo() {
    wx.navigateTo({ url: '/pages/staff/profile/personalInfo/personalInfo' })
  },

  goToMap() {
    wx.navigateTo({ url: '/pages/staff/mapDetail/mapDetail' })
  },

  goToSummary() {
    wx.navigateTo({ url: '/pages/staff/summary/summary' })
  },

  goToPublish() {
    wx.navigateTo({ url: '/pages/staff/profile/publish/publish' })
  },

  goToServiceCenter() {
    wx.navigateTo({ url: '/pages/staff/profile/serviceCenter/serviceCenter' })
  },

  goToFeedback() {
    wx.navigateTo({ url: '/pages/staff/profile/feedback/feedback' })
  },

  goToSettings() {
    wx.navigateTo({ url: '/pages/staff/profile/settings/settings' })
  },

  onLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      confirmText: '退出',
      confirmColor: '#FF4D4F',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('token')
          wx.removeStorageSync('userInfo')
          wx.reLaunch({ url: '/pages/login/login' })
        }
      }
    })
  }
})
