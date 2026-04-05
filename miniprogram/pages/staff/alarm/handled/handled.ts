import { get } from '../../../../utils/request'

const LEVEL_LABEL: Record<string, string> = {
  red: '红色预警',
  orange: '橙色预警',
  yellow: '黄色预警'
}

const RESULT_LABEL: Record<string, string> = {
  resolved: '已处理',
  follow_up: '需跟进',
  false_alarm: '误报'
}

interface HandledAlarm {
  id: string
  memberName: string
  alarmType: string
  alarmTime: string
  location: string
  description: string
  level: string
  levelLabel: string
  handleResult: string
  handleResultLabel: string
  handlerName: string
  handleTime: string
  handleDescription: string
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
    get<HandledAlarm>('/alarms/' + id)
      .then(res => {
        this.setData({
          alarm: {
            ...res,
            levelLabel: LEVEL_LABEL[res.level] || res.level,
            handleResultLabel: RESULT_LABEL[res.handleResult] || res.handleResult
          },
          loading: false
        })
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
