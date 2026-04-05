import { getFamilyDetail } from '../../../../utils/api'

const GENDER_LABEL: Record<string, string> = {
  male: '男',
  female: '女'
}

interface Member {
  id: string
  name: string
  age: number
  gender: string
  genderLabel: string
  deviceStatus: string
}

interface AlarmRecord {
  id: string
  alarmType: string
  alarmTime: string
  status: string
}

interface FamilyDetail {
  id: string
  familyName: string
  address: string
  members: Member[]
  recentAlarms: AlarmRecord[]
}

Page({
  data: {
    loading: false,
    id: '',
    family: null as FamilyDetail | null
  },

  onLoad(options: Record<string, string>) {
    const id = options.id || ''
    this.setData({ id })
    this.load(id)
  },

  load(id: string) {
    if (!id) return
    this.setData({ loading: true })
    getFamilyDetail(id)
      .then((res: any) => {
        const members = (res.members || []).map((m: any) => ({
          ...m,
          genderLabel: GENDER_LABEL[m.gender] || m.gender
        }))
        this.setData({
          family: { ...res, members, recentAlarms: (res.recentAlarms || []).slice(0, 5) },
          loading: false
        })
      })
      .catch(() => {
        this.setData({ loading: false })
        wx.showToast({ title: '加载失败', icon: 'none' })
      })
  }
})
