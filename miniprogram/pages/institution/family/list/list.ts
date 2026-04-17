import { getInstitutionFamilies } from '../../../../utils/api'

interface FamilyItem {
  id: string | number
  familyName: string
  memberCount?: number
  address?: string
  familyInitial?: string
}

Page({
  data: {
    loading: false,
    searchText: '',
    allList: [] as FamilyItem[],
    filteredList: [] as FamilyItem[]
  },

  onLoad() {
    this.loadList()
  },

  onShow() {
    this.loadList()
  },

  loadList() {
    this.setData({ loading: true })
    getInstitutionFamilies()
      .then((list: any) => {
        const mapped = (list || []).map((item: any) => ({
          ...item,
          familyInitial: (item.familyName || '家').slice(0, 1)
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
    const keyword = searchText.trim().toLowerCase()
    const filtered = keyword
      ? allList.filter(item =>
          (item.familyName || '').toLowerCase().includes(keyword) ||
          (item.address || '').toLowerCase().includes(keyword)
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
