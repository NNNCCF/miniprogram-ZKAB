// app.ts
interface AppOption {
  globalData: {
    token: string
    userInfo: any
    role: 'staff' | 'guardian' | ''
    statusBarHeight: number
  }
}

App<AppOption>({
  globalData: {
    token: '',
    userInfo: null,
    role: '',
    statusBarHeight: 0
  },
  onLaunch() {
    const info = wx.getSystemInfoSync()
    this.globalData.statusBarHeight = info.statusBarHeight || 0

    const token = wx.getStorageSync('token')
    const role = wx.getStorageSync('role')
    if (token) {
      this.globalData.token = token
      this.globalData.role = role
    }
  }
})
