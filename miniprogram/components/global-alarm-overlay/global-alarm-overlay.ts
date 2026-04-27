Component({
  data: {
    state: {
      visible: false,
      viewerRole: '',
      confirmOnly: false,
      actionText: '关闭',
      selectedResult: '',
      submitting: false,
      alarm: null as any,
    },
  },
  lifetimes: {
    attached() {
      const component = this as any
      const app = getApp<any>()
      app.startGlobalAlarmPolling?.()
      component.syncState?.()
      component.__alarmSyncTimer = setInterval(() => {
        component.syncState?.()
      }, 250)
    },
    detached() {
      const component = this as any
      if (component.__alarmSyncTimer) {
        clearInterval(component.__alarmSyncTimer)
        component.__alarmSyncTimer = null
      }
    },
  },
  methods: {
    syncState() {
      const app = getApp<any>()
      const state = app.getGlobalAlarmOverlayState?.()
      if (state) {
        this.setData({ state })
      }
    },
    selectResult(e: WechatMiniprogram.TouchEvent) {
      if (this.data.state.submitting || this.data.state.confirmOnly) return
      const value = e.currentTarget.dataset.value
      const app = getApp<any>()
      app.setGlobalAlarmResult?.(value)
      this.syncState()
    },
    closeAlarm() {
      const { selectedResult, submitting, confirmOnly } = this.data.state
      if (submitting) return
      if (!confirmOnly && !selectedResult) return
      const app = getApp<any>()
      Promise.resolve(app.submitGlobalAlarmResult?.()).finally(() => {
        setTimeout(() => this.syncState(), 0)
      })
    },
  },
})
