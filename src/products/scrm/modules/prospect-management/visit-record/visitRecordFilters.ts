/**
 * 0012 Cycle A / 0017 - 拜访记录独立页筛选（12 项：9 筛选字段 + 搜索/重置/导出）。
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

/** 拜访记录筛选值（9 个筛选字段）。时间范围统一保存为闭区间时间戳字符串。 */
export interface VisitRecordFilterValues {
  userId: string;
  namePhone: string;
  source: string | null;
  appointmentStore: string | null;
  visitWay: string | null;
  visitTimeRange: [string, string] | null;
  nextVisitTimeRange: [string, string] | null;
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
  nextVisitTimeRange: null,
  creator: '',
  createTimeRange: null,
};

/**
 * 将日期选择器的自然日边界规范成可与带时分秒记录比较的闭区间。
 * 旧的日期范围仍可传 YYYY-MM-DD，新下次拜访范围直接传完整时间戳。
 */
function normalizeRangeBoundary(value: string, isEnd: boolean): string {
  if (value.length === 10) return `${value} ${isEnd ? '23:59:59' : '00:00:00'}`;
  return value;
}

/** 时间字符串是否落在 [start, end] 闭区间内（占位/空值不匹配；无范围约束时视为通过）。 */
function inTimeRange(time: string | null | undefined, range: [string, string] | null): boolean {
  if (!range) return true;
  if (!time || time === '--') return false;
  const start = normalizeRangeBoundary(range[0], false);
  const end = normalizeRangeBoundary(range[1], true);
  return time >= start && time <= end;
}

/** 以本地自然日生成筛选范围，供快捷项与测试共享。 */
export function getNextVisitTimeRange(
  preset: 'today' | 'future7' | 'future30' | 'futureHalfYear',
  now: Date = new Date(),
): [string, string] {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  if (preset === 'future7') end.setDate(end.getDate() + 6);
  if (preset === 'future30') end.setDate(end.getDate() + 29);
  if (preset === 'futureHalfYear') {
    const targetMonth = end.getMonth() + 6;
    const targetDay = end.getDate();
    end.setDate(1);
    end.setMonth(targetMonth);
    end.setDate(Math.min(targetDay, new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate()));
  }
  return [`${formatDate(start)} 00:00:00`, `${formatDate(end)} 23:59:59`];
}

function formatDate(value: Date): string {
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}

/** RangePicker 选择的两个自然日转成用于筛选的闭区间。 */
export function normalizeNextVisitTimeRange(
  dateStrings: [string, string] | string[],
): [string, string] | null {
  const [start, end] = dateStrings;
  return start && end ? [`${start} 00:00:00`, `${end} 23:59:59`] : null;
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
    if (!inTimeRange(record.nextVisitTime, filters.nextVisitTimeRange)) return false;
    if (filters.creator.trim() !== '' && !record.creator.includes(filters.creator.trim())) {
      return false;
    }
    if (!inTimeRange(record.createTime, filters.createTimeRange)) return false;
    return true;
  });
}
