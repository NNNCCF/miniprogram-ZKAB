Component({
  properties: {
    active:     { type: String, value: 'home' },
    apptCount:  { type: Number, value: 0 }
  },
  data: {
    safeBottom: 0,
    tabs: [
      { key: 'home',    label: '首页',   icon: '/images/tab_map.png',     iconOn: '/images/tab_map_on.png',     url: '/pages/institution/index/index',            badge: '' },
      { key: 'appt',   label: '预约',   icon: '/images/tab_appt.png',    iconOn: '/images/tab_appt_on.png',    url: '/pages/institution/appointment/list/list',  badge: '' },
      { key: 'staff',  label: '医护',   icon: '/images/tab_archive.png', iconOn: '/images/tab_archive_on.png', url: '/pages/institution/staff/list/list',         badge: '' },
      { key: 'profile',label: '我的',   icon: '/images/tab_me.png',      iconOn: '/images/tab_me_on.png',      url: '/pages/institution/profile/index/index',    badge: '' }
    ]
  },
  lifetimes: {
    attached() {
      const info = wx.getSystemInfoSync()
      const safeBottom = info.screenHeight - (info.safeArea?.bottom ?? info.screenHeight)
      this.setData({ safeBottom })
    }
  },
  observers: {
    'apptCount'(apptCount: number) {
      const tabs = this.data.tabs.map(t => {
        if (t.key === 'appt') return { ...t, badge: apptCount > 0 ? String(apptCount > 99 ? '99+' : apptCount) : '' }
        return t
      })
      this.setData({ tabs })
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
