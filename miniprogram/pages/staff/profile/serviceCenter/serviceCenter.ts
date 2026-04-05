interface FaqItem {
  id: number
  question: string
  answer: string
  expanded: boolean
}

Page({
  data: {
    faqs: [
      {
        id: 1,
        question: '如何新增一个服务家庭？',
        answer: '进入"家庭管理"页面，点击右上角"+"按钮，填写家庭基本信息后提交，系统将自动生成家庭档案。',
        expanded: false
      },
      {
        id: 2,
        question: '上门记录如何提交？',
        answer: '完成上门服务后，在"上门记录"页面点击对应任务，填写本次服务详情并上传相关资料，提交即可。',
        expanded: false
      },
      {
        id: 3,
        question: '如何修改个人资料？',
        answer: '进入"我的"→"个人信息"，即可修改姓名、专业科室、职称等信息。手机号如需更改请联系管理员。',
        expanded: false
      },
      {
        id: 4,
        question: '收不到通知怎么办？',
        answer: '请检查"系统设置"中通知开关是否已开启，并确认手机微信通知权限已授予。如仍有问题，请联系客服。',
        expanded: false
      },
      {
        id: 5,
        question: '如何发布消息给家庭用户？',
        answer: '进入"我的"→"消息发布"，填写标题、选择消息类型和内容，选择目标家庭后点击发布即可。',
        expanded: false
      }
    ] as FaqItem[]
  },

  toggleFaq(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as number
    const faqs = this.data.faqs.map(item => ({
      ...item,
      expanded: item.id === id ? !item.expanded : item.expanded
    }))
    this.setData({ faqs })
  },

  onCallPhone() {
    wx.makePhoneCall({
      phoneNumber: '4008889999',
      fail() {
        wx.showToast({ title: '拨打失败', icon: 'none' })
      }
    })
  }
})
