import { getAppointmentDetail, acceptAppointment } from '../../../../utils/api'

const STATUS_LABEL: Record<string, string> = {
  pending: '待处理',
  dispatched: '已派单',
  accepted: '已接单',
  in_progress: '服务中',
  completed: '已完成',
  cancelled: '已取消'
}

const DONE_STATUSES = ['completed', 'cancelled']
const ACCEPTED_STATUSES = ['accepted', 'in_progress']

function normalizeStatus(raw: string): string {
  return (raw || '').toLowerCase().trim()
}

Page({
  data: {
    loading: false,
    accepting: false,
    id: '',
    appt: null as any,
    rawStatus: '',
    btnMode: '' as 'accept' | 'record' | 'done' | ''
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
        const rawStatus = res.status || ''
        const status = normalizeStatus(rawStatus)
        let btnMode: 'accept' | 'record' | 'done' = 'accept'
        if (DONE_STATUSES.includes(status)) btnMode = 'done'
        else if (ACCEPTED_STATUSES.includes(status)) btnMode = 'record'
        this.setData({
          appt: { ...res, status, statusLabel: STATUS_LABEL[status] || rawStatus || '未知' },
          rawStatus,
          btnMode,
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
    wx.showLoading({ title: '接单中...' })
    try {
      await acceptAppointment(id)
      wx.hideLoading()
      wx.showToast({ title: '接单成功', icon: 'success' })
      setTimeout(() => this.loadDetail(id), 1500)
    } catch (err: any) {
      wx.hideLoading()
      if (err.message?.includes('已')) {
        this.setData({ btnMode: 'record' })
      } else {
        wx.showToast({ title: err.message || '接单失败', icon: 'none' })
      }
    } finally {
      this.setData({ accepting: false })
    }
  },

  goToRecord() {
    wx.navigateTo({
      url: `/pages/staff/appointment/record/record?id=${this.data.id}&status=${this.data.rawStatus}`
    })
  },

  goBack() {
    wx.navigateBack()
  }
})
