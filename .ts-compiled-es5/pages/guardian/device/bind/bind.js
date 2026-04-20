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
Page({
    data: {
        statusH: 0,
        deviceCode: '',
        location: '', // "lat,lng" 字符串（可选，定位失败允许继续）
        locationText: '', // 显示给用户的地址文字
        latitude: 0,
        longitude: 0,
        locating: false, // 定位中状态
        locationFailed: false, // 定位失败标记（仅提示，不阻塞提交）
        address: '',
        roomLocation: '',
        loading: false,
        canSubmit: false
    },
    onLoad: function () {
        this.setData({ statusH: app.globalData.statusBarHeight || 0 });
        // 进页自动定位（失败不阻塞）
        this.getLocation();
    },
    goBack: function () {
        wx.navigateBack();
    },
    onMore: function () { },
    onScan: function () {
        var _this = this;
        wx.scanCode({
            onlyFromCamera: false,
            success: function (res) {
                if (res.result) {
                    _this.setData({ deviceCode: res.result });
                    _this.checkSubmit();
                }
            },
            fail: function () {
                wx.showToast({ title: '扫码失败', icon: 'none' });
            }
        });
    },
    onDeviceCodeInput: function (e) {
        this.setData({ deviceCode: e.detail.value });
        this.checkSubmit();
    },
    onAddressInput: function (e) {
        this.setData({ address: e.detail.value });
        this.checkSubmit();
    },
    onRoomInput: function (e) {
        this.setData({ roomLocation: e.detail.value });
        this.checkSubmit();
    },
    // 只要有设备号、门牌号、居家位置就可提交（定位可选）
    checkSubmit: function () {
        var _a = this.data, deviceCode = _a.deviceCode, address = _a.address, roomLocation = _a.roomLocation;
        this.setData({ canSubmit: !!(deviceCode && address && roomLocation) });
    },
    getLocation: function () {
        var _this = this;
        this.setData({ locating: true, locationFailed: false });
        // 先检查当前权限状态
        wx.getSetting({
            success: function (settingRes) {
                var authorized = settingRes.authSetting['scope.userLocation'];
                if (authorized === false) {
                    // 用户曾经拒绝过，无法再次弹窗，引导去设置中开启
                    _this.setData({ locating: false, locationFailed: true });
                    wx.showModal({
                        title: '需要位置权限',
                        content: '请前往手机"设置 → 隐私 → 位置信息"中允许该小程序访问位置，以便自动填写设备安装位置',
                        confirmText: '去设置',
                        cancelText: '暂不',
                        success: function (modalRes) {
                            if (modalRes.confirm)
                                wx.openSetting({});
                        }
                    });
                    return;
                }
                if (!authorized) {
                    // 未授权也未拒绝（第一次），主动弹出系统权限对话框
                    wx.authorize({
                        scope: 'scope.userLocation',
                        success: function () {
                            _this.doGetLocation();
                        },
                        fail: function () {
                            // 用户在系统弹窗中拒绝了
                            _this.setData({ locating: false, locationFailed: true });
                            _this.checkSubmit();
                        }
                    });
                    return;
                }
                // 已授权，直接定位
                _this.doGetLocation();
            },
            fail: function () {
                _this.doGetLocation();
            }
        });
    },
    doGetLocation: function () {
        var _this = this;
        wx.getLocation({
            type: 'gcj02',
            success: function (res) {
                var latitude = res.latitude, longitude = res.longitude;
                var locStr = "".concat(latitude, ",").concat(longitude);
                _this.setData({
                    location: locStr,
                    locationText: locStr,
                    latitude: latitude,
                    longitude: longitude,
                    locating: false,
                    locationFailed: false
                });
                _this.checkSubmit();
            },
            fail: function () {
                _this.setData({ locating: false, locationFailed: true });
                _this.checkSubmit();
            }
        });
    },
    onConfirm: function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, deviceCode, location, latitude, longitude, address, roomLocation, loading, canSubmit, payload, e_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.data, deviceCode = _a.deviceCode, location = _a.location, latitude = _a.latitude, longitude = _a.longitude, address = _a.address, roomLocation = _a.roomLocation, loading = _a.loading, canSubmit = _a.canSubmit;
                        if (!canSubmit || loading)
                            return [2 /*return*/];
                        this.setData({ loading: true });
                        wx.showLoading({ title: '绑定中...' });
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, 4, 5]);
                        payload = {
                            deviceCode: deviceCode,
                            address: "".concat(address, " ").concat(roomLocation).trim(),
                        };
                        // 有坐标就带上，没有也能绑定
                        if (location)
                            payload.location = location;
                        if (latitude)
                            payload.latitude = latitude;
                        if (longitude)
                            payload.longitude = longitude;
                        return [4 /*yield*/, (0, api_1.bindDevice)(payload)];
                    case 2:
                        _b.sent();
                        wx.hideLoading();
                        wx.setStorageSync('bindResult', { deviceId: deviceCode });
                        wx.navigateTo({ url: '../bindResult/bindResult?status=success' });
                        return [3 /*break*/, 5];
                    case 3:
                        e_1 = _b.sent();
                        wx.hideLoading();
                        wx.setStorageSync('bindResult', { error: e_1.message || '绑定失败' });
                        wx.navigateTo({ url: '../bindResult/bindResult?status=fail' });
                        return [3 /*break*/, 5];
                    case 4:
                        this.setData({ loading: false });
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }
});
