"use strict";
var appInstance = getApp();
Page({
    data: {
        statusH: 0,
        isSuccess: false,
        errorMsg: ''
    },
    onLoad: function (options) {
        this.setData({ statusH: appInstance.globalData.statusBarHeight || 0 });
        var status = options.status || 'fail';
        var result = wx.getStorageSync('bindResult') || {};
        this.setData({
            isSuccess: status === 'success',
            errorMsg: result.error || '未找到该设备，请确认设备号！'
        });
        wx.removeStorageSync('bindResult');
    },
    goBack: function () {
        wx.navigateBack();
    },
    onCreateMember: function () {
        wx.navigateTo({ url: '/pages/guardian/member/create/create' });
    },
    goRetry: function () {
        wx.navigateBack();
    }
});
