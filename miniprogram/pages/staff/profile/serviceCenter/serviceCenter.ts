import { getNewsList, getServiceCenterInfo } from '../../../../utils/api'

type ServiceCenterInfo = {
  name: string
  address: string
  phone: string
}

type NoticeItem = {
  id: number | string
  title: string
  date: string
}

type FaqItem = {
  id: number
  question: string
  answer: string
  expanded: boolean
}

const DEFAULT_CENTER: ServiceCenterInfo = {
  name: '卓凯安伴服务中心',
  address: '山西省太原市',
  phone: '03511234567'
}

const DEFAULT_FAQS: FaqItem[] = [
  {
    id: 1,
    question: '医护端服务中心可以做什么？',
    answer: '可以查看服务中心联系方式、机构公告和常见问题，也可以直接提交意见反馈。',
    expanded: true
  },
  {
    id: 2,
    question: '公告内容多久更新一次？',
    answer: '服务中心公告会同步读取当前系统中的最新资讯，进入页面后会自动刷新。',
    expanded: false
  },
  {
    id: 3,
    question: '遇到使用问题该怎么处理？',
    answer: '可以先查看常见问题；如果仍未解决，可通过“意见反馈”提交问题，或直接拨打服务电话。',
    expanded: false
  }
]

Page({
  data: {
    loading: true,
    center: DEFAULT_CENTER,
    notices: [] as NoticeItem[],
    faqs: DEFAULT_FAQS
  },

  onShow() {
    this.loadData()
  },

  async onPullDownRefresh() {
    await this.loadData()
    wx.stopPullDownRefresh()
  },

  async loadData() {
    this.setData({ loading: true })

    try {
      const [centerRes, newsRes] = await Promise.allSettled([
        getServiceCenterInfo(),
        getNewsList()
      ])

      const nextData: Record<string, unknown> = { loading: false }

      if (centerRes.status === 'fulfilled' && centerRes.value) {
        nextData.center = {
          name: centerRes.value.name || DEFAULT_CENTER.name,
          address: centerRes.value.address || DEFAULT_CENTER.address,
          phone: centerRes.value.phone || DEFAULT_CENTER.phone
        }
      }

      if (newsRes.status === 'fulfilled') {
        nextData.notices = (newsRes.value || []).slice(0, 6).map((item: any) => ({
          id: item.id,
          title: item.title || '未命名公告',
          date: item.createdAt || item.date || ''
        }))
      }

      this.setData(nextData)
    } catch {
      this.setData({ loading: false })
    }
  },

  toggleFaq(e: WechatMiniprogram.BaseEvent) {
    const id = Number(e.currentTarget.dataset.id)
    const faqs = (this.data.faqs as FaqItem[]).map((item) => (
      item.id === id ? { ...item, expanded: !item.expanded } : item
    ))
    this.setData({ faqs })
  },

  expandFaqs() {
    const currentFaqs = this.data.faqs as FaqItem[]
    const shouldExpand = currentFaqs.some((item) => !item.expanded)
    const faqs = currentFaqs.map((item) => ({ ...item, expanded: shouldExpand }))
    this.setData({ faqs })
  },

  showCenterInfo() {
    const center = this.data.center as ServiceCenterInfo
    wx.showModal({
      title: center.name || '服务中心',
      content: `地址：${center.address || '暂无'}\n电话：${center.phone || '暂无'}`,
      showCancel: false
    })
  },

  onCallPhone() {
    const center = this.data.center as ServiceCenterInfo
    if (!center.phone) {
      wx.showToast({ title: '暂无联系电话', icon: 'none' })
      return
    }
    wx.makePhoneCall({ phoneNumber: center.phone })
  },

  goFeedback() {
    wx.navigateTo({ url: '/pages/staff/profile/feedback/feedback' })
  },

  goNotice(e: WechatMiniprogram.BaseEvent) {
    const id = e.currentTarget.dataset.id
    if (!id) {
      return
    }
    wx.navigateTo({ url: `/pages/guardian/service/newsDetail/newsDetail?id=${id}` })
  }
})
