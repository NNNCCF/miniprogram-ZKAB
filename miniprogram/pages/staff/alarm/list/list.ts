import { getAlarms } from '../../../../utils/api'

interface Alarm {
  id: string
  memberName: string
  alarmType: string
  alarmTime: string
  status: string
  statusLabel: string
}

const STATUS_LABEL_MAP: Record<string, string> = {
  unhandled: '待处理',
  handled: '已处理',
  ignored: '已忽略'
}

Page({
  data: {
    loading: false,
    activeStatus: 'unhandled',
    allList: [] as Alarm[],
    filteredList: [] as Alarm[],
    unhandledCount: 0
  },

  onLoad() {
    this.loadList()
  },

  onShow() {
    this.loadList()
  },

  loadList() {
    this.setData({ loading: true })
    getAlarms()
      .then((list: any) => {
        const mapped = (list || []).map((item: any) => ({
          ...item,
          statusLabel: STATUS_LABEL_MAP[item.status] || item.status
        }))
        const unhandledCount = mapped.filter((item: any) => item.status === 'unhandled').length
        this.setData({ allList: mapped, unhandledCount, loading: false })
        this.applyFilter()
      })
      .catch(() => {
        this.setData({ loading: false })
      })
  },

  applyFilter() {
    const filtered = this.data.allList.filter((item) => item.status === this.data.activeStatus)
    this.setData({ filteredList: filtered })
  },

  onTabSwitch(e: WechatMiniprogram.TouchEvent) {
    const status = e.currentTarget.dataset.status as string
    if (status === this.data.activeStatus) return
    this.setData({ activeStatus: status })
    this.applyFilter()
  },

  goToDetail(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id
    const status = e.currentTarget.dataset.status
    const url = status === 'unhandled'
      ? `/pages/staff/alarm/detail/detail?id=${id}`
      : `/pages/staff/alarm/handled/handled?id=${id}`
    wx.navigateTo({ url })
  }
})