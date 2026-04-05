Component({
  properties: {
    active: { type: String, value: 'home' }
  },
  data: {
    safeBottom: 0,
    tabs: [
      { key: 'home',      label: '日常监控', icon: '/images/日常监控图标.png',      iconOn: '/images/日常监控选中图标.png',   url: '/pages/guardian/index/index' },
      { key: 'appt',      label: '预约服务', icon: '/images/预约服务图标.png',      iconOn: '/images/预约服务选中图标.png',   url: '/pages/guardian/service/list/list' },
      { key: 'emergency', label: '一键呼救', icon: '/images/一键呼救图标.png',      iconOn: '/images/一键呼救图标选中.png',   url: '/pages/guardian/emergency/emergency' },
      { key: 'service',   label: '服务中心', icon: '/images/服务中心图标.png',      iconOn: '/images/服务中心图标选中.png',   url: '/pages/guardian/service/list/list' },
      { key: 'profile',   label: '我的',    icon: '/images/我的图标.png',          iconOn: '/images/我的图标选中.png',      url: '/pages/guardian/profile/index/index' }
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
