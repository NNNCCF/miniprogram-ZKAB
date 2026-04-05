import { get, post } from '../../../../../utils/request'

const app = getApp<any>()

Page({
  data: {
    statusH: 0,
    doctor: {} as any,
    timeSlots: [] as any[],
    selectedSlot: null as any,
    loading: false,
    form: {
      patientName: '',
      phone: '',
      symptoms: ''
    }
  },

  onLoad(options: any) {
    this.setData({ statusH: app.globalData.statusBarHeight || 0 })
    const id = options.id || '1'
    this.loadDoctor(id)
  },

  async loadDoctor(id: string) {
    try {
      const doctor = await get('/services/doctor/' + id)
      this.setData({ doctor })
    } catch {
      this.setData({
        doctor: {
          id: 1, name: '王志远', title: '主任医师 · 内科',
          hospital: '北京协和医院', experience: 22,
          patients: 5200, rating: 4.9, price: 99,
          specialty: '高血压、冠心病、心力衰竭，擅长老年慢性病综合管理'
        }
      })
    }
    this.loadSlots()
  },

  loadSlots() {
    // Generate next 6 slots
    const slots = []
    const dates = ['03-16', '03-17', '03-18']
    const times = ['09:00', '14:00']
    let id = 1
    for (const d of dates) {
      for (const t of times) {
        slots.push({ id: id++, date: d, time: t, available: id % 3 !== 0 })
      }
    }
    this.setData({ timeSlots: slots })
  },

  selectSlot(e: any) {
    const { id, available } = e.currentTarget.dataset
    if (!available) return
    this.setData({ selectedSlot: id })
  },

  onInput(e: any) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`form.${field}`]: e.detail.value })
  },

  async onBook() {
    const { selectedSlot, form, doctor, loading } = this.data
    if (loading) return
    if (!selectedSlot) { wx.showToast({ title: '请选择预约时间', icon: 'none' }); return }
    if (!form.patientName) { wx.showToast({ title: '请填写患者姓名', icon: 'none' }); return }
    if (!form.phone) { wx.showToast({ title: '请填写联系电话', icon: 'none' }); return }
    this.setData({ loading: true })
    wx.showLoading({ title: '预约中...' })
    try {
      await post('/appointments', { doctorId: doctor.id, slotId: selectedSlot, ...form })
      wx.hideLoading()
      wx.showToast({ title: '预约成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
    } catch (e: any) {
      wx.hideLoading()
      wx.showToast({ title: e.message || '预约失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  goBack() {
    wx.navigateBack()
  }
})
