import { getFamilyMapList, getAlarms, getAppointments, getMemberList, getNurseList } from '../../../utils/api'

interface FamilyMapItem {
  id: string | number
  familyName: string
  address: string
  location: string
  memberCount?: number
  careLevel?: string
  status?: string
  hasAlarm?: boolean
}

interface MapMarker {
  id: number
  latitude: number
  longitude: number
  title: string
  iconPath: string
  width: number
  height: number
  callout: {
    content: string
    color: string
    fontSize: number
    borderRadius: number
    bgColor: string
    padding: number
    display: string
    borderWidth: number
    borderColor: string
  }
  customCallout?: any
}

function parseLocation(loc: string): { lat: number; lng: number } | null {
  if (!loc) return null
  const parts = loc.split(',')
  if (parts.length < 2) return null
  const lat = parseFloat(parts[0])
  const lng = parseFloat(parts[1])
  if (isNaN(lat) || isNaN(lng)) return null
  return { lat, lng }
}

const CARE_LEVEL_MAP: Record<string, string> = {
  light: '一般监护',
  medium: '重点监护',
  heavy: '特级监护'
}

Page({
  data: {
    panelOpen: true,
    mapLat: 37.8706,
    mapLng: 112.5498,
    mapScale: 13,
    allFamilies: [] as FamilyMapItem[],
    markers: [] as MapMarker[],
    filters: [
      { key: 'center',   label: '服务中心', icon: '/images/marker_center.png',   active: true  },
      { key: 'hospital', label: '医疗机构', icon: '/images/marker_hospital.png', active: true  },
      { key: 'family',   label: '服务家庭', icon: '/images/marker_family.png',   active: true  },
      { key: 'alarm',    label: '有报警',   icon: '/images/marker_alarm.png',    active: true  }
    ],
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
    this.loadMapData()
    this.loadStats()
  },

  onShow() {
    this.loadStats()
  },

  async loadMapData() {
    try {
      const list: any = await getFamilyMapList()
      const families: FamilyMapItem[] = list || []
      this.setData({ allFamilies: families })
      this.buildMarkers(families)
    } catch {
      // 无数据时地图仍可显示
    }
  },

  buildMarkers(families: FamilyMapItem[]) {
    const { filters } = this.data
    const showFamily = filters.find(f => f.key === 'family')?.active
    const showAlarm  = filters.find(f => f.key === 'alarm')?.active

    const markers: MapMarker[] = []
    families.forEach((item, idx) => {
      const coords = parseLocation(item.location)
      if (!coords) return

      const isAlarm = item.hasAlarm === true
      if (isAlarm && !showAlarm) return
      if (!isAlarm && !showFamily) return

      const careLabel = CARE_LEVEL_MAP[item.careLevel || ''] || '一般监护'
      const statusLabel = item.status === 'alarm' ? '报警' : '正常'

      markers.push({
        id: idx,
        latitude: coords.lat,
        longitude: coords.lng,
        title: item.familyName,
        iconPath: isAlarm ? '/images/marker_alarm.png' : '/images/marker_family.png',
        width: 40,
        height: 40,
        callout: {
          content: `${item.familyName}\n监护成员数：${item.memberCount || '--'}\n监护等级：${careLabel}\n当前状态：${statusLabel}`,
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

    this.setData({ markers })
  },

  togglePanel() {
    this.setData({ panelOpen: !this.data.panelOpen })
  },

  onFilter(e: any) {
    const key = e.currentTarget.dataset.key as string
    const filters = this.data.filters.map(f =>
      f.key === key ? { ...f, active: !f.active } : f
    )
    this.setData({ filters })
    this.buildMarkers(this.data.allFamilies)
  },

  onMarkerTap(e: any) {
    // callout 点击由地图组件内部处理，这里可做额外逻辑
    const markerId = e.detail.markerId
    const family = this.data.allFamilies[markerId]
    if (!family) return
  },

  onMapTap() {
    // 点空白区域关闭 callout（微信地图自动处理）
  },

  async loadStats() {
    const today = new Date().toISOString().slice(0, 10)
    const [families, members, alarms, nurses, appts, todayAppts] = await Promise.allSettled([
      getFamilyMapList(),
      getMemberList(),
      getAlarms(),
      getNurseList(),
      getAppointments(),
      getAppointments({ startDate: today, endDate: today, status: 'completed' })
    ])

    const safeLen = (r: PromiseSettledResult<any>) =>
      r.status === 'fulfilled' ? ((r.value as any[])?.length ?? 0) : 0

    const allAlarms: any[] = alarms.status === 'fulfilled' ? (alarms.value as any[] || []) : []
    const todayAlarmCount = allAlarms.filter((a: any) => {
      if (!a.alarmTime) return false
      return a.alarmTime.slice(0, 10) === today
    }).length

    const pendingAppts = appts.status === 'fulfilled'
      ? ((appts.value as any[]) || []).filter((a: any) => a.status === 'pending').length
      : 0

    this.setData({
      stats: {
        families: safeLen(families),
        members: safeLen(members),
        todayAlarms: todayAlarmCount,
        nurses: safeLen(nurses),
        totalAppts: safeLen(appts),
        todayVisits: safeLen(todayAppts),
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
