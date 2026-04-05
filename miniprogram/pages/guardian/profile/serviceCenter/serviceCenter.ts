Page({
  data: {
    statusH: 0,
    faqs: [
      { id: 1, q: '如何绑定老人的设备？', a: '进入首页，点击绑定设备按钮，输入设备背面的设备ID完成绑定。', open: false },
      { id: 2, q: '报警推送收不到怎么办？', a: '请检查手机通知权限是否已开启，并在报警设置中确认各提醒已打开。', open: false },
      { id: 3, q: '如何切换监护成员？', a: '在首页点击人员切换，选择要监护的成员即可。', open: false }
    ]
  },
  onLoad() { const app = getApp<any>(); this.setData({ statusH: app.globalData.statusBarHeight || 0 }) },
  goBack() { wx.navigateBack() },
  toggle(e: any) {
    const id = e.currentTarget.dataset.id
    const faqs = this.data.faqs.map((f: any) => f.id === id ? { ...f, open: !f.open } : f)
    this.setData({ faqs })
  },
  callPhone() { wx.makePhoneCall({ phoneNumber: '4008889999' }) }
})
