"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
Object.defineProperty(exports, "__esModule", { value: true });
var api_1 = require("../../../../utils/api");
var app = getApp();
Page({
    data: {
        statusH: 0,
        alarm: null,
        loading: true
    },
    onLoad: function (options) {
        this.setData({ statusH: app.globalData.statusBarHeight || 0 });
        if ((options === null || options === void 0 ? void 0 : options.id) && options.id !== 'latest') {
            this.loadAlarm(options.id);
            return;
        }
        this.loadLatestAlarm(options === null || options === void 0 ? void 0 : options.memberId);
    },
    loadLatestAlarm: function (memberId) {
        return __awaiter(this, void 0, void 0, function () {
            var targetMemberId, members, alarms, _a;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        this.setData({ loading: true });
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 7, 8, 9]);
                        targetMemberId = memberId || wx.getStorageSync('currentMemberId');
                        if (!!targetMemberId) return [3 /*break*/, 3];
                        return [4 /*yield*/, (0, api_1.getMemberList)()];
                    case 2:
                        members = _c.sent();
                        targetMemberId = (_b = members[0]) === null || _b === void 0 ? void 0 : _b.id;
                        _c.label = 3;
                    case 3:
                        if (!targetMemberId) {
                            this.setData({ alarm: null });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, (0, api_1.getAlarms)({ memberId: String(targetMemberId), status: 'unhandled' })];
                    case 4:
                        alarms = _c.sent();
                        if (!!alarms.length) return [3 /*break*/, 6];
                        return [4 /*yield*/, (0, api_1.getAlarms)({ memberId: String(targetMemberId) })];
                    case 5:
                        alarms = _c.sent();
                        _c.label = 6;
                    case 6:
                        this.setData({ alarm: alarms[0] || null });
                        return [3 /*break*/, 9];
                    case 7:
                        _a = _c.sent();
                        this.setData({ alarm: null });
                        return [3 /*break*/, 9];
                    case 8:
                        this.setData({ loading: false });
                        return [7 /*endfinally*/];
                    case 9: return [2 /*return*/];
                }
            });
        });
    },
    loadAlarm: function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var alarm, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.setData({ loading: true });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, (0, api_1.getAlarmDetail)(id)];
                    case 2:
                        alarm = _a.sent();
                        this.setData({ alarm: alarm });
                        return [3 /*break*/, 5];
                    case 3:
                        err_1 = _a.sent();
                        wx.showToast({ title: err_1.message || '加载失败', icon: 'none' });
                        this.setData({ alarm: null });
                        return [3 /*break*/, 5];
                    case 4:
                        this.setData({ loading: false });
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    },
    markIgnored: function () {
        return __awaiter(this, void 0, void 0, function () {
            var alarm, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        alarm = this.data.alarm;
                        if (!alarm)
                            return [2 /*return*/];
                        wx.showLoading({ title: '处理中...' });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, api_1.ignoreAlarm)(alarm.id)];
                    case 2:
                        _a.sent();
                        this.setData({ alarm: __assign(__assign({}, alarm), { status: 'ignored', handleResultLabel: '已忽略' }) });
                        wx.hideLoading();
                        wx.showToast({ title: '已忽略', icon: 'success' });
                        return [3 /*break*/, 4];
                    case 3:
                        err_2 = _a.sent();
                        wx.hideLoading();
                        wx.showToast({ title: err_2.message || '操作失败', icon: 'none' });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    },
    callEmergency: function () {
        wx.navigateTo({ url: '/pages/guardian/emergency/emergency' });
    },
    goBack: function () { wx.navigateBack(); }
});
