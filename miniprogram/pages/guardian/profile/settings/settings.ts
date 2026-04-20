import { clearSession } from '../../../../utils/session'

Page({
  data: { statusH: 0, pushOn: true },
  onLoad() {
    const app = getApp<any>()
    this.setData({ statusH: app.globalData.statusBarHeight || 0, pushOn: wx.getStorageSync('pushOn') !== false })
  },
  goBack() { wx.navigateBack() },
  onPush(e: any) { const v = e.detail.value; this.setData({ pushOn: v }); wx.setStorageSync('pushOn', v) },
  clearCache() {
    wx.showModal({ title: '清除缓存', content: '确定要清除缓存吗？', success: (r) => { if (r.confirm) { clearSession(['token', 'role', 'userInfo']); wx.showToast({ title: '清除成功', icon: 'success' }) } } })
  },
  showAbout() { wx.showModal({ title: '卓凯安伴', content: '版本 v1.0.0\n智慧养老监护平台', showCancel: false }) },
  logout() {
    wx.showModal({ title: '退出登录', content: '确定要退出登录吗？', success: (r) => { if (r.confirm) { clearSession(); wx.reLaunch({ url: '/pages/login/login' }) } } })
  }
})
