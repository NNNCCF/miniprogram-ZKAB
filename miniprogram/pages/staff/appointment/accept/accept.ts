Page({
  onLoad(options: Record<string, string>) {
    const id = options.id || ''
    if (!id) {
      wx.showToast({ title: '缺少预约编号', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 600)
      return
    }
    wx.redirectTo({ url: `/pages/staff/appointment/detail/detail?id=${id}` })
  }
})