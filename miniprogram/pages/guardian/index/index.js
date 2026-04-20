"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var api_1 = require("../../../utils/api");
var HOME_CHART_POINT_LIMIT = 24;
function formatLocalDate(input) {
    return "".concat(input.getFullYear(), "-").concat(String(input.getMonth() + 1).padStart(2, '0'), "-").concat(String(input.getDate()).padStart(2, '0'));
}
Page({
    data: {
        statusH: 0,
        hasMember: false,
        member: {},
        vitals: {},
        breathHistory: {},
        heartHistory: {},
        chartW: 300,
        loading: false,
        latestAlarmId: null
    },
    onLoad: function () {
        var _a = wx.getSystemInfoSync(), statusBarHeight = _a.statusBarHeight, windowWidth = _a.windowWidth;
        this.setData({ statusH: statusBarHeight || 0, chartW: windowWidth - 96 });
    },
    onShow: function () {
        this.loadData();
    },
    loadData: function () {
        return __awaiter(this, void 0, void 0, function () {
            var members, savedId_1, member, end, start, startDate, endDate, _a, vitalsRes, breathRes, heartRes, alarmRes, vitals, isWarn, breathHistory_1, heartHistory_1, err_1;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.setData({ loading: true });
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, 5, 6]);
                        return [4 /*yield*/, (0, api_1.getMemberList)()];
                    case 2:
                        members = _b.sent();
                        if (members.length === 0) {
                            this.setData({ hasMember: false, member: {}, vitals: {}, latestAlarmId: null });
                            return [2 /*return*/];
                        }
                        savedId_1 = wx.getStorageSync('currentMemberId');
                        member = members.find(function (item) { return String(item.id) === String(savedId_1); }) || members[0];
                        wx.setStorageSync('currentMemberId', member.id);
                        this.setData({ hasMember: true, member: member });
                        end = new Date();
                        start = new Date(end);
                        start.setDate(end.getDate() - 1);
                        startDate = formatLocalDate(start);
                        endDate = formatLocalDate(end);
                        return [4 /*yield*/, Promise.allSettled([
                                (0, api_1.getMonitorRealtime)(member.id),
                                (0, api_1.getMonitorHistory)({ memberId: member.id, type: 'breathRate', startDate: startDate, endDate: endDate }),
                                (0, api_1.getMonitorHistory)({ memberId: member.id, type: 'heartRate', startDate: startDate, endDate: endDate }),
                                (0, api_1.getAlarms)({ memberId: String(member.id), status: 'unhandled' })
                            ])];
                    case 3:
                        _a = __read.apply(void 0, [_b.sent(), 4]), vitalsRes = _a[0], breathRes = _a[1], heartRes = _a[2], alarmRes = _a[3];
                        vitals = vitalsRes.status === 'fulfilled' ? (vitalsRes.value || {}) : {};
                        isWarn = vitals.heartStatus === '异常' || vitals.breathStatus === '异常' || vitals.fallStatus === true;
                        member.status = isWarn ? 'warn' : 'normal';
                        this.setData({ vitals: vitals, member: member });
                        if (breathRes.status === 'fulfilled' && breathRes.value) {
                            breathHistory_1 = this.buildHistoryStat(breathRes.value, vitals.breathStatus);
                            this.setData({ breathHistory: breathHistory_1 });
                            setTimeout(function () { return _this.drawChart('breathChart', breathHistory_1.values, '#7B68EE'); }, 80);
                        }
                        if (heartRes.status === 'fulfilled' && heartRes.value) {
                            heartHistory_1 = this.buildHistoryStat(heartRes.value, vitals.heartStatus);
                            this.setData({ heartHistory: heartHistory_1 });
                            setTimeout(function () { return _this.drawChart('heartChart', heartHistory_1.values, '#7B68EE'); }, 80);
                        }
                        if (alarmRes.status === 'fulfilled' && alarmRes.value.length > 0) {
                            this.setData({ latestAlarmId: alarmRes.value[0].id || null });
                        }
                        else {
                            this.setData({ latestAlarmId: null });
                        }
                        return [3 /*break*/, 6];
                    case 4:
                        err_1 = _b.sent();
                        wx.showToast({ title: err_1.message || '加载失败', icon: 'none' });
                        return [3 /*break*/, 6];
                    case 5:
                        this.setData({ loading: false });
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    },
    buildHistoryStat: function (data, rawStatus) {
        var hours = Array.isArray(data === null || data === void 0 ? void 0 : data.hours) ? data.hours : [];
        var points = (Array.isArray(data === null || data === void 0 ? void 0 : data.values) ? data.values : [])
            .map(function (rawValue, index) { return ({
            value: Number(rawValue),
            time: hours[index] || ''
        }); })
            .filter(function (item) { return !Number.isNaN(item.value); })
            .slice(-HOME_CHART_POINT_LIMIT);
        var values = points.map(function (item) { return item.value; });
        var displayHours = points.map(function (item) { return item.time; });
        if (!values.length) {
            var status_1 = rawStatus || '正常';
            return { avg: '--', max: '--', min: '--', startTime: '--', endTime: '--', status: status_1, isWarn: status_1 === '异常', values: [] };
        }
        var sum = values.reduce(function (total, value) { return total + value; }, 0);
        var fmt = function (ts) {
            if (!ts)
                return '--';
            var d = new Date(ts);
            return "".concat(String(d.getHours()).padStart(2, '0'), ":").concat(String(d.getMinutes()).padStart(2, '0'));
        };
        var status = rawStatus || '正常';
        return {
            avg: (sum / values.length).toFixed(1),
            max: Math.max.apply(Math, __spreadArray([], __read(values), false)).toFixed(1),
            min: Math.min.apply(Math, __spreadArray([], __read(values), false)).toFixed(1),
            startTime: fmt(displayHours[0]),
            endTime: fmt(displayHours[displayHours.length - 1]),
            status: status,
            isWarn: status === '异常',
            values: values
        };
    },
    drawChart: function (canvasId, values, strokeColor) {
        if (!values.length)
            return;
        var width = this.data.chartW;
        var height = 80;
        var padding = { t: 6, r: 2, b: 6, l: 2 };
        var drawWidth = width - padding.l - padding.r;
        var drawHeight = height - padding.t - padding.b;
        var max = Math.max.apply(Math, __spreadArray([], __read(values), false));
        var min = Math.min.apply(Math, __spreadArray([], __read(values), false));
        var range = max - min || 1;
        var ctx = wx.createCanvasContext(canvasId, this);
        var gradient = ctx.createLinearGradient(0, padding.t, 0, height);
        gradient.addColorStop(0, 'rgba(123,104,238,0.20)');
        gradient.addColorStop(1, 'rgba(123,104,238,0.00)');
        var points = values.map(function (value, index) { return ({
            x: padding.l + (index / Math.max(values.length - 1, 1)) * drawWidth,
            y: padding.t + drawHeight - ((value - min) / range) * drawHeight
        }); });
        ctx.beginPath();
        ctx.setFillStyle(gradient);
        points.forEach(function (point, index) { return index === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y); });
        ctx.lineTo(points[points.length - 1].x, height);
        ctx.lineTo(points[0].x, height);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.setStrokeStyle(strokeColor);
        ctx.setLineWidth(1.5);
        ctx.setLineCap('round');
        ctx.setLineJoin('round');
        points.forEach(function (point, index) { return index === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y); });
        ctx.stroke();
        ctx.draw();
    },
    goBreathHistory: function () {
        wx.navigateTo({ url: "/pages/guardian/monitor/history/history?memberId=".concat(this.data.member.id, "&type=breathRate") });
    },
    goHeartHistory: function () {
        wx.navigateTo({ url: "/pages/guardian/monitor/history/history?memberId=".concat(this.data.member.id, "&type=heartRate") });
    },
    goLatestAlarm: function () {
        var _a;
        var memberId = (_a = this.data.member) === null || _a === void 0 ? void 0 : _a.id;
        if (!memberId)
            return;
        if (this.data.latestAlarmId) {
            wx.navigateTo({ url: "/pages/guardian/monitor/alarm/alarm?id=".concat(this.data.latestAlarmId) });
            return;
        }
        wx.navigateTo({ url: "/pages/guardian/monitor/alarm/alarm?id=latest&memberId=".concat(memberId) });
    },
    goSwitch: function () { wx.navigateTo({ url: '/pages/guardian/member/switch/switch' }); },
    goBindDevice: function () { wx.navigateTo({ url: '/pages/guardian/device/bind/bind' }); },
    onPullDownRefresh: function () { this.loadData().then(function () { return wx.stopPullDownRefresh(); }); }
});
