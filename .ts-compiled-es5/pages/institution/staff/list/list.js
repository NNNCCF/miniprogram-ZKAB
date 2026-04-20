"use strict";
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
        (0, api_1.getInstitutionNurses)()
            .then(function (list) {
            _this.setData({ allList: list || [], loading: false });
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
                return (item.name || '').toLowerCase().includes(keyword) ||
                    (item.phone || '').includes(keyword);
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
