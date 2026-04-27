"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGlobalAlarmManager = createGlobalAlarmManager;
var api_1 = require("./api");
var session_1 = require("./session");
function createGlobalAlarmManager(app) {
    var state = {
        queue: [],
        activeAlarm: null,
        selectedResult: '',
        pollingTimer: null,
        loading: false,
        submitting: false,
        activeAccountKey: '',
        seenByAccount: {},
    };
    function supportedRole(role) {
        return role === 'guardian' || role === 'staff';
    }
    function currentRole() {
        return app.globalData.role || wx.getStorageSync('role') || '';
    }
    function isGuardianRole() {
        return currentRole() === 'guardian';
    }
    function currentAccountKey() {
        var role = currentRole();
        var userInfo = app.globalData.userInfo || (0, session_1.getStoredUserInfo)();
        var userId = (userInfo === null || userInfo === void 0 ? void 0 : userInfo.id) || (userInfo === null || userInfo === void 0 ? void 0 : userInfo.userId) || (userInfo === null || userInfo === void 0 ? void 0 : userInfo.mobile) || (userInfo === null || userInfo === void 0 ? void 0 : userInfo.phone) || '';
        return role && userId ? "".concat(role, ":").concat(userId) : '';
    }
    function resetActiveQueue() {
        state.queue = [];
        state.activeAlarm = null;
        state.selectedResult = '';
    }
    function ensureAccountScope() {
        var nextKey = currentAccountKey();
        if (state.activeAccountKey && state.activeAccountKey !== nextKey) {
            resetActiveQueue();
        }
        state.activeAccountKey = nextKey;
        if (nextKey && !state.seenByAccount[nextKey]) {
            state.seenByAccount[nextKey] = [];
        }
        return nextKey;
    }
    function isEnabled() {
        var token = app.globalData.token || wx.getStorageSync('token') || '';
        return !!token && supportedRole(currentRole());
    }
    function getSeenIds() {
        var key = ensureAccountScope();
        return key ? (state.seenByAccount[key] || []) : [];
    }
    function setSeenIds(ids) {
        var key = ensureAccountScope();
        if (!key) {
            return;
        }
        state.seenByAccount[key] = Array.from(new Set(ids));
    }
    function resolveAlarmTypeLabel(item) {
        var raw = String((item === null || item === void 0 ? void 0 : item.type) || (item === null || item === void 0 ? void 0 : item.alarmType) || '');
        if (!raw) {
            return '跌倒';
        }
        if (raw.toUpperCase().includes('FALL') || raw.includes('跌倒')) {
            return '跌倒';
        }
        return raw;
    }
    function isFallAlarm(item) {
        var raw = String((item === null || item === void 0 ? void 0 : item.type) || (item === null || item === void 0 ? void 0 : item.alarmType) || '');
        return raw.toUpperCase().includes('FALL') || raw.includes('跌倒');
    }
    function sortByAlarmTime(items) {
        return items.slice().sort(function (left, right) {
            return new Date(left.alarmTime || 0).getTime() - new Date(right.alarmTime || 0).getTime();
        });
    }
    function normalizeAlarm(item) {
        var memberName = item.memberName || '未知成员';
        var location = item.location || item.familyAddress || '未知位置';
        return Object.assign(Object.assign({}, item), { memberName: memberName, location: location, overlayTypeLabel: resolveAlarmTypeLabel(item), overlayDescription: item.description || "".concat(memberName, "\u53D1\u751F\u8DCC\u5012\u62A5\u8B66"), guardianPrompt: "".concat(memberName, "\u8DCC\u5012\uFF0C\u8BF7\u786E\u8BA4") });
    }
    function openNextAlarm() {
        if (state.activeAlarm || !state.queue.length) {
            return;
        }
        state.activeAlarm = state.queue.shift() || null;
        state.selectedResult = '';
    }
    function enqueueAlarms(items) {
        var seenIds = getSeenIds();
        var unseenItems = sortByAlarmTime(items)
            .filter(function (item) { return !seenIds.includes(item.id); })
            .map(normalizeAlarm);
        if (!unseenItems.length) {
            return;
        }
        state.queue = sortByAlarmTime(state.queue.concat(unseenItems));
        setSeenIds(seenIds.concat(unseenItems.map(function (item) { return item.id; })));
        openNextAlarm();
    }
    function getOverlayState() {
        var viewerRole = currentRole();
        var confirmOnly = viewerRole === 'guardian';
        return {
            visible: !!state.activeAlarm,
            viewerRole: viewerRole,
            confirmOnly: confirmOnly,
            actionText: confirmOnly ? '确认' : '关闭',
            selectedResult: state.selectedResult,
            submitting: state.submitting,
            alarm: state.activeAlarm
                ? {
                    id: state.activeAlarm.id,
                    memberName: state.activeAlarm.memberName,
                    location: state.activeAlarm.location,
                    familyAddress: state.activeAlarm.familyAddress || state.activeAlarm.location,
                    alarmTime: state.activeAlarm.alarmTime,
                    alarmType: state.activeAlarm.overlayTypeLabel,
                    description: state.activeAlarm.overlayDescription,
                    guardianPrompt: state.activeAlarm.guardianPrompt,
                }
                : null,
        };
    }
    async function poll() {
        ensureAccountScope();
        if (!isEnabled()) {
            stop();
            resetActiveQueue();
            return;
        }
        if (state.loading || state.submitting) {
            return;
        }
        state.loading = true;
        try {
            var alarms = await (0, api_1.getAlarms)({ status: 'unhandled' });
            var fallAlarms = (alarms || []).filter(function (item) { return item.status === 'unhandled' && isFallAlarm(item); });
            enqueueAlarms(fallAlarms);
        }
        catch (_a) { }
        state.loading = false;
    }
    function start() {
        ensureAccountScope();
        if (!isEnabled()) {
            stop();
            resetActiveQueue();
            return;
        }
        if (!state.pollingTimer) {
            state.pollingTimer = setInterval(function () {
                void poll();
            }, 1000);
        }
        void poll();
    }
    function stop() {
        if (state.pollingTimer) {
            clearInterval(state.pollingTimer);
            state.pollingTimer = null;
        }
    }
    function selectResult(result) {
        if (isGuardianRole()) {
            return;
        }
        state.selectedResult = result === 'HANDLED' || result === 'IGNORED' ? result : '';
    }
    async function submit() {
        if (!state.activeAlarm) {
            return;
        }
        var confirmOnly = isGuardianRole();
        if (!confirmOnly && !state.selectedResult) {
            wx.showToast({ title: '请选择处理结果', icon: 'none' });
            return;
        }
        if (state.submitting) {
            return;
        }
        state.submitting = true;
        var currentAlarm = state.activeAlarm;
        try {
            if (confirmOnly) {
                wx.showToast({ title: '已确认', icon: 'none' });
            }
            else if (state.selectedResult === 'HANDLED') {
                await (0, api_1.handleAlarm)(currentAlarm.id, {
                    calledGuardian: true,
                    memberDanger: true,
                    handled: true,
                    remark: '全局跌倒报警已处理',
                });
                wx.showToast({ title: '报警已处理', icon: 'none' });
            }
            else {
                await (0, api_1.ignoreAlarm)(currentAlarm.id);
                wx.showToast({ title: '报警已忽略', icon: 'none' });
            }
            state.activeAlarm = null;
            state.selectedResult = '';
            openNextAlarm();
            void poll();
        }
        catch (_a) {
            wx.showToast({ title: confirmOnly ? '确认失败，请重试' : '处理失败，请重试', icon: 'none' });
        }
        state.submitting = false;
    }
    function reset() {
        stop();
        resetActiveQueue();
        state.loading = false;
        state.submitting = false;
        state.activeAccountKey = '';
        state.seenByAccount = {};
    }
    return {
        start: start,
        stop: stop,
        poll: poll,
        selectResult: selectResult,
        submit: submit,
        getOverlayState: getOverlayState,
        reset: reset,
    };
}
