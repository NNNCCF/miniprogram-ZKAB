import {
  createAppointment,
  getMemberList,
  getMiniDoctorDetail,
  getServiceCenterInfo,
  getServiceDoctor
} from '../../../../utils/api'
import { getStoredUserInfo } from '../../../../utils/session'

const app = getApp<any>()

const CHECKUP_ITEMS = [
  { key: 'blood_routine', label: '血常规' },
  { key: 'urine_routine', label: '尿常规' },
  { key: 'liver_func', label: '肝功能' },
  { key: 'kidney_func', label: '肾功能' },
  { key: 'blood_glucose', label: '血糖' },
  { key: 'blood_lipids', label: '血脂' },
  { key: 'ecg', label: '心电图' },
  { key: 'chest_xray', label: '胸部 X 光' },
  { key: 'ultrasound', label: '超声检查' },
  { key: 'blood_pressure', label: '血压监测' }
]

const NURSING_ITEMS = [
  { key: 'basic_care', label: '基础护理' },
  { key: 'wound_dressing', label: '换药护理' },
  { key: 'injection', label: '注射输液' },
  { key: 'catheter', label: '导管护理' },
  { key: 'pressure_sore', label: '压疮护理' },
  { key: 'rehab', label: '康复训练' },
  { key: 'turn_over', label: '翻身拍背' },
  { key: 'bp_measure', label: '血压测量' },
  { key: 'glucose_monitor', label: '血糖监测' },
  { key: 'oral_care', label: '口腔护理' }
]

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function defaultTime() {
  const d = new Date()
  d.setHours(d.getHours() + 1)
  d.setMinutes(0)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

Page({
  data: {
    statusH: 0,
    mode: 'profile',
    serviceMode: 'visit',
    apptType: '家庭医生',
    doctor: {} as any,
    orgPhone: '',
    loading: false,
    members: [] as any[],
    selectedMemberId: null as number | null,
    selectedMemberIndex: 0,
    itemList: [] as Array<{ key: string; label: string }>,
    selectedItems: [] as string[],
    apptDate: todayStr(),
    apptTime: defaultTime(),
    minDate: todayStr(),
    patientName: '',
    patientPhone: '',
    symptoms: '',
    extraNote: ''
  },

  onLoad(options: any) {
    this.setData({ statusH: app.globalData.statusBarHeight || 0 })
    this.prefillContact()

    const type = options?.type || ''
    if (type === 'checkup') {
      this.setData({ mode: 'book', serviceMode: 'checkup', apptType: '预约体检', itemList: CHECKUP_ITEMS })
    } else if (type === 'nursing') {
      this.setData({ mode: 'book', serviceMode: 'nursing', apptType: '护理服务', itemList: NURSING_ITEMS })
    } else if (type === 'visit') {
      this.setData({ mode: 'book', serviceMode: 'visit', apptType: '上门探访', itemList: [] })
    }

    this.loadDoctor(options?.id)
    this.loadServicePhone()
    this.loadMembers()
  },

  prefillContact() {
    const info: any = getStoredUserInfo() || {}
    this.setData({ patientName: info.name || '', patientPhone: info.phone || info.mobile || '' })
  },

  async loadDoctor(id?: string) {
    if (id) {
      try {
        const doctor = await getMiniDoctorDetail(id)
        this.setData({ doctor: doctor || {} })
        return
      } catch {}
    }
    try {
      const doctor = await getServiceDoctor()
      if (doctor) this.setData({ doctor })
    } catch {}
  },

  async loadServicePhone() {
    try {
      const center = await getServiceCenterInfo() as any
      const nextDoctor = { ...this.data.doctor }
      if (center?.name && !nextDoctor.institution && !nextDoctor.hospital) {
        nextDoctor.institution = center.name
      }
      this.setData({ orgPhone: center?.phone || '', doctor: nextDoctor })
    } catch {}
  },

  async loadMembers() {
    try {
      const members = await getMemberList()
      if (!members.length) {
        this.setData({ members: [] })
        return
      }
      const savedId = wx.getStorageSync('currentMemberId')
      const selectedIndex = Math.max(members.findIndex((item: any) => String(item.id) === String(savedId)), 0)
      const current = members[selectedIndex]
      wx.setStorageSync('currentMemberId', current.id)
      this.setData({
        members,
        selectedMemberId: current.id,
        selectedMemberIndex: selectedIndex,
        patientName: this.data.patientName || current.name || ''
      })
    } catch {}
  },

  onMemberChange(e: any) {
    const index = Number(e.detail.value || 0)
    const current = this.data.members[index]
    if (!current) return
    wx.setStorageSync('currentMemberId', current.id)
    this.setData({ selectedMemberIndex: index, selectedMemberId: current.id, patientName: current.name || this.data.patientName })
  },

  callDoctor() {
    const phone = this.data.doctor?.phone
    if (!phone) {
      wx.showToast({ title: '暂无联系电话', icon: 'none' })
      return
    }
    wx.makePhoneCall({ phoneNumber: phone })
  },

  callOrg() {
    if (!this.data.orgPhone) {
      wx.showToast({ title: '暂无机构联系电话', icon: 'none' })
      return
    }
    wx.makePhoneCall({ phoneNumber: this.data.orgPhone })
  },

  toggleItem(e: any) {
    const key = e.currentTarget.dataset.key as string
    const selectedItems = [...this.data.selectedItems]
    const index = selectedItems.indexOf(key)
    if (index >= 0) selectedItems.splice(index, 1)
    else selectedItems.push(key)
    this.setData({ selectedItems })
  },

  onDateChange(e: any) { this.setData({ apptDate: e.detail.value }) },
  onTimeChange(e: any) { this.setData({ apptTime: e.detail.value }) },
  onInput(e: any) {
    const field = e.currentTarget.dataset.field as string
    this.setData({ [field]: e.detail.value })
  },

  buildRequirement() {
    const currentMember = this.data.members[this.data.selectedMemberIndex]
    const lines = [] as string[]
    if (currentMember?.name) lines.push(`服务对象：${currentMember.name}`)
    if (this.data.serviceMode === 'visit') {
      lines.push(`需求说明：${this.data.symptoms.trim() || '上门探访'}`)
    } else {
      const labels = this.data.selectedItems.map((key) => this.data.itemList.find((item) => item.key === key)?.label || key).join('、')
      if (labels) lines.push(`服务项目：${labels}`)
    }
    if (this.data.extraNote.trim()) lines.push(`补充说明：${this.data.extraNote.trim()}`)
    return lines.join('\n')
  },

  async submitAppointment() {
    if (this.data.loading) return
    if (!this.data.patientName.trim()) {
      wx.showToast({ title: '请填写联系人姓名', icon: 'none' })
      return
    }
    if (!this.data.patientPhone.trim()) {
      wx.showToast({ title: '请填写联系电话', icon: 'none' })
      return
    }
    if (this.data.serviceMode !== 'visit' && this.data.selectedItems.length === 0) {
      wx.showToast({ title: '请至少选择一个服务项目', icon: 'none' })
      return
    }

    this.setData({ loading: true })
    wx.showLoading({ title: '提交中...' })
    try {
      await createAppointment({
        type: this.data.apptType,
        memberId: this.data.selectedMemberId || undefined,
        appointTime: `${this.data.apptDate} ${this.data.apptTime}`,
        contactName: this.data.patientName.trim(),
        contactPhone: this.data.patientPhone.trim(),
        requirement: this.buildRequirement()
      })
      wx.hideLoading()
      wx.showToast({ title: '预约成功', icon: 'success' })
      setTimeout(() => wx.navigateTo({ url: '/pages/guardian/order/list/list' }), 1200)
    } catch (err: any) {
      wx.hideLoading()
      wx.showToast({ title: err.message || '预约失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  goBack() { wx.navigateBack() }
})
