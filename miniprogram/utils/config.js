"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBaseUrl = getBaseUrl;
var DEFAULT_API_ORIGIN = 'http://localhost:8080';
function getBaseUrl() {
    var customOrigin = wx.getStorageSync('apiBaseUrl');
    var origin = customOrigin || DEFAULT_API_ORIGIN;
    return "".concat(origin, "/api");
}
