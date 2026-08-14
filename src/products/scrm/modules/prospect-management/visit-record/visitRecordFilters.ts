/**
 * 0012 Cycle A - 拜访记录独立页筛选（11 项：8 筛选字段 + 搜索/重置/导出）。
 *
 * 仅提供字段与筛选匹配逻辑，供独立页使用；跟进详情 Tab 不展示筛选。
 */
import type { VisitRecord } from './visitRecordTypes';

/** 客资来源筛选选项（与拜访记录 Mock 数据保持一致） */
export const VISIT_SOURCE_OPTIONS = [
  { value: '地推活动', label: '地推活动' },
  { value: '线上广告', label: '线上广告' },
  { value: '朋友推荐', label: '朋友推荐' },
  { value: '自然到访', label: '自然到访' },
  { value: '会员转介绍', label: '会员转介绍' },
];

/** 预约门店筛选选项 */
export const VISIT_STORE_OPTIONS = [
  { value: '示例旗舰店', label: '示例旗舰店' },
  { value: '示例宝安店', label: '示例宝安店' },
  { value: '示例罗湖店', label: '示例罗湖店' },
];

/** 拜访方式选项（0012 §7.5 沿用：系统外呼/自主拨打/企微/微信） */
export const VISIT_WAY_OPTIONS = [
  { value: '系统外呼', label: '系统外呼' },
  { value: '自主拨打', label: '自主拨打' },
  { value: '企微', label: '企微' },
  { value: '微信', label: '微信' },
  { value: '上门拜访', label: '上门拜访' },
  { value: '电话沟通', label: '电话沟通' },
];

/** 拜访记录筛选值（8 个筛选字段） */
export interface VisitRecordFilterValues {
  userId: string;
  namePhone: string;
  source: string | null;
  appointmentStore: string | null;
  visitWay: string | null;
  visitTimeRange: [string, string] | null;
  creator: string;
  createTimeRange: [string, string] | null;
}

export const VISIT_RECORD_DEFAULT_FILTERS: VisitRecordFilterValues = {
  userId: '',
  namePhone: '',
  source: null,
  appointmentStore: null,
  visitWay: null,
  visitTimeRange: null,
  creator: '',
  createTimeRange: null,
};

/** 时间字符串是否落在 [start, end] 闭区间内（'--' 等占位符不匹配；无范围约束时视为通过）。 */
function inTimeRange(time: string, range: [string, string] | null): boolean {
  if (!range) return true;
  if (time === '--') return false;
  return time >= range[0] && time <= range[1];
}

/** 按拜访记录筛选值过滤（字段之间为 AND 关系；文本字段为包含匹配）。 */
export function applyVisitRecordFilter(
  records: VisitRecord[],
  filters: VisitRecordFilterValues,
): VisitRecord[] {
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
    if (filters.visitWay !== null && record.visitWay !== filters.visitWay) return false;
    if (!inTimeRange(record.visitTime, filters.visitTimeRange)) return false;
    if (filters.creator.trim() !== '' && !record.creator.includes(filters.creator.trim())) {
      return false;
    }
    if (!inTimeRange(record.createTime, filters.createTimeRange)) return false;
    return true;
  });
}
