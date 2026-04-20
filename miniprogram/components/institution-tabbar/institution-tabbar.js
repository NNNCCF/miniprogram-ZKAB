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
Component({
    properties: {
        active: { type: String, value: 'home' },
        apptCount: { type: Number, value: 0 }
    },
    data: {
        safeBottom: 0,
        tabs: [
            { key: 'home', label: '首页', icon: '/images/tab_map.png', iconOn: '/images/tab_map_on.png', url: '/pages/institution/index/index', badge: '' },
            { key: 'appt', label: '预约', icon: '/images/tab_appt.png', iconOn: '/images/tab_appt_on.png', url: '/pages/institution/appointment/list/list', badge: '' },
            { key: 'staff', label: '医护', icon: '/images/tab_archive.png', iconOn: '/images/tab_archive_on.png', url: '/pages/institution/staff/list/list', badge: '' },
            { key: 'profile', label: '我的', icon: '/images/tab_me.png', iconOn: '/images/tab_me_on.png', url: '/pages/institution/profile/index/index', badge: '' }
        ]
    },
    lifetimes: {
        attached: function () {
            var _a, _b;
            var info = wx.getSystemInfoSync();
            var safeBottom = info.screenHeight - ((_b = (_a = info.safeArea) === null || _a === void 0 ? void 0 : _a.bottom) !== null && _b !== void 0 ? _b : info.screenHeight);
            this.setData({ safeBottom: safeBottom });
        }
    },
    observers: {
        'apptCount': function (apptCount) {
            var tabs = this.data.tabs.map(function (t) {
                if (t.key === 'appt')
                    return __assign(__assign({}, t), { badge: apptCount > 0 ? String(apptCount > 99 ? '99+' : apptCount) : '' });
                return t;
            });
            this.setData({ tabs: tabs });
        }
    },
    methods: {
        onTab: function (e) {
            var _a = e.currentTarget.dataset, key = _a.key, url = _a.url;
            if (key === this.properties.active)
                return;
            wx.reLaunch({ url: url });
        }
    }
});
