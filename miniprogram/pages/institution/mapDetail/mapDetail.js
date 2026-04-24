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
    data: { lat: 37.8706, lng: 112.5498, markers: [], families: [] },
    onLoad: function () { this.loadLocations(); },
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
                            if (item.latitude == null || item.longitude == null) return;
                            var isAlarm = item.hasAlarm === true || item.status === 'alarm';
                            var familyName = item.shortName || item.familyName || item.address || '\u672a\u547d\u540d\u5bb6\u5ead';
                            markers_1.push({
                                id: index,
                                latitude: item.latitude,
                                longitude: item.longitude,
                                title: familyName,
                                iconPath: isAlarm ? '/images/marker_alarm.png' : '/images/marker_family.png',
                                width: 40,
                                height: 40,
                                callout: {
                                    content: familyName + '\n\u6210\u5458\u6570\uff1a' + (item.memberCount || 0) + ' \u4eba\n\u5730\u5740\uff1a' + (item.address || '\u672a\u77e5') + '\n' + (isAlarm ? '\u26a0\ufe0f \u6709\u62a5\u8b66' : '\u6b63\u5e38'),
                                    color: '#1a1a1a',
                                    fontSize: 13,
                                    borderRadius: 10,
                                    bgColor: '#ffffff',
                                    padding: 12,
                                    display: 'BYCLICK',
                                    borderWidth: 1,
                                    borderColor: isAlarm ? '#EF4444' : '#3B7EFF'
                                }
                            });
                        });
                        update = { markers: markers_1, families: families };
                        if (markers_1.length > 0) { update.lat = markers_1[0].latitude; update.lng = markers_1[0].longitude; }
                        this.setData(update);
                        return [3 /*break*/, 3];
                    case 2:
                        err_1 = _a.sent();
                        wx.showToast({ title: err_1.message || '\u4f4d\u7f6e\u52a0\u8f7d\u5931\u8d25', icon: 'none' });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    onMarkerTap: function (e) {
        var family = this.data.families[e.detail.markerId];
        if (!family) return;
        var isAlarm = family.hasAlarm === true || family.status === 'alarm';
        wx.showModal({
            title: family.shortName || family.familyName || '\u5bb6\u5ead\u4f4d\u7f6e',
            content: '\u5730\u5740\uff1a' + (family.address || '\u672a\u77e5') + '\n\u6210\u5458\u6570\uff1a' + (family.memberCount || 0) + ' \u4eba' + (isAlarm ? '\n\u26a0\ufe0f \u5f53\u524d\u6709\u62a5\u8b66' : ''),
            showCancel: false,
            confirmText: '\u77e5\u9053\u4e86'
        });
    }
});
