/**
 * 0012 Cycle A - 到店/拜访记录共享格式化纯函数。
 */

/**
 * 金额展示规则（0011 §10 / 0012 沿用）：
 * - 空值显示 `--`；
 * - 数字统一保留两位小数，`0` 显示 `0.00`。
 */
export function formatRecordAmount(value: number | null | undefined): string {
  if (value === null || value === undefined) return '--';
  if (!Number.isFinite(value)) return '--';
  return value.toFixed(2);
}

/**
 * Cycle B2 新增：新建记录的创建/更新时间戳。
 * 返回格式 YYYY-MM-DD HH:mm:ss（与既有 Mock 时间格式一致，列表按字符串排序稳定）。
 */
export function formatNow(): string {
  const date = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}
