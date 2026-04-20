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
Object.defineProperty(exports, "__esModule", { value: true });
exports.readStorageObject = readStorageObject;
exports.normalizeUserInfo = normalizeUserInfo;
exports.getStoredUserInfo = getStoredUserInfo;
exports.setStoredUserInfo = setStoredUserInfo;
exports.clearSession = clearSession;
function readStorageObject(key) {
    var raw = wx.getStorageSync(key);
    if (!raw)
        return null;
    if (typeof raw === 'string') {
        try {
            return JSON.parse(raw);
        }
        catch (_a) {
            return null;
        }
    }
    return raw;
}
function normalizeUserInfo(userInfo) {
    var info = __assign({}, (userInfo || {}));
    if (info.institutionName && !info.orgName)
        info.orgName = info.institutionName;
    if (info.institutionId && !info.orgId)
        info.orgId = info.institutionId;
    if (info.mobile && !info.phone)
        info.phone = info.mobile;
    return info;
}
function getStoredUserInfo() {
    return normalizeUserInfo(readStorageObject('userInfo'));
}
function setStoredUserInfo(userInfo) {
    var normalized = normalizeUserInfo(userInfo);
    wx.setStorageSync('userInfo', normalized);
    try {
        var app = getApp();
        app.globalData.userInfo = normalized;
    }
    catch (_a) { }
    return normalized;
}
function clearSession(preserveKeys) {
    if (preserveKeys === void 0) { preserveKeys = []; }
    var preserved = {};
    preserveKeys.forEach(function (key) {
        var value = wx.getStorageSync(key);
        if (value !== '' && value !== undefined && value !== null) {
            preserved[key] = value;
        }
    });
    wx.clearStorageSync();
    Object.keys(preserved).forEach(function (key) { return wx.setStorageSync(key, preserved[key]); });
    try {
        var app = getApp();
        app.globalData.token = preserved.token || '';
        app.globalData.role = preserved.role || '';
        app.globalData.userInfo = preserved.userInfo ? normalizeUserInfo(preserved.userInfo) : null;
    }
    catch (_a) { }
}
