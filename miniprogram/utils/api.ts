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
export const bindDevice = (data: { deviceCode: string; location?: string; address?: string }) =>
  post('/mini/device/bind', data)

export const unbindDevice = (data: { deviceId: string; keepHistory?: boolean }) =>
  post('/mini/device/unbind', data)

export const getDeviceList = () =>
  get('/mini/device/list')

// ─── 护士列表 ─────────────────────────────────────────────
export const getNurseList = () =>
  get('/mini/nurse-list')

// ─── 新闻动态 /api/news ───────────────────────────────────
export const getNewsList = () =>
  get('/news')

export const getNewsDetail = (id: string | number) =>
  get(`/news/${id}`)
