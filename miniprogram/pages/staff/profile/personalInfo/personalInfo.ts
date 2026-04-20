import { getStaffProfile, updateStaffProfile } from '../../../../utils/api'

interface ProfileForm {
  name: string
  phone: string
  department: string
  title: string
  idCard: string
}

Page({
  data: {
    form: {
      name: '',
      phone: '',
      department: '',
      title: '',
      idCard: ''
    } as ProfileForm,
    saving: false
  },

  onLoad() {
    this.loadProfile()
  },

  async loadProfile() {
    try {
      const data = await getStaffProfile() as ProfileForm
      this.setData({ form: data })
    } catch (err: any) {
      wx.showToast({
        title: err.message || '加载失败',
        icon: 'none'
      })
    }
  },

  onInput(e: WechatMiniprogram.Input) {
    const field = e.currentTarget.dataset.field as string
    const update: any = {}
    update['form.' + field] = e.detail.value
    this.setData(update)
  },

  async onSave() {
    const { form } = this.data
    if (!form.name.trim()) {
      wx.showToast({ title: '请输入姓名', icon: 'none' })
      return
    }
    this.setData({ saving: true })
    try {
      await updateStaffProfile({
        name: form.name,
        department: form.department,
        title: form.title,
        idCard: form.idCard
      })
      wx.showToast({ title: '保存成功', icon: 'success' })
    } catch (err: any) {
      wx.showToast({
        title: err.message || '保存失败',
        icon: 'none'
      })
    } finally {
      this.setData({ saving: false })
    }
  }
})
