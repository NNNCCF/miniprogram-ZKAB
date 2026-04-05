import { get } from '../../../../utils/request'

const LEVEL_LABEL: Record<string, string> = {
  red: '红色预警',
  orange: '橙色预警',
  yellow: '黄色预警'
}

const STATUS_LABEL: Record<string, string> = {
  unhandled: '未处理',
  handling: '处理中',
  handled: '已处理'
}

interface AlarmDetail {
  id: string
  memberName: string
  alarmType: string
  alarmTime: string
  location: string
  description: string
  level: string
  levelLabel: string
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
    get<AlarmDetail>('/alarms/' + id)
      .then(res => {
        this.setData({
          alarm: {
            ...res,
            levelLabel: LEVEL_LABEL[res.level] || res.level,
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
