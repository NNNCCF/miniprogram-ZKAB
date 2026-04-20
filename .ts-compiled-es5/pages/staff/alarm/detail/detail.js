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
Object.defineProperty(exports, "__esModule", { value: true });
var api_1 = require("../../../../utils/api");
var STATUS_LABEL = {
    unhandled: '未处理',
    handling: '处理中',
    handled: '已处理',
    ignored: '已忽略'
};
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
            _this.setData({
                alarm: __assign(__assign({}, res), { statusLabel: STATUS_LABEL[res.status] || res.status }),
                loading: false
            });
        })
            .catch(function () {
            _this.setData({ loading: false });
            wx.showToast({ title: '加载失败', icon: 'none' });
        });
    },
    goToHandle: function () {
        wx.navigateTo({
            url: "/pages/staff/alarm/handle/handle?id=".concat(this.data.id)
        });
    },
    goBack: function () {
        wx.navigateBack();
    }
});
