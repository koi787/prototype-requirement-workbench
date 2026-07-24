/**
 * 门店客户列表 - 需求点映射
 *
 * 12 个固定编号对应的页面需求点配置。
 * 编号属于页面锚点配置，不进入需求正文 JSON。
 *
 * requirementKey → JSON 说明
 * displayNumber → 页面显示编号
 * targetId → 具体高亮位置（行内目标使用稳定 record.key）
 */

// ============================================================================
// 需求点配置类型
// ============================================================================

export interface RequirementPointConfig {
  /** 稳定 requirement key（关联 JSON） */
  requirementKey: string;
  /** 页面显示编号（1—12） */
  displayNumber: number;
  /** 目标位置类型 */
  targetKind: 'column-header' | 'filter-label' | 'inline-status' | 'menu-item' | 'mode-control';
  /** target data-req-id（不含 record.key 后缀） */
  targetDataReqId: string;
  /** 对应列 key（仅 column-header 类型） */
  columnKey?: string;
  /** 是否按 record.key 生成行级 targetId */
  perRecord?: boolean;
}

// ============================================================================
// 12 个固定需求点
// ============================================================================

export const REQUIREMENT_POINTS: RequirementPointConfig[] = [
  {
    requirementKey: 'scrm-store-customer-first-allocation-time',
    displayNumber: 1,
    targetKind: 'column-header',
    targetDataReqId: 'first-allocation-time-column',
    columnKey: 'firstAssignTime',
  },
  {
    requirementKey: 'scrm-store-customer-latest-allocation-time',
    displayNumber: 2,
    targetKind: 'column-header',
    targetDataReqId: 'latest-allocation-time-column',
    columnKey: 'lastAssignTime',
  },
  {
    requirementKey: 'scrm-store-customer-is-arrived',
    displayNumber: 3,
    targetKind: 'column-header',
    targetDataReqId: 'is-arrived-column',
    columnKey: 'isVisited',
  },
  {
    requirementKey: 'scrm-store-customer-is-deal',
    displayNumber: 4,
    targetKind: 'column-header',
    targetDataReqId: 'is-deal-column',
    columnKey: 'isDeal',
  },
  {
    requirementKey: 'scrm-store-customer-appointment-arrival-time',
    displayNumber: 5,
    targetKind: 'column-header',
    targetDataReqId: 'appointment-arrival-time-column',
    columnKey: 'appointmentTime',
  },
  {
    requirementKey: 'scrm-store-customer-actual-arrival-status',
    displayNumber: 6,
    targetKind: 'column-header',
    targetDataReqId: 'actual-arrival-status-column',
    columnKey: 'actualVisitStatus',
  },
  {
    requirementKey: 'scrm-store-customer-actual-deal-status',
    displayNumber: 7,
    targetKind: 'column-header',
    targetDataReqId: 'actual-deal-status-column',
    columnKey: 'actualDealStatus',
  },
  {
    requirementKey: 'scrm-store-customer-invalid-lead-status',
    displayNumber: 8,
    targetKind: 'column-header',
    targetDataReqId: 'invalid-lead-status-column',
    columnKey: 'invalidCustomerStatus',
  },
  {
    requirementKey: 'scrm-store-customer-invalid-lead-filter',
    displayNumber: 9,
    targetKind: 'filter-label',
    targetDataReqId: 'invalid-lead-filter',
  },
  {
    requirementKey: 'scrm-store-customer-invalid-lead-detail',
    displayNumber: 10,
    targetKind: 'inline-status',
    targetDataReqId: 'invalid-lead-detail',
    columnKey: 'invalidCustomerStatus',
    perRecord: true,
  },
  {
    requirementKey: 'scrm-store-customer-invalid-lead-approval',
    displayNumber: 11,
    targetKind: 'menu-item',
    targetDataReqId: 'invalid-lead-approval',
    perRecord: true,
  },
  {
    requirementKey: 'scrm-store-customer-requirement-view-mode',
    displayNumber: 12,
    targetKind: 'mode-control',
    targetDataReqId: 'requirement-view-mode-control',
  },
] as const;

// ============================================================================
// 工具函数
// ============================================================================

/** 根据 requirement key 查找配置 */
export function getPointByKey(key: string): RequirementPointConfig | undefined {
  return REQUIREMENT_POINTS.find((p) => p.requirementKey === key);
}

/** 根据显示编号查找配置 */
export function getPointByNumber(num: number): RequirementPointConfig | undefined {
  return REQUIREMENT_POINTS.find((p) => p.displayNumber === num);
}

/** 检查 12 个编号是否完整且唯一 */
export function validateDisplayNumbers(): string | null {
  const numbers = REQUIREMENT_POINTS.map((p) => p.displayNumber);
  const unique = new Set(numbers);
  if (unique.size !== 12) return '显示编号不唯一';
  for (let i = 1; i <= 12; i++) {
    if (!unique.has(i)) return `缺少显示编号 ${i}`;
  }
  return null;
}

/** 检查 12 个 requirement key 是否唯一 */
export function validateRequirementKeys(): string | null {
  const keys = REQUIREMENT_POINTS.map((p) => p.requirementKey);
  const unique = new Set(keys);
  if (unique.size !== 12) return 'requirement key 不唯一';
  return null;
}
