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
var TYPE_FILTERS = [
    { label: '全部', value: '' },
    { label: '送药', value: '送药' },
    { label: '上门探诊', value: '上门探诊' },
    { label: '预约体检', value: '预约体检' },
    { label: '护理', value: '护理' }
];
var STATUS_FILTERS = [
    { label: '全部', value: '' },
    { label: '待处理', value: 'pending' },
    { label: '待上门', value: 'accepted' },
    { label: '已完成', value: 'completed' }
];
var STATUS_LABEL_MAP = {
    pending: '待处理',
    accepted: '待上门',
    completed: '已完成'
};
function formatYearMonth(date) {
    var y = date.getFullYear();
    var m = String(date.getMonth() + 1).padStart(2, '0');
    return "".concat(y, "-").concat(m);
}
Page({
    data: {
        loading: false,
        currentMonth: formatYearMonth(new Date()),
        searchText: '',
        activeType: '',
        activeStatus: '',
        typeFilters: TYPE_FILTERS,
        statusFilters: STATUS_FILTERS,
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
        var currentMonth = this.data.currentMonth;
        (0, api_1.getAppointments)({ startDate: currentMonth + '-01', endDate: currentMonth + '-31' })
            .then(function (list) {
            var mapped = (list || []).map(function (item) { return (__assign(__assign({}, item), { statusLabel: STATUS_LABEL_MAP[item.status] || item.status })); });
            _this.setData({ allList: mapped, loading: false });
            _this.applyFilters();
        })
            .catch(function () {
            _this.setData({ loading: false });
        });
    },
    applyFilters: function () {
        var _a = this.data, allList = _a.allList, searchText = _a.searchText, activeType = _a.activeType, activeStatus = _a.activeStatus;
        var keyword = searchText.trim().toLowerCase();
        var filtered = allList.filter(function (item) {
            var matchType = !activeType || item.type === activeType;
            var matchStatus = !activeStatus || item.status === activeStatus;
            var matchSearch = !keyword ||
                (item.memberName || '').toLowerCase().includes(keyword) ||
                (item.requirement || '').toLowerCase().includes(keyword);
            return matchType && matchStatus && matchSearch;
        });
        this.setData({ filteredList: filtered });
    },
    onMonthChange: function (e) {
        var val = e.detail.value.slice(0, 7);
        this.setData({ currentMonth: val });
        this.loadList();
    },
    onSearchInput: function (e) {
        this.setData({ searchText: e.detail.value });
        this.applyFilters();
    },
    onTypeFilter: function (e) {
        var value = e.currentTarget.dataset.value;
        this.setData({ activeType: value });
        this.applyFilters();
    },
    onStatusFilter: function (e) {
        var value = e.currentTarget.dataset.value;
        this.setData({ activeStatus: value });
        this.applyFilters();
    },
    goToDetail: function (e) {
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({ url: "/pages/staff/appointment/detail/detail?id=".concat(id) });
    }
});
