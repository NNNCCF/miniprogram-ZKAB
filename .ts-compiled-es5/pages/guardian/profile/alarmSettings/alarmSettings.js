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
Object.defineProperty(exports, "__esModule", { value: true });
var api_1 = require("../../../../utils/api");
Page({
    data: {
        statusH: 0,
        settings: [
            { key: 'hrAlert', label: '心率异常提醒', desc: '心率超出正常范围时通知', value: true },
            { key: 'bpAlert', label: '血压异常提醒', desc: '血压异常时通知', value: true },
            { key: 'fallAlert', label: '跌倒检测提醒', desc: '检测到跌倒事件时通知', value: true },
            { key: 'bedAlert', label: '离床提醒', desc: '夜间长时间离床时通知', value: false }
        ]
    },
    onLoad: function () {
        var app = getApp();
        this.setData({ statusH: app.globalData.statusBarHeight || 0 });
        this.load();
    },
    load: function () {
        return __awaiter(this, void 0, void 0, function () {
            var res_1, settings, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, api_1.getGuardianAlarmSettings)()];
                    case 1:
                        res_1 = _a.sent();
                        settings = this.data.settings.map(function (item) {
                            var _a;
                            return (__assign(__assign({}, item), { value: (_a = res_1 === null || res_1 === void 0 ? void 0 : res_1[item.key]) !== null && _a !== void 0 ? _a : item.value }));
                        });
                        this.setData({ settings: settings });
                        return [3 /*break*/, 3];
                    case 2:
                        err_1 = _a.sent();
                        wx.showToast({
                            title: err_1.message || '加载失败',
                            icon: 'none'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    onChange: function (e) {
        return __awaiter(this, void 0, void 0, function () {
            var key, value, settings, payload, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        key = e.currentTarget.dataset.key;
                        value = !!e.detail.value;
                        settings = this.data.settings.map(function (item) { return item.key === key ? __assign(__assign({}, item), { value: value }) : item; });
                        this.setData({ settings: settings });
                        payload = {};
                        settings.forEach(function (item) {
                            payload[item.key] = item.value;
                        });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, api_1.updateGuardianAlarmSettings)(payload)];
                    case 2:
                        _a.sent();
                        wx.showToast({ title: '已保存', icon: 'success' });
                        return [3 /*break*/, 4];
                    case 3:
                        err_2 = _a.sent();
                        wx.showToast({
                            title: err_2.message || '保存失败',
                            icon: 'none'
                        });
                        this.load();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    },
    goBack: function () {
        wx.navigateBack();
    }
});
