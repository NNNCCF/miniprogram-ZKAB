import { get } from '../../../utils/request'

interface Appointment {
  id: string
  type: string
  status: string
  statusLabel: string
  appointmentTime: string
  memberName: string
}

interface HomeStats {
  todayAppts: number
  pendingAlarms: number
  totalArchives: number
}

interface DoctorInfo {
  name: string
  orgName: string
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
    this.loadDoctorInfo()
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

  loadDoctorInfo() {
    get<DoctorInfo>('/staff/profile').then(res => {
      const name = res.name || '医护人员'
      this.setData({
        doctorName: name,
        orgName: res.orgName || '',
        avatarText: name.slice(-2)
      })
    }).catch(() => {
      const stored = wx.getStorageSync('userInfo') || {}
      const name = stored.name || '医护人员'
      this.setData({
        doctorName: name,
        orgName: stored.orgName || '',
        avatarText: name.slice(-2)
      })
    })
  },

  loadStats() {
    get<HomeStats>('/staff/home/stats').then(res => {
      this.setData({
        todayAppts: res.todayAppts || 0,
        pendingAlarms: res.pendingAlarms || 0,
        totalArchives: res.totalArchives || 0
      })
    }).catch(() => {
      // fallback: load counts from individual endpoints
      Promise.allSettled([
        get<any[]>('/appointments', { date: 'today' }),
        get<any[]>('/alarms', { status: 'unhandled' }),
        get<any[]>('/archives')
      ]).then(([appts, alarms, archives]) => {
        this.setData({
          todayAppts: appts.status === 'fulfilled' ? (appts.value?.length ?? 0) : 0,
          pendingAlarms: alarms.status === 'fulfilled' ? (alarms.value?.length ?? 0) : 0,
          totalArchives: archives.status === 'fulfilled' ? (archives.value?.length ?? 0) : 0
        })
      })
    })
  },

  loadRecentAppts() {
    get<Appointment[]>('/appointments', { date: 'today', limit: 5 }).then(list => {
      const mapped = (list || []).map(item => ({
        ...item,
        statusLabel: STATUS_LABEL_MAP[item.status] || item.status
      }))
      this.setData({ recentAppts: mapped })
    }).catch(() => {
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
