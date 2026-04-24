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
var SERVICE_RESULTS = ['\u670D\u52A1\u5B8C\u6210', '\u90E8\u5206\u5B8C\u6210', '\u65E0\u6CD5\u5B8C\u6210'];
var ELDER_STATUSES = ['\u826F\u597D', '\u4E00\u822C', '\u9700\u5173\u6CE8', '\u7D27\u6025'];
function todayStr() {
    var d = new Date();
    return "".concat(d.getFullYear(), "-").concat(String(d.getMonth() + 1).padStart(2, '0'), "-").concat(String(d.getDate()).padStart(2, '0'));
}
Page({
    data: {
        submitting: false,
        id: '',
        needAccept: false,
        form: {
            visitDate: todayStr(),
            serviceResult: '',
            elderStatus: '',
            elderStatusNote: '',
            medication: '',
            suggestion: '',
            payAmount: '',
            payStatus: 'unpaid'
        },
        photos: [],
        serviceResults: SERVICE_RESULTS,
        elderStatuses: ELDER_STATUSES
    },
    onLoad: function (options) {
        this.setData({
            id: options.id || '',
            needAccept: options.status === 'pending'
        });
    },
    onVisitDateChange: function (e) {
        this.setData({ 'form.visitDate': e.detail.value });
    },
    selectServiceResult: function (e) {
        this.setData({ 'form.serviceResult': e.currentTarget.dataset.value });
    },
    selectElderStatus: function (e) {
        this.setData({ 'form.elderStatus': e.currentTarget.dataset.value });
    },
    onInput: function (e) {
        var _a;
        var field = e.currentTarget.dataset.field;
        this.setData((_a = {}, _a[field] = e.detail.value, _a));
    },
    onPayStatusChange: function (e) {
        this.setData({ 'form.payStatus': e.currentTarget.dataset.status });
    },
    selectPhoto: function () {
        var _this = this;
        if (this.data.photos.length >= 9) {
            wx.showToast({ title: '最多上传9张照片', icon: 'none' });
            return;
        }
        wx.chooseMedia({
            count: 9 - this.data.photos.length,
            mediaType: ['image'],
            sourceType: ['album', 'camera'],
            success: function (res) {
                var newPaths = res.tempFiles.map(function (f) { return f.tempFilePath; });
                _this.setData({ photos: _this.data.photos.concat(newPaths) });
            }
        });
    },
    removePhoto: function (e) {
        var index = Number(e.currentTarget.dataset.index);
        var photos = this.data.photos.slice();
        photos.splice(index, 1);
        this.setData({ photos: photos });
    },
    previewPhoto: function (e) {
        var index = Number(e.currentTarget.dataset.index);
        wx.previewImage({
            current: this.data.photos[index],
            urls: this.data.photos
        });
    },
    buildRemark: function () {
        var form = this.data.form;
        var lines = [];
        if (form.serviceResult) lines.push('\u670D\u52A1\u7ED3\u679C\uFF1A' + form.serviceResult);
        if (form.elderStatus) {
            var note = form.elderStatusNote.trim();
            lines.push('\u957F\u8F88\u72B6\u6001\uFF1A' + form.elderStatus + (note ? '\uFF08' + note + '\uFF09' : ''));
        }
        if (form.medication.trim()) lines.push('\u7528\u836F\u60C5\u51B5\uFF1A' + form.medication.trim());
        if (form.suggestion.trim()) lines.push('\u540E\u7EED\u5EFA\u8BAE\uFF1A' + form.suggestion.trim());
        return lines.join('\n');
    },
    handleSubmit: function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, form, id, needAccept, photos, photoUrls, i, path, url, _b, err_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this.data, form = _a.form, id = _a.id, needAccept = _a.needAccept, photos = _a.photos;
                        if (this.data.submitting) return [2 /*return*/];
                        if (!form.visitDate) { wx.showToast({ title: '请选择实际上门日期', icon: 'none' }); return [2 /*return*/]; }
                        if (!form.serviceResult) { wx.showToast({ title: '请选择服务结果', icon: 'none' }); return [2 /*return*/]; }
                        if (!form.elderStatus) { wx.showToast({ title: '请选择长辈状态', icon: 'none' }); return [2 /*return*/]; }
                        if (!id) { wx.showToast({ title: '预约ID缺失', icon: 'none' }); return [2 /*return*/]; }
                        this.setData({ submitting: true });
                        wx.showLoading({ title: '提交中...' });
                        photoUrls = [];
                        i = 0;
                        _c.label = 1;
                    case 1:
                        if (!(i < photos.length)) return [3 /*break*/, 6];
                        path = photos[i];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, (0, api_1.uploadPhoto)(path)];
                    case 3:
                        url = _c.sent();
                        if (url) photoUrls.push(url);
                        return [3 /*break*/, 5];
                    case 4:
                        _b = _c.sent();
                        return [3 /*break*/, 5];
                    case 5:
                        i++;
                        return [3 /*break*/, 1];
                    case 6:
                        _c.trys.push([6, 10, 11, 12]);
                        if (!needAccept) return [3 /*break*/, 8];
                        return [4 /*yield*/, (0, api_1.acceptAppointment)(id)];
                    case 7:
                        _c.sent();
                        _c.label = 8;
                    case 8: return [4 /*yield*/, (0, api_1.submitVisitRecord)(id, {
                            visitTime: form.visitDate + ' 00:00:00',
                            remark: this.buildRemark(),
                            payAmount: form.payAmount || undefined,
                            payStatus: form.payStatus,
                            photos: photoUrls.length > 0 ? photoUrls : undefined
                        })];
                    case 9:
                        _c.sent();
                        wx.hideLoading();
                        wx.showToast({ title: '记录已提交', icon: 'success' });
                        setTimeout(function () { return wx.navigateBack(); }, 1500);
                        return [3 /*break*/, 12];
                    case 10:
                        err_1 = _c.sent();
                        wx.hideLoading();
                        wx.showToast({ title: err_1.message || '提交失败', icon: 'none' });
                        return [3 /*break*/, 12];
                    case 11:
                        this.setData({ submitting: false });
                        return [7 /*endfinally*/];
                    case 12: return [2 /*return*/];
                }
            });
        });
    }
});
