"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var api_1 = require("../../../../utils/api");
var session_1 = require("../../../../utils/session");
Page({
    data: {
        doctorName: '',
        orgName: '',
        roleName: '',
        avatarText: ''
    },
    onLoad: function () {
        this.loadProfile();
    },
    onShow: function () {
        this.loadProfile();
    },
    loadProfile: function () {
        var _this = this;
        // Try from cache first for fast render
        var cached = (0, session_1.getStoredUserInfo)() || {};
        if (cached.name) {
            this.setData({
                doctorName: cached.name,
                orgName: cached.orgName || '',
                roleName: cached.role || '医护人员',
                avatarText: cached.name.slice(-2)
            });
        }
        (0, api_1.getStaffProfile)()
            .then(function (res) {
            var name = res.name || '医护人员';
            _this.setData({
                doctorName: name,
                orgName: res.orgName || '',
                roleName: res.role || '医护人员',
                avatarText: name.slice(-2)
            });
            (0, session_1.setStoredUserInfo)(res);
        })
            .catch(function () {
            // Keep cached values, no-op
        });
    },
    goToOrgInfo: function () {
        wx.navigateTo({ url: '/pages/staff/profile/orgInfo/orgInfo' });
    },
    goToPersonalInfo: function () {
        wx.navigateTo({ url: '/pages/staff/profile/personalInfo/personalInfo' });
    },
    goToMap: function () {
        wx.navigateTo({ url: '/pages/staff/mapDetail/mapDetail' });
    },
    goToSummary: function () {
        wx.navigateTo({ url: '/pages/staff/summary/summary' });
    },
    goToPublish: function () {
        wx.navigateTo({ url: '/pages/staff/profile/publish/publish' });
    },
    goToServiceCenter: function () {
        wx.navigateTo({ url: '/pages/staff/profile/serviceCenter/serviceCenter' });
    },
    goToFeedback: function () {
        wx.navigateTo({ url: '/pages/staff/profile/feedback/feedback' });
    },
    goToSettings: function () {
        wx.navigateTo({ url: '/pages/staff/profile/settings/settings' });
    },
    onLogout: function () {
        wx.showModal({
            title: '退出登录',
            content: '确定要退出登录吗？',
            confirmText: '退出',
            confirmColor: '#FF4D4F',
            success: function (res) {
                if (res.confirm) {
                    wx.removeStorageSync('token');
                    wx.removeStorageSync('role');
                    wx.removeStorageSync('userInfo');
                    wx.reLaunch({ url: '/pages/login/login' });
                }
            }
        });
    }
});
