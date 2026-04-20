"use strict";
Page({
    onLoad: function (options) {
        var id = options.id || '';
        if (!id) {
            wx.showToast({ title: '缺少预约编号', icon: 'none' });
            setTimeout(function () { return wx.navigateBack(); }, 600);
            return;
        }
        wx.redirectTo({ url: "/pages/staff/appointment/detail/detail?id=".concat(id) });
    }
});
