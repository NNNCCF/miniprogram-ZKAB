import { getFamilyMapList } from '../../../utils/api'

interface FamilyMapItem {
  id: string
  familyName: string
  address: string
  location: string
}

interface MapMarker {
  id: number
  latitude: number
  longitude: number
  title: string
  iconPath: string
  width: number
  height: number
}

function parseLocation(location: string): { lat: number; lng: number } | null {
  if (!location) return null
  const parts = location.split(',')
  if (parts.length !== 2) return null
  const lat = parseFloat(parts[0])
  const lng = parseFloat(parts[1])
  if (isNaN(lat) || isNaN(lng)) return null
  return { lat, lng }
}

Page({
  data: {
    lat: 39.9042,
    lng: 116.4074,
    markers: [] as MapMarker[],
    families: [] as FamilyMapItem[]
  },

  onLoad() {
    this.loadLocations()
  },

  loadLocations() {
    getFamilyMapList()
      .then((res: any) => {
        const families = res || []
        const markers: MapMarker[] = []
        families.forEach((item: any, index: number) => {
          const coords = parseLocation(item.location)
          if (coords) {
            markers.push({
              id: index,
              latitude: coords.lat,
              longitude: coords.lng,
              title: item.familyName,
              iconPath: '/images/tab_home.png',
              width: 30,
              height: 30
            })
          }
        })

        const update: Record<string, any> = { markers, families }
        if (markers.length > 0) {
          update.lat = markers[0].latitude
          update.lng = markers[0].longitude
        }
        this.setData(update)
      })
      .catch(() => {
        wx.showToast({ title: '位置加载失败', icon: 'none' })
      })
  },

  onMarkerTap(e: WechatMiniprogram.MapMarkerTap) {
    const markerId = e.detail.markerId
    const family = this.data.families[markerId]
    if (!family) return

    wx.showModal({
      title: family.familyName,
      content: `地址：${family.address || '未知'}`,
      showCancel: false,
      confirmText: '知道了'
    })
  }
})
