"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var session_1 = require("./utils/session");
App({
    globalData: {
        token: '',
        userInfo: null,
        role: '',
        statusBarHeight: 0
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
        // 全局加载鸿蒙字体（Regular + Black 字重）
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
    }
});
