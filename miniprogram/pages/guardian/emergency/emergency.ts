import { post } from '../../../utils/request'

const app = getApp<any>()

Page({
  data: {
    statusH: 0,
    sosPressed: false,
    contacts: [
      { id: 1, name: '李明', relationship: '儿子', phone: '13800138001' },
      { id: 2, name: '王芳', relationship: '女儿', phone: '13900139001' },
      { id: 3, name: '张医生', relationship: '家庭医生', phone: '13700137001' }
    ] as any[]
  },

  onLoad() {
    this.setData({ statusH: app.globalData.statusBarHeight || 0 })
  },

  async onSOS() {
    this.setData({ sosPressed: true })
    setTimeout(() => this.setData({ sosPressed: false }), 300)

    wx.showModal({
      title: '一键呼救',
      content: '确认发出紧急求救信号？将通知所有联系人并拨打120',
      confirmColor: '#EF4444',
      confirmText: '确认呼救',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '正在呼救...' })
          try {
            await post('/guardian/emergency/call', { timestamp: Date.now() })
            wx.hideLoading()
            wx.showToast({ title: '求救信号已发送', icon: 'success' })
            // Also make phone call
            wx.makePhoneCall({ phoneNumber: '120' })
          } catch (e: any) {
            wx.hideLoading()
            wx.showToast({ title: '信号发送失败，请直接拨打120', icon: 'none', duration: 3000 })
            wx.makePhoneCall({ phoneNumber: '120' })
          }
        }
      }
    })
  },

  callContact(e: any) {
    const phone = e.currentTarget.dataset.phone
    if (!phone) return
    wx.makePhoneCall({ phoneNumber: phone })
  },

  callEmergency(e: any) {
    const phone = e.currentTarget.dataset.phone
    wx.makePhoneCall({ phoneNumber: phone })
  }
})
