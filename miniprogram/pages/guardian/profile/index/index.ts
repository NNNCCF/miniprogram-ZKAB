import { getAlarms, getAppointments, getGuardianProfile, getMemberList } from '../../../../utils/api'
import { clearSession, getStoredUserInfo, setStoredUserInfo } from '../../../../utils/session'

const app = getApp<any>()

Page({
  data: {
    statusH: 0,
    userInfo: {} as any,
    stats: { memberCount: 0, alarmCount: 0, serviceCount: 0 }
  },

  onLoad() {
    this.setData({ statusH: app.globalData.statusBarHeight || 0 })
  },

  onShow() {
    const cached = getStoredUserInfo()
    if (cached?.name) {
      this.setData({ userInfo: cached })
    }
    this.loadPageData()
  },

  async loadPageData() {
    const [profileRes, membersRes, alarmsRes, appointmentsRes] = await Promise.allSettled([
      getGuardianProfile(),
      getMemberList(),
      getAlarms({ status: 'unhandled' }),
      getAppointments()
    ])

    if (profileRes.status === 'fulfilled') {
      const merged = setStoredUserInfo({ ...getStoredUserInfo(), ...profileRes.value })
      this.setData({ userInfo: merged })
    }

    const memberCount = membersRes.status === 'fulfilled' ? membersRes.value.length : this.data.stats.memberCount
    const alarmCount = alarmsRes.status === 'fulfilled' ? alarmsRes.value.length : this.data.stats.alarmCount
    const serviceCount = appointmentsRes.status === 'fulfilled' ? appointmentsRes.value.length : this.data.stats.serviceCount

    this.setData({
      stats: {
        memberCount,
        alarmCount,
        serviceCount
      }
    })
  },

  goEdit() {
    wx.navigateTo({ url: '/pages/guardian/profile/profileEdit/profileEdit' })
  },

  goSwitchMember() {
    wx.navigateTo({ url: '/pages/guardian/member/switch/switch' })
  },

  goAlarmSettings() {
    wx.navigateTo({ url: '/pages/guardian/profile/alarmSettings/alarmSettings' })
  },

  goServiceCenter() {
    wx.navigateTo({ url: '/pages/guardian/profile/serviceCenter/serviceCenter' })
  },

  goFeedback() {
    wx.navigateTo({ url: '/pages/guardian/profile/feedback/feedback' })
  },

  goSettings() {
    wx.navigateTo({ url: '/pages/guardian/profile/settings/settings' })
  },

  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确认退出当前账号吗？',
      confirmColor: '#EF4444',
      success: (res) => {
        if (!res.confirm) return
        clearSession()
        wx.reLaunch({ url: '/pages/login/login' })
      }
    })
  }
})