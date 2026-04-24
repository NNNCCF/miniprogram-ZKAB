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
exports.getNewsDetail = exports.getNewsList = exports.createNewsPost = exports.getStaffSummary = exports.getStaffOrgInfo = exports.updateStaffProfile = exports.getStaffProfile = exports.submitMiniFeedback = exports.createEmergencyCall = exports.updateGuardianAlarmSettings = exports.getGuardianAlarmSettings = exports.updateGuardianProfile = exports.getGuardianProfile = exports.getServiceCenterInfo = exports.getInstitutionFamilies = exports.getInstitutionNurses = exports.createMember = exports.createMedicineOrder = exports.getMiniDoctorDetail = exports.getServiceDoctor = exports.getMonitorHistory = exports.getMonitorRealtime = exports.getNurseList = exports.getDeviceList = exports.unbindDevice = exports.bindDevice = exports.getMemberList = exports.getMemberHistory = exports.getFamilyMapList = exports.getFamilyDetail = exports.getFamilyList = exports.submitVisitRecord = exports.dispatchAppointment = exports.acceptAppointment = exports.createAppointment = exports.getAppointmentDetail = exports.getAppointments = exports.ignoreAlarm = exports.handleAlarm = exports.getAlarmDetail = exports.getAlarms = exports.getPublicInstitutionList = exports.guardianRegister = exports.nurseRegister = exports.guardianLogin = exports.nurseLogin = exports.unifiedLogin = void 0;
var request_1 = require("./request");
var normalizers_1 = require("./normalizers");
// ─── 认证 ────────────────────────────────────────────────
/** 统一登录：后端自动识别角色，返回 { token, role, userInfo } */
var unifiedLogin = function (data) {
    return (0, request_1.post)('/auth/login', data).then(function (res) { return (__assign(__assign({}, res), { userInfo: (0, normalizers_1.normalizeUserInfo)(res === null || res === void 0 ? void 0 : res.userInfo) })); });
};
exports.unifiedLogin = unifiedLogin;
var nurseLogin = function (data) {
    return (0, request_1.post)('/auth/nurse/login', data);
};
exports.nurseLogin = nurseLogin;
var guardianLogin = function (data) {
    return (0, request_1.post)('/auth/guardian/login', data);
};
exports.guardianLogin = guardianLogin;
var nurseRegister = function (data) {
    return (0, request_1.post)('/auth/nurse/register', data);
};
exports.nurseRegister = nurseRegister;
var guardianRegister = function (data) {
    return (0, request_1.post)('/auth/guardian/register', data);
};
exports.guardianRegister = guardianRegister;
/** 获取已启用机构列表（注册时选择，无需登录）*/
var getPublicInstitutionList = function () {
    return (0, request_1.get)('/institution/list');
};
exports.getPublicInstitutionList = getPublicInstitutionList;
// ─── 报警 /mini/alarms ───────────────────────────────────
var getAlarms = function (params) { return (0, request_1.get)('/mini/alarms', params).then(function (list) { return (list || []).map(normalizers_1.normalizeAlarm); }); };
exports.getAlarms = getAlarms;
var getAlarmDetail = function (id) {
    return (0, request_1.get)("/mini/alarms/".concat(id)).then(normalizers_1.normalizeAlarm);
};
exports.getAlarmDetail = getAlarmDetail;
var handleAlarm = function (id, data) { return (0, request_1.post)("/mini/alarms/".concat(id, "/handle"), data); };
exports.handleAlarm = handleAlarm;
var ignoreAlarm = function (id) {
    return (0, request_1.post)("/mini/alarms/".concat(id, "/ignore"), {});
};
exports.ignoreAlarm = ignoreAlarm;
// ─── 预约 /mini/appointments ─────────────────────────────
var getAppointments = function (params) { return (0, request_1.get)('/mini/appointments', params).then(function (list) { return (list || []).map(normalizers_1.normalizeAppointment); }); };
exports.getAppointments = getAppointments;
var getAppointmentDetail = function (id) {
    return (0, request_1.get)("/mini/appointments/".concat(id)).then(normalizers_1.normalizeAppointment);
};
exports.getAppointmentDetail = getAppointmentDetail;
var createAppointment = function (data) { return (0, request_1.post)('/mini/appointments', data); };
exports.createAppointment = createAppointment;
var acceptAppointment = function (id) {
    return (0, request_1.put)("/mini/appointments/".concat(id, "/accept"), {});
};
exports.acceptAppointment = acceptAppointment;
var dispatchAppointment = function (id, data) { return (0, request_1.put)("/mini/appointments/".concat(id, "/dispatch"), data); };
exports.dispatchAppointment = dispatchAppointment;
var submitVisitRecord = function (id, data) { return (0, request_1.post)("/mini/appointments/".concat(id, "/visit-record"), data); };
exports.submitVisitRecord = submitVisitRecord;
// ─── 家庭档案 /mini/family ───────────────────────────────
var getFamilyList = function (params) {
    return (0, request_1.get)('/mini/family/list', params).then(function (list) { return (list || []).map(normalizers_1.normalizeFamily); });
};
exports.getFamilyList = getFamilyList;
var getFamilyDetail = function (id) {
    return (0, request_1.get)("/mini/family/".concat(id)).then(normalizers_1.normalizeFamily);
};
exports.getFamilyDetail = getFamilyDetail;
var getFamilyMapList = function () {
    return (0, request_1.get)('/mini/family/map-list').then(function (list) { return (list || []).map(normalizers_1.normalizeFamily); });
};
exports.getFamilyMapList = getFamilyMapList;
// ─── 成员健康历史 ─────────────────────────────────────────
var getMemberHistory = function (familyId, memberId, params) { return (0, request_1.get)("/mini/family/".concat(familyId, "/member/").concat(memberId, "/history"), params); };
exports.getMemberHistory = getMemberHistory;
// ─── 成员列表 ─────────────────────────────────────────────
var getMemberList = function () {
    return (0, request_1.get)('/mini/member/list').then(function (list) { return (list || []).map(normalizers_1.normalizeMember); });
};
exports.getMemberList = getMemberList;
// ─── 设备 /mini/device ───────────────────────────────────
var bindDevice = function (data) { return (0, request_1.post)('/mini/device/bind', data); };
exports.bindDevice = bindDevice;
var unbindDevice = function (data) {
    return (0, request_1.post)('/mini/device/unbind', data);
};
exports.unbindDevice = unbindDevice;
var getDeviceList = function () {
    return (0, request_1.get)('/mini/device/list');
};
exports.getDeviceList = getDeviceList;
// ─── 护士列表 ─────────────────────────────────────────────
var getNurseList = function () {
    return (0, request_1.get)('/mini/nurse-list');
};
exports.getNurseList = getNurseList;
// ─── 实时监控 /mini/monitor ───────────────────────────────
var getMonitorRealtime = function (memberId) {
    return (0, request_1.get)('/mini/monitor/realtime', { memberId: memberId });
};
exports.getMonitorRealtime = getMonitorRealtime;
var getMonitorHistory = function (params) { return (0, request_1.get)('/mini/monitor/history', params); };
exports.getMonitorHistory = getMonitorHistory;
// ─── 绑定的家庭医生（当前登录家属设备关联的医生）────────────
var getServiceDoctor = function () {
    return (0, request_1.get)('/mini/service/doctor');
};
exports.getServiceDoctor = getServiceDoctor;
// ─── 医生详情（家属端）/mini/doctor ───────────────────────
var getMiniDoctorDetail = function (id) {
    return (0, request_1.get)("/mini/doctor/".concat(id));
};
exports.getMiniDoctorDetail = getMiniDoctorDetail;
// ─── 送药上门订单 /mini/medicine/order ────────────────────
var createMedicineOrder = function (data) { return (0, request_1.post)('/mini/medicine/order', data); };
exports.createMedicineOrder = createMedicineOrder;
// ─── 创建成员 /mini/member/create ─────────────────────────
var createMember = function (data) { return (0, request_1.post)('/mini/member/create', data); };
exports.createMember = createMember;
// ─── 机构管理接口 /mini/institution ──────────────────────
/** 获取本机构医护人员列表 */
var getInstitutionNurses = function () {
    return (0, request_1.get)('/mini/institution/nurses');
};
exports.getInstitutionNurses = getInstitutionNurses;
/** 获取本机构绑定家庭列表 */
var getInstitutionFamilies = function () {
    return (0, request_1.get)('/mini/institution/families').then(function (list) { return (list || []).map(normalizers_1.normalizeFamily); });
};
exports.getInstitutionFamilies = getInstitutionFamilies;
var getServiceCenterInfo = function () {
    return (0, request_1.get)('/mini/service/center').then(normalizers_1.normalizeServiceCenter);
};
exports.getServiceCenterInfo = getServiceCenterInfo;
var getGuardianProfile = function () {
    return (0, request_1.get)('/mini/guardian/profile').then(normalizers_1.normalizeUserInfo);
};
exports.getGuardianProfile = getGuardianProfile;
var updateGuardianProfile = function (data) {
    return (0, request_1.put)('/mini/guardian/profile', data).then(normalizers_1.normalizeUserInfo);
};
exports.updateGuardianProfile = updateGuardianProfile;
var getGuardianAlarmSettings = function () {
    return (0, request_1.get)('/mini/guardian/alarm-settings');
};
exports.getGuardianAlarmSettings = getGuardianAlarmSettings;
var updateGuardianAlarmSettings = function (data) { return (0, request_1.put)('/mini/guardian/alarm-settings', data); };
exports.updateGuardianAlarmSettings = updateGuardianAlarmSettings;
var createEmergencyCall = function (data) {
    return (0, request_1.post)('/mini/guardian/emergency/call', data || {});
};
exports.createEmergencyCall = createEmergencyCall;
var submitMiniFeedback = function (data) {
    return (0, request_1.post)('/mini/feedback', data);
};
exports.submitMiniFeedback = submitMiniFeedback;
var getStaffProfile = function () {
    return (0, request_1.get)('/mini/staff/profile').then(normalizers_1.normalizeUserInfo);
};
exports.getStaffProfile = getStaffProfile;
var updateStaffProfile = function (data) {
    return (0, request_1.put)('/mini/staff/profile', data).then(normalizers_1.normalizeUserInfo);
};
exports.updateStaffProfile = updateStaffProfile;
var getStaffOrgInfo = function () {
    return (0, request_1.get)('/mini/staff/org-info');
};
exports.getStaffOrgInfo = getStaffOrgInfo;
var getStaffSummary = function () {
    return (0, request_1.get)('/mini/summary/nurse').then(normalizers_1.normalizeSummary);
};
exports.getStaffSummary = getStaffSummary;
var createNewsPost = function (data) { return (0, request_1.post)('/news', data); };
exports.createNewsPost = createNewsPost;
// ─── 新闻动态 /api/news ───────────────────────────────────
var getNewsList = function () {
    return (0, request_1.get)('/news');
};
exports.getNewsList = getNewsList;
var getNewsDetail = function (id) {
    return (0, request_1.get)("/news/".concat(id));
};
exports.getNewsDetail = getNewsDetail;
// ─── 文件上传 /mini/upload ────────────────────────────────
var uploadPhoto = function (filePath) {
    var app = getApp();
    var token = app.globalData.token || wx.getStorageSync('token') || '';
    var origin = wx.getStorageSync('apiBaseUrl') || 'https://116.204.127.178';
    return new Promise(function (resolve, reject) {
        wx.uploadFile({
            url: origin + '/api/mini/upload',
            filePath: filePath,
            name: 'file',
            header: { Authorization: token ? 'Bearer ' + token : '' },
            success: function (res) {
                try {
                    var data = JSON.parse(res.data);
                    if (data.code === 0 && data.data) {
                        resolve(data.data);
                    } else {
                        reject(new Error(data.message || '\u4E0A\u4F20\u5931\u8D25'));
                    }
                } catch (e) {
                    reject(new Error('\u4E0A\u4F20\u54CD\u5E94\u89E3\u6790\u5931\u8D25'));
                }
            },
            fail: function (err) {
                reject(new Error(err.errMsg || '\u4E0A\u4F20\u5931\u8D25'));
            }
        });
    });
};
exports.uploadPhoto = uploadPhoto;
