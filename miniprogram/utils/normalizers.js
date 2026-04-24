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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeUserInfo = normalizeUserInfo;
exports.normalizeMember = normalizeMember;
exports.normalizeFamily = normalizeFamily;
exports.normalizeAlarm = normalizeAlarm;
exports.normalizeAppointment = normalizeAppointment;
exports.normalizeServiceCenter = normalizeServiceCenter;
exports.normalizeSummary = normalizeSummary;
var GENDER_LABEL_MAP = {
    MALE: '男',
    FEMALE: '女',
    male: '男',
    female: '女'
};
var HANDLED_RESULT_LABEL = {
    handled: '已处理',
    ignored: '已忽略'
};
function valueOf(input, fallback) {
    if (fallback === void 0) { fallback = ''; }
    return input === null || input === undefined ? fallback : input;
}
function normalizeUserInfo(input) {
    if (!input)
        return {};
    var info = __assign({}, input);
    if (info.institutionName && !info.orgName)
        info.orgName = info.institutionName;
    if (info.institutionId && !info.orgId)
        info.orgId = info.institutionId;
    if (info.mobile && !info.phone)
        info.phone = info.mobile;
    return info;
}
function normalizeMember(raw) {
    var gender = valueOf(raw === null || raw === void 0 ? void 0 : raw.gender);
    var genderLabel = GENDER_LABEL_MAP[gender] || valueOf(gender, '未知');
    return __assign(__assign({}, raw), { id: valueOf(raw === null || raw === void 0 ? void 0 : raw.id, raw === null || raw === void 0 ? void 0 : raw.memberId), name: valueOf(raw === null || raw === void 0 ? void 0 : raw.name), age: valueOf(raw === null || raw === void 0 ? void 0 : raw.age, null), gender: gender, genderLabel: genderLabel, mobile: valueOf(raw === null || raw === void 0 ? void 0 : raw.mobile), chronicDisease: valueOf(raw === null || raw === void 0 ? void 0 : raw.chronicDisease), remark: valueOf(raw === null || raw === void 0 ? void 0 : raw.remark), deviceId: valueOf(raw === null || raw === void 0 ? void 0 : raw.deviceId), deviceStatus: valueOf(raw === null || raw === void 0 ? void 0 : raw.deviceStatus, 'offline'), device: {
            id: valueOf(raw === null || raw === void 0 ? void 0 : raw.deviceId),
            status: valueOf(raw === null || raw === void 0 ? void 0 : raw.deviceStatus, 'offline')
        } });
}
function normalizeFamily(raw) {
    var members = ((raw === null || raw === void 0 ? void 0 : raw.members) || []).map(normalizeMember);
    var familyName = (raw === null || raw === void 0 ? void 0 : raw.shortName) || (raw === null || raw === void 0 ? void 0 : raw.familyName) || (raw === null || raw === void 0 ? void 0 : raw.community) || (raw === null || raw === void 0 ? void 0 : raw.address) || '未命名家庭';
    var recentAlarms = ((raw === null || raw === void 0 ? void 0 : raw.recentAlarms) || []).map(function (item) { return ({
        id: valueOf(item === null || item === void 0 ? void 0 : item.id),
        type: valueOf(item === null || item === void 0 ? void 0 : item.type, item === null || item === void 0 ? void 0 : item.alarmType),
        time: valueOf(item === null || item === void 0 ? void 0 : item.time, item === null || item === void 0 ? void 0 : item.alarmTime),
        handled: (item === null || item === void 0 ? void 0 : item.status) === 'handled'
    }); });
    return __assign(__assign({}, raw), { id: valueOf(raw === null || raw === void 0 ? void 0 : raw.id), shortName: familyName, familyName: familyName, address: valueOf(raw === null || raw === void 0 ? void 0 : raw.address), community: valueOf(raw === null || raw === void 0 ? void 0 : raw.community, familyName), latitude: raw === null || raw === void 0 ? void 0 : raw.latitude, longitude: raw === null || raw === void 0 ? void 0 : raw.longitude, location: (raw === null || raw === void 0 ? void 0 : raw.latitude) != null && (raw === null || raw === void 0 ? void 0 : raw.longitude) != null ? "".concat(raw.latitude, ",").concat(raw.longitude) : '', familyInitial: familyName.slice(0, 1), memberCount: members.length, careLevel: (raw === null || raw === void 0 ? void 0 : raw.hasAlarm) ? 'heavy' : 'light', careLevelLabel: (raw === null || raw === void 0 ? void 0 : raw.level) || ((raw === null || raw === void 0 ? void 0 : raw.hasAlarm) ? '重点关注' : '一般关注'), status: (raw === null || raw === void 0 ? void 0 : raw.status) || ((raw === null || raw === void 0 ? void 0 : raw.hasAlarm) ? 'alarm' : 'normal'), guardian: (raw === null || raw === void 0 ? void 0 : raw.guardian) || null, members: members, recentAlarms: recentAlarms });
}
function normalizeAlarm(raw) {
    var _a, _b, _c, _d, _e, _f;
    var type = valueOf(raw === null || raw === void 0 ? void 0 : raw.type, raw === null || raw === void 0 ? void 0 : raw.alarmType);
    var location = ((_a = raw === null || raw === void 0 ? void 0 : raw.family) === null || _a === void 0 ? void 0 : _a.address) || (raw === null || raw === void 0 ? void 0 : raw.location) || ((_b = raw === null || raw === void 0 ? void 0 : raw.family) === null || _b === void 0 ? void 0 : _b.community) || '未知位置';
    var isHigh = typeof type === 'string' && (type.includes('紧急') || type.includes('跌倒'));
    var level = isHigh ? 'high' : 'medium';
    var status = valueOf(raw === null || raw === void 0 ? void 0 : raw.status, 'unhandled');
    var memberName = valueOf((_c = raw === null || raw === void 0 ? void 0 : raw.member) === null || _c === void 0 ? void 0 : _c.name, raw === null || raw === void 0 ? void 0 : raw.memberName);
    return __assign(__assign({}, raw), { id: valueOf(raw === null || raw === void 0 ? void 0 : raw.id), type: type, alarmType: type, alarmTime: valueOf(raw === null || raw === void 0 ? void 0 : raw.alarmTime), status: status, memberName: memberName, guardianName: valueOf((_d = raw === null || raw === void 0 ? void 0 : raw.guardian) === null || _d === void 0 ? void 0 : _d.name, raw === null || raw === void 0 ? void 0 : raw.guardianName), guardianPhone: valueOf((_e = raw === null || raw === void 0 ? void 0 : raw.guardian) === null || _e === void 0 ? void 0 : _e.phone, raw === null || raw === void 0 ? void 0 : raw.guardianPhone), familyAddress: valueOf((_f = raw === null || raw === void 0 ? void 0 : raw.family) === null || _f === void 0 ? void 0 : _f.address), location: location, description: valueOf(raw === null || raw === void 0 ? void 0 : raw.description, "".concat(valueOf(memberName, '成员'), "\u53D1\u751F").concat(type)), level: level, levelLabel: isHigh ? '高危' : '中危', handlerName: valueOf(raw === null || raw === void 0 ? void 0 : raw.handleNurse, raw === null || raw === void 0 ? void 0 : raw.handlerName), handleTime: valueOf(raw === null || raw === void 0 ? void 0 : raw.handleTime), remark: valueOf(raw === null || raw === void 0 ? void 0 : raw.handleRemark, raw === null || raw === void 0 ? void 0 : raw.remark), handleDescription: valueOf(raw === null || raw === void 0 ? void 0 : raw.handleRemark, raw === null || raw === void 0 ? void 0 : raw.handleDescription), handleResult: status, handleResultLabel: HANDLED_RESULT_LABEL[status] || '待处理' });
}
function normalizeAppointment(raw) {
    var _a, _b, _c, _d, _e, _f;
    var familyAddress = ((_a = raw === null || raw === void 0 ? void 0 : raw.family) === null || _a === void 0 ? void 0 : _a.address) || '';
    var guardianName = ((_b = raw === null || raw === void 0 ? void 0 : raw.guardian) === null || _b === void 0 ? void 0 : _b.name) || (raw === null || raw === void 0 ? void 0 : raw.guardianName) || '';
    var guardianPhone = ((_c = raw === null || raw === void 0 ? void 0 : raw.guardian) === null || _c === void 0 ? void 0 : _c.phone) || (raw === null || raw === void 0 ? void 0 : raw.guardianPhone) || '';
    var memberName = ((_d = raw === null || raw === void 0 ? void 0 : raw.member) === null || _d === void 0 ? void 0 : _d.name) || (raw === null || raw === void 0 ? void 0 : raw.memberName) || '';
    var nurseName = (raw === null || raw === void 0 ? void 0 : raw.acceptNurse) || (raw === null || raw === void 0 ? void 0 : raw.nurseName) || '';
    var familyDoctorName = (raw === null || raw === void 0 ? void 0 : raw.doctor) || (raw === null || raw === void 0 ? void 0 : raw.doctorName) || '';
    var visitRemark = (raw === null || raw === void 0 ? void 0 : raw.visitRemark) || ((_e = raw === null || raw === void 0 ? void 0 : raw.record) === null || _e === void 0 ? void 0 : _e.serviceContent) || '';
    return __assign(__assign({}, raw), { id: valueOf(raw === null || raw === void 0 ? void 0 : raw.id), type: valueOf(raw === null || raw === void 0 ? void 0 : raw.type), status: valueOf(raw === null || raw === void 0 ? void 0 : raw.status, 'pending'), appointTime: valueOf(raw === null || raw === void 0 ? void 0 : raw.appointTime, raw === null || raw === void 0 ? void 0 : raw.appointmentTime), appointmentTime: valueOf(raw === null || raw === void 0 ? void 0 : raw.appointTime, raw === null || raw === void 0 ? void 0 : raw.appointmentTime), requirement: valueOf(raw === null || raw === void 0 ? void 0 : raw.requirement), notes: valueOf(raw === null || raw === void 0 ? void 0 : raw.requirement, raw === null || raw === void 0 ? void 0 : raw.notes), memberName: memberName, memberPhone: guardianPhone, memberAddress: familyAddress, guardianName: guardianName, guardianPhone: guardianPhone, nurseName: nurseName, nursePhone: (raw === null || raw === void 0 ? void 0 : raw.nursePhone) || '', doctorName: familyDoctorName, doctorPhone: (raw === null || raw === void 0 ? void 0 : raw.nursePhone) || '', familyName: ((_f = raw === null || raw === void 0 ? void 0 : raw.family) === null || _f === void 0 ? void 0 : _f.community) || familyAddress, familyAddress: familyAddress, visitTime: valueOf(raw === null || raw === void 0 ? void 0 : raw.visitTime), dispatchedBy: valueOf(raw === null || raw === void 0 ? void 0 : raw.dispatchedBy), record: (raw === null || raw === void 0 ? void 0 : raw.visitTime) || visitRemark ? {
            serviceContent: visitRemark,
            healthObservation: (raw === null || raw === void 0 ? void 0 : raw.payStatus) || '',
            followUpPlan: (raw === null || raw === void 0 ? void 0 : raw.payAmount) ? "\u8D39\u7528\uFF1A".concat(raw.payAmount) : ''
        } : null });
}
function normalizeServiceCenter(raw) {
    return {
        id: valueOf(raw === null || raw === void 0 ? void 0 : raw.id),
        name: valueOf(raw === null || raw === void 0 ? void 0 : raw.name, '卓凯安伴服务中心'),
        address: valueOf(raw === null || raw === void 0 ? void 0 : raw.address, '山西省太原市'),
        phone: valueOf(raw === null || raw === void 0 ? void 0 : raw.phone, '03511234567'),
        type: valueOf(raw === null || raw === void 0 ? void 0 : raw.type)
    };
}
function normalizeSummary(raw) {
    var bars = ((raw === null || raw === void 0 ? void 0 : raw.alarmTypeBars) || []).map(function (item) { return (__assign(__assign({}, item), { percent: 0 })); });
    var max = Math.max.apply(Math, __spreadArray(__spreadArray([], __read(bars.map(function (item) { return item.count || 0; })), false), [1], false));
    return {
        familyCount: valueOf(raw === null || raw === void 0 ? void 0 : raw.familyCount, 0),
        totalAppt: valueOf(raw === null || raw === void 0 ? void 0 : raw.totalAppt, 0),
        completedAppt: valueOf(raw === null || raw === void 0 ? void 0 : raw.completedAppt, 0),
        handledAlarms: valueOf(raw === null || raw === void 0 ? void 0 : raw.handledAlarms, 0),
        alarmTypeBars: bars.map(function (item) { return (__assign(__assign({}, item), { percent: Math.round(((item.count || 0) / max) * 100) })); })
    };
}
