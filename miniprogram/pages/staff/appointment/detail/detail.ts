import { getAppointmentDetail, acceptAppointment } from '../../../../utils/api'

const STATUS_LABEL: Record<string, string> = {
  pending: '待处理',
  accepted: '已接受',
  completed: '已完成',
  cancelled: '已取消'
}

interface AppointmentDetail {
  id: string
  type: string
  status: string
  statusLabel: string
  appointTime: string
  requirement: string
  memberName: string
  guardianName: string
  nurseName: string
}

Page({
  data: {
    loading: false,
    accepting: false,
    id: '',
    appt: null as AppointmentDetail | null
  },

  onLoad(options: Record<string, string>) {
    const id = options.id || ''
    this.setData({ id })
    this.loadDetail(id)
  },

  onShow() {
    if (this.data.id) this.loadDetail(this.data.id)
  },

  loadDetail(id: string) {
    if (!id) return
    this.setData({ loading: true })
    getAppointmentDetail(id)
      .then((res: any) => {
        this.setData({
          appt: {
            ...res,
            statusLabel: STATUS_LABEL[res.status] || res.status
          },
          loading: false
        })
      })
      .catch(() => {
        this.setData({ loading: false })
        wx.showToast({ title: '加载失败', icon: 'none' })
      })
  },

  async goToAccept() {
    const { id, accepting } = this.data
    if (accepting || !id) return
    this.setData({ accepting: true })
    wx.showLoading({ title: '接受中...' })
    try {
      await acceptAppointment(id)
      wx.hideLoading()
      wx.showToast({ title: '已接受预约', icon: 'success' })
      setTimeout(() => this.loadDetail(id), 1500)
    } catch (err: any) {
      wx.hideLoading()
      wx.showToast({ title: err.message || '操作失败', icon: 'none' })
    } finally {
      this.setData({ accepting: false })
    }
  },

  goToRecord() {
    wx.navigateTo({
      url: `/pages/staff/appointment/record/record?id=${this.data.id}`
    })
  },

  goBack() {
    wx.navigateBack()
  }
})
