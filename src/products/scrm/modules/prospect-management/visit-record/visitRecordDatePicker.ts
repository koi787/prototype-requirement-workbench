/**
 * 0017 拜访记录日期范围选择器适配。
 *
 * 项目不直接依赖 dayjs；Ant Design 的 RangePicker 仍复用，但以原生 Date
 * 作为 generatePicker 的值类型，避免为了筛选器新增日期库或修改 lockfile。
 */
import { DatePicker } from 'antd';

const pad = (value: number) => String(value).padStart(2, '0');

export function parseLocalDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?: (\d{2}):(\d{2}):(\d{2}))?$/.exec(value);
  if (!match) return null;
  const [, year, month, day, hour = '00', minute = '00', second = '00'] = match;
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  );
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Ant Design 日历会用短 token（尤其是 `D`）格式化日期格，不能只支持
 * 表单里的完整时间格式。按最长 token 优先替换，避免 `DD` 被拆成两个 `D`。
 */
export function formatLocalDate(value: Date, format: string): string {
  const tokens: Record<string, string> = {
    YYYY: String(value.getFullYear()),
    YY: String(value.getFullYear()).slice(-2),
    MMMM: `${value.getMonth() + 1}月`,
    MMM: `${value.getMonth() + 1}月`,
    MM: pad(value.getMonth() + 1),
    M: String(value.getMonth() + 1),
    DD: pad(value.getDate()),
    D: String(value.getDate()),
    HH: pad(value.getHours()),
    H: String(value.getHours()),
    mm: pad(value.getMinutes()),
    m: String(value.getMinutes()),
    ss: pad(value.getSeconds()),
    s: String(value.getSeconds()),
    d: String(value.getDay()),
  };
  return format.replace(/YYYY|MMMM|MMM|YY|MM|DD|HH|mm|ss|M|D|H|m|s|d/g, (token) => tokens[token]!);
}

function cloneDate(value: Date): Date {
  return new Date(value.getTime());
}

function setMonthWithEndOfMonth(value: Date, month: number): Date {
  const next = cloneDate(value);
  const day = next.getDate();
  next.setDate(1);
  next.setMonth(month);
  next.setDate(Math.min(day, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()));
  return next;
}

/** 原生 Date 版 generateConfig，仅作为 Ant Design RangePicker 的适配层。 */
const nativeDateGenerateConfig = {
  getWeekDay: (value: Date) => value.getDay(),
  getMillisecond: (value: Date) => value.getMilliseconds(),
  getSecond: (value: Date) => value.getSeconds(),
  getMinute: (value: Date) => value.getMinutes(),
  getHour: (value: Date) => value.getHours(),
  getDate: (value: Date) => value.getDate(),
  getMonth: (value: Date) => value.getMonth(),
  getYear: (value: Date) => value.getFullYear(),
  getNow: () => new Date(),
  getFixedDate: (value: string) => parseLocalDate(value) ?? new Date(NaN),
  getEndDate: (value: Date) => new Date(value.getFullYear(), value.getMonth() + 1, 0),
  addYear: (value: Date, diff: number) => {
    const next = cloneDate(value);
    next.setFullYear(next.getFullYear() + diff);
    return next;
  },
  addMonth: (value: Date, diff: number) => setMonthWithEndOfMonth(value, value.getMonth() + diff),
  addDate: (value: Date, diff: number) => {
    const next = cloneDate(value);
    next.setDate(next.getDate() + diff);
    return next;
  },
  setYear: (value: Date, year: number) => {
    const next = cloneDate(value);
    next.setFullYear(year);
    return next;
  },
  setMonth: (value: Date, month: number) => setMonthWithEndOfMonth(value, month),
  setDate: (value: Date, day: number) => {
    const next = cloneDate(value);
    next.setDate(day);
    return next;
  },
  setHour: (value: Date, hour: number) => {
    const next = cloneDate(value);
    next.setHours(hour);
    return next;
  },
  setMinute: (value: Date, minute: number) => {
    const next = cloneDate(value);
    next.setMinutes(minute);
    return next;
  },
  setSecond: (value: Date, second: number) => {
    const next = cloneDate(value);
    next.setSeconds(second);
    return next;
  },
  setMillisecond: (value: Date, millisecond: number) => {
    const next = cloneDate(value);
    next.setMilliseconds(millisecond);
    return next;
  },
  isAfter: (left: Date, right: Date) => left.getTime() > right.getTime(),
  isValidate: (value: Date) => !Number.isNaN(value.getTime()),
  locale: {
    getWeekFirstDay: () => 1,
    getWeekFirstDate: (_locale: string, value: Date) => {
      const first = cloneDate(value);
      const day = first.getDay() || 7;
      first.setDate(first.getDate() - day + 1);
      return first;
    },
    getWeek: (_locale: string, value: Date) => {
      const firstDayOfYear = new Date(value.getFullYear(), 0, 1);
      const dayOfYear = Math.floor((value.getTime() - firstDayOfYear.getTime()) / 86400000) + 1;
      return Math.ceil((dayOfYear + firstDayOfYear.getDay()) / 7);
    },
    format: (_locale: string, value: Date, format: string) => formatLocalDate(value, format),
    parse: (_locale: string, text: string) => parseLocalDate(text),
    getShortWeekDays: () => ['日', '一', '二', '三', '四', '五', '六'],
    getShortMonths: () => Array.from({ length: 12 }, (_, index) => `${index + 1}月`),
  },
};

const NativeDatePicker = DatePicker.generatePicker(nativeDateGenerateConfig);

export const NativeDateRangePicker = NativeDatePicker.RangePicker;
