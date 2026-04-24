"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var api_1 = require("../../../../utils/api");
var app = getApp();
function getTypeIcon(type) {
    if (!type) return '服';
    if (type.includes('医生') || type.includes('家庭')) return '医';
    if (type.includes('探访') || type.includes('上门')) return '访';
    if (type.includes('体检')) return '检';
    if (type.includes('护理')) return '护';
    if (type.includes('送药') || type.includes('药')) return '药';
    return type[0] || '服';
}
function getTypeColor(type) {
    if (type.includes('医生') || type.includes('家庭')) return '#3B7EFF';
    if (type.includes('探访') || type.includes('上门')) return '#10B981';
    if (type.includes('体检')) return '#F59E0B';
    if (type.includes('护理')) return '#8B5CF6';
    if (type.includes('送药') || type.includes('药')) return '#EF4444';
    return '#6B7280';
}
function getDisplayStatus(appt) {
    if (appt.status === 'cancelled') return { label: '已取消', color: '#9CA3AF' };
    if (appt.status === 'completed') return { label: '已完成', color: '#6B7280' };
    if (appt.status === 'accepted') return { label: '已接单', color: '#10B981' };
    if (appt.nurseName) return { label: '已派单', color: '#F59E0B' };
    return { label: '已提交', color: '#3B7EFF' };
}
Page({
    data: {
        statusH: 0,
        loading: false,
        activeTab: 0,
        tabs: ['全部', '进行中', '已完成'],
        allOrders: [],
        displayOrders: []
    },
    onLoad: function () {
        this.setData({ statusH: app.globalData.statusBarHeight || 0 });
    },
    onShow: function () {
        this.loadOrders();
    },
    loadOrders: function () {
        return __awaiter(this, void 0, void 0, function () {
            var orders, allOrders, _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.setData({ loading: true });
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, (0, api_1.getAppointments)()];
                    case 2:
                        orders = _b.sent();
                        allOrders = (orders || []).map(function (appt) {
                            var ds = getDisplayStatus(appt);
                            return Object.assign({}, appt, {
                                displayLabel: ds.label,
                                displayColor: ds.color,
                                typeIcon: getTypeIcon(appt.type),
                                typeColor: getTypeColor(appt.type)
                            });
                        }).sort(function (a, b) {
                            return (b.appointTime || '').localeCompare(a.appointTime || '');
                        });
                        this.setData({ allOrders: allOrders });
                        this.applyFilter();
                        return [3 /*break*/, 5];
                    case 3:
                        _a = _b.sent();
                        wx.showToast({ title: '加载失败', icon: 'none' });
                        return [3 /*break*/, 5];
                    case 4:
                        this.setData({ loading: false });
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    },
    applyFilter: function () {
        var activeTab = this.data.activeTab;
        var allOrders = this.data.allOrders;
        var displayOrders;
        if (activeTab === 1) {
            displayOrders = allOrders.filter(function (o) { return o.status === 'pending' || o.status === 'accepted'; });
        } else if (activeTab === 2) {
            displayOrders = allOrders.filter(function (o) { return o.status === 'completed'; });
        } else {
            displayOrders = allOrders.filter(function (o) { return o.status !== 'cancelled'; });
        }
        this.setData({ displayOrders: displayOrders });
    },
    onTabChange: function (e) {
        var index = Number(e.currentTarget.dataset.index);
        this.setData({ activeTab: index });
        this.applyFilter();
    },
    goDetail: function (e) {
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({ url: "/pages/guardian/order/detail/detail?id=".concat(id) });
    },
    onPullDownRefresh: function () {
        var _this = this;
        this.loadOrders().then(function () { return wx.stopPullDownRefresh(); });
    },
    goBack: function () {
        wx.navigateBack();
    }
});
