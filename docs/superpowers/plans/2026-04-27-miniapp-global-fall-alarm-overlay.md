# Mini Program Global Fall Alarm Overlay Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a foreground-only global fall alarm overlay for guardian and staff mini-program pages, with one-second polling, serial queueing, red glow, and close-to-handle behavior.

**Architecture:** Create a single app-level alarm manager that polls `/mini/alarms`, filters fall alarms, deduplicates by current account, and pushes overlay state into the current page. Render the overlay through a reusable component mounted from shared host components (`staff-navbar`, `staff-tabbar`, `guardian-tabbar`) plus direct page inserts for guardian detail pages that do not use a shared host.

**Tech Stack:** WeChat Mini Program, page/component WXML/WXSS, app-level JavaScript state, existing mini-program request utilities and alarm APIs.

---

### Task 1: Add the reusable overlay component

**Files:**
- Create: `卓凯安伴小程序/miniprogram/components/global-alarm-overlay/global-alarm-overlay.json`
- Create: `卓凯安伴小程序/miniprogram/components/global-alarm-overlay/global-alarm-overlay.wxml`
- Create: `卓凯安伴小程序/miniprogram/components/global-alarm-overlay/global-alarm-overlay.wxss`
- Create: `卓凯安伴小程序/miniprogram/components/global-alarm-overlay/global-alarm-overlay.ts`
- Create: `卓凯安伴小程序/miniprogram/components/global-alarm-overlay/global-alarm-overlay.js`

- [ ] Define a single `state` property and expose result/close actions through `getApp()`.

```ts
Component({
  properties: {
    state: {
      type: Object,
      value: {
        visible: false,
        selectedResult: '',
        alarm: null,
      },
    },
  },
  methods: {
    selectResult(e: any) {
      getApp<any>().setGlobalAlarmResult?.(e.currentTarget.dataset.value)
    },
    closeAlarm() {
      getApp<any>().submitGlobalAlarmResult?.()
    },
  },
})
```

- [ ] Render the red glow, detail rows, result selector, and disabled close state in WXML/WXSS.

```xml
<view wx:if="{{state.visible}}" class="alarm-overlay">
  <view class="alarm-glow"></view>
  <view class="alarm-card">
    <view class="alarm-title">跌倒报警</view>
    <view class="alarm-row"><text>成员姓名</text><text>{{state.alarm.memberName || '未知成员'}}</text></view>
    <view class="alarm-row"><text>发生位置</text><text>{{state.alarm.location || state.alarm.familyAddress || '未知位置'}}</text></view>
  </view>
</view>
```

### Task 2: Build the app-level global alarm manager

**Files:**
- Modify: `卓凯安伴小程序/miniprogram/app.js`
- Create: `卓凯安伴小程序/miniprogram/utils/global-alarm-manager.js`

- [ ] Create manager state and public app hooks.

```js
function createInitialAlarmState() {
  return {
    queue: [],
    activeAlarm: null,
    seenByAccount: {},
    selectedResult: '',
    pollingTimer: null,
    loading: false,
  }
}
```

- [ ] Poll `/mini/alarms` every second in the foreground, filter fall alarms, and deduplicate by account key.

```js
function isFallAlarm(item) {
  const type = String(item?.type || item?.alarmType || '').toUpperCase()
  return type.includes('FALL') || String(item?.type || item?.alarmType || '').includes('跌倒')
}
```

- [ ] Push render state into the current page with `getCurrentPages()` so page JavaScript does not need custom handlers.

```js
function syncAlarmStateToCurrentPage(app) {
  const pages = getCurrentPages()
  const current = pages[pages.length - 1]
  if (!current || typeof current.setData !== 'function') return
  current.setData({
    globalAlarmState: {
      visible: !!app.globalData.globalAlarm.activeAlarm,
      selectedResult: app.globalData.globalAlarm.selectedResult,
      alarm: app.globalData.globalAlarm.activeAlarm,
    },
  })
}
```

- [ ] Wire `App.onShow`, `App.onHide`, `setGlobalAlarmResult`, and `submitGlobalAlarmResult`.

```js
onShow() {
  this.startGlobalAlarmPolling?.()
}

onHide() {
  this.stopGlobalAlarmPolling?.()
}
```

### Task 3: Mount the overlay from shared host components

**Files:**
- Modify: `卓凯安伴小程序/miniprogram/components/staff-navbar/staff-navbar.json`
- Modify: `卓凯安伴小程序/miniprogram/components/staff-navbar/staff-navbar.wxml`
- Modify: `卓凯安伴小程序/miniprogram/components/staff-tabbar/staff-tabbar.json`
- Modify: `卓凯安伴小程序/miniprogram/components/staff-tabbar/staff-tabbar.wxml`
- Modify: `卓凯安伴小程序/miniprogram/components/guardian-tabbar/guardian-tabbar.json`
- Modify: `卓凯安伴小程序/miniprogram/components/guardian-tabbar/guardian-tabbar.wxml`

- [ ] Register the overlay component in each shared host JSON file.

```json
{
  "component": true,
  "usingComponents": {
    "global-alarm-overlay": "/components/global-alarm-overlay/global-alarm-overlay"
  }
}
```

