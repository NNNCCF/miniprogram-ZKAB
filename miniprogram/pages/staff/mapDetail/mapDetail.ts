import { getFamilyMapList } from '../../../utils/api'

interface MapMarker {
  id: number
  latitude: number
  longitude: number
  title: string
  iconPath: string
  width: number
  height: number
}

Page({
  data: {
    lat: 37.8706,
    lng: 112.5498,
    markers: [] as MapMarker[],
    families: [] as any[]
  },

  onLoad() {
    this.loadLocations()
  },

  async loadLocations() {
    try {
      const families = await getFamilyMapList() as any[]
      const markers: MapMarker[] = []
      families.forEach((item: any, index: number) => {
        if (item.latitude == null || item.longitude == null) return
        markers.push({
          id: index,
          latitude: item.latitude,
          longitude: item.longitude,
          title: item.shortName || item.familyName || item.address || '家庭',
          iconPath: '/images/tab_home.png',
          width: 30,
          height: 30
        })
      })

      const update: Record<string, any> = { markers, families }
      if (markers.length > 0) {
        update.lat = markers[0].latitude
        update.lng = markers[0].longitude
      }
      this.setData(update)
    } catch (err: any) {
      wx.showToast({
        title: err.message || '位置加载失败',
        icon: 'none'
      })
    }
  },

  onMarkerTap(e: WechatMiniprogram.MarkerTap) {
    const markerId = e.detail.markerId
    const family = this.data.families[markerId]
    if (!family) return
    wx.showModal({
      title: family.shortName || family.familyName || '家庭位置',
      content: `地址：${family.address || '未知'}`,
      showCancel: false,
      confirmText: '知道了'
    })
  }
})
