import { getAppointments, getInstitutionNurses, getInstitutionFamilies, getNewsList } from '../../../utils/api'

Page({
  data: {
    adminName: '',
    orgName: '',
    avatarText: '',
    news: [] as any[],
    stats: {
      pendingAppts: 0,
      totalAppts: 0,
      nurses: 0,
      families: 0
    }
  },

  onLoad() {
    this.loadProfile()
    this.loadStats()
    this.loadNews()
  },

  onShow() {
    this.loadStats()
    this.loadNews()
  },

  loadProfile() {
    const cached = wx.getStorageSync('userInfo') || {}
    const name = cached.name || '机构管理员'
    this.setData({
      adminName: name,
      orgName: cached.orgName || '',
      avatarText: (name as string).slice(-2)
    })
  },

  async loadStats() {
    const [appts, nurses, families] = await Promise.allSettled([
      getAppointments(),
      getInstitutionNurses(),
      getInstitutionFamilies()
    ])

    const safeLen = (r: PromiseSettledResult<any>) =>
      r.status === 'fulfilled' ? ((r.value as any[])?.length ?? 0) : 0

    const allAppts: any[] = appts.status === 'fulfilled' ? (appts.value as any[] || []) : []
    const pendingAppts = allAppts.filter((a: any) => a.status === 'pending').length

    this.setData({
      stats: {
        pendingAppts,
        totalAppts: safeLen(appts),
        nurses: safeLen(nurses),
        families: safeLen(families)
      }
    })
  },

  async loadNews() {
    try {
      const list = await getNewsList() as any[]
      this.setData({ news: (list || []).slice(0, 5) })
    } catch {
      this.setData({ news: [] })
    }
  },

  goToNews(e: any) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/guardian/service/newsDetail/newsDetail?id=${id}` })
  },

  goToApptList() {
    wx.reLaunch({ url: '/pages/institution/appointment/list/list' })
  },

  goToStaffList() {
    wx.reLaunch({ url: '/pages/institution/staff/list/list' })
  },

  goToFamilyList() {
    wx.navigateTo({ url: '/pages/institution/family/list/list' })
  }
})
