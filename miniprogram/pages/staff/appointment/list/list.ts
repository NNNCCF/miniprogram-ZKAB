import { getAppointments } from '../../../../utils/api'

interface Appointment {
  id: string
  type: string
  status: string
  statusLabel: string
  appointTime: string
  memberName: string
  requirement: string
}

const TYPE_FILTERS = [
  { label: '全部', value: '' },
  { label: '送药', value: '送药' },
  { label: '上门探诊', value: '上门探诊' },
  { label: '预约体检', value: '预约体检' },
  { label: '护理', value: '护理' }
]

const STATUS_FILTERS = [
  { label: '全部', value: '' },
  { label: '待处理', value: 'pending' },
  { label: '待上门', value: 'accepted' },
  { label: '已完成', value: 'completed' }
]

const STATUS_LABEL_MAP: Record<string, string> = {
  pending: '待处理',
  accepted: '待上门',
  completed: '已完成'
}

function formatYearMonth(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

Page({
  data: {
    loading: false,
    currentMonth: formatYearMonth(new Date()),
    searchText: '',
    activeType: '',
    activeStatus: '',
    typeFilters: TYPE_FILTERS,
    statusFilters: STATUS_FILTERS,
    allList: [] as Appointment[],
    filteredList: [] as Appointment[]
  },

  onLoad() {
    this.loadList()
  },

  onShow() {
    this.loadList()
  },

  loadList() {
    this.setData({ loading: true })
    const { currentMonth } = this.data
    getAppointments({ startDate: currentMonth + '-01', endDate: currentMonth + '-31' })
      .then((list: any) => {
        const mapped = (list || []).map((item: any) => ({
          ...item,
          statusLabel: STATUS_LABEL_MAP[item.status] || item.status
        }))
        this.setData({ allList: mapped, loading: false })
        this.applyFilters()
      })
      .catch(() => {
        this.setData({ loading: false })
      })
  },

  applyFilters() {
    const { allList, searchText, activeType, activeStatus } = this.data
    const keyword = searchText.trim().toLowerCase()
    const filtered = allList.filter(item => {
      const matchType = !activeType || item.type === activeType
      const matchStatus = !activeStatus || item.status === activeStatus
      const matchSearch = !keyword ||
        (item.memberName || '').toLowerCase().includes(keyword) ||
        (item.requirement || '').toLowerCase().includes(keyword)
      return matchType && matchStatus && matchSearch
    })
    this.setData({ filteredList: filtered })
  },

  onMonthChange(e: WechatMiniprogram.PickerChange) {
    const val = (e.detail.value as string).slice(0, 7)
    this.setData({ currentMonth: val })
    this.loadList()
  },

  onSearchInput(e: WechatMiniprogram.Input) {
    this.setData({ searchText: e.detail.value })
    this.applyFilters()
  },

  onTypeFilter(e: WechatMiniprogram.TouchEvent) {
    const value = e.currentTarget.dataset.value as string
    this.setData({ activeType: value })
    this.applyFilters()
  },

  onStatusFilter(e: WechatMiniprogram.TouchEvent) {
    const value = e.currentTarget.dataset.value as string
    this.setData({ activeStatus: value })
    this.applyFilters()
  },

  goToDetail(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/staff/appointment/detail/detail?id=${id}` })
  }
})
