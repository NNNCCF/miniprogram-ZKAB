"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.del = exports.put = exports.post = exports.get = void 0;
exports.request = request;
var config_1 = require("./config");
var sign_1 = require("./sign");
function request(url, method, data) {
    if (method === void 0) { method = 'GET'; }
    var app = getApp();
    var token = app.globalData.token || wx.getStorageSync('token') || '';
    var baseUrl = (0, config_1.getBaseUrl)();
    var requestPath = "/api".concat(url);
    var query = method === 'GET' && data ? (0, sign_1.buildCanonicalQuery)(data) : '';
    var requestUrl = query ? "".concat(baseUrl).concat(url, "?").concat(query) : "".concat(baseUrl).concat(url);
    var body = method === 'GET' || data === undefined ? '' : (0, sign_1.stableStringify)(data);
    var signatureHeaders = (0, sign_1.buildMiniAppSignatureHeaders)(method, requestPath, query, body);
    return new Promise(function (resolve, reject) {
        wx.request({
            url: requestUrl,
            method: method,
            data: body || undefined,
            header: {
                'Content-Type': 'application/json',
                Authorization: token ? "Bearer ".concat(token) : '',
                'X-Mini-Client-Id': signatureHeaders['X-Mini-Client-Id'],
                'X-Mini-Timestamp': signatureHeaders['X-Mini-Timestamp'],
                'X-Mini-Nonce': signatureHeaders['X-Mini-Nonce'],
                'X-Mini-Signature': signatureHeaders['X-Mini-Signature']
            },
            success: function (res) {
                if (res.statusCode === 401) {
                    app.resetGlobalAlarmState === null || app.resetGlobalAlarmState === void 0 ? void 0 : app.resetGlobalAlarmState();
                    wx.removeStorageSync('token');
                    wx.reLaunch({ url: '/pages/login/login' });
                    reject(new Error('未授权'));
                    return;
                }
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    var body = res.data;
                    // 解包后端 ApiResponse<T> 包装 { code, message, data }
                    if (body && typeof body === 'object' && 'code' in body) {
                        if (body.code === 0) {
                            resolve(body.data);
                        }
                        else {
                            reject(new Error(body.message || '请求失败'));
                        }
                    }
                    else {
                        // 非标准包装，直接返回
                        resolve(res.data);
                    }
                }
                else {
                    var body = res.data;
                    reject(new Error((body === null || body === void 0 ? void 0 : body.message) || (body === null || body === void 0 ? void 0 : body.msg) || '请求失败'));
                }
            },
            fail: function (err) {
                reject(new Error(err.errMsg || '网络错误'));
            }
        });
    });
}
var get = function (url, data) { return request(url, 'GET', data); };
exports.get = get;
var post = function (url, data) { return request(url, 'POST', data); };
exports.post = post;
var put = function (url, data) { return request(url, 'PUT', data); };
exports.put = put;
var del = function (url, data) { return request(url, 'DELETE', data); };
exports.del = del;
