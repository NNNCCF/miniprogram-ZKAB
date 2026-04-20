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
var STATUS_LABEL = {
    pending: '待处理',
    accepted: '已派单',
    completed: '已完成',
    cancelled: '已取消'
};
Page({
    data: {
        loading: false,
        dispatching: false,
        id: '',
        appt: null,
        showDispatchModal: false,
        nurses: [],
        selectedNurseId: null,
        selectedNurseName: ''
    },
    onLoad: function (options) {
        var id = options.id || '';
        this.setData({ id: id });
        this.loadDetail(id);
    },
    onShow: function () {
        if (this.data.id)
            this.loadDetail(this.data.id);
    },
    loadDetail: function (id) {
        var _this = this;
        if (!id)
            return;
        this.setData({ loading: true });
        (0, api_1.getAppointmentDetail)(id)
            .then(function (res) {
            _this.setData({
                appt: __assign(__assign({}, res), { statusLabel: STATUS_LABEL[res.status] || res.status }),
                loading: false
            });
        })
            .catch(function () {
            _this.setData({ loading: false });
            wx.showToast({ title: '加载失败', icon: 'none' });
        });
    },
    openDispatchModal: function () {
        return __awaiter(this, void 0, void 0, function () {
            var nurses, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        wx.showLoading({ title: '加载医护...' });
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, api_1.getInstitutionNurses)()];
                    case 2:
                        nurses = _b.sent();
                        wx.hideLoading();
                        this.setData({
                            nurses: nurses || [],
                            showDispatchModal: true,
                            selectedNurseId: null,
                            selectedNurseName: ''
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        _a = _b.sent();
                        wx.hideLoading();
                        wx.showToast({ title: '加载医护列表失败', icon: 'none' });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    },
    closeDispatchModal: function () {
        this.setData({ showDispatchModal: false });
    },
    selectNurse: function (e) {
        var id = e.currentTarget.dataset.id;
        var name = e.currentTarget.dataset.name;
        this.setData({ selectedNurseId: id, selectedNurseName: name });
    },
    confirmDispatch: function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, id, selectedNurseId, selectedNurseName, dispatching, err_1;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.data, id = _a.id, selectedNurseId = _a.selectedNurseId, selectedNurseName = _a.selectedNurseName, dispatching = _a.dispatching;
                        if (!selectedNurseId) {
                            wx.showToast({ title: '请选择医护人员', icon: 'none' });
                            return [2 /*return*/];
                        }
                        if (dispatching)
                            return [2 /*return*/];
                        this.setData({ dispatching: true });
                        wx.showLoading({ title: '派单中...' });
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, (0, api_1.dispatchAppointment)(id, {
                                nurseId: Number(selectedNurseId),
                                nurseName: selectedNurseName
                            })];
                    case 2:
                        _b.sent();
                        wx.hideLoading();
                        wx.showToast({ title: '派单成功', icon: 'success' });
                        this.setData({ showDispatchModal: false });
                        setTimeout(function () { return _this.loadDetail(id); }, 1500);
                        return [3 /*break*/, 5];
                    case 3:
                        err_1 = _b.sent();
                        wx.hideLoading();
                        wx.showToast({ title: err_1.message || '派单失败', icon: 'none' });
                        return [3 /*break*/, 5];
                    case 4:
                        this.setData({ dispatching: false });
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    },
    goBack: function () {
        wx.navigateBack();
    }
});
