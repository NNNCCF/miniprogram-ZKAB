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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var api_1 = require("../../../../utils/api");
var session_1 = require("../../../../utils/session");
var app = getApp();
var CHECKUP_ITEMS = [
    { key: 'blood_routine', label: '血常规' },
    { key: 'urine_routine', label: '尿常规' },
    { key: 'liver_func', label: '肝功能' },
    { key: 'kidney_func', label: '肾功能' },
    { key: 'blood_glucose', label: '血糖' },
    { key: 'blood_lipids', label: '血脂' },
    { key: 'ecg', label: '心电图' },
    { key: 'chest_xray', label: '胸部 X 光' },
    { key: 'ultrasound', label: '超声检查' },
    { key: 'blood_pressure', label: '血压监测' }
];
var NURSING_ITEMS = [
    { key: 'basic_care', label: '基础护理' },
    { key: 'wound_dressing', label: '换药护理' },
    { key: 'injection', label: '注射输液' },
    { key: 'catheter', label: '导管护理' },
    { key: 'pressure_sore', label: '压疮护理' },
    { key: 'rehab', label: '康复训练' },
    { key: 'turn_over', label: '翻身拍背' },
    { key: 'bp_measure', label: '血压测量' },
    { key: 'glucose_monitor', label: '血糖监测' },
    { key: 'oral_care', label: '口腔护理' }
];
function todayStr() {
    var d = new Date();
    return "".concat(d.getFullYear(), "-").concat(String(d.getMonth() + 1).padStart(2, '0'), "-").concat(String(d.getDate()).padStart(2, '0'));
}
function defaultTime() {
    var d = new Date();
    d.setHours(d.getHours() + 1);
    d.setMinutes(0);
    return "".concat(String(d.getHours()).padStart(2, '0'), ":").concat(String(d.getMinutes()).padStart(2, '0'));
}
Page({
    data: {
        statusH: 0,
        mode: 'profile',
        serviceMode: 'visit',
        apptType: '家庭医生',
        doctor: {},
        orgPhone: '',
        loading: false,
        members: [],
        selectedMemberId: null,
        selectedMemberIndex: 0,
        itemList: [],
        selectedItems: [],
        apptDate: todayStr(),
        apptTime: defaultTime(),
        minDate: todayStr(),
        patientName: '',
        patientPhone: '',
        symptoms: '',
        extraNote: ''
    },
    onLoad: function (options) {
        this.setData({ statusH: app.globalData.statusBarHeight || 0 });
        this.prefillContact();
        var type = (options === null || options === void 0 ? void 0 : options.type) || '';
        if (type === 'checkup') {
            this.setData({ mode: 'book', serviceMode: 'checkup', apptType: '预约体检', itemList: CHECKUP_ITEMS });
        }
        else if (type === 'nursing') {
            this.setData({ mode: 'book', serviceMode: 'nursing', apptType: '护理服务', itemList: NURSING_ITEMS });
        }
        else if (type === 'visit') {
            this.setData({ mode: 'book', serviceMode: 'visit', apptType: '上门探访', itemList: [] });
        }
        this.loadDoctor(options === null || options === void 0 ? void 0 : options.id);
        this.loadServicePhone();
        this.loadMembers();
    },
    prefillContact: function () {
        var info = (0, session_1.getStoredUserInfo)() || {};
        this.setData({ patientName: info.name || '', patientPhone: info.phone || info.mobile || '' });
    },
    loadDoctor: function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var doctor, _a, doctor, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!id) return [3 /*break*/, 4];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, api_1.getMiniDoctorDetail)(id)];
                    case 2:
                        doctor = _c.sent();
                        this.setData({ doctor: doctor || {} });
                        return [2 /*return*/];
                    case 3:
                        _a = _c.sent();
                        return [3 /*break*/, 4];
                    case 4:
                        _c.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, (0, api_1.getServiceDoctor)()];
                    case 5:
                        doctor = _c.sent();
                        if (doctor)
                            this.setData({ doctor: doctor });
                        return [3 /*break*/, 7];
                    case 6:
                        _b = _c.sent();
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    },
    loadServicePhone: function () {
        return __awaiter(this, void 0, void 0, function () {
            var center, nextDoctor, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, api_1.getServiceCenterInfo)()];
                    case 1:
                        center = _b.sent();
                        nextDoctor = __assign({}, this.data.doctor);
                        if ((center === null || center === void 0 ? void 0 : center.name) && !nextDoctor.institution && !nextDoctor.hospital) {
                            nextDoctor.institution = center.name;
                        }
                        this.setData({ orgPhone: (center === null || center === void 0 ? void 0 : center.phone) || '', doctor: nextDoctor });
                        return [3 /*break*/, 3];
                    case 2:
                        _a = _b.sent();
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    loadMembers: function () {
        return __awaiter(this, void 0, void 0, function () {
            var members, savedId_1, selectedIndex, current, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, api_1.getMemberList)()];
                    case 1:
                        members = _b.sent();
                        if (!members.length) {
                            this.setData({ members: [] });
                            return [2 /*return*/];
                        }
                        savedId_1 = wx.getStorageSync('currentMemberId');
                        selectedIndex = Math.max(members.findIndex(function (item) { return String(item.id) === String(savedId_1); }), 0);
                        current = members[selectedIndex];
                        wx.setStorageSync('currentMemberId', current.id);
                        this.setData({
                            members: members,
                            selectedMemberId: current.id,
                            selectedMemberIndex: selectedIndex,
                            patientName: this.data.patientName || current.name || ''
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        _a = _b.sent();
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    onMemberChange: function (e) {
        var index = Number(e.detail.value || 0);
        var current = this.data.members[index];
        if (!current)
            return;
        wx.setStorageSync('currentMemberId', current.id);
        this.setData({ selectedMemberIndex: index, selectedMemberId: current.id, patientName: current.name || this.data.patientName });
    },
    callDoctor: function () {
        var _a;
        var phone = (_a = this.data.doctor) === null || _a === void 0 ? void 0 : _a.phone;
        if (!phone) {
            wx.showToast({ title: '暂无联系电话', icon: 'none' });
            return;
        }
        wx.makePhoneCall({ phoneNumber: phone });
    },
    callOrg: function () {
        if (!this.data.orgPhone) {
            wx.showToast({ title: '暂无机构联系电话', icon: 'none' });
            return;
        }
        wx.makePhoneCall({ phoneNumber: this.data.orgPhone });
    },
    toggleItem: function (e) {
        var key = e.currentTarget.dataset.key;
        var selectedItems = __spreadArray([], __read(this.data.selectedItems), false);
        var index = selectedItems.indexOf(key);
        if (index >= 0)
            selectedItems.splice(index, 1);
        else
            selectedItems.push(key);
        this.setData({ selectedItems: selectedItems });
    },
    onDateChange: function (e) { this.setData({ apptDate: e.detail.value }); },
    onTimeChange: function (e) { this.setData({ apptTime: e.detail.value }); },
    onInput: function (e) {
        var _a;
        var field = e.currentTarget.dataset.field;
        this.setData((_a = {}, _a[field] = e.detail.value, _a));
    },
    buildRequirement: function () {
        var _this = this;
        var _a;
        var currentMember = this.data.members[this.data.selectedMemberIndex];
        var lines = [];
        if (currentMember === null || currentMember === void 0 ? void 0 : currentMember.name)
            lines.push("\u670D\u52A1\u5BF9\u8C61\uFF1A".concat(currentMember.name));
        lines.push("\u8054\u7CFB\u4EBA\uFF1A".concat(this.data.patientName));
        lines.push("\u8054\u7CFB\u7535\u8BDD\uFF1A".concat(this.data.patientPhone));
        if ((_a = this.data.doctor) === null || _a === void 0 ? void 0 : _a.name)
            lines.push("\u670D\u52A1\u4EBA\u5458\uFF1A".concat(this.data.doctor.name));
        if (this.data.serviceMode === 'visit') {
            lines.push("\u9700\u6C42\u8BF4\u660E\uFF1A".concat(this.data.symptoms.trim() || '上门探访'));
        }
        else {
            var labels = this.data.selectedItems.map(function (key) { var _a; return ((_a = _this.data.itemList.find(function (item) { return item.key === key; })) === null || _a === void 0 ? void 0 : _a.label) || key; }).join('、');
            lines.push("\u670D\u52A1\u9879\u76EE\uFF1A".concat(labels));
        }
        if (this.data.extraNote.trim())
            lines.push("\u8865\u5145\u8BF4\u660E\uFF1A".concat(this.data.extraNote.trim()));
        return lines.join('\n');
    },
    submitAppointment: function () {
        return __awaiter(this, void 0, void 0, function () {
            var err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.data.loading)
                            return [2 /*return*/];
                        if (!this.data.patientName.trim()) {
                            wx.showToast({ title: '请填写联系人姓名', icon: 'none' });
                            return [2 /*return*/];
                        }
                        if (!this.data.patientPhone.trim()) {
                            wx.showToast({ title: '请填写联系电话', icon: 'none' });
                            return [2 /*return*/];
                        }
                        if (this.data.serviceMode !== 'visit' && this.data.selectedItems.length === 0) {
                            wx.showToast({ title: '请至少选择一个服务项目', icon: 'none' });
                            return [2 /*return*/];
                        }
                        this.setData({ loading: true });
                        wx.showLoading({ title: '提交中...' });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, (0, api_1.createAppointment)({
                                type: this.data.apptType,
                                memberId: this.data.selectedMemberId || undefined,
                                appointTime: "".concat(this.data.apptDate, " ").concat(this.data.apptTime),
                                requirement: this.buildRequirement()
                            })];
                    case 2:
                        _a.sent();
                        wx.hideLoading();
                        wx.showToast({ title: '预约成功', icon: 'success' });
                        setTimeout(function () { return wx.navigateBack(); }, 1200);
                        return [3 /*break*/, 5];
                    case 3:
                        err_1 = _a.sent();
                        wx.hideLoading();
                        wx.showToast({ title: err_1.message || '预约失败', icon: 'none' });
                        return [3 /*break*/, 5];
                    case 4:
                        this.setData({ loading: false });
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    },
    goBack: function () { wx.navigateBack(); }
});
