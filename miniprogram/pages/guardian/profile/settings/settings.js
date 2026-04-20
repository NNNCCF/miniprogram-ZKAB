"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var session_1 = require("../../../../utils/session");
Page({
    data: { statusH: 0, pushOn: true },
    onLoad: function () {
        var app = getApp();
        this.setData({ statusH: app.globalData.statusBarHeight || 0, pushOn: wx.getStorageSync('pushOn') !== false });
    },
    goBack: function () { wx.navigateBack(); },
    onPush: function (e) { var v = e.detail.value; this.setData({ pushOn: v }); wx.setStorageSync('pushOn', v); },
    clearCache: function () {
        wx.showModal({ title: '清除缓存', content: '确定要清除缓存吗？', success: function (r) { if (r.confirm) {
                (0, session_1.clearSession)(['token', 'role', 'userInfo']);
                wx.showToast({ title: '清除成功', icon: 'success' });
            } } });
    },
    showAbout: function () { wx.showModal({ title: '卓凯安伴', content: '版本 v1.0.0\n智慧养老监护平台', showCancel: false }); },
    logout: function () {
        wx.showModal({ title: '退出登录', content: '确定要退出登录吗？', success: function (r) { if (r.confirm) {
                (0, session_1.clearSession)();
                wx.reLaunch({ url: '/pages/login/login' });
            } } });
    }
});
