import { post } from '../../../../utils/request'
Page({
  data: {
    statusH: 0, activeType: 'bug', content: '',
    types: [{ val: 'bug', label: '功能异常' }, { val: 'exp', label: '体验问题' }, { val: 'suggest', label: '功能建议' }, { val: 'other', label: '其他' }]
  },
  onLoad() { const app = getApp<any>(); this.setData({ statusH: app.globalData.statusBarHeight || 0 }) },
  goBack() { wx.navigateBack() },
  setType(e: any) { this.setData({ activeType: e.currentTarget.dataset.val }) },
  onContent(e: any) { this.setData({ content: e.detail.value }) },
  async submit() {
    if (this.data.content.length < 10) return wx.showToast({ title: '内容至少10字', icon: 'none' })
    wx.showLoading({ title: '提交中...' })
    try {
      await post('/feedback', { type: this.data.activeType, content: this.data.content })
      wx.hideLoading()
      wx.showToast({ title: '感谢反馈', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
    } catch (e: any) { wx.hideLoading(); wx.showToast({ title: e.message || '提交失败', icon: 'none' }) }
  }
})
