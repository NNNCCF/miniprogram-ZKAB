Component({
  properties: {
    active:      { type: String, value: 'home' },
    alarmCount:  { type: Number, value: 0 },
    apptCount:   { type: Number, value: 0 }
  },
  data: {
    safeBottom: 0,
    tabs: [
      { key: 'home',    label: '地图分布', icon: '/images/tab_map.png',     iconOn: '/images/tab_map_on.png',     url: '/pages/staff/home/home',                   badge: '' },
      { key: 'appt',    label: '预约信息', icon: '/images/tab_appt.png',    iconOn: '/images/tab_appt_on.png',    url: '/pages/staff/appointment/list/list',        badge: '' },
      { key: 'alarm',   label: '报警信息', icon: '/images/tab_alarm.png',   iconOn: '/images/tab_alarm_on.png',   url: '/pages/staff/alarm/list/list',              badge: '' },
      { key: 'archive', label: '家庭档案', icon: '/images/tab_archive.png', iconOn: '/images/tab_archive_on.png', url: '/pages/staff/archive/list/list',            badge: '' },
      { key: 'profile', label: '我的',     icon: '/images/tab_me.png',      iconOn: '/images/tab_me_on.png',      url: '/pages/staff/profile/index/index',          badge: '' }
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
    'alarmCount, apptCount'(alarmCount: number, apptCount: number) {
      const tabs = this.data.tabs.map(t => {
        if (t.key === 'alarm') return { ...t, badge: alarmCount > 0 ? String(alarmCount > 99 ? '99+' : alarmCount) : '' }
        if (t.key === 'appt')  return { ...t, badge: apptCount  > 0 ? String(apptCount  > 99 ? '99+' : apptCount)  : '' }
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
