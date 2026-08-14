/**
 * 0012 Cycle A - 到店记录独立页筛选（15 项：12 筛选字段 + 搜索/重置/导出）。
 *
 * 仅提供字段与筛选匹配逻辑，供独立页使用；跟进详情 Tab 不展示筛选。
 */
import type { ArrivalRecord } from './arrivalRecordTypes';

/** 客资来源筛选选项（与到店记录 Mock 数据保持一致，保证演示可筛选出结果） */
export const ARRIVAL_SOURCE_OPTIONS = [
  { value: '地推活动', label: '地推活动' },
  { value: '线上广告', label: '线上广告' },
  { value: '朋友推荐', label: '朋友推荐' },
  { value: '自然到访', label: '自然到访' },
  { value: '会员转介绍', label: '会员转介绍' },
];

/** 预约门店筛选选项 */
export const ARRIVAL_STORE_OPTIONS = [
  { value: '示例旗舰店', label: '示例旗舰店' },
  { value: '示例宝安店', label: '示例宝安店' },
  { value: '示例罗湖店', label: '示例罗湖店' },
];

/** 是否到店选项 */
export const ARRIVED_OPTIONS = [
  { value: '已到店', label: '已到店' },
  { value: '未到店', label: '未到店' },
];

/**
 * Cycle B2 新增：到店抽屉 create 模式"体验课"（课程类型）选项。
 * 仅选择当前已有 Mock 能力（到店 Mock 数据 courseType 出现值），
 * 不扩展合同/课卡业务（§6.6 冻结）。
 */
export const ARRIVAL_COURSE_TYPE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '少儿体适能', label: '少儿体适能' },
  { value: '儿童篮球', label: '儿童篮球' },
  { value: '亲子运动', label: '亲子运动' },
  { value: '成人瑜伽', label: '成人瑜伽' },
];

/** 是否成交选项 */
export const DEAL_OPTIONS = [
  { value: '已成交', label: '已成交' },
  { value: '未成交', label: '未成交' },
];

/** 体验课状态选项 */
export const TRIAL_CLASS_STATUS_OPTIONS = [
  { value: '已下课', label: '已下课' },
  { value: '待上课', label: '待上课' },
  { value: '未开始', label: '未开始' },
];

/** 是否签到选项 */
export const SIGNED_IN_OPTIONS = [
  { value: '已签到', label: '已签到' },
  { value: '未签到', label: '未签到' },
];

/** 到店记录筛选值（12 个筛选字段） */
export interface ArrivalRecordFilterValues {
  userId: string;
  namePhone: string;
  source: string | null;
  appointmentStore: string | null;
  isArrived: string | null;
  isDeal: string | null;
  trialClassStatus: string | null;
  isSignedIn: string | null;
  trialClassCoach: string;
  arrivalTimeRange: [string, string] | null;
  trialClassGetTimeRange: [string, string] | null;
  contractNo: string;
}

export const ARRIVAL_RECORD_DEFAULT_FILTERS: ArrivalRecordFilterValues = {
  userId: '',
  namePhone: '',
  source: null,
  appointmentStore: null,
  isArrived: null,
  isDeal: null,
  trialClassStatus: null,
  isSignedIn: null,
  trialClassCoach: '',
  arrivalTimeRange: null,
  trialClassGetTimeRange: null,
  contractNo: '',
};

/** 时间字符串是否落在 [start, end] 闭区间内（'--' 等占位符不匹配；无范围约束时视为通过）。 */
function inTimeRange(time: string, range: [string, string] | null): boolean {
  if (!range) return true;
  if (time === '--') return false;
  return time >= range[0] && time <= range[1];
}

/** 按到店记录筛选值过滤（字段之间为 AND 关系；文本字段为包含匹配）。 */
export function applyArrivalRecordFilter(
  records: ArrivalRecord[],
  filters: ArrivalRecordFilterValues,
): ArrivalRecord[] {
  return records.filter((record) => {
    if (filters.userId.trim() !== '' && !record.userId.includes(filters.userId.trim())) {
      return false;
    }
    const keyword = filters.namePhone.trim();
    if (keyword !== '' && !record.userName.includes(keyword) && !record.phone.includes(keyword)) {
      return false;
    }
    if (filters.source !== null && record.source !== filters.source) return false;
    if (filters.appointmentStore !== null && record.appointmentStore !== filters.appointmentStore) {
      return false;
    }
    if (filters.isArrived !== null && record.isArrived !== filters.isArrived) return false;
    if (filters.isDeal !== null && record.isDeal !== filters.isDeal) return false;
    if (filters.trialClassStatus !== null && record.trialClassStatus !== filters.trialClassStatus) {
      return false;
    }
    if (filters.isSignedIn !== null && record.isSignedIn !== filters.isSignedIn) return false;
    if (filters.trialClassCoach.trim() !== '' && !record.trialClassCoach.includes(filters.trialClassCoach.trim())) {
      return false;
    }
    if (!inTimeRange(record.arrivalTime, filters.arrivalTimeRange)) return false;
    if (!inTimeRange(record.trialClassGetTime, filters.trialClassGetTimeRange)) return false;
    if (filters.contractNo.trim() !== '' && !record.contractNo.includes(filters.contractNo.trim())) {
      return false;
    }
    return true;
  });
}
