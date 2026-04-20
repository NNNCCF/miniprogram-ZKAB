"use strict";
var api_1 = require("../../utils/api");
Component({
    properties: {
        active: { type: String, value: 'home' }
    },
    data: {
        safeBottom: 0,
        showSOS: false,
        tabs: [
            { key: 'home', label: '日常监控', icon: '/images/日常监控图标.png', iconOn: '/images/日常监控选中图标.png', url: '/pages/guardian/index/index' },
            { key: 'appt', label: '预约服务', icon: '/images/预约服务图标.png', iconOn: '/images/预约服务选中图标.png', url: '/pages/guardian/service/list/list' },
            { key: 'emergency', label: '一键呼救', icon: '/images/一键呼救图标.png', iconOn: '/images/一键呼救图标选中.png', url: '' },
            { key: 'service', label: '服务中心', icon: '/images/服务中心图标.png', iconOn: '/images/服务中心图标选中.png', url: '/pages/guardian/serviceCenter/serviceCenter' },
            { key: 'profile', label: '我的', icon: '/images/我的图标.png', iconOn: '/images/我的图标选中.png', url: '/pages/guardian/profile/index/index' }
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
    methods: {
        onTab: function (e) {
            var _a = e.currentTarget.dataset, key = _a.key, url = _a.url;
            if (key === 'emergency') {
                this.setData({ showSOS: true });
                return;
            }
            if (key === this.properties.active)
                return;
            wx.reLaunch({ url: url });
        },
        closeSOS: function () {
            this.setData({ showSOS: false });
        },
        onSOSCall: function () {
            var _this = this;
            this.setData({ showSOS: false });
            wx.showLoading({ title: '正在连接...' });
            (0, api_1.createEmergencyCall)()
                .catch(function () { return null; })
                .then(function () {
                wx.hideLoading();
                wx.makePhoneCall({ phoneNumber: '03511234567' });
                _this.setData({ showSOS: false });
            });
        }
    }
});
