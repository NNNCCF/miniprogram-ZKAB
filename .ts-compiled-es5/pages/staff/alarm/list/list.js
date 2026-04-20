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
var STATUS_LABEL_MAP = {
    unhandled: '待处理',
    handled: '已处理',
    ignored: '已忽略'
};
Page({
    data: {
        loading: false,
        activeStatus: 'unhandled',
        allList: [],
        filteredList: [],
        unhandledCount: 0
    },
    onLoad: function () {
        this.loadList();
    },
    onShow: function () {
        this.loadList();
    },
    loadList: function () {
        var _this = this;
        this.setData({ loading: true });
        (0, api_1.getAlarms)()
            .then(function (list) {
            var mapped = (list || []).map(function (item) { return (__assign(__assign({}, item), { statusLabel: STATUS_LABEL_MAP[item.status] || item.status })); });
            var unhandledCount = mapped.filter(function (item) { return item.status === 'unhandled'; }).length;
            _this.setData({ allList: mapped, unhandledCount: unhandledCount, loading: false });
            _this.applyFilter();
        })
            .catch(function () {
            _this.setData({ loading: false });
        });
    },
    applyFilter: function () {
        var _this = this;
        var filtered = this.data.allList.filter(function (item) { return item.status === _this.data.activeStatus; });
        this.setData({ filteredList: filtered });
    },
    onTabSwitch: function (e) {
        var status = e.currentTarget.dataset.status;
        if (status === this.data.activeStatus)
            return;
        this.setData({ activeStatus: status });
        this.applyFilter();
    },
    goToDetail: function (e) {
        var id = e.currentTarget.dataset.id;
        var status = e.currentTarget.dataset.status;
        var url = status === 'unhandled'
            ? "/pages/staff/alarm/detail/detail?id=".concat(id)
            : "/pages/staff/alarm/handled/handled?id=".concat(id);
        wx.navigateTo({ url: url });
    }
});
