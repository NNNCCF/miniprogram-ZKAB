import { getStaffProfile } from '../../../../utils/api'
import { clearSession, getStoredUserInfo, setStoredUserInfo } from '../../../../utils/session'

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

  async loadProfile() {
    const cached: any = getStoredUserInfo() || {}
    if (cached.name) {
      this.setData({
        adminName: cached.name,
        orgName: cached.orgName || '',
        roleName: '机构管理员',
        avatarText: cached.name.slice(-2)
      })
    }

    try {
      const profile: any = await getStaffProfile()
      const merged = setStoredUserInfo({ ...cached, ...profile })
      const name = merged.name || '机构管理员'
      this.setData({
        adminName: name,
        orgName: merged.orgName || '',
        roleName: '机构管理员',
        avatarText: name.slice(-2)
      })
    } catch {}
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
        if (!res.confirm) return
        clearSession()
        wx.reLaunch({ url: '/pages/login/login' })
      }
    })
  }
})