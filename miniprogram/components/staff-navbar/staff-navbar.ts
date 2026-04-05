Component({
  properties: {
    title: { type: String, value: '' },
    showBack: { type: Boolean, value: false }
  },
  data: {
    statusH: 0,
    totalH: 0
  },
  lifetimes: {
    attached() {
      const app = getApp<{ globalData: { statusBarHeight: number } }>()
      const statusH = app.globalData.statusBarHeight || 0
      this.setData({ statusH, totalH: statusH + 44 })
    }
  },
  methods: {
    onBack() {
      wx.navigateBack()
    }
  }
})
