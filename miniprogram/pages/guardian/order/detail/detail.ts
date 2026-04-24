import { getAppointmentDetail } from '../../../../utils/api'

const app = getApp<any>()

const PROGRESS_LABELS = ['已提交', '已派单', '护理人员已接单', '服务中', '已完成']

function buildProgressData(currentStep: number) {
  return PROGRESS_LABELS.map((label, index) => ({
    label,
    active: index <= currentStep,
    current: index === currentStep,
    done: index < currentStep,
    showLine: index < PROGRESS_LABELS.length - 1,
    lineActive: index < currentStep
  }))
}

function getProgressStep(appt: any): number {
  if (appt.status === 'completed') return 4
  if (appt.status === 'accepted') return 2
  if (appt.nurseName) return 1
  return 0
}

Page({
  data: {
    statusH: 0,
    loading: false,
    id: '',
    appt: null as any,
    progressData: buildProgressData(0),
    trackWidth: '0%',
    currentStep: 0,
    cancelled: false
  },

  onLoad(options: any) {
    this.setData({ statusH: app.globalData.statusBarHeight || 0, id: options.id || '' })
    this.loadDetail(options.id)
  },

  onShow() {
    if (this.data.id) this.loadDetail(this.data.id)
  },

  async loadDetail(id: string) {
    if (!id) return
    this.setData({ loading: true })
    try {
      const appt = await getAppointmentDetail(id)
      const cancelled = appt.status === 'cancelled'
      const currentStep = cancelled ? 0 : getProgressStep(appt)
      const trackWidth = currentStep === 0 ? '0%' : `${(currentStep / 4) * 100}%`
      this.setData({
        appt,
        cancelled,
        currentStep,
        progressData: buildProgressData(currentStep),
        trackWidth
      })
    } catch {
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  callNurse() {
    const phone = this.data.appt?.doctorPhone || this.data.appt?.nursePhone
    if (!phone) {
      wx.showToast({ title: '暂无联系电话', icon: 'none' })
      return
    }
    wx.makePhoneCall({ phoneNumber: phone })
  },

  goBack() {
    wx.navigateBack()
  }
})
