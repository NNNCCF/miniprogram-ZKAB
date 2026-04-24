const GENDER_LABEL_MAP: Record<string, string> = {
  MALE: '男',
  FEMALE: '女',
  male: '男',
  female: '女'
}

const HANDLED_RESULT_LABEL: Record<string, string> = {
  handled: '已处理',
  ignored: '已忽略'
}

function valueOf<T = any>(input: T | null | undefined, fallback: any = ''): any {
  return input === null || input === undefined ? fallback : input
}

export function normalizeUserInfo(input: any) {
  if (!input) return {}
  const info = { ...input }
  if (info.institutionName && !info.orgName) info.orgName = info.institutionName
  if (info.institutionId && !info.orgId) info.orgId = info.institutionId
  if (info.mobile && !info.phone) info.phone = info.mobile
  return info
}

export function normalizeMember(raw: any) {
  const gender = valueOf(raw?.gender)
  const genderLabel = GENDER_LABEL_MAP[gender] || valueOf(gender, '未知')
  return {
    ...raw,
    id: valueOf(raw?.id, raw?.memberId),
    name: valueOf(raw?.name),
    age: valueOf(raw?.age, null),
    gender,
    genderLabel,
    mobile: valueOf(raw?.mobile),
    chronicDisease: valueOf(raw?.chronicDisease),
    remark: valueOf(raw?.remark),
    deviceId: valueOf(raw?.deviceId),
    deviceStatus: valueOf(raw?.deviceStatus, 'offline'),
    device: {
      id: valueOf(raw?.deviceId),
      status: valueOf(raw?.deviceStatus, 'offline')
    }
  }
}

export function normalizeFamily(raw: any) {
  const members = (raw?.members || []).map(normalizeMember)
  const familyName = raw?.shortName || raw?.familyName || raw?.community || raw?.address || '未命名家庭'
  const recentAlarms = (raw?.recentAlarms || []).map((item: any) => ({
    id: valueOf(item?.id),
    type: valueOf(item?.type, item?.alarmType),
    time: valueOf(item?.time, item?.alarmTime),
    handled: item?.status === 'handled'
  }))

  return {
    ...raw,
    id: valueOf(raw?.id),
    shortName: familyName,
    familyName,
    address: valueOf(raw?.address),
    community: valueOf(raw?.community, familyName),
    latitude: raw?.latitude,
    longitude: raw?.longitude,
    location: raw?.latitude != null && raw?.longitude != null ? `${raw.latitude},${raw.longitude}` : '',
    familyInitial: familyName.slice(0, 1),
    memberCount: members.length,
    careLevel: raw?.hasAlarm ? 'heavy' : 'light',
    careLevelLabel: raw?.level || (raw?.hasAlarm ? '重点关注' : '一般关注'),
    status: raw?.status || (raw?.hasAlarm ? 'alarm' : 'normal'),
    guardian: raw?.guardian || null,
    members,
    recentAlarms
  }
}

export function normalizeAlarm(raw: any) {
  const type = valueOf(raw?.type, raw?.alarmType)
  const location = raw?.family?.address || raw?.location || raw?.family?.community || '未知位置'
  const isHigh = typeof type === 'string' && (type.includes('紧急') || type.includes('跌倒'))
  const level = isHigh ? 'high' : 'medium'
  const status = valueOf(raw?.status, 'unhandled')
  const memberName = valueOf(raw?.member?.name, raw?.memberName)

  return {
    ...raw,
    id: valueOf(raw?.id),
    type,
    alarmType: type,
    alarmTime: valueOf(raw?.alarmTime),
    status,
    memberName,
    guardianName: valueOf(raw?.guardian?.name, raw?.guardianName),
    guardianPhone: valueOf(raw?.guardian?.phone, raw?.guardianPhone),
    familyAddress: valueOf(raw?.family?.address),
    location,
    description: valueOf(raw?.description, `${valueOf(memberName, '成员')}发生${type}`),
    level,
    levelLabel: isHigh ? '高危' : '中危',
    handlerName: valueOf(raw?.handleNurse, raw?.handlerName),
    handleTime: valueOf(raw?.handleTime),
    remark: valueOf(raw?.handleRemark, raw?.remark),
    handleDescription: valueOf(raw?.handleRemark, raw?.handleDescription),
    handleResult: status,
    handleResultLabel: HANDLED_RESULT_LABEL[status] || '待处理'
  }
}

export function normalizeAppointment(raw: any) {
  const familyAddress = raw?.family?.address || ''
  const guardianName = raw?.guardian?.name || raw?.guardianName || ''
  const guardianPhone = raw?.guardian?.phone || raw?.guardianPhone || ''
  const memberName = raw?.member?.name || raw?.memberName || ''
  // nurseName = 被派单的护理人员（王医生）
  const nurseName = raw?.acceptNurse || raw?.nurseName || ''
  // familyDoctorName = 订单关联的家庭医生（张医生），不受派单影响
  const familyDoctorName = raw?.doctor || raw?.doctorName || ''
  const visitRemark = raw?.visitRemark || raw?.record?.serviceContent || ''

  return {
    ...raw,
    id: valueOf(raw?.id),
    type: valueOf(raw?.type),
    status: valueOf(raw?.status, 'pending'),
    appointTime: valueOf(raw?.appointTime, raw?.appointmentTime),
    appointmentTime: valueOf(raw?.appointTime, raw?.appointmentTime),
    requirement: valueOf(raw?.requirement),
    notes: valueOf(raw?.requirement, raw?.notes),
    memberName,
    memberPhone: guardianPhone,
    memberAddress: familyAddress,
    guardianName,
    guardianPhone,
    nurseName,                       // 护理人员（派单护士）
    nursePhone: raw?.nursePhone || '',
    doctorName: familyDoctorName,    // 家庭医生（不被派单覆盖）
    doctorPhone: raw?.nursePhone || '',
    familyName: raw?.family?.community || familyAddress,
    familyAddress,
    visitTime: valueOf(raw?.visitTime),
    dispatchedBy: valueOf(raw?.dispatchedBy),
    record: raw?.visitTime || visitRemark ? {
      serviceContent: visitRemark,
      healthObservation: raw?.payStatus || '',
      followUpPlan: raw?.payAmount ? `费用：${raw.payAmount}` : ''
    } : null
  }
}

export function normalizeServiceCenter(raw: any) {
  return {
    id: valueOf(raw?.id),
    name: valueOf(raw?.name, '卓凯安伴服务中心'),
    address: valueOf(raw?.address, '山西省太原市'),
    phone: valueOf(raw?.phone, '03511234567'),
    type: valueOf(raw?.type)
  }
}

export function normalizeSummary(raw: any) {
  const bars = (raw?.alarmTypeBars || []).map((item: any) => ({
    ...item,
    percent: 0
  }))
  const max = Math.max(...bars.map((item: any) => item.count || 0), 1)

  return {
    familyCount: valueOf(raw?.familyCount, 0),
    totalAppt: valueOf(raw?.totalAppt, 0),
    completedAppt: valueOf(raw?.completedAppt, 0),
    handledAlarms: valueOf(raw?.handledAlarms, 0),
    alarmTypeBars: bars.map((item: any) => ({
      ...item,
      percent: Math.round(((item.count || 0) / max) * 100)
    }))
  }
}