import { getServiceDoctor, getMiniDoctorDetail, createAppointment, getMemberList } from '../../../../utils/api'
import { get } from '../../../../utils/request'

const app = getApp<any>()

const CHECKUP_ITEMS = [
  { key: 'blood_routine',    label: '血常规' },
  { key: 'urine_routine',    label: '尿常规' },
  { key: 'liver_func',       label: '肝功能' },
  { key: 'kidney_func',      label: '肾功能' },
  { key: 'blood_glucose',    label: '血糖' },
  { key: 'blood_lipids',     label: '血脂' },
  { key: 'ecg',              label: '心电图' },
  { key: 'chest_xray',       label: '胸部X光' },
  { key: 'abdo_ultrasound',  label: '腹部B超' },
  { key: 'blood_pressure',   label: '血压监测' },
  { key: 'bone_density',     label: '骨密度' },
  { key: 'fundus',           label: '眼底检查' },
  { key: 'thyroid',          label: '甲状腺功能' },
  { key: 'tumor_markers',    label: '肿瘤标志物' },
  { key: 'ct_head',          label: '头部CT' },
]

const NURSING_ITEMS = [
  { key: 'basic_care',       label: '基础护理' },
  { key: 'wound_dressing',   label: '伤口换药' },
  { key: 'injection',        label: '注射/输液' },
  { key: 'catheter',         label: '导管护理' },
  { key: 'pressure_sore',    label: '压疮护理' },
  { key: 'rehab',            label: '康复训练' },
  { key: 'turn_over',        label: '翻身拍背' },
  { key: 'bp_measure',       label: '血压测量' },
  { key: 'glucose_monitor',  label: '血糖监测' },
  { key: 'ecg_monitor',      label: '心电监护' },
  { key: 'oral_care',        label: '口腔护理' },
  { key: 'feeding',          label: '鼻饲喂食' },
]

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function defaultTime() {
  const d = new Date()
  d.setHours(d.getHours() + 1)
  return `${String(d.getHours()).padStart(2, '0')}:00`
}

