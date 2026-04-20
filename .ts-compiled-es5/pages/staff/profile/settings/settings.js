"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var session_1 = require("../../../../utils/session");
Page({
    data: {
        notify: {
            appointment: true,
            alarm: true
        },
        showAbout: false
    },
    onLoad: function () {
        // Restore saved notification prefs
        var appointment = wx.getStorageSync('notify_appointment');
        var alarm = wx.getStorageSync('notify_alarm');
        this.setData({
            'notify.appointment': appointment !== false,
            'notify.alarm': alarm !== false
        });
    },
    onNotifyChange: function (e) {
        var key = e.currentTarget.dataset.key;
        var value = e.detail.value;
        var update = {};
        update['notify.' + key] = value;
        this.setData(update);
        wx.setStorageSync('notify_' + key, value);
    },
    onClearCache: function () {
        wx.showModal({
            title: '清除缓存',
            content: '确认清除本地缓存数据？',
            success: function (res) {
                if (res.confirm) {
                    try {
                        (0, session_1.clearSession)(['token', 'role', 'userInfo']);
                        wx.showToast({ title: '缓存已清除', icon: 'success' });
                    }
                    catch (_a) {
                        wx.showToast({ title: '清除失败', icon: 'none' });
                    }
                }
            }
        });
    },
    onAbout: function () {
        this.setData({ showAbout: true });
    },
    closeAbout: function () {
        this.setData({ showAbout: false });
    },
    onLogout: function () {
        wx.showModal({
            title: '退出登录',
            content: '确认退出登录？',
            success: function (res) {
                if (res.confirm) {
                    (0, session_1.clearSession)();
                    wx.reLaunch({ url: '/pages/login/login' });
                }
            }
        });
    }
});
