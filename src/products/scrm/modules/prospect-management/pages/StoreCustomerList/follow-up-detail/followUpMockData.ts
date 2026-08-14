/**
 * 0011 门店客户跟进详情 Cycle 1 - 页面专用 Mock 数据。
 *
 * 通过稳定客户 key 与当前列表选中客户关联，不复制第二套客户身份数据。
 * 仅覆盖测试与 Story 需要的演示客户；未配置的客户返回空数据，便于稳定复现空态。
 * 所有数据均为虚构演示数据。
 *
 * 0012 Cycle A：到店/拜访记录初始数据与选择器已迁移至独立业务模块
 * （arrival-record / visit-record），本文件不再保留第二套数组，概览统计
 * 按客户 key 从共享模块读取。
 */
import type {
  AssignmentRecord,
  CallRecord,
  CustomerFollowUpData,
  JourneyEvent,
} from './followUpTypes';
import { getArrivalRecordsByCustomerKey } from '../../../arrival-record';
import { getVisitRecordsByCustomerKey } from '../../../visit-record';

/** 张三（key '1'）：完整演示数据（含金额 0.00 / -- / 两位小数、多类记录与旅程事件） */
const ZHANG_SAN: CustomerFollowUpData = {
  remainingTrialClasses: 2,
  noVisitDuration: '3天',
  remainingValue: 1290,
  totalRefundAmount: 0,
  callRecords: [
    {
      key: 'c1',
      id: 'CL001',
      userName: '张三',
      userId: 'UID1001',
      phone: '139****4822',
      callResult: '已接通',
      callStatus: '已完成',
      callDuration: '03:26',
      callTag: '课程咨询',
      callRemark: '介绍体验课活动，家长已同意到店',
      callType: '呼出',
      callEmployee: '王经理',
      callTime: '2026-07-21 16:00:00',
    },
    {
      key: 'c2',
      id: 'CL002',
      userName: '张三',
      userId: 'UID1001',
      phone: '139****4822',
      callResult: '未接通',
      callStatus: '未完成',
      callDuration: '00:00',
      callTag: '回访',
      callRemark: '--',
      callType: '呼出',
      callEmployee: '王经理',
      callTime: '2026-07-17 09:30:00',
    },
  ],
  assignmentRecords: [
    { key: 'as1', assigner: '王经理', assignTime: '2026-07-22 09:15:00' },
    { key: 'as2', assigner: '赵主管', assignTime: '2026-07-21 14:30:00' },
  ],
  journeyEvents: [
    {
      key: 'j1',
      type: 'arrival',
      time: '2026-07-22 17:00:00',
      isArrived: '已到店',
      isDeal: '已成交',
      intentLevel: 5,
      appointmentStore: '示例旗舰店',
      trialClass: '少儿体适能',
      improvementNeed: '改善基础体能',
      intendedCourse: '少儿体适能课',
    },
    {
      key: 'j2',
      type: 'call',
      time: '2026-07-21 16:00:00',
      callResult: '已接通',
      callDuration: '03:26',
      callEmployee: '王经理',
    },
    {
      key: 'j3',
      type: 'visit',
      time: '2026-07-21 15:00:00',
      visitWay: '上门拜访',
      intentLevel: 4,
      improvementNeed: '咨询课程方案',
      intendedCourse: '少儿体适能课',
    },
    {
      key: 'j4',
      type: 'arrival',
      time: '2026-07-20 14:30:00',
      isArrived: '已到店',
      isDeal: '未成交',
      intentLevel: 3,
      appointmentStore: '示例旗舰店',
      trialClass: '儿童篮球',
      improvementNeed: '提升身体协调能力',
      intendedCourse: '儿童篮球课',
    },
    {
      key: 'j5',
      type: 'validity',
      time: '2026-07-16 10:00:00',
      validityLabel: '标注无效客资',
      submitTime: '2026-07-16 10:00:00',
      submitEmployee: '王经理',
      remark: '多次联系未接通，暂标记为无效客资',
      attachmentName: '无效客资说明.png',
    },
    {
      key: 'j6',
      type: 'validity',
      time: '2026-07-15 09:00:00',
      validityLabel: '恢复有效客资',
      submitTime: '2026-07-15 09:00:00',
      submitEmployee: '赵主管',
      remark: '客户重新取得联系，恢复为有效客资',
      attachmentName: '恢复确认截图.png',
    },
  ],
};

/** 王五（key '3'）：空旅程 / 空记录，稳定复现空态 */
const EMPTY: CustomerFollowUpData = {
  remainingTrialClasses: 0,
  noVisitDuration: '--',
  remainingValue: 0,
  totalRefundAmount: 0,
  callRecords: [],
  assignmentRecords: [],
  journeyEvents: [],
};

const FOLLOW_UP_MOCK: Record<string, CustomerFollowUpData> = {
  '1': ZHANG_SAN,
  '3': EMPTY,
};