Page({
  data: {
    statusH: 0,
    // 'profile' | 'book' | 'checkup' | 'nursing'
    mode: 'profile' as string,
    apptType: '家庭医生',
    doctor: {} as any,
    orgPhone: '',
    // 预约表单（book模式）
    timeSlots: [] as any[],
    selectedSlot: null as any,
    loading: false,
    members: [] as any[],
    selectedMemberId: null as number | null,
    form: { patientName: '', phone: '', symptoms: '' },
    // 体检 / 护理模式
    apptDate: todayStr(),
    apptTime: defaultTime(),
    minDate: todayStr(),
    selectedItems: [] as string[],
    itemList: [] as { key: string; label: string }[],
    patientName: '',
    patientPhone: '',
    extraNote: ''
  },

  onLoad(options: any) {
    this.setData({ statusH: app.globalData.statusBarHeight || 0 })
    const typeMap: Record<string, string> = {
      visit: '上门探诊', checkup: '预约体检', nursing: '护理服务'
    }
    if (options.type === 'checkup') {
      this.setData({ mode: 'checkup', apptType: '预约体检', itemList: CHECKUP_ITEMS })
      this.loadUserInfo()
    } else if (options.type === 'nursing') {
      this.setData({ mode: 'nursing', apptType: '护理服务', itemList: NURSING_ITEMS })
      this.loadUserInfo()
    } else if (options.type === 'visit') {
      this.setData({ mode: 'book', apptType: '上门探诊' })
      if (options.id) this.loadDoctorById(options.id)
      else this.loadServiceDoctor()
      this.loadSlots()
      this.loadMembers()
    } else {
      this.setData({ mode: 'profile' })
      this.loadServiceDoctor()
      this.loadOrgPhone()
    }
  },

  loadUserInfo() {
    try {
      let info = wx.getStorageSync('userInfo') || {}
      if (typeof info === 'string') info = JSON.parse(info)
      this.setData({ patientName: info.name || '', patientPhone: info.mobile || info.phone || '' })
    } catch {}
  },

  async loadServiceDoctor() {
    try {
      const doctor: any = await getServiceDoctor()
      if (doctor) this.setData({ doctor })
    } catch {}
  },

  async loadOrgPhone() {
    try {
      const center: any = await get('/service/center')
      if (center?.phone) this.setData({ orgPhone: center.phone })
    } catch {}
  },

  async loadDoctorById(id: string) {
    try {
      const doctor = await getMiniDoctorDetail(id)
      this.setData({ doctor })
    } catch {}
  },

  async loadMembers() {
    try {
      const list: any = await getMemberList()
      this.setData({ members: list || [] })
    } catch {}
  },

  callDoctor() {
    const phone = this.data.doctor?.phone
    if (!phone) return wx.showToast({ title: '暂无联系方式', icon: 'none' })
    wx.makePhoneCall({ phoneNumber: phone })
  },

  callOrg() {
    if (!this.data.orgPhone) return wx.showToast({ title: '暂无机构联系方式', icon: 'none' })
    wx.makePhoneCall({ phoneNumber: this.data.orgPhone })
  },

  // ── 选择/取消 体检/护理 项目 ──
  toggleItem(e: any) {
    const key = e.currentTarget.dataset.key as string
    const { selectedItems } = this.data
    const idx = selectedItems.indexOf(key)
    if (idx >= 0) {
      this.setData({ selectedItems: selectedItems.filter(k => k !== key) })
    } else {
      this.setData({ selectedItems: [...selectedItems, key] })
    }
  },

  onDateChange(e: any) { this.setData({ apptDate: e.detail.value }) },
  onTimeChange(e: any) { this.setData({ apptTime: e.detail.value }) },
  onInput(e: any) {
    const field = e.currentTarget.dataset.field
    this.setData({ [field]: e.detail.value })
  },

  // ── 提交体检/护理预约 ──
  async submitService() {
    const { selectedItems, itemList, apptDate, apptTime, patientName, patientPhone, extraNote, apptType, loading } = this.data
    if (selectedItems.length === 0) return wx.showToast({ title: '请至少选择一项', icon: 'none' })
    if (!patientName.trim()) return wx.showToast({ title: '请填写患者姓名', icon: 'none' })
    if (!patientPhone.trim()) return wx.showToast({ title: '请填写联系电话', icon: 'none' })
    if (loading) return

    const labels = selectedItems.map(k => itemList.find(i => i.key === k)?.label || k).join('、')
    const userInfoStr = wx.getStorageSync('userInfo')
    let userInfo: any = {}
    try { userInfo = typeof userInfoStr === 'string' ? JSON.parse(userInfoStr) : userInfoStr || {} } catch {}

    this.setData({ loading: true })
    wx.showLoading({ title: '提交中...' })
    try {
      await createAppointment({
        type: apptType,
        guardianId: userInfo.id || undefined,
        appointTime: `${apptDate} ${apptTime}`,
        requirement: `患者：${patientName} 电话：${patientPhone}\n项目：${labels}${extraNote ? '\n备注：' + extraNote : ''}`
      })
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

  // ── book 模式（上门探诊）──
  loadSlots() {
    const slots: any[] = []
    const today = new Date()
    for (let di = 0; di < 3; di++) {
      const d = new Date(today); d.setDate(today.getDate() + di)
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      const date = `${mm}-${dd}`
      let id = di * 3 + 1
      for (const time of ['09:00', '14:00', '16:00']) {
        slots.push({ id: id++, date, time, available: id % 3 !== 0 })
      }
    }
    this.setData({ timeSlots: slots })
  },

  selectSlot(e: any) {
    const { id, available } = e.currentTarget.dataset
    if (!available) return
    this.setData({ selectedSlot: id })
  },

  async onBook() {
    const { selectedSlot, form, doctor, loading, timeSlots, apptType } = this.data
    if (loading) return
    if (!selectedSlot) return wx.showToast({ title: '请选择预约时间', icon: 'none' })
    if (!form.patientName) return wx.showToast({ title: '请填写患者姓名', icon: 'none' })
    if (!form.phone) return wx.showToast({ title: '请填写联系电话', icon: 'none' })
    const slot = timeSlots.find((s: any) => s.id === selectedSlot)
    const year = new Date().getFullYear()
    const userInfoStr = wx.getStorageSync('userInfo')
    let userInfo: any = {}
    try { userInfo = typeof userInfoStr === 'string' ? JSON.parse(userInfoStr) : userInfoStr || {} } catch {}
    this.setData({ loading: true })
    wx.showLoading({ title: '预约中...' })
    try {
      await createAppointment({
        type: apptType,
        guardianId: userInfo.id || undefined,
        memberId: this.data.selectedMemberId || undefined,
        appointTime: slot ? `${year}-${slot.date} ${slot.time}` : undefined,
        requirement: `医生：${doctor.name || ''} 患者：${form.patientName} 电话：${form.phone} 症状：${form.symptoms}`
      })
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

  goBack() { wx.navigateBack() }
})
