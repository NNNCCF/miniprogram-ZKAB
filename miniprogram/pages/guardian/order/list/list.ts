import { getAppointments } from '../../../../utils/api'

const app = getApp<any>()

function getTypeIcon(type: string): string {
  if (!type) return '服'
  if (type.includes('医生') || type.includes('家庭')) return '医'
  if (type.includes('探访') || type.includes('上门')) return '访'
  if (type.includes('体检')) return '检'
  if (type.includes('护理')) return '护'
  if (type.includes('送药') || type.includes('药')) return '药'
  return type[0] || '服'
}

function getTypeColor(type: string): string {
  if (type.includes('医生') || type.includes('家庭')) return '#3B7EFF'
  if (type.includes('探访') || type.includes('上门')) return '#10B981'
  if (type.includes('体检')) return '#F59E0B'
  if (type.includes('护理')) return '#8B5CF6'
  if (type.includes('送药') || type.includes('药')) return '#EF4444'
  return '#6B7280'
}

function getDisplayStatus(appt: any): { label: string; color: string } {
  if (appt.status === 'cancelled') return { label: '已取消', color: '#9CA3AF' }
  if (appt.status === 'completed') return { label: '已完成', color: '#6B7280' }
  if (appt.status === 'accepted') return { label: '已接单', color: '#10B981' }
  if (appt.nurseName) return { label: '已派单', color: '#F59E0B' }
  return { label: '已提交', color: '#3B7EFF' }
}

Page({
  data: {
    statusH: 0,
    loading: false,
    activeTab: 0,
    tabs: ['全部', '进行中', '已完成'],
    allOrders: [] as any[],
    displayOrders: [] as any[]
  },

  onLoad() {
    this.setData({ statusH: app.globalData.statusBarHeight || 0 })
  },

  onShow() {
    this.loadOrders()
  },

  async loadOrders() {
    this.setData({ loading: true })
    try {
      const orders = await getAppointments()
      const allOrders = (orders || []).map((appt: any) => {
        const ds = getDisplayStatus(appt)
        return {
          ...appt,
          displayLabel: ds.label,
          displayColor: ds.color,
          typeIcon: getTypeIcon(appt.type),
          typeColor: getTypeColor(appt.type)
        }
      }).sort((a: any, b: any) =>
        (b.appointTime || '').localeCompare(a.appointTime || '')
      )
      this.setData({ allOrders })
      this.applyFilter()
    } catch {
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  applyFilter() {
    const { activeTab, allOrders } = this.data
    let displayOrders: any[]
    if (activeTab === 1) {
      displayOrders = allOrders.filter(o => o.status === 'pending' || o.status === 'accepted')
    } else if (activeTab === 2) {
      displayOrders = allOrders.filter(o => o.status === 'completed')
    } else {
      displayOrders = allOrders.filter(o => o.status !== 'cancelled')
    }
    this.setData({ displayOrders })
  },

  onTabChange(e: any) {
    const index = Number(e.currentTarget.dataset.index)
    this.setData({ activeTab: index })
    this.applyFilter()
  },

  goDetail(e: any) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/guardian/order/detail/detail?id=${id}` })
  },

  onPullDownRefresh() {
    this.loadOrders().then(() => wx.stopPullDownRefresh())
  },

  goBack() {
    wx.navigateBack()
  }
})
