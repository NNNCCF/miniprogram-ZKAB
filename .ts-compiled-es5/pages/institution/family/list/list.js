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
        (0, api_1.getInstitutionFamilies)()
            .then(function (list) {
            var mapped = (list || []).map(function (item) { return (__assign(__assign({}, item), { familyInitial: (item.familyName || '家').slice(0, 1) })); });
            _this.setData({ allList: mapped, loading: false });
            _this.applyFilter();
        })
            .catch(function () {
            _this.setData({ loading: false });
        });
    },
    applyFilter: function () {
        var _a = this.data, allList = _a.allList, searchText = _a.searchText;
        var keyword = searchText.trim().toLowerCase();
        var filtered = keyword
            ? allList.filter(function (item) {
                return (item.familyName || '').toLowerCase().includes(keyword) ||
                    (item.address || '').toLowerCase().includes(keyword);
            })
            : allList;
        this.setData({ filteredList: filtered });
    },
    onSearchInput: function (e) {
        this.setData({ searchText: e.detail.value });
        this.applyFilter();
    },
    clearSearch: function () {
        this.setData({ searchText: '' });
        this.applyFilter();
    }
});
