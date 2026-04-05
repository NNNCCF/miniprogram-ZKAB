import { getFamilyList } from '../../../../utils/api'

interface Archive {
  id: string
  familyName: string
  familyInitial: string
  memberCount: number
  lastUpdateTime: string
}

function getFamilyInitial(name: string): string {
  if (!name) return '家'
  return name.slice(0, 2)
}

Page({
  data: {
    loading: false,
    searchText: '',
    allList: [] as Archive[],
    filteredList: [] as Archive[]
  },

  onLoad() {
    this.loadList()
  },

  onShow() {
    this.loadList()
  },

  loadList() {
    this.setData({ loading: true })
    getFamilyList()
      .then((list: any) => {
        const mapped = (list || []).map((item: any) => ({
          ...item,
          familyInitial: getFamilyInitial(item.familyName)
        }))
        this.setData({ allList: mapped, loading: false })
        this.applyFilter()
      })
      .catch(() => {
        this.setData({ loading: false })
      })
  },

  applyFilter() {
    const { allList, searchText } = this.data
    const keyword = searchText.trim()
    if (!keyword) {
      this.setData({ filteredList: allList })
      return
    }
    const filtered = allList.filter(item =>
      (item.familyName || '').includes(keyword)
    )
    this.setData({ filteredList: filtered })
  },

  onSearchInput(e: WechatMiniprogram.Input) {
    this.setData({ searchText: e.detail.value })
    this.applyFilter()
  },

  onSearchConfirm() {
    this.applyFilter()
  },

  clearSearch() {
    this.setData({ searchText: '' })
    this.applyFilter()
  },

  goToDetail(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/staff/archive/detail/detail?id=${id}` })
  }
})
