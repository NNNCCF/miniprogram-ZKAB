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
var session_1 = require("../../../../utils/session");
Page({
    data: {
        adminName: '',
        orgName: '',
        roleName: '',
        avatarText: ''
    },
    onLoad: function () {
        this.loadProfile();
    },
    onShow: function () {
        this.loadProfile();
    },
    loadProfile: function () {
        return __awaiter(this, void 0, void 0, function () {
            var cached, profile, merged, name, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        cached = (0, session_1.getStoredUserInfo)() || {};
                        if (cached.name) {
                            this.setData({
                                adminName: cached.name,
                                orgName: cached.orgName || '',
                                roleName: '机构管理员',
                                avatarText: cached.name.slice(-2)
                            });
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, api_1.getStaffProfile)()];
                    case 2:
                        profile = _b.sent();
                        merged = (0, session_1.setStoredUserInfo)(__assign(__assign({}, cached), profile));
                        name = merged.name || '机构管理员';
                        this.setData({
                            adminName: name,
                            orgName: merged.orgName || '',
                            roleName: '机构管理员',
                            avatarText: name.slice(-2)
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        _a = _b.sent();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    },
    goToFamilyList: function () {
        wx.navigateTo({ url: '/pages/institution/family/list/list' });
    },
    onLogout: function () {
        wx.showModal({
            title: '退出登录',
            content: '确定要退出登录吗？',
            confirmText: '退出',
            confirmColor: '#FF4D4F',
            success: function (res) {
                if (!res.confirm)
                    return;
                (0, session_1.clearSession)();
                wx.reLaunch({ url: '/pages/login/login' });
            }
        });
    }
});
