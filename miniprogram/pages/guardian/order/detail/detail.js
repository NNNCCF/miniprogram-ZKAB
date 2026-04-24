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
var PROGRESS_LABELS = ['\u5DF2\u63D0\u4EA4', '\u5DF2\u6D3E\u5355', '\u62A4\u7406\u4EBA\u5458\u5DF2\u63A5\u5355', '\u670D\u52A1\u4E2D', '\u5DF2\u5B8C\u6210'];
function buildProgressData(currentStep) {
    return PROGRESS_LABELS.map(function (label, index) {
        return {
            label: label,
            active: index <= currentStep,
            current: index === currentStep,
            done: index < currentStep,
            showLine: index < PROGRESS_LABELS.length - 1,
            lineActive: index < currentStep
        };
    });
}
function getProgressStep(appt) {
    if (appt.status === 'completed') return 4;
    if (appt.status === 'accepted') return 2;
    if (appt.nurseName) return 1;
    return 0;
}
Page({
    data: {
        statusH: 0,
        loading: false,
        id: '',
        appt: null,
        progressData: buildProgressData(0),
        trackWidth: '0%',
        currentStep: 0,
        cancelled: false
    },
    onLoad: function (options) {
        this.setData({ statusH: app.globalData.statusBarHeight || 0, id: options.id || '' });
        this.loadDetail(options.id);
    },
    onShow: function () {
        if (this.data.id) this.loadDetail(this.data.id);
    },
    loadDetail: function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var appt, cancelled, currentStep, trackWidth, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!id) return [2 /*return*/];
                        this.setData({ loading: true });
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, (0, api_1.getAppointmentDetail)(id)];
                    case 2:
                        appt = _b.sent();
                        cancelled = appt.status === 'cancelled';
                        currentStep = cancelled ? 0 : getProgressStep(appt);
                        trackWidth = currentStep === 0 ? '0%' : (currentStep / 4 * 100) + '%';
                        this.setData({
                            appt: appt,
                            cancelled: cancelled,
                            currentStep: currentStep,
                            progressData: buildProgressData(currentStep),
                            trackWidth: trackWidth
                        });
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
    callNurse: function () {
        var _a;
        var phone = ((_a = this.data.appt) === null || _a === void 0 ? void 0 : _a.doctorPhone) || (this.data.appt && this.data.appt.nursePhone);
        if (!phone) {
            wx.showToast({ title: '暂无联系电话', icon: 'none' });
            return;
        }
        wx.makePhoneCall({ phoneNumber: phone });
    },
    goBack: function () {
        wx.navigateBack();
    }
});
