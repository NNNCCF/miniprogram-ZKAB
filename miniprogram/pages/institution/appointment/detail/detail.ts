import { getAppointmentDetail, dispatchAppointment, getInstitutionNurses } from '../../../../utils/api'

const STATUS_LABEL: Record<string, string> = {
  pending: '待处理',
  accepted: '已派单',
  completed: '已完成',
  cancelled: '已取消'
}

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

interface NurseItem {
  id: string | number
  name: string
  phone?: string
}

Page({
  data: {
    loading: false,
    dispatching: false,
    id: '',
    appt: null as any,
    showDispatchModal: false,
    nurses: [] as NurseItem[],
    selectedNurseId: null as string | number | null,
    selectedNurseName: '',
    visitDate: '',
    minVisitDate: todayStr()
  },

  onLoad(options: Record<string, string>) {
    const id = options.id || ''
    this.setData({ id })
    this.loadDetail(id)
  },

  onShow() {
    if (this.data.id) this.loadDetail(this.data.id)
  },

  loadDetail(id: string) {
    if (!id) return
    this.setData({ loading: true })
    getAppointmentDetail(id)
      .then((res: any) => {
        this.setData({
          appt: { ...res, statusLabel: STATUS_LABEL[res.status] || res.status },
          loading: false
        })
      })
      .catch(() => {
        this.setData({ loading: false })
        wx.showToast({ title: '加载失败', icon: 'none' })
      })
  },

  async openDispatchModal() {
    wx.showLoading({ title: '加载医护...' })
    try {
      const nurses: any = await getInstitutionNurses()
      wx.hideLoading()
      this.setData({
        nurses: nurses || [],
        showDispatchModal: true,
        selectedNurseId: null,
        selectedNurseName: '',
        visitDate: todayStr()
      })
    } catch {
      wx.hideLoading()
      wx.showToast({ title: '加载医护列表失败', icon: 'none' })
    }
  },

  closeDispatchModal() {
    this.setData({ showDispatchModal: false })
  },

  selectNurse(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id
    const name = e.currentTarget.dataset.name
    this.setData({ selectedNurseId: id, selectedNurseName: name })
  },

  onVisitDateChange(e: WechatMiniprogram.PickerChange) {
    this.setData({ visitDate: e.detail.value as string })
  },

  async confirmDispatch() {
    const { id, selectedNurseId, selectedNurseName, visitDate, dispatching } = this.data
    if (!selectedNurseId) {
      wx.showToast({ title: '请选择医护人员', icon: 'none' })
      return
    }
    if (!visitDate) {
      wx.showToast({ title: '请选择上门日期', icon: 'none' })
      return
    }
    if (dispatching) return
    this.setData({ dispatching: true })
    wx.showLoading({ title: '派单中...' })
    try {
      await dispatchAppointment(id, {
        nurseId: Number(selectedNurseId),
        nurseName: selectedNurseName,
        visitDate
      } as any)
      wx.hideLoading()
      wx.showToast({ title: '派单成功', icon: 'success' })
      this.setData({ showDispatchModal: false })
      setTimeout(() => this.loadDetail(id), 1500)
    } catch (err: any) {
      wx.hideLoading()
      wx.showToast({ title: err.message || '派单失败', icon: 'none' })
    } finally {
      this.setData({ dispatching: false })
    }
  },

  noop() {},

  goBack() {
    wx.navigateBack()
  }
})
