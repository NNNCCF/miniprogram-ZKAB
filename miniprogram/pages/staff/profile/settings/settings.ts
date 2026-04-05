Page({
  data: {
    notify: {
      appointment: true,
      alarm: true
    },
    showAbout: false
  },

  onLoad() {
    // Restore saved notification prefs
    const appointment = wx.getStorageSync('notify_appointment')
    const alarm = wx.getStorageSync('notify_alarm')
    this.setData({
      'notify.appointment': appointment !== false,
      'notify.alarm': alarm !== false
    })
  },

  onNotifyChange(e: WechatMiniprogram.SwitchChange) {
    const key = e.currentTarget.dataset.key as 'appointment' | 'alarm'
    const value = e.detail.value
    this.setData({ [`notify.${key}`]: value })
    wx.setStorageSync(`notify_${key}`, value)
  },

  onClearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确认清除本地缓存数据？',
      success: (res) => {
        if (res.confirm) {
          try {
            // Preserve auth token before clearing
            const token = wx.getStorageSync('token')
            wx.clearStorageSync()
            if (token) wx.setStorageSync('token', token)
            wx.showToast({ title: '缓存已清除', icon: 'success' })
          } catch {
            wx.showToast({ title: '清除失败', icon: 'none' })
          }
        }
      }
    })
  },

  onAbout() {
    this.setData({ showAbout: true })
  },

  closeAbout() {
    this.setData({ showAbout: false })
  },

  onLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确认退出登录？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync()
          wx.reLaunch({ url: '/pages/login/login' })
        }
      }
    })
  }
})
