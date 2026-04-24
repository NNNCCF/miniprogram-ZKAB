import { getFamilyMapList } from '../../../utils/api'

Page({
  data: {
    lat: 37.8706,
    lng: 112.5498,
    markers: [] as any[],
    families: [] as any[]
  },

  onLoad() {
    this.loadLocations()
  },

  async loadLocations() {
    try {
      const families = await getFamilyMapList() as any[]
      const markers: any[] = []
      families.forEach((item: any, index: number) => {
        if (item.latitude == null || item.longitude == null) return
        const isAlarm = item.hasAlarm === true || item.status === 'alarm'
        const familyName = item.shortName || item.familyName || item.address || '未命名家庭'
        markers.push({
          id: index,
          latitude: item.latitude,
          longitude: item.longitude,
          title: familyName,
          iconPath: isAlarm ? '/images/marker_alarm.png' : '/images/marker_family.png',
          width: 40,
          height: 40,
          callout: {
            content: `${familyName}\n成员数：${item.memberCount || 0} 人\n地址：${item.address || '未知'}\n${isAlarm ? '⚠️ 有报警' : '正常'}`,
            color: '#1a1a1a',
            fontSize: 13,
            borderRadius: 10,
            bgColor: '#ffffff',
            padding: 12,
            display: 'BYCLICK',
            borderWidth: 1,
            borderColor: isAlarm ? '#EF4444' : '#3B7EFF'
          }
        })
      })
      const update: Record<string, any> = { markers, families }
      if (markers.length > 0) {
        update.lat = markers[0].latitude
        update.lng = markers[0].longitude
      }
      this.setData(update)
    } catch (err: any) {
      wx.showToast({ title: err.message || '位置加载失败', icon: 'none' })
    }
  },

  onMarkerTap(e: WechatMiniprogram.MarkerTap) {
    const family = this.data.families[e.detail.markerId]
    if (!family) return
    const isAlarm = family.hasAlarm === true || family.status === 'alarm'
    wx.showModal({
      title: family.shortName || family.familyName || '家庭位置',
      content: `地址：${family.address || '未知'}\n成员数：${family.memberCount || 0} 人${isAlarm ? '\n⚠️ 当前有报警' : ''}`,
      showCancel: false,
      confirmText: '知道了'
    })
  }
})
