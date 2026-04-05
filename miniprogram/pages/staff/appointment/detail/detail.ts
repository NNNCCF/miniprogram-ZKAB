import { get } from '../../../../utils/request'

const STATUS_LABEL: Record<string, string> = {
  pending: '待处理',
  accepted: '已接受',
  completed: '已完成',
  cancelled: '已取消'
}

interface ApptRecord {
  serviceContent: string
  healthObservation: string
  followUpPlan: string
}

interface AppointmentDetail {
  id: string
  type: string
  status: string
  statusLabel: string
  appointmentTime: string
  notes: string
  memberName: string
  memberPhone: string
  memberAddress: string
  doctorName: string
  doctorPhone: string
  record: ApptRecord | null
}

Page({
  data: {
    loading: false,
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
    get<AppointmentDetail>('/appointments/' + id)
      .then(res => {
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

  goToAccept() {
    wx.navigateTo({
      url: `/pages/staff/appointment/accept/accept?id=${this.data.id}`
    })
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
