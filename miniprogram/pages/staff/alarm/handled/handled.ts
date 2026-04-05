import { getAlarmDetail } from '../../../../utils/api'

interface HandledAlarm {
  id: string
  memberName: string
  alarmType: string
  alarmTime: string
  location: string
  status: string
  calledGuardian: boolean
  memberDanger: boolean
  remark: string
  handlerName: string
  handleTime: string
}

Page({
  data: {
    loading: false,
    id: '',
    alarm: null as HandledAlarm | null
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
        this.setData({ alarm: res, loading: false })
      })
      .catch(() => {
        this.setData({ loading: false })
        wx.showToast({ title: '加载失败', icon: 'none' })
      })
  },

  goBack() {
    wx.navigateBack()
  }
})
