"use strict";
Component({
    properties: {
        title: { type: String, value: '' },
        showBack: { type: Boolean, value: false }
    },
    data: {
        statusH: 0,
        totalH: 0
    },
    lifetimes: {
        attached: function () {
            var app = getApp();
            var statusH = app.globalData.statusBarHeight || 0;
            this.setData({ statusH: statusH, totalH: statusH + 44 });
        }
    },
    methods: {
        onBack: function () {
            wx.navigateBack();
        }
    }
});
