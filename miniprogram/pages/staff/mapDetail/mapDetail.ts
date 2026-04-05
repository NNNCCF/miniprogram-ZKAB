import { get } from '../../../utils/request'

interface MemberLocation {
  id: string
  name: string
  latitude: number
  longitude: number
  address: string
  status: string
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

Page({
  data: {
    lat: 39.9042,
    lng: 116.4074,
    markers: [] as MapMarker[],
    locations: [] as MemberLocation[]
  },

  onLoad() {
    this.loadLocations()
  },

  loadLocations() {
    get<MemberLocation[]>('/staff/members/locations')
      .then(res => {
        const locations = res || []
        const markers: MapMarker[] = locations.map((item, index) => ({
          id: index,
          latitude: item.latitude,
          longitude: item.longitude,
          title: item.name,
          iconPath: '/images/tab_home.png',
          width: 30,
          height: 30
        }))

        // Center map on first marker if available
        const centerUpdate: Record<string, any> = { markers, locations }
        if (locations.length > 0) {
          centerUpdate.lat = locations[0].latitude
          centerUpdate.lng = locations[0].longitude
        }

        this.setData(centerUpdate)
      })
      .catch(() => {
        wx.showToast({ title: '位置加载失败', icon: 'none' })
      })
  },

  onMarkerTap(e: WechatMiniprogram.MapMarkerTap) {
    const markerId = e.detail.markerId
    const location = this.data.locations[markerId]
    if (!location) return

    wx.showModal({
      title: location.name,
      content: `地址：${location.address || '未知'}\n状态：${location.status || '正常'}`,
      showCancel: false,
      confirmText: '知道了'
    })
  }
})
