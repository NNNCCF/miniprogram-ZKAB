"use strict";
Component({
    properties: {
        title: { type: String, value: '' },
        showBack: { type: Boolean, value: false }
    },
    data: {
        statusH: 0,
        totalH: 0,
        showGlobalAlarmHost: true
    },
    lifetimes: {
        attached: function () {
            var app = getApp();
            var statusH = app.globalData.statusBarHeight || 0;
            var currentPage = getCurrentPages().slice(-1)[0];
            var route = (currentPage === null || currentPage === void 0 ? void 0 : currentPage.route) || '';
            var tabbarRoutes = new Set([
                'pages/staff/home/home',
                'pages/staff/appointment/list/list',
                'pages/staff/alarm/list/list',
                'pages/staff/archive/list/list',
                'pages/staff/profile/index/index',
            ]);
            this.setData({
                statusH: statusH,
                totalH: statusH + 44,
                showGlobalAlarmHost: !tabbarRoutes.has(route),
            });
        }
    },
    methods: {
        onBack: function () {
            wx.navigateBack();
        }
    }
});
