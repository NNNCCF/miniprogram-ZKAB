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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var api_1 = require("../../../utils/api");
var app = getApp();
var DEFAULT_COORDINATE = { longitude: 112.5488, latitude: 37.8706 };
Page({
    data: {
        statusH: 0,
        longitude: DEFAULT_COORDINATE.longitude,
        latitude: DEFAULT_COORDINATE.latitude,
        scale: 15,
        markers: [],
        center: {
            name: '卓凯安伴服务中心',
            address: '山西省太原市',
            phone: '03511234567'
        },
        notices: []
    },
    onLoad: function () {
        this.setData({ statusH: app.globalData.statusBarHeight || 0 });
        this.refreshMarker(this.data.center.name);
    },
    onShow: function () {
        this.loadData();
    },
    loadData: function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, centerRes, newsRes, notices;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Promise.allSettled([(0, api_1.getServiceCenterInfo)(), (0, api_1.getNewsList)()])];
                    case 1:
                        _a = __read.apply(void 0, [_b.sent(), 2]), centerRes = _a[0], newsRes = _a[1];
                        if (centerRes.status === 'fulfilled' && centerRes.value) {
                            this.setData({ center: centerRes.value });
                            this.refreshMarker(centerRes.value.name || '卓凯安伴服务中心');
                        }
                        if (newsRes.status === 'fulfilled') {
                            notices = (newsRes.value || []).slice(0, 6).map(function (item) { return ({ id: item.id, title: item.title, date: item.createdAt || item.date || '' }); });
                            this.setData({ notices: notices });
                        }
                        return [2 /*return*/];
                }
            });
        });
    },
    refreshMarker: function (title) {
        this.setData({
            markers: [{
                    id: 1,
                    longitude: this.data.longitude,
                    latitude: this.data.latitude,
                    title: title,
                    iconPath: '/images/marker_center.png',
                    width: 40,
                    height: 40,
                    callout: { content: title, color: '#0F1C38', fontSize: 13, borderRadius: 8, bgColor: '#ffffff', padding: 6, display: 'ALWAYS' }
                }]
        });
    },
    showIntro: function () {
        var center = this.data.center;
        wx.showModal({ title: center.name || '服务中心', content: "\u5730\u5740\uFF1A".concat(center.address || '暂无', "\n\u7535\u8BDD\uFF1A").concat(center.phone || '暂无'), showCancel: false });
    },
    callService: function () {
        if (!this.data.center.phone) {
            wx.showToast({ title: '暂无联系电话', icon: 'none' });
            return;
        }
        wx.makePhoneCall({ phoneNumber: this.data.center.phone });
    },
    showFaq: function () {
        wx.showModal({
            title: '常见问题',
            content: '1. 设备绑定后可查看监测数据和报警。\n2. SOS 会直接生成紧急报警记录。\n3. 服务预约、送药订单提交后可在服务页查看进度。',
            showCancel: false
        });
    },
    goFeedback: function () {
        wx.navigateTo({ url: '/pages/guardian/profile/feedback/feedback' });
    },
    goNotice: function (e) {
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({ url: "/pages/guardian/service/newsDetail/newsDetail?id=".concat(id) });
    }
});
