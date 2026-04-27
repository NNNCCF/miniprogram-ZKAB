Component({
  properties: {
    title: { type: String, value: '' },
    showBack: { type: Boolean, value: false }
  },
  data: {
    statusH: 0,
    totalH: 0,
    showGlobalAlarmHost: true
  },
  lifetimes: {
    attached() {
      const app = getApp<{ globalData: { statusBarHeight: number } }>()
      const statusH = app.globalData.statusBarHeight || 0
      const currentPage = getCurrentPages().slice(-1)[0]
      const route = currentPage?.route || ''
      const tabbarRoutes = new Set([
        'pages/staff/home/home',
        'pages/staff/appointment/list/list',
        'pages/staff/alarm/list/list',
        'pages/staff/archive/list/list',
        'pages/staff/profile/index/index',
      ])
      this.setData({
        statusH,
        totalH: statusH + 44,
        showGlobalAlarmHost: !tabbarRoutes.has(route),
      })
    }
  },
  methods: {
    onBack() {
      wx.navigateBack()
    }
  }
})
