import { getInstitutionNurses } from '../../../../utils/api'

interface NurseItem {
  id: string | number
  name: string
  phone?: string
  role?: string
}

Page({
  data: {
    loading: false,
    searchText: '',
    allList: [] as NurseItem[],
    filteredList: [] as NurseItem[]
  },

  onLoad() {
    this.loadList()
  },

  onShow() {
    this.loadList()
  },

  loadList() {
    this.setData({ loading: true })
    getInstitutionNurses()
      .then((list: any) => {
        this.setData({ allList: list || [], loading: false })
        this.applyFilter()
      })
      .catch(() => {
        this.setData({ loading: false })
      })
  },

  applyFilter() {
    const { allList, searchText } = this.data
    const keyword = searchText.trim().toLowerCase()
    const filtered = keyword
      ? allList.filter(item =>
          (item.name || '').toLowerCase().includes(keyword) ||
          (item.phone || '').includes(keyword)
        )
      : allList
    this.setData({ filteredList: filtered })
  },

  onSearchInput(e: WechatMiniprogram.Input) {
    this.setData({ searchText: e.detail.value })
    this.applyFilter()
  },

  clearSearch() {
    this.setData({ searchText: '' })
    this.applyFilter()
  }
})
