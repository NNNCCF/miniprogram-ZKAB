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
function getFamilyInitial(name) {
    if (!name)
        return '家';
    return name.slice(0, 2);
}
Page({
    data: {
        loading: false,
        searchText: '',
        allList: [],
        filteredList: []
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
        (0, api_1.getFamilyList)()
            .then(function (list) {
            var mapped = (list || []).map(function (item) {
                var _a, _b, _c, _d;
                var name = item.shortName || item.familyName || item.name || item.address || '未命名';
                return __assign(__assign({}, item), { familyName: name, memberCount: (_a = item.memberCount) !== null && _a !== void 0 ? _a : ((_c = (_b = item.members) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0), lastUpdateTime: item.lastUpdateTime || ((_d = item.createdAt) === null || _d === void 0 ? void 0 : _d.slice(0, 10)) || '--', familyInitial: getFamilyInitial(name) });
            });
            _this.setData({ allList: mapped, loading: false });
            _this.applyFilter();
        })
            .catch(function () {
            _this.setData({ loading: false });
        });
    },
    applyFilter: function () {
        var _a = this.data, allList = _a.allList, searchText = _a.searchText;
        var keyword = searchText.trim();
        if (!keyword) {
            this.setData({ filteredList: allList });
            return;
        }
        var filtered = allList.filter(function (item) {
            return (item.familyName || '').includes(keyword);
        });
        this.setData({ filteredList: filtered });
    },
    onSearchInput: function (e) {
        this.setData({ searchText: e.detail.value });
        this.applyFilter();
    },
    onSearchConfirm: function () {
        this.applyFilter();
    },
    clearSearch: function () {
        this.setData({ searchText: '' });
        this.applyFilter();
    },
    goToDetail: function (e) {
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({ url: "/pages/staff/archive/detail/detail?id=".concat(id) });
    }
});
