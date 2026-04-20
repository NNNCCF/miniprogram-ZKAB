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
Object.defineProperty(exports, "__esModule", { value: true });
var api_1 = require("../../../utils/api");
var app = getApp();
Page({
    data: {
        statusH: 0,
        submitting: false,
        servicePhone: '03511234567',
        currentMemberId: null,
        currentMemberName: ''
    },
    onLoad: function () {
        this.setData({ statusH: app.globalData.statusBarHeight || 0 });
        this.loadContext();
    },
    loadContext: function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, membersRes, centerRes, savedId_1, current;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, Promise.allSettled([
                            (0, api_1.getMemberList)(),
                            (0, api_1.getServiceCenterInfo)()
                        ])];
                    case 1:
                        _a = __read.apply(void 0, [_c.sent(), 2]), membersRes = _a[0], centerRes = _a[1];
                        if (membersRes.status === 'fulfilled' && membersRes.value.length > 0) {
                            savedId_1 = wx.getStorageSync('currentMemberId');
                            current = membersRes.value.find(function (item) { return String(item.id) === String(savedId_1); }) || membersRes.value[0];
                            wx.setStorageSync('currentMemberId', current.id);
                            this.setData({
                                currentMemberId: current.id,
                                currentMemberName: current.name || ''
                            });
                        }
                        if (centerRes.status === 'fulfilled' && ((_b = centerRes.value) === null || _b === void 0 ? void 0 : _b.phone)) {
                            this.setData({ servicePhone: centerRes.value.phone });
                        }
                        return [2 /*return*/];
                }
            });
        });
    },
    callServicePhone: function () {
        wx.makePhoneCall({ phoneNumber: this.data.servicePhone || '03511234567' });
    },
    onCall: function () {
        return __awaiter(this, void 0, void 0, function () {
            var result, err_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.data.submitting)
                            return [2 /*return*/];
                        this.setData({ submitting: true });
                        wx.showLoading({ title: '正在发送...' });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, (0, api_1.createEmergencyCall)(this.data.currentMemberId ? { memberId: this.data.currentMemberId } : undefined)];
                    case 2:
                        result = _a.sent();
                        wx.hideLoading();
                        wx.showModal({
                            title: 'SOS 已发送',
                            content: "\u62A5\u8B66\u8BB0\u5F55\u5DF2\u521B\u5EFA".concat((result === null || result === void 0 ? void 0 : result.alarmId) ? "\uFF08#".concat(result.alarmId, "\uFF09") : '', "\uFF0C\u662F\u5426\u7EE7\u7EED\u62E8\u6253\u670D\u52A1\u4E2D\u5FC3\uFF1F"),
                            confirmText: '拨打电话',
                            cancelText: '返回首页',
                            success: function (res) {
                                if (res.confirm) {
                                    _this.callServicePhone();
                                }
                                wx.reLaunch({ url: '/pages/guardian/index/index' });
                            }
                        });
                        return [3 /*break*/, 5];
                    case 3:
                        err_1 = _a.sent();
                        wx.hideLoading();
                        wx.showToast({
                            title: err_1.message || '发送失败',
                            icon: 'none'
                        });
                        return [3 /*break*/, 5];
                    case 4:
                        this.setData({ submitting: false });
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    },
    onCancel: function () {
        wx.reLaunch({ url: '/pages/guardian/index/index' });
    }
});
