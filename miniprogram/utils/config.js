"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMiniAppSharedSecret = exports.getMiniAppClientId = void 0;
exports.getBaseUrl = getBaseUrl;
var DEFAULT_API_ORIGIN = 'https://116.204.127.178';
var DEFAULT_MINI_APP_CLIENT_ID = 'zkab-miniapp';
var DEFAULT_MINI_APP_SHARED_SECRET = 'change-me-miniapp-shared-secret';
function getBaseUrl() {
    var customOrigin = wx.getStorageSync('apiBaseUrl');
    var origin = customOrigin || DEFAULT_API_ORIGIN;
    return "".concat(origin, "/api");
}
function getMiniAppClientId() {
    return wx.getStorageSync('miniAppClientId') || DEFAULT_MINI_APP_CLIENT_ID;
}
exports.getMiniAppClientId = getMiniAppClientId;
function getMiniAppSharedSecret() {
    return wx.getStorageSync('miniAppSharedSecret') || DEFAULT_MINI_APP_SHARED_SECRET;
}
exports.getMiniAppSharedSecret = getMiniAppSharedSecret;
