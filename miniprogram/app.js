"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var session_1 = require("./utils/session");
var global_alarm_manager_1 = require("./utils/global-alarm-manager");
App({
    globalData: {
        token: '',
        userInfo: null,
        role: '',
        statusBarHeight: 0,
        globalAlarmManager: null
    },
    onLaunch: function () {
        var info = wx.getSystemInfoSync();
        this.globalData.statusBarHeight = info.statusBarHeight || 0;
        var token = wx.getStorageSync('token');
        var role = wx.getStorageSync('role');
        if (token) {
            this.globalData.token = token;
            this.globalData.role = role;
        }
        this.globalData.userInfo = (0, session_1.getStoredUserInfo)();
        this.globalData.globalAlarmManager = (0, global_alarm_manager_1.createGlobalAlarmManager)(this);
        var base = 'https://cdn.bootcdn.net/ajax/libs/HarmonyOS-Sans/2.0.0';
        wx.loadFontFace({
            family: 'HarmonyOS_Sans_SC',
            source: "url(\"".concat(base, "/HarmonyOS_Sans_SC_Regular.woff2\")"),
            desc: { weight: '400' },
            scopes: ['webview', 'native'],
            fail: function () { }
        });
        wx.loadFontFace({
            family: 'HarmonyOS_Sans_SC',
            source: "url(\"".concat(base, "/HarmonyOS_Sans_SC_Black.woff2\")"),
            desc: { weight: '900' },
            scopes: ['webview', 'native'],
            fail: function () { }
        });
    },
    onShow: function () {
        var _a;
        (_a = this.globalData.globalAlarmManager) === null || _a === void 0 ? void 0 : _a.start();
    },
    onHide: function () {
        var _a;
        (_a = this.globalData.globalAlarmManager) === null || _a === void 0 ? void 0 : _a.stop();
    },
    startGlobalAlarmPolling: function () {
        var _a;
        (_a = this.globalData.globalAlarmManager) === null || _a === void 0 ? void 0 : _a.start();
    },
    stopGlobalAlarmPolling: function () {
        var _a;
        (_a = this.globalData.globalAlarmManager) === null || _a === void 0 ? void 0 : _a.stop();
    },
    getGlobalAlarmOverlayState: function () {
        var _a, _b;
        return ((_b = (_a = this.globalData.globalAlarmManager) === null || _a === void 0 ? void 0 : _a.getOverlayState()) !== null && _b !== void 0 ? _b : {
            visible: false,
            viewerRole: '',
            confirmOnly: false,
            actionText: '关闭',
            selectedResult: '',
            submitting: false,
            alarm: null,
        });
    },
    setGlobalAlarmResult: function (result) {
        var _a;
        (_a = this.globalData.globalAlarmManager) === null || _a === void 0 ? void 0 : _a.selectResult(result);
    },
    submitGlobalAlarmResult: function () {
        var _a;
        return (_a = this.globalData.globalAlarmManager) === null || _a === void 0 ? void 0 : _a.submit();
    },
    resetGlobalAlarmState: function () {
        var _a;
        (_a = this.globalData.globalAlarmManager) === null || _a === void 0 ? void 0 : _a.reset();
    }
});
