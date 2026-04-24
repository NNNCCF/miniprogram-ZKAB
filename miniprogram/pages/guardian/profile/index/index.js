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
var api_1 = require("../../../../utils/api");
var session_1 = require("../../../../utils/session");
var app = getApp();
Page({
    data: {
        statusH: 0,
        userInfo: {},
        stats: { memberCount: 0, alarmCount: 0, serviceCount: 0 }
    },
    onLoad: function () {
        this.setData({ statusH: app.globalData.statusBarHeight || 0 });
    },
    onShow: function () {
        var cached = (0, session_1.getStoredUserInfo)();
        if (cached === null || cached === void 0 ? void 0 : cached.name) {
            this.setData({ userInfo: cached });
        }
        this.loadPageData();
    },
    loadPageData: function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, profileRes, membersRes, alarmsRes, appointmentsRes, merged, memberCount, alarmCount, serviceCount;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Promise.allSettled([
                            (0, api_1.getGuardianProfile)(),
                            (0, api_1.getMemberList)(),
                            (0, api_1.getAlarms)({ status: 'unhandled' }),
                            (0, api_1.getAppointments)()
                        ])];
                    case 1:
                        _a = __read.apply(void 0, [_b.sent(), 4]), profileRes = _a[0], membersRes = _a[1], alarmsRes = _a[2], appointmentsRes = _a[3];
                        if (profileRes.status === 'fulfilled') {
                            merged = (0, session_1.setStoredUserInfo)(__assign(__assign({}, (0, session_1.getStoredUserInfo)()), profileRes.value));
                            this.setData({ userInfo: merged });
                        }
                        memberCount = membersRes.status === 'fulfilled' ? membersRes.value.length : this.data.stats.memberCount;
                        alarmCount = alarmsRes.status === 'fulfilled' ? alarmsRes.value.length : this.data.stats.alarmCount;
                        serviceCount = appointmentsRes.status === 'fulfilled' ? appointmentsRes.value.length : this.data.stats.serviceCount;
                        this.setData({
                            stats: {
                                memberCount: memberCount,
                                alarmCount: alarmCount,
                                serviceCount: serviceCount
                            }
                        });
                        return [2 /*return*/];
                }
            });
        });
    },
    goEdit: function () {
        wx.navigateTo({ url: '/pages/guardian/profile/profileEdit/profileEdit' });
    },
    goOrders: function () {
        wx.navigateTo({ url: '/pages/guardian/order/list/list' });
    },
    goSwitchMember: function () {
        wx.navigateTo({ url: '/pages/guardian/member/switch/switch' });
    },
    goAlarmSettings: function () {
        wx.navigateTo({ url: '/pages/guardian/profile/alarmSettings/alarmSettings' });
    },
    goServiceCenter: function () {
        wx.navigateTo({ url: '/pages/guardian/profile/serviceCenter/serviceCenter' });
    },
    goFeedback: function () {
        wx.navigateTo({ url: '/pages/guardian/profile/feedback/feedback' });
    },
    goSettings: function () {
        wx.navigateTo({ url: '/pages/guardian/profile/settings/settings' });
    },
    logout: function () {
        wx.showModal({
            title: '退出登录',
            content: '确认退出当前账号吗？',
            confirmColor: '#EF4444',
            success: function (res) {
                if (!res.confirm)
                    return;
                (0, session_1.clearSession)();
                wx.reLaunch({ url: '/pages/login/login' });
            }
        });
    }
});
