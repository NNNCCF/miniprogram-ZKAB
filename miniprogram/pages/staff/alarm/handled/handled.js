"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var api_1 = require("../../../../utils/api");
Page({
    data: {
        loading: false,
        id: '',
        alarm: null
    },
    onLoad: function (options) {
        var id = options.id || '';
        this.setData({ id: id });
        this.loadDetail(id);
    },
    loadDetail: function (id) {
        var _this = this;
        if (!id)
            return;
        this.setData({ loading: true });
        (0, api_1.getAlarmDetail)(id)
            .then(function (res) {
            _this.setData({ alarm: res, loading: false });
        })
            .catch(function () {
            _this.setData({ loading: false });
            wx.showToast({ title: '加载失败', icon: 'none' });
        });
    },
    goBack: function () {
        wx.navigateBack();
    }
});
