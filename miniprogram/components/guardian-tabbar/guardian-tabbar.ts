Component({
  properties: {
    active: { type: String, value: 'home' }
  },
  data: {
    safeBottom: 0,
    tabs: [
      { key: 'home',      label: '首页',   icon: '/images/tab_home.png',    iconOn: '/images/tab_home.png',    url: '/pages/guardian/index/index' },
      { key: 'emergency', label: '一键呼救', icon: '/images/tab_sos.png',     iconOn: '/images/tab_sos.png',     url: '/pages/guardian/emergency/emergency' },
      { key: 'service',   label: '服务',   icon: '/images/tab_service.png', iconOn: '/images/tab_service.png', url: '/pages/guardian/service/list/list' },
      { key: 'profile',   label: '我的',   icon: '/images/tab_me.png',      iconOn: '/images/tab_me_on.png',   url: '/pages/guardian/profile/index/index' }
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
