Component({
  properties: {
    active: { type: String, value: 'home' }
  },
  data: {
    safeBottom: 0,
    tabs: [
      { key: 'home',     label: '首页',     icon: '/images/tab_home.png',    iconOn: '/images/tab_home.png',      url: '/pages/staff/home/home' },
      { key: 'appt',     label: '预约',     icon: '/images/tab_appt.png',    iconOn: '/images/tab_appt_on.png',   url: '/pages/staff/appointment/list/list' },
      { key: 'alarm',    label: '报警',     icon: '/images/tab_alarm.png',   iconOn: '/images/tab_alarm_on.png',  url: '/pages/staff/alarm/list/list' },
      { key: 'archive',  label: '档案',     icon: '/images/tab_archive.png', iconOn: '/images/tab_archive_on.png',url: '/pages/staff/archive/list/list' },
      { key: 'profile',  label: '我的',     icon: '/images/tab_me.png',      iconOn: '/images/tab_me_on.png',     url: '/pages/staff/profile/index/index' }
    ]
  },
  lifetimes: {
    attached() {
      const info = wx.getSystemInfoSync()
      const safeBottom = info.screenHeight - (info.safeArea?.bottom ?? info.screenHeight)
      this.setData({ safeBottom })
    }
  },
  methods: {
    onTab(e: any) {
      const { key, url } = e.currentTarget.dataset
      if (key === this.properties.active) return
      wx.reLaunch({ url })
    }
  }
})
