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
var session_1 = require("../../../../utils/session");
var app = getApp();
function todayStr() {
    var d = new Date();
    return "".concat(d.getFullYear(), "-").concat(String(d.getMonth() + 1).padStart(2, '0'), "-").concat(String(d.getDate()).padStart(2, '0'));
}
function nowTimeStr() {
    var d = new Date();
    d.setMinutes(d.getMinutes() + 30);
    return "".concat(String(d.getHours()).padStart(2, '0'), ":").concat(String(d.getMinutes()).padStart(2, '0'));
}
Page({
    data: {
        statusH: 0,
        submitting: false,
        selectedAddress: '',
        addressDetail: '',
        contactName: '',
        contactPhone: '',
        deliveryDate: todayStr(),
        deliveryTime: nowTimeStr(),
        minDate: todayStr(),
        payMethod: '送达后支付',
        medicines: '',
        notes: ''
    },
    onLoad: function () {
        this.setData({ statusH: app.globalData.statusBarHeight || 0 });
        var info = (0, session_1.getStoredUserInfo)() || {};
        this.setData({ contactName: info.name || '', contactPhone: info.phone || info.mobile || '' });
    },
    chooseLocation: function () {
        var _this = this;
        wx.chooseLocation({
            success: function (res) {
                var title = [res.name, res.address].filter(Boolean).join(' ');
                _this.setData({ selectedAddress: title });
            }
        });
    },
    onDateChange: function (e) { this.setData({ deliveryDate: e.detail.value }); },
    onTimeChange: function (e) { this.setData({ deliveryTime: e.detail.value }); },
    onInput: function (e) {
        var _a;
        var field = e.currentTarget.dataset.field;
        this.setData((_a = {}, _a[field] = e.detail.value, _a));
    },
    submit: function () {
        return __awaiter(this, void 0, void 0, function () {
            var medicineList, fullAddress, addressDesc, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.data.submitting)
                            return [2 /*return*/];
                        if (!this.data.selectedAddress && !this.data.addressDetail.trim()) {
                            wx.showToast({ title: '请先选择地址或补充地址', icon: 'none' });
                            return [2 /*return*/];
                        }
                        if (!this.data.contactName.trim()) {
                            wx.showToast({ title: '请填写联系人', icon: 'none' });
                            return [2 /*return*/];
                        }
                        if (!this.data.contactPhone.trim()) {
                            wx.showToast({ title: '请填写联系电话', icon: 'none' });
                            return [2 /*return*/];
                        }
                        if (!this.data.medicines.trim()) {
                            wx.showToast({ title: '请填写所需药品', icon: 'none' });
                            return [2 /*return*/];
                        }
                        medicineList = this.data.medicines.split(/[，,\n]+/).map(function (item) { return item.trim(); }).filter(Boolean);
                        if (!medicineList.length) {
                            wx.showToast({ title: '请填写有效药品名称', icon: 'none' });
                            return [2 /*return*/];
                        }
                        fullAddress = [this.data.selectedAddress, this.data.addressDetail.trim()].filter(Boolean).join(' ');
                        addressDesc = [
                            "\u5730\u5740\uFF1A".concat(fullAddress),
                            "\u8054\u7CFB\u4EBA\uFF1A".concat(this.data.contactName.trim()),
                            "\u7535\u8BDD\uFF1A".concat(this.data.contactPhone.trim()),
                            "\u9001\u8FBE\u65F6\u95F4\uFF1A".concat(this.data.deliveryDate, " ").concat(this.data.deliveryTime)
                        ].join('；');
                        this.setData({ submitting: true });
                        wx.showLoading({ title: '提交中...' });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, (0, api_1.createMedicineOrder)({
                                medicines: medicineList.map(function (name) { return ({ name: name, spec: '', qty: 1 }); }),
                                address: addressDesc,
                                notes: this.data.notes.trim()
                            })];
                    case 2:
                        _a.sent();
                        wx.hideLoading();
                        wx.showToast({ title: '订单已提交', icon: 'success' });
                        setTimeout(function () { return wx.navigateTo({ url: '/pages/guardian/order/list/list' }); }, 1200);
                        return [3 /*break*/, 5];
                    case 3:
                        err_1 = _a.sent();
                        wx.hideLoading();
                        wx.showToast({ title: err_1.message || '提交失败', icon: 'none' });
                        return [3 /*break*/, 5];
                    case 4:
                        this.setData({ submitting: false });
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    },
    goBack: function () { wx.navigateBack(); }
});