- [ ] Render the overlay once in each shared host WXML file.

```xml
<global-alarm-overlay state="{{globalAlarmState}}" />
```

### Task 4: Mount the overlay on guardian pages without a shared host

**Files:**
- Modify: `卓凯安伴小程序/miniprogram/pages/guardian/device/bind/bind.json`
- Modify: `卓凯安伴小程序/miniprogram/pages/guardian/device/bind/bind.wxml`
- Modify: `卓凯安伴小程序/miniprogram/pages/guardian/device/bindResult/bindResult.json`
- Modify: `卓凯安伴小程序/miniprogram/pages/guardian/device/bindResult/bindResult.wxml`
- Modify: `卓凯安伴小程序/miniprogram/pages/guardian/member/create/create.json`
- Modify: `卓凯安伴小程序/miniprogram/pages/guardian/member/create/create.wxml`
- Modify: `卓凯安伴小程序/miniprogram/pages/guardian/member/switch/switch.json`
- Modify: `卓凯安伴小程序/miniprogram/pages/guardian/member/switch/switch.wxml`
- Modify: `卓凯安伴小程序/miniprogram/pages/guardian/monitor/alarm/alarm.json`
- Modify: `卓凯安伴小程序/miniprogram/pages/guardian/monitor/alarm/alarm.wxml`
- Modify: `卓凯安伴小程序/miniprogram/pages/guardian/monitor/history/history.json`
- Modify: `卓凯安伴小程序/miniprogram/pages/guardian/monitor/history/history.wxml`
- Modify: `卓凯安伴小程序/miniprogram/pages/guardian/profile/alarmSettings/alarmSettings.json`
- Modify: `卓凯安伴小程序/miniprogram/pages/guardian/profile/alarmSettings/alarmSettings.wxml`
- Modify: `卓凯安伴小程序/miniprogram/pages/guardian/profile/edit/edit.json`
- Modify: `卓凯安伴小程序/miniprogram/pages/guardian/profile/edit/edit.wxml`
- Modify: `卓凯安伴小程序/miniprogram/pages/guardian/profile/feedback/feedback.json`
- Modify: `卓凯安伴小程序/miniprogram/pages/guardian/profile/feedback/feedback.wxml`
- Modify: `卓凯安伴小程序/miniprogram/pages/guardian/profile/serviceCenter/serviceCenter.json`
- Modify: `卓凯安伴小程序/miniprogram/pages/guardian/profile/serviceCenter/serviceCenter.wxml`
- Modify: `卓凯安伴小程序/miniprogram/pages/guardian/profile/settings/settings.json`
- Modify: `卓凯安伴小程序/miniprogram/pages/guardian/profile/settings/settings.wxml`
- Modify: `卓凯安伴小程序/miniprogram/pages/guardian/profile/profileEdit/profileEdit.json`
- Modify: `卓凯安伴小程序/miniprogram/pages/guardian/profile/profileEdit/profileEdit.wxml`
- Modify: `卓凯安伴小程序/miniprogram/pages/guardian/service/doctorDetail/doctorDetail.json`
- Modify: `卓凯安伴小程序/miniprogram/pages/guardian/service/doctorDetail/doctorDetail.wxml`
- Modify: `卓凯安伴小程序/miniprogram/pages/guardian/service/medicineDetail/medicineDetail.json`
- Modify: `卓凯安伴小程序/miniprogram/pages/guardian/service/medicineDetail/medicineDetail.wxml`
- Modify: `卓凯安伴小程序/miniprogram/pages/guardian/service/newsDetail/newsDetail.json`
- Modify: `卓凯安伴小程序/miniprogram/pages/guardian/service/newsDetail/newsDetail.wxml`
- Modify: `卓凯安伴小程序/miniprogram/pages/guardian/order/detail/detail.json`
- Modify: `卓凯安伴小程序/miniprogram/pages/guardian/order/detail/detail.wxml`

- [ ] Register the overlay component on each guardian detail page that does not already use `guardian-tabbar`.

```json
{
  "usingComponents": {
    "global-alarm-overlay": "/components/global-alarm-overlay/global-alarm-overlay"
  }
}
```

- [ ] Insert the overlay component once near the end of each page root.

```xml
<global-alarm-overlay state="{{globalAlarmState}}" />
```

### Task 5: Verify foreground-only behavior and result submission

**Files:**
- Modify: none

- [ ] Smoke test guardian and staff logins in the mini-program developer tools.

Run: open WeChat DevTools and verify:
- guardian pages receive only their own fall alarms
- staff pages receive only their bound-family fall alarms
- selecting `已处理` or `已忽略` then closing updates the server state
- backgrounding the mini-program pauses new polling until foreground resumes

- [ ] Commit the mini-program changes.

```bash
git add miniprogram/app.js miniprogram/utils/global-alarm-manager.js miniprogram/components/global-alarm-overlay miniprogram/components/staff-navbar miniprogram/components/staff-tabbar miniprogram/components/guardian-tabbar miniprogram/pages/guardian docs/superpowers/plans/2026-04-27-miniapp-global-fall-alarm-overlay.md
git commit -m "feat: add miniapp global fall alarm overlay"
```
