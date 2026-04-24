import {
  getAlarms,
  getAppointments,
  getDeviceList,
  getFamilyMapList,
  getMemberList,
  getNewsList,
  getNurseList,
  getServiceCenterInfo
} from '../../../utils/api'

interface FamilyMapItem {
  id: string | number
  shortName?: string
  familyName?: string
  address?: string
  location?: string
  latitude?: number
  longitude?: number
  memberCount?: number
  careLevel?: string
  careLevelLabel?: string
  status?: string
  hasAlarm?: boolean
  members?: Array<{ name?: string }>
}

interface DeviceItem {
  id?: string
  deviceCode?: string
  location?: string
  address?: string
  status?: string
  members?: Array<{ name?: string }>
}

interface ServiceCenterInfo {
  id?: string | number
  name: string
  address: string
  phone: string
  type?: string
}

interface FilterItem {
  key: 'center' | 'hospital' | 'family' | 'alarm'
  label: string
  icon: string
  active: boolean
}

interface MarkerTarget {
  markerId: number
  url: string
}

interface MapMarker {
  id: number
  latitude: number
  longitude: number
  title: string
  iconPath: string
  width: number
  height: number
  callout?: {
    content: string
    color: string
    fontSize: number
    borderRadius: number
    bgColor: string
    padding: number
    display: 'BYCLICK' | 'ALWAYS'
    borderWidth: number
    borderColor: string
  }
}

const DEFAULT_CENTER = {
  lat: 37.8706,
  lng: 112.5498
}

const CARE_LEVEL_MAP: Record<string, string> = {
  light: '一般监护',
  medium: '重点监护',
  heavy: '特级监护'
}

function parseLocation(location?: string | null): { lat: number; lng: number } | null {
  if (!location) return null
  const parts = location.split(',')
  if (parts.length < 2) return null
  const lat = Number(parts[0])
  const lng = Number(parts[1])
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null
  return { lat, lng }
}

