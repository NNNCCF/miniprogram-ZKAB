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
var DEFAULT_CENTER = {
    lat: 37.8706,
    lng: 112.5498
};
var CARE_LEVEL_MAP = {
    light: '一般监护',
    medium: '重点监护',
    heavy: '特级监护'
};
function parseLocation(location) {
    if (!location)
        return null;
    var parts = location.split(',');
    if (parts.length < 2)
        return null;
    var lat = Number(parts[0]);
    var lng = Number(parts[1]);
    if (Number.isNaN(lat) || Number.isNaN(lng))
        return null;
    return { lat: lat, lng: lng };
}
function localDateString(date) {
    var year = date.getFullYear();
    var month = "".concat(date.getMonth() + 1).padStart(2, '0');
    var day = "".concat(date.getDate()).padStart(2, '0');
    return "".concat(year, "-").concat(month, "-").concat(day);
}
function familyPoint(item) {
    if (typeof item.latitude === 'number' && typeof item.longitude === 'number') {
        return { lat: item.latitude, lng: item.longitude };
    }
    return parseLocation(item.location);
}
function devicePoint(item) {
    return parseLocation(item.location);
}
Page({
    data: {
        panelOpen: true,
        news: [],
        mapLat: DEFAULT_CENTER.lat,
        mapLng: DEFAULT_CENTER.lng,
        mapScale: 13,
        allFamilies: [],
        allDevices: [],
        serviceCenter: null,
        markerTargets: [],
        markers: [],
        filters: [
            { key: 'center', label: '服务中心', icon: '/images/marker_center.png', active: true },
            { key: 'hospital', label: '设备点位', icon: '/images/marker_hospital.png', active: true },
            { key: 'family', label: '服务家庭', icon: '/images/marker_family.png', active: true },
            { key: 'alarm', label: '报警家庭', icon: '/images/marker_alarm.png', active: true }
        ],
        stats: {
            families: 0,
            members: 0,
            todayAlarms: 0,
            nurses: 0,
            totalAppts: 0,
            todayVisits: 0,
            pendingAppts: 0
        }
    },
    onLoad: function () {
        void this.loadMapData();
        void this.loadStats();
    },
    onShow: function () {
        void this.loadStats();
        void this.loadNews();
    },
    loadNews: function () {
        return __awaiter(this, void 0, void 0, function () {
            var list, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, api_1.getNewsList)()];
                    case 1:
                        list = _b.sent();
                        this.setData({ news: (list || []).slice(0, 3) });
                        return [3 /*break*/, 3];
                    case 2:
                        _a = _b.sent();
                        this.setData({ news: [] });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    goToNews: function (e) {
        var id = e.currentTarget.dataset.id;
        if (!id)
            return;
        wx.navigateTo({ url: "/pages/guardian/service/newsDetail/newsDetail?id=".concat(id) });
    },
    loadMapData: function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, families, devices, center;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            (0, api_1.getFamilyMapList)().catch(function () { return []; }),
                            (0, api_1.getDeviceList)().catch(function () { return []; }),
                            (0, api_1.getServiceCenterInfo)().catch(function () { return null; })
                        ])];
                    case 1:
                        _a = __read.apply(void 0, [_b.sent(), 3]), families = _a[0], devices = _a[1], center = _a[2];
                        this.setData({
                            allFamilies: Array.isArray(families) ? families : [],
                            allDevices: Array.isArray(devices) ? devices : [],
                            serviceCenter: center
                        });
                        this.buildMarkers();
                        return [2 /*return*/];
                }
            });
        });
    },
    buildMarkers: function () {
        var _a, _b, _c, _d;
        var filters = this.data.filters;
        var families = this.data.allFamilies;
        var devices = this.data.allDevices;
        var serviceCenter = this.data.serviceCenter;
        var showCenter = !!((_a = filters.find(function (item) { return item.key === 'center'; })) === null || _a === void 0 ? void 0 : _a.active);
        var showHospital = !!((_b = filters.find(function (item) { return item.key === 'hospital'; })) === null || _b === void 0 ? void 0 : _b.active);
        var showFamily = !!((_c = filters.find(function (item) { return item.key === 'family'; })) === null || _c === void 0 ? void 0 : _c.active);
        var showAlarm = !!((_d = filters.find(function (item) { return item.key === 'alarm'; })) === null || _d === void 0 ? void 0 : _d.active);
        var markers = [];
        var markerTargets = [];
        var nextId = 0;
        if (showCenter) {
            markers.push({
                id: nextId++,
                latitude: DEFAULT_CENTER.lat,
                longitude: DEFAULT_CENTER.lng,
                title: (serviceCenter === null || serviceCenter === void 0 ? void 0 : serviceCenter.name) || '卓凯安伴服务中心',
                iconPath: '/images/marker_center.png',
                width: 44,
                height: 44,
                callout: {
                    content: "".concat((serviceCenter === null || serviceCenter === void 0 ? void 0 : serviceCenter.name) || '卓凯安伴服务中心', "\n").concat((serviceCenter === null || serviceCenter === void 0 ? void 0 : serviceCenter.address) || '山西省太原市', "\n").concat((serviceCenter === null || serviceCenter === void 0 ? void 0 : serviceCenter.phone) || ''),
                    color: '#1a1a1a',
                    fontSize: 13,
                    borderRadius: 10,
                    bgColor: '#ffffff',
                    padding: 12,
                    display: 'BYCLICK',
                    borderWidth: 1,
                    borderColor: '#3B7EFF'
                }
            });
        }
        if (showHospital) {
            devices.forEach(function (device) {
                var point = devicePoint(device);
                if (!point)
                    return;
                var memberNames = (device.members || [])
                    .map(function (item) { return item === null || item === void 0 ? void 0 : item.name; })
                    .filter(Boolean)
                    .join('、') || '未绑定成员';
                markers.push({
                    id: nextId++,
                    latitude: point.lat,
                    longitude: point.lng,
                    title: device.deviceCode || device.id || '设备',
                    iconPath: '/images/marker_hospital.png',
                    width: 36,
                    height: 36,
                    callout: {
                        content: "\u8BBE\u5907\uFF1A".concat(device.deviceCode || device.id || '-', "\n\u5730\u5740\uFF1A").concat(device.address || '-', "\n\u6210\u5458\uFF1A").concat(memberNames, "\n\u72B6\u6001\uFF1A").concat(device.status === 'online' ? '在线' : '离线'),
                        color: '#1a1a1a',
                        fontSize: 13,
                        borderRadius: 10,
                        bgColor: '#ffffff',
                        padding: 12,
                        display: 'BYCLICK',
                        borderWidth: 1,
                        borderColor: '#E0E6F5'
                    }
                });
            });
        }
        families.forEach(function (family) {
            var _a, _b, _c;
            var point = familyPoint(family);
            if (!point)
                return;
            var isAlarm = family.hasAlarm === true || family.status === 'alarm';
            if (isAlarm && !showAlarm)
                return;
            if (!isAlarm && !showFamily)
                return;
            var familyName = family.shortName || family.familyName || family.address || '未命名家庭';
            var memberCount = (_c = (_a = family.memberCount) !== null && _a !== void 0 ? _a : (_b = family.members) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0;
            var careLabel = family.careLevelLabel || CARE_LEVEL_MAP[family.careLevel || ''] || '一般监护';
            var statusLabel = isAlarm ? '报警中' : '正常';
            var markerId = nextId++;
            markers.push({
                id: markerId,
                latitude: point.lat,
                longitude: point.lng,
                title: familyName,
                iconPath: isAlarm ? '/images/marker_alarm.png' : '/images/marker_family.png',
                width: 40,
                height: 40,
                callout: {
                    content: "".concat(familyName, "\n\u76D1\u62A4\u6210\u5458\uFF1A").concat(memberCount, "\n\u76D1\u62A4\u7B49\u7EA7\uFF1A").concat(careLabel, "\n\u5F53\u524D\u72B6\u6001\uFF1A").concat(statusLabel),
                    color: '#1a1a1a',
                    fontSize: 13,
                    borderRadius: 10,
                    bgColor: '#ffffff',
                    padding: 12,
                    display: 'BYCLICK',
                    borderWidth: 1,
                    borderColor: '#E0E6F5'
                }
            });
            markerTargets.push({
                markerId: markerId,
                url: isAlarm
                    ? '/pages/staff/alarm/list/list'
                    : "/pages/staff/archive/detail/detail?id=".concat(family.id)
            });
        });
        var firstFamilyPoint = families.map(familyPoint).find(Boolean) || null;
        var firstDevicePoint = devices.map(devicePoint).find(Boolean) || null;
        var mapCenter = firstFamilyPoint || firstDevicePoint || DEFAULT_CENTER;
        this.setData({
            markers: markers,
            markerTargets: markerTargets,
            mapLat: mapCenter.lat,
            mapLng: mapCenter.lng
        });
    },
    togglePanel: function () {
        this.setData({ panelOpen: !this.data.panelOpen });
    },
    onFilter: function (e) {
        var _this = this;
        var key = e.currentTarget.dataset.key;
        var filters = this.data.filters.map(function (item) {
            return item.key === key ? __assign(__assign({}, item), { active: !item.active }) : item;
        });
        this.setData({ filters: filters }, function () {
            _this.buildMarkers();
        });
    },
    onMarkerTap: function (e) {
        var markerId = e.detail.markerId;
        var target = this.data.markerTargets.find(function (item) { return item.markerId === markerId; });
        if (!target)
            return;
        wx.navigateTo({ url: target.url });
    },
    onMapTap: function () { },
    loadStats: function () {
        return __awaiter(this, void 0, void 0, function () {
            var today, _a, families, members, alarms, nurses, appointments, completedToday, alarmList, appointmentList, todayAlarms, pendingAppts;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        today = localDateString(new Date());
                        return [4 /*yield*/, Promise.all([
                                (0, api_1.getFamilyMapList)().catch(function () { return []; }),
                                (0, api_1.getMemberList)().catch(function () { return []; }),
                                (0, api_1.getAlarms)().catch(function () { return []; }),
                                (0, api_1.getNurseList)().catch(function () { return []; }),
                                (0, api_1.getAppointments)().catch(function () { return []; }),
                                (0, api_1.getAppointments)({ startDate: today, endDate: today, status: 'completed' }).catch(function () { return []; })
                            ])];
                    case 1:
                        _a = __read.apply(void 0, [_b.sent(), 6]), families = _a[0], members = _a[1], alarms = _a[2], nurses = _a[3], appointments = _a[4], completedToday = _a[5];
                        alarmList = Array.isArray(alarms) ? alarms : [];
                        appointmentList = Array.isArray(appointments) ? appointments : [];
                        todayAlarms = alarmList.filter(function (item) {
                            var alarmTime = typeof (item === null || item === void 0 ? void 0 : item.alarmTime) === 'string' ? item.alarmTime : '';
                            return alarmTime.slice(0, 10) === today;
                        }).length;
                        pendingAppts = appointmentList.filter(function (item) { return (item === null || item === void 0 ? void 0 : item.status) === 'pending'; }).length;
                        this.setData({
                            stats: {
                                families: Array.isArray(families) ? families.length : 0,
                                members: Array.isArray(members) ? members.length : 0,
                                todayAlarms: todayAlarms,
                                nurses: Array.isArray(nurses) ? nurses.length : 0,
                                totalAppts: appointmentList.length,
                                todayVisits: Array.isArray(completedToday) ? completedToday.length : 0,
                                pendingAppts: pendingAppts
                            }
                        });
                        return [2 /*return*/];
                }
            });
        });
    },
    goToAppt: function () {
        wx.reLaunch({ url: '/pages/staff/appointment/list/list' });
    },
    goToAlarm: function () {
        wx.reLaunch({ url: '/pages/staff/alarm/list/list' });
    },
    goToArchive: function () {
        wx.reLaunch({ url: '/pages/staff/archive/list/list' });
    }
});
