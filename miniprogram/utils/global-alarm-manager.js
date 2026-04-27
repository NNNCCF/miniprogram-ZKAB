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
        if (!key)
            return;
        state.seenByAccount[key] = Array.from(new Set(ids));
    }
    function resolveAlarmTypeLabel(item) {
        var raw = String((item === null || item === void 0 ? void 0 : item.type) || (item === null || item === void 0 ? void 0 : item.alarmType) || '');
        if (!raw)
            return '跌倒';
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
        return Object.assign(Object.assign({}, item), { memberName: memberName, location: location, overlayTypeLabel: resolveAlarmTypeLabel(item), overlayDescription: item.description || "".concat(memberName, "\u53D1\u751F\u8DCC\u5012\u62A5\u8B66") });
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
            .filter(function (item) { return !(seenIds.includes(item.id)); })
            .map(normalizeAlarm);
        if (!unseenItems.length) {
            return;
        }
        state.queue = sortByAlarmTime(state.queue.concat(unseenItems));
        setSeenIds(seenIds.concat(unseenItems.map(function (item) { return item.id; })));
        openNextAlarm();
    }
    function getOverlayState() {
        return {
            visible: !!state.activeAlarm,
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
                }
                : null,
        };
    }
    function poll() {
        return __awaiter(this, void 0, void 0, function () {
            var alarms, fallAlarms;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ensureAccountScope();
                        if (!isEnabled()) {
                            stop();
                            resetActiveQueue();
                            return [2 /*return*/];
                        }
                        if (state.loading || state.submitting) {
                            return [2 /*return*/];
                        }
                        state.loading = true;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, (0, api_1.getAlarms)({ status: 'unhandled' })];
                    case 2:
                        alarms = _a.sent();
                        fallAlarms = (alarms || []).filter(function (item) { return item.status === 'unhandled' && isFallAlarm(item); });
                        enqueueAlarms(fallAlarms);
                        return [3 /*break*/, 5];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        state.loading = false;
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
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
        state.selectedResult = result === 'HANDLED' || result === 'IGNORED' ? result : '';
    }
    function submit() {
        return __awaiter(this, void 0, void 0, function () {
            var currentAlarm, successText;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!state.activeAlarm) {
                            return [2 /*return*/];
                        }
                        if (!state.selectedResult) {
                            wx.showToast({ title: '请选择处理结果', icon: 'none' });
                            return [2 /*return*/];
                        }
                        if (state.submitting) {
                            return [2 /*return*/];
                        }
                        state.submitting = true;
                        currentAlarm = state.activeAlarm;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, 7, 8]);
                        if (!(state.selectedResult === 'HANDLED')) return [3 /*break*/, 3];
                        return [4 /*yield*/, (0, api_1.handleAlarm)(currentAlarm.id, {
                                calledGuardian: true,
                                memberDanger: true,
                                handled: true,
                                remark: '全局跌倒报警已处理',
                            })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, (0, api_1.ignoreAlarm)(currentAlarm.id)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        successText = state.selectedResult === 'HANDLED' ? '报警已处理' : '报警已忽略';
                        wx.showToast({ title: successText, icon: 'none' });
                        state.activeAlarm = null;
                        state.selectedResult = '';
                        openNextAlarm();
                        void poll();
                        return [3 /*break*/, 8];
                    case 6:
                        _a.sent();
                        wx.showToast({ title: '处理失败，请重试', icon: 'none' });
                        return [3 /*break*/, 8];
                    case 7:
                        state.submitting = false;
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
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
function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}
function __generator(thisArg, body) {
    var _ = { label: 0, sent: function () { if (t[0] & 1)
            throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f)
            throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _)
            try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                    return t;
                if (y = 0, t)
                    op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0:
                    case 1:
                        t = op;
                        break;
                    case 4:
                        _.label++;
                        return { value: op[1], done: false };
                    case 5:
                        _.label++;
                        y = op[1];
                        op = [0];
                        continue;
                    case 7:
                        op = _.ops.pop();
                        _.trys.pop();
                        continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                            _ = 0;
                            continue;
                        }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                            _.label = op[1];
                            break;
                        }
                        if (op[0] === 6 && _.label < t[1]) {
                            _.label = t[1];
                            t = op;
                            break;
                        }
                        if (t && _.label < t[2]) {
                            _.label = t[2];
                            _.ops.push(op);
                            break;
                        }
                        if (t[2])
                            _.ops.pop();
                        _.trys.pop();
                        continue;
                }
                op = body.call(thisArg, _);
            }
            catch (e) {
                op = [6, e];
                y = 0;
            }
            finally {
                f = t = 0;
            }
        if (op[0] & 5)
            throw op[1];
        return { value: op[0] ? op[1] : void 0, done: true };
    }
}
