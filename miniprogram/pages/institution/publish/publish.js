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
var api_1 = require("../../../utils/api");
var session_1 = require("../../../utils/session");
var TYPES = [
    { label: '\u5065\u5eb7\u63d0\u793a', value: 'health' },
    { label: '\u6d3b\u52a8\u901a\u77e5', value: 'activity' },
    { label: '\u7d27\u6025\u901a\u77e5', value: 'urgent' },
    { label: '\u673a\u6784\u516c\u544a', value: 'announcement' }
];
Page({
    data: {
        types: TYPES,
        form: {
            title: '',
            type: 'health',
            content: '',
            target: 'all',
            familyName: ''
        },
        photos: [],
        submitting: false
    },
    onInput: function (e) {
        var _a;
        var field = e.currentTarget.dataset.field;
        this.setData((_a = {}, _a['form.' + field] = e.detail.value, _a));
    },
    onTypeChange: function (e) {
        this.setData({ 'form.type': e.currentTarget.dataset.value });
    },
    onTargetChange: function (e) {
        this.setData({ 'form.target': e.currentTarget.dataset.value });
    },
    selectPhoto: function () {
        var _this = this;
        if (this.data.photos.length >= 9) {
            wx.showToast({ title: '最多上传9张图片', icon: 'none' });
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
        wx.previewImage({ current: this.data.photos[index], urls: this.data.photos });
    },
    onSubmit: function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, form, photos, attachments, i, path, url, _b, userInfo, err_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this.data, form = _a.form, photos = _a.photos;
                        if (!form.title.trim()) { wx.showToast({ title: '请输入标题', icon: 'none' }); return [2 /*return*/]; }
                        if (form.content.trim().length < 10) { wx.showToast({ title: '内容至少10字', icon: 'none' }); return [2 /*return*/]; }
                        if (form.target === 'specific' && !form.familyName.trim()) { wx.showToast({ title: '请输入目标家庭姓名', icon: 'none' }); return [2 /*return*/]; }
                        this.setData({ submitting: true });
                        wx.showLoading({ title: '发布中...' });
                        attachments = [];
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
                        if (url) attachments.push(url);
                        return [3 /*break*/, 5];
                    case 4:
                        _b = _c.sent();
                        return [3 /*break*/, 5];
                    case 5:
                        i++;
                        return [3 /*break*/, 1];
                    case 6:
                        _c.trys.push([6, 8, 9, 10]);
                        userInfo = (0, session_1.getStoredUserInfo)() || {};
                        return [4 /*yield*/, (0, api_1.createNewsPost)({
                                title: form.title.trim(),
                                content: form.content.trim(),
                                category: form.type,
                                targetScope: form.target === 'specific' ? 'FAMILY' : 'ALL',
                                targetFamilyName: form.target === 'specific' ? form.familyName.trim() : undefined,
                                publisherId: userInfo.id,
                                publisherName: userInfo.name || userInfo.orgName,
                                attachments: attachments.length > 0 ? attachments : undefined
                            })];
                    case 7:
                        _c.sent();
                        wx.hideLoading();
                        wx.showToast({ title: '发布成功', icon: 'success' });
                        setTimeout(function () { return wx.navigateBack(); }, 1500);
                        return [3 /*break*/, 10];
                    case 8:
                        err_1 = _c.sent();
                        wx.hideLoading();
                        wx.showToast({ title: err_1.message || '发布失败', icon: 'none' });
                        return [3 /*break*/, 10];
                    case 9:
                        this.setData({ submitting: false });
                        return [7 /*endfinally*/];
                    case 10: return [2 /*return*/];
                }
            });
        });
    }
});
