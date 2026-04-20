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
Page({
    data: {
        lat: 37.8706,
        lng: 112.5498,
        markers: [],
        families: []
    },
    onLoad: function () {
        this.loadLocations();
    },
    loadLocations: function () {
        return __awaiter(this, void 0, void 0, function () {
            var families, markers_1, update, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, api_1.getFamilyMapList)()];
                    case 1:
                        families = _a.sent();
                        markers_1 = [];
                        families.forEach(function (item, index) {
                            if (item.latitude == null || item.longitude == null)
                                return;
                            markers_1.push({
                                id: index,
                                latitude: item.latitude,
                                longitude: item.longitude,
                                title: item.shortName || item.familyName || item.address || '家庭',
                                iconPath: '/images/tab_home.png',
                                width: 30,
                                height: 30
                            });
                        });
                        update = { markers: markers_1, families: families };
                        if (markers_1.length > 0) {
                            update.lat = markers_1[0].latitude;
                            update.lng = markers_1[0].longitude;
                        }
                        this.setData(update);
                        return [3 /*break*/, 3];
                    case 2:
                        err_1 = _a.sent();
                        wx.showToast({
                            title: err_1.message || '位置加载失败',
                            icon: 'none'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    onMarkerTap: function (e) {
        var markerId = e.detail.markerId;
        var family = this.data.families[markerId];
        if (!family)
            return;
        wx.showModal({
            title: family.shortName || family.familyName || '家庭位置',
            content: "\u5730\u5740\uFF1A".concat(family.address || '未知'),
            showCancel: false,
            confirmText: '知道了'
        });
    }
});
