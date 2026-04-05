import { get } from '../../../../utils/request'

const CARE_LEVEL_LABEL: Record<string, string> = {
  light: '轻度照护',
  medium: '中度照护',
  heavy: '重度照护'
}

const GENDER_LABEL: Record<string, string> = {
  male: '男',
  female: '女'
}

interface DeviceInfo {
  status: 'online' | 'offline'
}

interface Member {
  id: string
  name: string
  age: number
  gender: string
  genderLabel: string
  device: DeviceInfo | null
}

interface AlarmRecord {
  id: string
  type: string
  time: string
  handled: boolean
}

interface ArchiveDetail {
  id: string
  familyName: string
  address: string
  careLevel: string
  careLevelLabel: string
  members: Member[]
  recentAlarms: AlarmRecord[]
}

Page({
  data: {
    loading: false,
    id: '',
    archive: null as ArchiveDetail | null
  },

  onLoad(options: Record<string, string>) {
    const id = options.id || ''
    this.setData({ id })
    this.load(id)
  },

  load(id: string) {
    if (!id) return
    this.setData({ loading: true })
    get<ArchiveDetail>('/archives/' + id)
      .then(res => {
        const members = (res.members || []).map((m: Member) => ({
          ...m,
          genderLabel: GENDER_LABEL[m.gender] || m.gender
        }))
        this.setData({
          archive: {
            ...res,
            careLevelLabel: CARE_LEVEL_LABEL[res.careLevel] || res.careLevel,
            members,
            recentAlarms: (res.recentAlarms || []).slice(0, 5)
          },
          loading: false
        })
      })
      .catch(() => {
        this.setData({ loading: false })
        wx.showToast({ title: '加载失败', icon: 'none' })
      })
  }
})
