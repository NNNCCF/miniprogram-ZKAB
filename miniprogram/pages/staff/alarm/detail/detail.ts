import { getAlarmDetail } from '../../../../utils/api'

const STATUS_LABEL: Record<string, string> = {
  unhandled: '未处理',
  handling: '处理中',
  handled: '已处理',
  ignored: '已忽略'
}

interface AlarmDetail {
  id: string
  memberName: string
  alarmType: string
  alarmTime: string
  location: string
  description: string
  status: string
  statusLabel: string
}

Page({
  data: {
    loading: false,
    id: '',
    alarm: null as AlarmDetail | null
  },

  onLoad(options: Record<string, string>) {
    const id = options.id || ''
    this.setData({ id })
    this.loadDetail(id)
  },

  loadDetail(id: string) {
    if (!id) return
    this.setData({ loading: true })
    getAlarmDetail(id)
      .then((res: any) => {
        this.setData({
          alarm: {
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

  goToHandle() {
    wx.navigateTo({
      url: `/pages/staff/alarm/handle/handle?id=${this.data.id}`
    })
  },

  goBack() {
    wx.navigateBack()
  }
})
