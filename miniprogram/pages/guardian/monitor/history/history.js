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
var api_1 = require("../../../../utils/api");
var app = getApp();
function formatDate(input) {
    return "".concat(input.getFullYear(), "-").concat(String(input.getMonth() + 1).padStart(2, '0'), "-").concat(String(input.getDate()).padStart(2, '0'));
}
function warnHeart(value) {
    return value < 60 || value > 100;
}
function warnBreath(value) {
    return value < 12 || value > 20;
}
Page({
    data: {
        statusH: 0,
        memberId: null,
        memberName: '',
        currentHeartRate: '--',
        heartRateWarn: false,
        currentBreath: '--',
        breathWarn: false,
        chartType: 'heartRate',
        yLabels: [],
        xLabels: [],
        canvasW: 280,
        canvasH: 160,
        loading: false,
        historyList: [],
        heartRatePoints: [],
        breathPoints: []
    },
    onLoad: function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var info;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        info = wx.getSystemInfoSync();
                        this.setData({
                            statusH: app.globalData.statusBarHeight || 0,
                            canvasW: Math.floor(info.windowWidth - 56),
                            canvasH: 160,
                            chartType: (options === null || options === void 0 ? void 0 : options.type) === 'breathRate' ? 'breathRate' : 'heartRate'
                        });
                        return [4 /*yield*/, this.resolveMember(options === null || options === void 0 ? void 0 : options.memberId)];
                    case 1:
                        _a.sent();
                        this.loadData();
                        return [2 /*return*/];
                }
            });
        });
    },
    resolveMember: function (memberId) {
        return __awaiter(this, void 0, void 0, function () {
            var members, savedId_1, current, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, api_1.getMemberList)()];
                    case 1:
                        members = _b.sent();
                        if (!members.length)
                            return [2 /*return*/];
                        savedId_1 = memberId || wx.getStorageSync('currentMemberId');
                        current = members.find(function (item) { return String(item.id) === String(savedId_1); }) || members[0];
                        wx.setStorageSync('currentMemberId', current.id);
                        this.setData({ memberId: current.id, memberName: current.name || '' });
                        return [3 /*break*/, 3];
                    case 2:
                        _a = _b.sent();
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    loadData: function () {
        return __awaiter(this, void 0, void 0, function () {
            var end, start, _a, heartRaw, breathRaw, heartRatePoints, breathPoints, latestHeart, latestBreath, err_1;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.data.memberId) {
                            this.setData({ loading: false, historyList: [], heartRatePoints: [], breathPoints: [] });
                            return [2 /*return*/];
                        }
                        end = new Date();
                        start = new Date();
                        start.setDate(end.getDate() - 6);
                        this.setData({ loading: true });
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, Promise.all([
                                (0, api_1.getMonitorHistory)({ memberId: this.data.memberId, type: 'heartRate', startDate: formatDate(start), endDate: formatDate(end) }),
                                (0, api_1.getMonitorHistory)({ memberId: this.data.memberId, type: 'breathRate', startDate: formatDate(start), endDate: formatDate(end) })
                            ])];
                    case 2:
                        _a = __read.apply(void 0, [_b.sent(), 2]), heartRaw = _a[0], breathRaw = _a[1];
                        heartRatePoints = this.buildPoints(heartRaw);
                        breathPoints = this.buildPoints(breathRaw);
                        latestHeart = heartRatePoints[heartRatePoints.length - 1];
                        latestBreath = breathPoints[breathPoints.length - 1];
                        this.setData({
                            heartRatePoints: heartRatePoints,
                            breathPoints: breathPoints,
                            currentHeartRate: latestHeart ? latestHeart.value : '--',
                            heartRateWarn: latestHeart ? warnHeart(latestHeart.value) : false,
                            currentBreath: latestBreath ? latestBreath.value : '--',
                            breathWarn: latestBreath ? warnBreath(latestBreath.value) : false
                        });
                        this.buildChart(this.data.chartType);
                        this.buildHistoryList();
                        setTimeout(function () { return _this.drawChart(); }, 80);
                        return [3 /*break*/, 5];
                    case 3:
                        err_1 = _b.sent();
                        wx.showToast({ title: err_1.message || '加载失败', icon: 'none' });
                        return [3 /*break*/, 5];
                    case 4:
                        this.setData({ loading: false });
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    },
    buildPoints: function (data) {
        var hours = (data === null || data === void 0 ? void 0 : data.hours) || [];
        var values = (data === null || data === void 0 ? void 0 : data.values) || [];
        var startIndex = Math.max(values.length - 24, 0);
        return values.slice(startIndex).map(function (value, offset) {
            var index = startIndex + offset;
            var raw = hours[index];
            var time = raw ? new Date(raw) : null;
            return {
                id: index,
                raw: raw,
                date: time ? "".concat(String(time.getMonth() + 1).padStart(2, '0'), "/").concat(String(time.getDate()).padStart(2, '0')) : '--',
                time: time ? "".concat(String(time.getHours()).padStart(2, '0'), ":").concat(String(time.getMinutes()).padStart(2, '0')) : '--',
                label: time ? "".concat(String(time.getMonth() + 1).padStart(2, '0'), "/").concat(String(time.getDate()).padStart(2, '0')) : '--',
                value: Number(value) || 0
            };
        });
    },
    buildChart: function (type) {
        var _a, _b, _c;
        var points = type === 'heartRate' ? this.data.heartRatePoints : this.data.breathPoints;
        if (!points.length) {
            this.setData({ yLabels: [], xLabels: [], chartType: type });
            return;
        }
        var values = points.map(function (item) { return item.value; });
        var min = Math.min.apply(Math, __spreadArray([], __read(values), false));
        var max = Math.max.apply(Math, __spreadArray([], __read(values), false));
        var pad = Math.max(3, Math.ceil((max - min) * 0.2) || 3);
        var yMax = max + pad;
        var yMin = min - pad;
        var step = Math.max(1, Math.ceil((yMax - yMin) / 3));
        var xLabels = [(_a = points[0]) === null || _a === void 0 ? void 0 : _a.label, (_b = points[Math.floor(points.length / 2)]) === null || _b === void 0 ? void 0 : _b.label, (_c = points[points.length - 1]) === null || _c === void 0 ? void 0 : _c.label].filter(Boolean);
        this.setData({
            chartType: type,
            yLabels: [yMax, yMax - step, yMax - step * 2, yMin].map(function (item) { return String(Math.round(item)); }),
            xLabels: xLabels
        });
    },
    drawChart: function () {
        var points = this.data.chartType === 'heartRate' ? this.data.heartRatePoints : this.data.breathPoints;
        if (!points.length)
            return;
        var values = points.map(function (item) { return item.value; });
        var min = Math.min.apply(Math, __spreadArray([], __read(values), false));
        var max = Math.max.apply(Math, __spreadArray([], __read(values), false));
        var pad = Math.max(3, Math.ceil((max - min) * 0.2) || 3);
        var dataMin = min - pad;
        var dataMax = max + pad;
        var range = dataMax - dataMin || 1;
        var width = this.data.canvasW;
        var height = this.data.canvasH;
        var paddingLeft = 8;
        var paddingRight = 12;
        var paddingTop = 16;
        var paddingBottom = 8;
        var chartWidth = width - paddingLeft - paddingRight;
        var chartHeight = height - paddingTop - paddingBottom;
        var toX = function (index) { return paddingLeft + (index / Math.max(points.length - 1, 1)) * chartWidth; };
        var toY = function (value) { return paddingTop + (1 - (value - dataMin) / range) * chartHeight; };
        var color = this.data.chartType === 'heartRate' ? '#3B7EFF' : '#10B981';
        var fillColor = this.data.chartType === 'heartRate' ? 'rgba(59,126,255,0.10)' : 'rgba(16,185,129,0.10)';
        var ctx = wx.createCanvasContext('lineChart', this);
        var coordPoints = values.map(function (value, index) { return ({ x: toX(index), y: toY(value) }); });
        ctx.clearRect(0, 0, width, height);
        ctx.setStrokeStyle('rgba(200,215,240,0.5)');
        ctx.setLineWidth(0.5);
        for (var index = 0; index <= 3; index += 1) {
            var y = paddingTop + (index / 3) * chartHeight;
            ctx.beginPath();
            ctx.moveTo(paddingLeft, y);
            ctx.lineTo(width - paddingRight, y);
            ctx.stroke();
        }
        ctx.setFillStyle(fillColor);
        ctx.beginPath();
        ctx.moveTo(coordPoints[0].x, paddingTop + chartHeight);
        coordPoints.forEach(function (point) { return ctx.lineTo(point.x, point.y); });
        ctx.lineTo(coordPoints[coordPoints.length - 1].x, paddingTop + chartHeight);
        ctx.closePath();
        ctx.fill();
        ctx.setStrokeStyle(color);
        ctx.setLineWidth(2);
        ctx.setLineCap('round');
        ctx.setLineJoin('round');
        ctx.beginPath();
        coordPoints.forEach(function (point, index) { return index === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y); });
        ctx.stroke();
        ctx.draw();
    },
    buildHistoryList: function () {
        var heartPoints = this.data.heartRatePoints;
        var breathPoints = this.data.breathPoints;
        var total = Math.max(heartPoints.length, breathPoints.length);
        var historyList = [];
        for (var index = total - 1; index >= 0; index -= 1) {
            var heart = heartPoints[index];
            var breath = breathPoints[index];
            if (!heart && !breath)
                continue;
            var heartValue = heart === null || heart === void 0 ? void 0 : heart.value;
            var breathValue = breath === null || breath === void 0 ? void 0 : breath.value;
            historyList.push({
                id: index,
                date: (heart === null || heart === void 0 ? void 0 : heart.date) || (breath === null || breath === void 0 ? void 0 : breath.date) || '--',
                time: (heart === null || heart === void 0 ? void 0 : heart.time) || (breath === null || breath === void 0 ? void 0 : breath.time) || '--',
                heartRate: heartValue !== null && heartValue !== void 0 ? heartValue : '--',
                breath: breathValue !== null && breathValue !== void 0 ? breathValue : '--',
                heartRateWarn: typeof heartValue === 'number' ? warnHeart(heartValue) : false,
                warn: (typeof heartValue === 'number' && warnHeart(heartValue)) || (typeof breathValue === 'number' && warnBreath(breathValue))
            });
        }
        this.setData({ historyList: historyList });
    },
    switchChart: function (e) {
        var _this = this;
        var type = e.currentTarget.dataset.type;
        this.buildChart(type);
        setTimeout(function () { return _this.drawChart(); }, 50);
    },
    goBack: function () { wx.navigateBack(); },
    onPullDownRefresh: function () { this.loadData().then(function () { return wx.stopPullDownRefresh(); }); }
});