function localDateString(date: Date): string {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function familyPoint(item: FamilyMapItem): { lat: number; lng: number } | null {
  if (typeof item.latitude === 'number' && typeof item.longitude === 'number') {
    return { lat: item.latitude, lng: item.longitude }
  }
  return parseLocation(item.location)
}

function devicePoint(item: DeviceItem): { lat: number; lng: number } | null {
  return parseLocation(item.location)
}

Page({
  data: {
    panelOpen: true,
    news: [] as any[],
    mapLat: DEFAULT_CENTER.lat,
    mapLng: DEFAULT_CENTER.lng,
    mapScale: 13,
    allFamilies: [] as FamilyMapItem[],
    allDevices: [] as DeviceItem[],
    serviceCenter: null as ServiceCenterInfo | null,
    markerTargets: [] as MarkerTarget[],
    markers: [] as MapMarker[],
    filters: [
      { key: 'center', label: '服务中心', icon: '/images/marker_center.png', active: true },
      { key: 'hospital', label: '设备点位', icon: '/images/marker_hospital.png', active: true },
      { key: 'family', label: '服务家庭', icon: '/images/marker_family.png', active: true },
      { key: 'alarm', label: '报警家庭', icon: '/images/marker_alarm.png', active: true }
    ] as FilterItem[],
    stats: {
      families: 0,
      members: 0,
      todayAlarms: 0,
      nurses: 0,
      totalAppts: 0,
      todayVisits: 0,
      pendingAppts: 0
    }
  },

  onLoad() {
    void this.loadMapData()
    void this.loadStats()
  },

  onShow() {
    void this.loadStats()
    void this.loadNews()
  },

  async loadNews() {
    try {
      const list = await getNewsList() as any[]
      this.setData({ news: (list || []).slice(0, 3) })
    } catch {
      this.setData({ news: [] })
    }
  },

  goToNews(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id
    if (!id) return
    wx.navigateTo({ url: `/pages/guardian/service/newsDetail/newsDetail?id=${id}` })
  },

  goToNewsList() {
    wx.navigateTo({ url: '/pages/staff/news/list/list' })
  },

  async loadMapData() {
    const [families, devices, center] = await Promise.all([
      getFamilyMapList().catch(() => []),
      getDeviceList().catch(() => []),
      getServiceCenterInfo().catch(() => null)
    ])

    this.setData({
      allFamilies: Array.isArray(families) ? families : [],
      allDevices: Array.isArray(devices) ? devices : [],
      serviceCenter: center as ServiceCenterInfo | null
    })

    this.buildMarkers()
  },

  buildMarkers() {
    const filters = this.data.filters as FilterItem[]
    const families = this.data.allFamilies as FamilyMapItem[]
    const devices = this.data.allDevices as DeviceItem[]
    const serviceCenter = this.data.serviceCenter as ServiceCenterInfo | null

    const showCenter = !!filters.find((item) => item.key === 'center')?.active
    const showHospital = !!filters.find((item) => item.key === 'hospital')?.active
    const showFamily = !!filters.find((item) => item.key === 'family')?.active
    const showAlarm = !!filters.find((item) => item.key === 'alarm')?.active

    const markers: MapMarker[] = []
    const markerTargets: MarkerTarget[] = []
    let nextId = 0

    if (showCenter) {
      markers.push({
        id: nextId++,
        latitude: DEFAULT_CENTER.lat,
        longitude: DEFAULT_CENTER.lng,
        title: serviceCenter?.name || '卓凯安伴服务中心',
        iconPath: '/images/marker_center.png',
        width: 44,
        height: 44,
        callout: {
          content: `${serviceCenter?.name || '卓凯安伴服务中心'}\n${serviceCenter?.address || '山西省太原市'}\n${serviceCenter?.phone || ''}`,
          color: '#1a1a1a',
          fontSize: 13,
          borderRadius: 10,
          bgColor: '#ffffff',
          padding: 12,
          display: 'BYCLICK',
          borderWidth: 1,
          borderColor: '#3B7EFF'
        }
      })
    }

    if (showHospital) {
      devices.forEach((device) => {
        const point = devicePoint(device)
        if (!point) return

        const memberNames = (device.members || [])
          .map((item) => item?.name)
          .filter(Boolean)
          .join('、') || '未绑定成员'

        markers.push({
          id: nextId++,
          latitude: point.lat,
          longitude: point.lng,
          title: device.deviceCode || device.id || '设备',
          iconPath: '/images/marker_hospital.png',
          width: 36,
          height: 36,
          callout: {
            content: `设备：${device.deviceCode || device.id || '-'}\n地址：${device.address || '-'}\n成员：${memberNames}\n状态：${device.status === 'online' ? '在线' : '离线'}`,
            color: '#1a1a1a',
            fontSize: 13,
            borderRadius: 10,
            bgColor: '#ffffff',
            padding: 12,
            display: 'BYCLICK',
            borderWidth: 1,
            borderColor: '#E0E6F5'
          }
        })
      })
    }

    families.forEach((family) => {
      const point = familyPoint(family)
      if (!point) return

      const isAlarm = family.hasAlarm === true || family.status === 'alarm'
      if (isAlarm && !showAlarm) return
      if (!isAlarm && !showFamily) return

      const familyName = family.shortName || family.familyName || family.address || '未命名家庭'
      const memberCount = family.memberCount ?? family.members?.length ?? 0
      const careLabel = family.careLevelLabel || CARE_LEVEL_MAP[family.careLevel || ''] || '一般监护'
      const statusLabel = isAlarm ? '报警中' : '正常'
      const markerId = nextId++

      markers.push({
        id: markerId,
        latitude: point.lat,
        longitude: point.lng,
        title: familyName,
        iconPath: isAlarm ? '/images/marker_alarm.png' : '/images/marker_family.png',
        width: 40,
        height: 40,
        callout: {
          content: `${familyName}\n监护成员：${memberCount}\n监护等级：${careLabel}\n当前状态：${statusLabel}`,
          color: '#1a1a1a',
          fontSize: 13,
          borderRadius: 10,
          bgColor: '#ffffff',
          padding: 12,
          display: 'BYCLICK',
          borderWidth: 1,
          borderColor: '#E0E6F5'
        }
      })

      markerTargets.push({
        markerId,
        url: isAlarm
          ? '/pages/staff/alarm/list/list'
          : `/pages/staff/archive/detail/detail?id=${family.id}`
      })
    })

    const firstFamilyPoint = families.map(familyPoint).find(Boolean) || null
    const firstDevicePoint = devices.map(devicePoint).find(Boolean) || null
    const mapCenter = firstFamilyPoint || firstDevicePoint || DEFAULT_CENTER

    this.setData({
      markers,
      markerTargets,
      mapLat: mapCenter.lat,
      mapLng: mapCenter.lng
    })
  },

  togglePanel() {
    this.setData({ panelOpen: !this.data.panelOpen })
  },

  onFilter(e: WechatMiniprogram.TouchEvent) {
    const key = e.currentTarget.dataset.key as FilterItem['key']
    const filters = (this.data.filters as FilterItem[]).map((item) =>
      item.key === key ? { ...item, active: !item.active } : item
    )

    this.setData({ filters }, () => {
      this.buildMarkers()
    })
  },

  onMarkerTap(e: WechatMiniprogram.CustomEvent<{ markerId: number }>) {
    const markerId = e.detail.markerId
    const target = (this.data.markerTargets as MarkerTarget[]).find((item) => item.markerId === markerId)
    if (!target) return
    wx.navigateTo({ url: target.url })
  },

  onMapTap() {},

  async loadStats() {
    const today = localDateString(new Date())

    const [families, members, alarms, nurses, appointments, completedToday] = await Promise.all([
      getFamilyMapList().catch(() => []),
      getMemberList().catch(() => []),
      getAlarms().catch(() => []),
      getNurseList().catch(() => []),
      getAppointments().catch(() => []),
      getAppointments({ startDate: today, endDate: today, status: 'completed' }).catch(() => [])
    ])

    const alarmList = Array.isArray(alarms) ? alarms : []
    const appointmentList = Array.isArray(appointments) ? appointments : []

    const todayAlarms = alarmList.filter((item: any) => {
      const alarmTime = typeof item?.alarmTime === 'string' ? item.alarmTime : ''
      return alarmTime.slice(0, 10) === today
    }).length

    const pendingAppts = appointmentList.filter((item: any) => item?.status === 'pending').length

    this.setData({
      stats: {
        families: Array.isArray(families) ? families.length : 0,
        members: Array.isArray(members) ? members.length : 0,
        todayAlarms,
        nurses: Array.isArray(nurses) ? nurses.length : 0,
        totalAppts: appointmentList.length,
        todayVisits: Array.isArray(completedToday) ? completedToday.length : 0,
        pendingAppts
      }
    })
  },

  goToAppt() {
    wx.reLaunch({ url: '/pages/staff/appointment/list/list' })
  },

  goToAlarm() {
    wx.reLaunch({ url: '/pages/staff/alarm/list/list' })
  },

  goToArchive() {
    wx.reLaunch({ url: '/pages/staff/archive/list/list' })
  }
})
