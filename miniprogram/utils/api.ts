/**
 * 所有后端接口封装（路径以后端 MiniAppController / MiniAppAuthController 为准）
 */
import { get, post, put } from './request'

// ─── 认证 ────────────────────────────────────────────────
/** 统一登录：后端自动识别角色，返回 { token, role, userInfo } */
export const unifiedLogin = (data: { phone: string; password: string }) =>
  post('/auth/login', data)

export const nurseLogin    = (data: { phone: string; password: string }) =>
  post('/auth/nurse/login', data)

export const guardianLogin = (data: { phone: string; password: string }) =>
  post('/auth/guardian/login', data)

export const nurseRegister = (data: any) =>
  post('/auth/nurse/register', data)

export const guardianRegister = (data: any) =>
  post('/auth/guardian/register', data)

/** 获取已启用机构列表（注册时选择，无需登录）*/
export const getPublicInstitutionList = () =>
  get<{ id: number; name: string; address: string; type: string }[]>('/institution/list')

// ─── 报警 /mini/alarms ───────────────────────────────────
export const getAlarms = (params?: {
  status?: 'unhandled' | 'handled' | 'ignored'
  keyword?: string
  startDate?: string
  endDate?: string
  memberId?: string
}) => get('/mini/alarms', params)

export const getAlarmDetail = (id: string | number) =>
  get(`/mini/alarms/${id}`)

export const handleAlarm = (id: string | number, data: {
  calledGuardian: boolean
  memberDanger: boolean
  handled: boolean
  remark: string
}) => post(`/mini/alarms/${id}/handle`, data)

export const ignoreAlarm = (id: string | number) =>
  post(`/mini/alarms/${id}/ignore`, {})

// ─── 预约 /mini/appointments ─────────────────────────────
export const getAppointments = (params?: {
  status?: string
  keyword?: string
  startDate?: string
  endDate?: string
}) => get('/mini/appointments', params)

export const getAppointmentDetail = (id: string | number) =>
  get(`/mini/appointments/${id}`)

export const createAppointment = (data: {
  type: string
  memberId?: number
  familyId?: number
  guardianId?: number
  appointTime?: string
  requirement?: string
}) => post('/mini/appointments', data)

export const acceptAppointment = (id: string | number) =>
  put(`/mini/appointments/${id}/accept`, {})

export const dispatchAppointment = (id: string | number, data: {
  nurseId?: number
  nurseName: string
}) => put(`/mini/appointments/${id}/dispatch`, data)

export const submitVisitRecord = (id: string | number, data: {
  visitTime: string
  payAmount?: string
  payStatus?: string
  remark: string
  photos?: string[]
}) => post(`/mini/appointments/${id}/visit-record`, data)

// ─── 家庭档案 /mini/family ───────────────────────────────
export const getFamilyList = (params?: { keyword?: string }) =>
  get('/mini/family/list', params)

export const getFamilyDetail = (id: string | number) =>
  get(`/mini/family/${id}`)

export const getFamilyMapList = () =>
  get('/mini/family/map-list')

// ─── 成员健康历史 ─────────────────────────────────────────
export const getMemberHistory = (familyId: string | number, memberId: string | number, params?: {
  type?: string
  startDate?: string
  endDate?: string
}) => get(`/mini/family/${familyId}/member/${memberId}/history`, params)

// ─── 成员列表 ─────────────────────────────────────────────
export const getMemberList = () =>
  get('/mini/member/list')

// ─── 设备 /mini/device ───────────────────────────────────
export const bindDevice = (data: {
  deviceCode: string
  location?: string
  address?: string
  latitude?: number
  longitude?: number
}) => post('/mini/device/bind', data)

export const unbindDevice = (data: { deviceId: string; keepHistory?: boolean }) =>
  post('/mini/device/unbind', data)

export const getDeviceList = () =>
  get('/mini/device/list')

// ─── 护士列表 ─────────────────────────────────────────────
export const getNurseList = () =>
  get('/mini/nurse-list')

// ─── 实时监控 /mini/monitor ───────────────────────────────
export const getMonitorRealtime = (memberId: string | number) =>
  get('/mini/monitor/realtime', { memberId })

export const getMonitorHistory = (params: {
  memberId: string | number
  type?: string
  startDate?: string
  endDate?: string
}) => get('/mini/monitor/history', params)

// ─── 绑定的家庭医生（当前登录家属设备关联的医生）────────────
export const getServiceDoctor = () =>
  get('/mini/service/doctor')

// ─── 医生详情（家属端）/mini/doctor ───────────────────────
export const getMiniDoctorDetail = (id: string | number) =>
  get(`/mini/doctor/${id}`)

// ─── 送药上门订单 /mini/medicine/order ────────────────────
export const createMedicineOrder = (data: {
  medicines: { name: string; spec: string; qty: number }[]
  address: string
  notes?: string
}) => post('/mini/medicine/order', data)

// ─── 创建成员 /mini/member/create ─────────────────────────
export const createMember = (data: {
  name: string
  gender: string
  birthday?: string
  mobile?: string
  chronicDisease?: string
  remark?: string
  emergencyPhone?: string
  deviceId?: string
}) => post('/mini/member/create', data)

// ─── 机构管理接口 /mini/institution ──────────────────────
/** 获取本机构医护人员列表 */
export const getInstitutionNurses = () =>
  get('/mini/institution/nurses')

/** 获取本机构绑定家庭列表 */
export const getInstitutionFamilies = () =>
  get('/mini/institution/families')

// ─── 新闻动态 /api/news ───────────────────────────────────
export const getNewsList = () =>
  get('/news')

export const getNewsDetail = (id: string | number) =>
  get(`/news/${id}`)
