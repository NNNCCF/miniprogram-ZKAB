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
  unhandled: '未处理',
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
        const unhandledCount = mapped.filter((a: any) => a.status === 'unhandled').length
        this.setData({ allList: mapped, unhandledCount, loading: false })
        this.applyFilter()
      })
      .catch(() => {
        this.setData({ loading: false })
      })
  },

  applyFilter() {
    const { allList, activeStatus } = this.data
    const filtered = allList.filter(item => item.status === activeStatus)
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
    wx.navigateTo({ url: `/pages/staff/alarm/detail/detail?id=${id}` })
  }
})
