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
var api_1 = require("../../utils/api");
var session_1 = require("../../utils/session");
Page({
    data: {
        activeTab: 'login',
        showPwd: false,
        showRegPwd: false,
        submitting: false,
        loginForm: { phone: '', password: '' },
        regForm: { phone: '', password: '', confirmPassword: '', name: '', role: 'staff' },
        // 机构列表
        orgList: [],
        orgNames: [], // picker 显示用
        orgIndex: -1, // 当前选中下标，-1 表示未选
        orgLoading: false
    },
    onLoad: function (options) {
        if (options.tab === 'register') {
            this.setData({ activeTab: 'register' });
        }
        this.loadOrgList();
    },
    loadOrgList: function () {
        return __awaiter(this, void 0, void 0, function () {
            var list, orgList, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.setData({ orgLoading: true });
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, api_1.getPublicInstitutionList)()];
                    case 2:
                        list = _b.sent();
                        orgList = (list || []).map(function (o) { return ({
                            id: o.id,
                            name: o.name,
                            address: o.address || ''
                        }); });
                        this.setData({
                            orgList: orgList,
                            orgNames: orgList.map(function (o) { return o.name; }),
                            orgLoading: false
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        _a = _b.sent();
                        this.setData({ orgLoading: false });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    },
    setTab: function (e) {
        this.setData({ activeTab: e.currentTarget.dataset.tab });
    },
    onLoginInput: function (e) {
        var field = e.currentTarget.dataset.field;
        var update = {};
        update['loginForm.' + field] = e.detail.value;
        this.setData(update);
    },
    onRegInput: function (e) {
        var field = e.currentTarget.dataset.field;
        var update = {};
        update['regForm.' + field] = e.detail.value;
        this.setData(update);
    },
    togglePwd: function () { this.setData({ showPwd: !this.data.showPwd }); },
    toggleRegPwd: function () { this.setData({ showRegPwd: !this.data.showRegPwd }); },
    selectRole: function (e) {
        var role = e.currentTarget.dataset.role;
        this.setData({ 'regForm.role': role, orgIndex: -1 });
    },
    onOrgPickerChange: function (e) {
        this.setData({ orgIndex: Number(e.detail.value) });
    },
    // ─── 登录（自动识别角色）─────────────────────────────────────────────────────
    handleLogin: function () {
        return __awaiter(this, void 0, void 0, function () {
            var loginForm, res, app, roleMap, role, urlMap, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        loginForm = this.data.loginForm;
                        if (!loginForm.phone || loginForm.phone.length !== 11) {
                            wx.showToast({ title: '请输入正确手机号', icon: 'none' });
                            return [2 /*return*/];
                        }
                        if (!loginForm.password) {
                            wx.showToast({ title: '请输入密码', icon: 'none' });
                            return [2 /*return*/];
                        }
                        this.setData({ submitting: true });
                        wx.showLoading({ title: '登录中...' });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, (0, api_1.unifiedLogin)({ phone: loginForm.phone, password: loginForm.password })];
                    case 2:
                        res = _a.sent();
                        wx.hideLoading();
                        if (res === null || res === void 0 ? void 0 : res.token) {
                            app = getApp();
                            roleMap = {
                                caregiver: 'staff',
                                guardian: 'guardian',
                                institution: 'institution'
                            };
                            role = roleMap[(res.role || '').toLowerCase()] || 'guardian';
                            app.globalData.token = res.token;
                            app.globalData.role = role;
                            app.globalData.userInfo = res.userInfo || {};
                            wx.setStorageSync('token', res.token);
                            wx.setStorageSync('role', role);
                            (0, session_1.setStoredUserInfo)(res.userInfo || {});
                            urlMap = {
                                staff: '/pages/staff/home/home',
                                guardian: '/pages/guardian/index/index',
                                institution: '/pages/institution/index/index'
                            };
                            wx.reLaunch({ url: urlMap[role] || '/pages/guardian/index/index' });
                        }
                        else {
                            wx.showToast({ title: (res === null || res === void 0 ? void 0 : res.msg) || '登录失败', icon: 'none' });
                        }
                        return [3 /*break*/, 5];
                    case 3:
                        e_1 = _a.sent();
                        wx.hideLoading();
                        wx.showToast({ title: e_1.message || '网络异常', icon: 'none' });
                        return [3 /*break*/, 5];
                    case 4:
                        this.setData({ submitting: false });
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    },
    // ─── 注册 ──────────────────────────────────────────────────────────────────
    handleRegister: function () {
        return __awaiter(this, void 0, void 0, function () {
            var regForm, selectedOrg, err_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        regForm = this.data.regForm;
                        if (!regForm.phone || regForm.phone.length !== 11) {
                            wx.showToast({ title: '请输入正确手机号', icon: 'none' });
                            return [2 /*return*/];
                        }
                        if (!regForm.name.trim()) {
                            wx.showToast({ title: '请输入真实姓名', icon: 'none' });
                            return [2 /*return*/];
                        }
                        if (!regForm.password || regForm.password.length < 6) {
                            wx.showToast({ title: '密码不能少于6位', icon: 'none' });
                            return [2 /*return*/];
                        }
                        if (regForm.password !== regForm.confirmPassword) {
                            wx.showToast({ title: '两次密码不一致', icon: 'none' });
                            return [2 /*return*/];
                        }
                        if (regForm.role === 'staff' && this.data.orgIndex < 0) {
                            wx.showToast({ title: '请选择所属医疗机构', icon: 'none' });
                            return [2 /*return*/];
                        }
                        selectedOrg = this.data.orgList[this.data.orgIndex];
                        this.setData({ submitting: true });
                        wx.showLoading({ title: '注册中...' });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, 7, 8]);
                        if (!(regForm.role === 'staff')) return [3 /*break*/, 3];
                        return [4 /*yield*/, (0, api_1.nurseRegister)({
                                phone: regForm.phone,
                                password: regForm.password,
                                name: regForm.name.trim(),
                                role: 'NURSE',
                                institutionId: selectedOrg.id, // 直接用 ID 绑定，精准关联
                                institutionName: selectedOrg.name // 备用字段
                            })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, (0, api_1.guardianRegister)({
                            phone: regForm.phone,
                            password: regForm.password,
                            name: regForm.name.trim()
                        })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        wx.hideLoading();
                        wx.showToast({ title: '注册成功，请登录', icon: 'success' });
                        setTimeout(function () {
                            _this.setData({
                                activeTab: 'login',
                                'loginForm.phone': regForm.phone,
                                regForm: { phone: '', password: '', confirmPassword: '', name: '', role: 'staff' },
                                orgIndex: -1
                            });
                        }, 1500);
                        return [3 /*break*/, 8];
                    case 6:
                        err_1 = _a.sent();
                        wx.hideLoading();
                        wx.showToast({ title: err_1.message || '注册失败', icon: 'none' });
                        return [3 /*break*/, 8];
                    case 7:
                        this.setData({ submitting: false });
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
    },
    wechatLogin: function () {
        wx.showToast({ title: '微信登录开发中', icon: 'none' });
    }
});
