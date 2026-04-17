import { get } from '../../../../utils/request'

interface InstitutionProfile {
  name: string
  orgName: string
  role: string
}

Page({
  data: {
    adminName: '',
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
    const cached = wx.getStorageSync('userInfo') || {}
    if (cached.name) {
      this.setData({
        adminName: cached.name,
        orgName: cached.orgName || '',
        roleName: '机构管理员',
        avatarText: (cached.name as string).slice(-2)
      })
    }

    get<InstitutionProfile>('/mini/staff/profile')
      .then(res => {
        const name = res.name || '机构管理员'
        this.setData({
          adminName: name,
          orgName: res.orgName || '',
          roleName: '机构管理员',
          avatarText: name.slice(-2)
        })
        wx.setStorageSync('userInfo', res)
      })
      .catch(() => {})
  },

  goToFamilyList() {
    wx.navigateTo({ url: '/pages/institution/family/list/list' })
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
          wx.removeStorageSync('role')
          wx.removeStorageSync('userInfo')
          wx.reLaunch({ url: '/pages/login/login' })
        }
      }
    })
  }
})
