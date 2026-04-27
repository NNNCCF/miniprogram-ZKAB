import { getAlarms, handleAlarm, ignoreAlarm } from './api'
import { getStoredUserInfo } from './session'

type AlarmResult = 'HANDLED' | 'IGNORED' | ''
type SupportedRole = 'guardian' | 'staff' | 'institution' | ''

interface MiniAlarmLike {
  id: string | number
  status?: string
  type?: string
  alarmType?: string
  alarmTime?: string
  memberName?: string
  location?: string
  familyAddress?: string
  description?: string
}

export function createGlobalAlarmManager(app: any) {
  const state = {
    queue: [] as MiniAlarmLike[],
    activeAlarm: null as MiniAlarmLike | null,
    selectedResult: '' as AlarmResult,
    pollingTimer: null as ReturnType<typeof setInterval> | null,
    loading: false,
    submitting: false,
    activeAccountKey: '',
    seenByAccount: {} as Record<string, Array<string | number>>,
  }

  function supportedRole(role: string) {
    return role === 'guardian' || role === 'staff'
  }

  function currentRole(): SupportedRole {
    return (app.globalData.role || wx.getStorageSync('role') || '') as SupportedRole
  }

  function isGuardianRole() {
    return currentRole() === 'guardian'
  }

  function currentAccountKey() {
    const role = currentRole()
    const userInfo = app.globalData.userInfo || getStoredUserInfo()
    const userId = userInfo?.id || userInfo?.userId || userInfo?.mobile || userInfo?.phone || ''
    return role && userId ? `${role}:${userId}` : ''
  }

  function resetActiveQueue() {
    state.queue = []
    state.activeAlarm = null
    state.selectedResult = ''
  }

  function ensureAccountScope() {
    const nextKey = currentAccountKey()
    if (state.activeAccountKey && state.activeAccountKey !== nextKey) {
      resetActiveQueue()
    }
    state.activeAccountKey = nextKey
    if (nextKey && !state.seenByAccount[nextKey]) {
      state.seenByAccount[nextKey] = []
    }
    return nextKey
  }

  function isEnabled() {
    const token = app.globalData.token || wx.getStorageSync('token') || ''
    return !!token && supportedRole(currentRole())
  }

  function getSeenIds() {
    const key = ensureAccountScope()
    return key ? (state.seenByAccount[key] || []) : []
  }

  function setSeenIds(ids: Array<string | number>) {
    const key = ensureAccountScope()
    if (!key) return
    state.seenByAccount[key] = Array.from(new Set(ids))
  }

  function resolveAlarmTypeLabel(item: MiniAlarmLike) {
    const raw = String(item?.type || item?.alarmType || '')
    if (!raw) return '跌倒'
    if (raw.toUpperCase().includes('FALL') || raw.includes('跌倒')) return '跌倒'
    return raw
  }

  function isFallAlarm(item: MiniAlarmLike) {
    const raw = String(item?.type || item?.alarmType || '')
    return raw.toUpperCase().includes('FALL') || raw.includes('跌倒')
  }

  function sortByAlarmTime(items: MiniAlarmLike[]) {
    return items.slice().sort((left, right) =>
      new Date(left.alarmTime || 0).getTime() - new Date(right.alarmTime || 0).getTime(),
    )
  }

  function normalizeAlarm(item: MiniAlarmLike) {
    const memberName = item.memberName || '未知成员'
    const location = item.location || item.familyAddress || '未知位置'
    return {
      ...item,
      memberName,
      location,
      overlayTypeLabel: resolveAlarmTypeLabel(item),
      overlayDescription: item.description || `${memberName}发生跌倒报警`,
      guardianPrompt: `${memberName}跌倒，请确认`,
    }
  }

  function openNextAlarm() {
    if (state.activeAlarm || !state.queue.length) return
    state.activeAlarm = state.queue.shift() || null
    state.selectedResult = ''
  }

  function enqueueAlarms(items: MiniAlarmLike[]) {
    const seenIds = getSeenIds()
    const unseenItems = sortByAlarmTime(items)
      .filter((item) => !seenIds.includes(item.id))
      .map(normalizeAlarm)

    if (!unseenItems.length) return

    state.queue = sortByAlarmTime(state.queue.concat(unseenItems))
    setSeenIds(seenIds.concat(unseenItems.map((item) => item.id)))
    openNextAlarm()
  }

  function getOverlayState() {
    const viewerRole = currentRole()
    const confirmOnly = viewerRole === 'guardian'
    return {
      visible: !!state.activeAlarm,
      viewerRole,
      confirmOnly,
      actionText: confirmOnly ? '确认' : '关闭',
      selectedResult: state.selectedResult,
      submitting: state.submitting,
      alarm: state.activeAlarm
        ? {
            id: state.activeAlarm.id,
            memberName: state.activeAlarm.memberName,
            location: (state.activeAlarm as any).location,
            familyAddress: state.activeAlarm.familyAddress || (state.activeAlarm as any).location,
            alarmTime: state.activeAlarm.alarmTime,
            alarmType: (state.activeAlarm as any).overlayTypeLabel,
            description: (state.activeAlarm as any).overlayDescription,
            guardianPrompt: (state.activeAlarm as any).guardianPrompt,
          }
        : null,
    }
  }

  async function poll() {
    ensureAccountScope()
    if (!isEnabled()) {
      stop()
      resetActiveQueue()
      return
    }
    if (state.loading || state.submitting) return

    state.loading = true
    try {
      const alarms = await getAlarms({ status: 'unhandled' })
      const fallAlarms = (alarms || []).filter((item: any) => item.status === 'unhandled' && isFallAlarm(item))
      enqueueAlarms(fallAlarms)
    } catch {}
    state.loading = false
  }

  function start() {
    ensureAccountScope()
    if (!isEnabled()) {
      stop()
      resetActiveQueue()
      return
    }
    if (!state.pollingTimer) {
      state.pollingTimer = setInterval(() => {
        void poll()
      }, 1000)
    }
    void poll()
  }

  function stop() {
    if (state.pollingTimer) {
      clearInterval(state.pollingTimer)
      state.pollingTimer = null
    }
  }

  function selectResult(result: AlarmResult) {
    if (isGuardianRole()) return
    state.selectedResult = result === 'HANDLED' || result === 'IGNORED' ? result : ''
  }

  async function submit() {
    if (!state.activeAlarm) return
    const confirmOnly = isGuardianRole()
    if (!confirmOnly && !state.selectedResult) {
      wx.showToast({ title: '请选择处理结果', icon: 'none' })
      return
    }
    if (state.submitting) return

    state.submitting = true
    const currentAlarm = state.activeAlarm
    try {
      if (confirmOnly) {
        wx.showToast({ title: '已确认', icon: 'none' })
      } else if (state.selectedResult === 'HANDLED') {
        await handleAlarm(currentAlarm.id, {
          calledGuardian: true,
          memberDanger: true,
          handled: true,
          remark: '全局跌倒报警已处理',
        })
      } else {
        await ignoreAlarm(currentAlarm.id)
      }

      if (!confirmOnly) {
        wx.showToast({
          title: state.selectedResult === 'HANDLED' ? '报警已处理' : '报警已忽略',
          icon: 'none',
        })
      }

      state.activeAlarm = null
      state.selectedResult = ''
      openNextAlarm()
      void poll()
    } catch {
      wx.showToast({ title: confirmOnly ? '确认失败，请重试' : '处理失败，请重试', icon: 'none' })
    }
    state.submitting = false
  }

  function reset() {
    stop()
    resetActiveQueue()
    state.loading = false
    state.submitting = false
    state.activeAccountKey = ''
    state.seenByAccount = {}
  }

  return {
    start,
    stop,
    poll,
    selectResult,
    submit,
    getOverlayState,
    reset,
  }
}