export function getCallRecords(customerKey: string): CallRecord[] {
  return FOLLOW_UP_MOCK[customerKey]?.callRecords ?? [];
}

export function getAssignmentRecords(customerKey: string): AssignmentRecord[] {
  return FOLLOW_UP_MOCK[customerKey]?.assignmentRecords ?? [];
}

export interface FollowUpOverview {
  /** 剩余体验课次数 */
  remainingTrialClasses: number;
  /** 总到店记录数 */
  arrivalCount: number;
  /** 总拜访次数 */
  visitCount: number;
  /** 总成交金额（元） */
  totalDealAmount: number;
  /** 总体验课次数 */
  totalTrialClasses: number;
  /** 总体验课卡数（按体验课卡去重） */
  totalTrialClassCards: number;
  /** 有体验课到店次数 */
  trialClassArrivalCount: number;
  /** 未到店次数 */
  notArrivedCount: number;
  /** 上次到店时间 */
  lastArrivalTime: string;
  /** 首次到店时间 */
  firstArrivalTime: string;
  /** 未拜访时长（Mock 字符串，如 "3天" / "--"） */
  noVisitDuration: string;
  /** 上次拜访时间 */
  lastVisitTime: string;
  /** 首次拜访时间 */
  firstVisitTime: string;
  /** 剩余价值（元） */
  remainingValue: number;
  /** 总退款金额（元） */
  totalRefundAmount: number;
  /** 总成交课卡数（按课卡去重） */
  totalDealClassCards: number;
  /** 成交课程类型（去重后顿号连接，空时 `--`） */
  dealCourseTypes: string;
}

/** 时间字符串列表中的最大值（最新），空列表返回 `--`。 */
function maxTime(times: string[]): string {
  if (times.length === 0) return '--';
  return [...times].sort((a, b) => b.localeCompare(a))[0]!;
}

/** 时间字符串列表中的最小值（最早），空列表返回 `--`。 */
function minTime(times: string[]): string {
  if (times.length === 0) return '--';
  return [...times].sort((a, b) => a.localeCompare(b))[0]!;
}

/**
 * 跟进概览：到店/拜访/成交相关的详细统计全部由当前客户记录 Mock 派生，
 * 剩余体验课次数、未拜访时长、剩余价值与总退款金额来自页面 Mock。
 */
export function getCustomerOverview(customerKey: string): FollowUpOverview {
  const data = FOLLOW_UP_MOCK[customerKey];
  const arrivalRecords = getArrivalRecordsByCustomerKey(customerKey);
  const visitRecords = getVisitRecordsByCustomerKey(customerKey);
  const totalDealAmount = arrivalRecords.reduce(
    (sum, record) => sum + (typeof record.dealAmount === 'number' ? record.dealAmount : 0),
    0,
  );

  const withTrialClass = arrivalRecords.filter((record) => record.hasTrialClass === '是');
  const arrived = arrivalRecords.filter((record) => record.isArrived === '已到店');
  const dealt = arrivalRecords.filter((record) => record.isDeal === '已成交');
  const arrivedTimes = arrived.map((record) => record.arrivalTime);
  const visitTimes = visitRecords.map((record) => record.visitTime);
  const trialClassCards = new Set(withTrialClass.map((record) => record.trialClassCard));
  const dealClassCards = new Set(dealt.map((record) => record.trialClassCard));
  const dealCourseTypes = new Set(dealt.map((record) => record.courseType));

  return {
    remainingTrialClasses: data?.remainingTrialClasses ?? 0,
    arrivalCount: arrivalRecords.length,
    visitCount: visitRecords.length,
    totalDealAmount,
    totalTrialClasses: withTrialClass.length,
    totalTrialClassCards: trialClassCards.size,
    trialClassArrivalCount: arrived.filter((record) => record.hasTrialClass === '是').length,
    notArrivedCount: arrivalRecords.filter((record) => record.isArrived === '未到店').length,
    lastArrivalTime: maxTime(arrivedTimes),
    firstArrivalTime: minTime(arrivedTimes),
    noVisitDuration: data?.noVisitDuration ?? '--',
    lastVisitTime: maxTime(visitTimes),
    firstVisitTime: minTime(visitTimes),
    remainingValue: data?.remainingValue ?? 0,
    totalRefundAmount: data?.totalRefundAmount ?? 0,
    totalDealClassCards: dealClassCards.size,
    dealCourseTypes: [...dealCourseTypes].join('、') || '--',
  };
}

/** 跟进旅程事件：固定按时间倒序返回，最新在前。 */
export function getJourneyEvents(customerKey: string): JourneyEvent[] {
  const events = FOLLOW_UP_MOCK[customerKey]?.journeyEvents ?? [];
  return [...events].sort((a, b) => b.time.localeCompare(a.time));
}
