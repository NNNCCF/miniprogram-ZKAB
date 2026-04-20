import { unifiedLogin, nurseRegister, guardianRegister, getPublicInstitutionList } from '../../utils/api'

Page({
  data: {
    activeTab: 'login' as 'login' | 'register',
    showPwd: false,
    showRegPwd: false,
    submitting: false,
    loginForm: { phone: '', password: '' },
    regForm: { phone: '', password: '', confirmPassword: '', name: '', role: 'staff' },
    // 机构列表
    orgList: [] as { id: number; name: string; address: string }[],
    orgNames: [] as string[],   // picker 显示用
    orgIndex: -1,               // 当前选中下标，-1 表示未选
    orgLoading: false
  },

  onLoad() {
    this.loadOrgList()
  },

  async loadOrgList() {
    this.setData({ orgLoading: true })
    try {
      const list = await getPublicInstitutionList() as any[]
      const orgList = (list || []).map((o: any) => ({
        id: o.id,
        name: o.name,
        address: o.address || ''
      }))
      this.setData({
        orgList,
        orgNames: orgList.map((o: any) => o.name),
        orgLoading: false
      })
    } catch {
      this.setData({ orgLoading: false })
    }
  },

  setTab(e: any) {
    this.setData({ activeTab: e.currentTarget.dataset.tab })
  },

  onLoginInput(e: any) {
    const field: string = e.currentTarget.dataset.field
    const update: any = {}
    update['loginForm.' + field] = e.detail.value
    this.setData(update)
  },

  onRegInput(e: any) {
    const field: string = e.currentTarget.dataset.field
    const update: any = {}
    update['regForm.' + field] = e.detail.value
    this.setData(update)
  },

  togglePwd() { this.setData({ showPwd: !this.data.showPwd }) },
  toggleRegPwd() { this.setData({ showRegPwd: !this.data.showRegPwd }) },

  selectRole(e: any) {
    const role = e.currentTarget.dataset.role
    this.setData({ 'regForm.role': role, orgIndex: -1 })
  },

  onOrgPickerChange(e: any) {
    this.setData({ orgIndex: Number(e.detail.value) })
  },

  // ─── 登录（自动识别角色）─────────────────────────────────────────────────────
  async handleLogin() {
    const { loginForm } = this.data

    if (!loginForm.phone || loginForm.phone.length !== 11) {
      return wx.showToast({ title: '请输入正确手机号', icon: 'none' })
    }
    if (!loginForm.password) {
      return wx.showToast({ title: '请输入密码', icon: 'none' })
    }

    // ── 虚拟账户（仅供前端开发调试使用）──────────────────────────────
    const MOCK_ACCOUNTS: Record<string, { role: 'guardian' | 'staff'; name: string }> = {
      '13333333333': { role: 'guardian', name: '测试家属' },
      '15555555555': { role: 'staff',    name: '测试医护' },
    }
    const mockAccount = MOCK_ACCOUNTS[loginForm.phone]
    if (mockAccount && loginForm.password === '123456') {
      const app = getApp<any>()
      const mockToken = `mock_${mockAccount.role}_token`
      app.globalData.token = mockToken
      app.globalData.role  = mockAccount.role
      wx.setStorageSync('token', mockToken)
      wx.setStorageSync('role',  mockAccount.role)
      wx.setStorageSync('userInfo', JSON.stringify({ name: mockAccount.name, phone: loginForm.phone }))
      const url = mockAccount.role === 'staff'
        ? '/pages/staff/home/home'
        : '/pages/guardian/index/index'
      wx.reLaunch({ url })
      return
    }
    // ──────────────────────────────────────────────────────────────────

    this.setData({ submitting: true })
    wx.showLoading({ title: '登录中...' })

    try {
      const res: any = await unifiedLogin({ phone: loginForm.phone, password: loginForm.password })
      wx.hideLoading()

      if (res?.token) {
        const app = getApp<any>()
        // role: "caregiver" → staff 端；"guardian" → 家属端
        const roleMap: Record<string, string> = {
          caregiver: 'staff',
          guardian: 'guardian',
          institution: 'institution'
        }
        const role = roleMap[(res.role || '').toLowerCase()] || 'guardian'
        app.globalData.token = res.token
        app.globalData.role = role
        wx.setStorageSync('token', res.token)
        wx.setStorageSync('role', role)
        wx.setStorageSync('userInfo', JSON.stringify(res.userInfo || {}))

        const urlMap: Record<string, string> = {
          staff: '/pages/staff/home/home',
          guardian: '/pages/guardian/index/index',
          institution: '/pages/institution/index/index'
        }
        wx.reLaunch({ url: urlMap[role] || '/pages/guardian/index/index' })
      } else {
        wx.showToast({ title: res?.msg || '登录失败', icon: 'none' })
      }
    } catch (e: any) {
      wx.hideLoading()
      wx.showToast({ title: e.message || '网络异常', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  },

  // ─── 注册 ──────────────────────────────────────────────────────────────────
  async handleRegister() {
    const { regForm } = this.data

    if (!regForm.phone || regForm.phone.length !== 11) {
      return wx.showToast({ title: '请输入正确手机号', icon: 'none' })
    }
    if (!regForm.name.trim()) {
      return wx.showToast({ title: '请输入真实姓名', icon: 'none' })
    }
    if (!regForm.password || regForm.password.length < 6) {
      return wx.showToast({ title: '密码不能少于6位', icon: 'none' })
    }
    if (regForm.password !== regForm.confirmPassword) {
      return wx.showToast({ title: '两次密码不一致', icon: 'none' })
    }
    if (regForm.role === 'staff' && this.data.orgIndex < 0) {
      return wx.showToast({ title: '请选择所属医疗机构', icon: 'none' })
    }

    const selectedOrg = this.data.orgList[this.data.orgIndex]

    this.setData({ submitting: true })
    wx.showLoading({ title: '注册中...' })

    try {
      if (regForm.role === 'staff') {
        await nurseRegister({
          phone: regForm.phone,
          password: regForm.password,
          name: regForm.name.trim(),
          role: 'NURSE',
          institutionId: selectedOrg.id,        // 直接用 ID 绑定，精准关联
          institutionName: selectedOrg.name      // 备用字段
        })
      } else {
        await guardianRegister({
          phone: regForm.phone,
          password: regForm.password,
          name: regForm.name.trim()
        })
      }
      wx.hideLoading()
      wx.showToast({ title: '注册成功，请登录', icon: 'success' })
      setTimeout(() => {
        this.setData({
          activeTab: 'login',
          'loginForm.phone': regForm.phone,
          regForm: { phone: '', password: '', confirmPassword: '', name: '', role: 'staff' },
          orgIndex: -1
        })
      }, 1500)
    } catch (err: any) {
      wx.hideLoading()
      wx.showToast({ title: err.message || '注册失败', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  },

  wechatLogin() {
    wx.showToast({ title: '微信登录开发中', icon: 'none' })
  }
})
