import { getAppointments, getAlarms, getFamilyList } from '../../../utils/api'

interface Appointment {
  id: string
  type: string
  status: string
  statusLabel: string
  appointTime: string
  memberName: string
}

const WEEK_LABELS = ['日', '一', '二', '三', '四', '五', '六']

const STATUS_LABEL_MAP: Record<string, string> = {
  pending: '待处理',
  accepted: '待上门',
  completed: '已完成'
}

Page({
  data: {
    doctorName: '',
    orgName: '',
    avatarText: '',
    dateText: '',
    weekText: '',
    todayAppts: 0,
    pendingAlarms: 0,
    totalArchives: 0,
    recentAppts: [] as Appointment[]
  },

  onLoad() {
    this.initDate()
    this.loadUserInfo()
    this.loadStats()
    this.loadRecentAppts()
  },

  onShow() {
    this.loadStats()
    this.loadRecentAppts()
  },

  initDate() {
    const now = new Date()
    const month = now.getMonth() + 1
    const day = now.getDate()
    const week = WEEK_LABELS[now.getDay()]
    this.setData({
      dateText: `${month}月${day}日`,
      weekText: `星期${week}`
    })
  },

  loadUserInfo() {
    try {
      const stored = JSON.parse(wx.getStorageSync('userInfo') || '{}')
      const name = stored.name || stored.nurseName || '医护人员'
      this.setData({
        doctorName: name,
        orgName: stored.orgName || stored.organizationName || '',
        avatarText: name.slice(-2)
      })
    } catch {
      this.setData({ doctorName: '医护人员', avatarText: '护' })
    }
  },

  loadStats() {
    const today = new Date().toISOString().slice(0, 10)
    Promise.allSettled([
      getAppointments({ startDate: today, endDate: today }),
      getAlarms({ status: 'unhandled' }),
      getFamilyList()
    ]).then(([appts, alarms, archives]) => {
      this.setData({
        todayAppts: appts.status === 'fulfilled' ? ((appts.value as any)?.length ?? 0) : 0,
        pendingAlarms: alarms.status === 'fulfilled' ? ((alarms.value as any)?.length ?? 0) : 0,
        totalArchives: archives.status === 'fulfilled' ? ((archives.value as any)?.length ?? 0) : 0
      })
    })
  },

  loadRecentAppts() {
    const today = new Date().toISOString().slice(0, 10)
    getAppointments({ startDate: today, endDate: today })
      .then((list: any) => {
        const mapped = ((list || []) as any[]).slice(0, 5).map((item: any) => ({
          ...item,
          statusLabel: STATUS_LABEL_MAP[item.status] || item.status
        }))
        this.setData({ recentAppts: mapped })
      })
      .catch(() => {
        this.setData({ recentAppts: [] })
      })
  },

  goToAppt() {
    wx.reLaunch({ url: '/pages/staff/appointment/list/list' })
  },

  goToAlarm() {
    wx.reLaunch({ url: '/pages/staff/alarm/list/list' })
  },

  goToArchive() {
    wx.reLaunch({ url: '/pages/staff/archive/list/list' })
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

  goToApptDetail(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/staff/appointment/detail/detail?id=${id}` })
  }
})
