import { z } from 'zod';
import { stableIdSchema, nonEmptyTrimmedString } from './requirement';

// ============================================================================
// 需求确认状态（只读需求说明专用）
// ============================================================================

/**
 * 需求确认状态枚举：
 * - 已确认：需求已经产品经理确认
 * - 部分确认：部分内容已确认，仍有待补充
 * - 待确认：需求尚未确认
 * - 空字符串/null：展示时回退为"待确认"
 */
export const requirementConfirmationStatusSchema = z.enum([
  '已确认',
  '部分确认',
  '待确认',
]);

/**
 * 需求确认状态（允许空值和缺失）：
 * - 合法非空字符串：必须属于枚举值之一
 * - null / ""：表示未填写，展示时回退为"待确认"
 * - 缺失：与 null 同义
 */
export const requirementConfirmationStatusOptionalSchema = z
  .union([
    requirementConfirmationStatusSchema,
    z.string().trim().length(0),
    z.null(),
  ])
  .optional();

/**
 * 可选需求说明文字：
 * - 缺失、null、空字符串和纯空格均合法
 * - 非空字符串 trim 后进入展示层
 */
const optionalTrimmedTextSchema = z
  .union([z.string().transform((value) => value.trim()), z.null()])
  .optional();

// ============================================================================
// 需求说明条目（单条需求正文）
// ============================================================================

/**
 * 只读需求说明条目 Schema：
 * - requirementNo 和 requirementName 为必填，trim 后非空
 * - status 为可选确认状态，缺失/null/空字符串均合法（展示时回退"待确认"）
 * - definition、dataSource、rule、remark 为可选字符串，缺失/null/空字符串均合法（展示时隐藏）
 * - 使用 strictObject 拒绝未知字段
 */
export const requirementViewEntrySchema = z.strictObject({
  requirementNo: nonEmptyTrimmedString,
  requirementName: nonEmptyTrimmedString,
  status: requirementConfirmationStatusOptionalSchema,
  definition: optionalTrimmedTextSchema,
  dataSource: optionalTrimmedTextSchema,
  rule: optionalTrimmedTextSchema,
  remark: optionalTrimmedTextSchema,
});

// ============================================================================
// 需求映射 Schema
// ============================================================================

/**
 * 需求视图映射 Schema：
 * - 根节点为以 stable requirement key 为键的对象
 * - 每个键对应一个有效的 requirementViewEntrySchema
 */
export const requirementViewMapSchema = z.record(stableIdSchema, requirementViewEntrySchema);

// ============================================================================
// 校验辅助函数
// ============================================================================

/**
 * 预期 requirement key 集合（任务单第18节固定12条）。
 * 用于交叉校验 JSON 恰好包含这 12 个 key。
 */
export const EXPECTED_REQUIREMENT_KEYS = [
  'scrm-store-customer-first-allocation-time',
  'scrm-store-customer-latest-allocation-time',
  'scrm-store-customer-is-arrived',
  'scrm-store-customer-is-deal',
  'scrm-store-customer-appointment-arrival-time',
  'scrm-store-customer-actual-arrival-status',
  'scrm-store-customer-actual-deal-status',
  'scrm-store-customer-invalid-lead-status',
  'scrm-store-customer-invalid-lead-approval',
  'scrm-store-customer-invalid-lead-detail',
  'scrm-store-customer-invalid-lead-filter',
  'scrm-store-customer-requirement-view-mode',
] as const;

/**
 * 校验 JSON 恰好包含预期的 12 个 key。
 * 返回 null 表示通过，否则返回错误信息。
 */
export function validateRequirementKeys(
  data: Record<string, unknown>,
): string | null {
  const actualKeys = Object.keys(data);
  const expected = new Set<string>(EXPECTED_REQUIREMENT_KEYS);

  const missing = EXPECTED_REQUIREMENT_KEYS.filter((k) => !actualKeys.includes(k));
  const extra = actualKeys.filter((k) => !expected.has(k));

  if (missing.length > 0) {
    return `缺少 requirement key: ${missing.join(', ')}`;
  }
  if (extra.length > 0) {
    return `多余 requirement key: ${extra.join(', ')}`;
  }
  return null;
}

// ============================================================================
// TypeScript 类型推导
// ============================================================================

/** 需求确认状态类型 */
export type RequirementConfirmationStatus = z.infer<typeof requirementConfirmationStatusSchema>;

/** 需求说明条目类型 */
export type RequirementViewEntry = z.infer<typeof requirementViewEntrySchema>;

/** 需求视图映射类型 */
export type RequirementViewMap = z.infer<typeof requirementViewMapSchema>;
