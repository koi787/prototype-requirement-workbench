/**
 * 门店客户列表 - 需求点映射
 *
 * 0008 闭环一 + 闭环二：15 个固定编号对应的页面需求点配置。
 * 编号属于页面锚点配置，不进入需求正文 JSON。
 *
 * 注意：编号 12 由 prototype-core 中的 RequirementModeControl 硬编码，
 * 不可在页面层修改其 displayNumber。
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
  /** 页面显示编号 */
  displayNumber: number;
  /** 目标位置类型 */
  targetKind: 'column-header' | 'filter-label' | 'mode-control' | 'row-action' | 'drawer-field';
  /** target data-req-id（不含 record.key 后缀） */
  targetDataReqId: string;
  /** 对应列 key（仅 column-header 类型） */
  columnKey?: string;
  /** 是否按 record.key 生成行级 targetId */
  perRecord?: boolean;
}

// ============================================================================
// 0008 需求点（15 个页面可配 + 1 个 prototype-core 硬编码）
// ============================================================================

export const REQUIREMENT_POINTS: RequirementPointConfig[] = [
  // --- 闭环一：列与筛选（1—8）---
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
    requirementKey: 'scrm-store-customer-appointment-arrival-time',
    displayNumber: 3,
    targetKind: 'column-header',
    targetDataReqId: 'appointment-arrival-time-column',
    columnKey: 'appointmentTime',
  },
  {
    requirementKey: 'scrm-store-customer-is-arrived',
    displayNumber: 4,
    targetKind: 'column-header',
    targetDataReqId: 'is-arrived-column',
    columnKey: 'isVisited',
  },
  {
    requirementKey: 'scrm-store-customer-is-deal',
    displayNumber: 5,
    targetKind: 'column-header',
    targetDataReqId: 'is-deal-column',
    columnKey: 'isDeal',
  },
  {
    requirementKey: 'scrm-store-customer-first-deal-amount',
    displayNumber: 6,
    targetKind: 'column-header',
    targetDataReqId: 'first-deal-amount-column',
    columnKey: 'firstDealAmount',
  },
  {
    requirementKey: 'scrm-store-customer-invalid-approval-status',
    displayNumber: 7,
    targetKind: 'column-header',
    targetDataReqId: 'invalid-approval-status-column',
    columnKey: 'invalidApprovalStatus',
  },
  {
    requirementKey: 'scrm-store-customer-invalid-approval-filter',
    displayNumber: 8,
    targetKind: 'filter-label',
    targetDataReqId: 'invalid-approval-filter',
  },

  // --- 闭环二：操作菜单（9—11，行级）---
  {
    requirementKey: 'scrm-store-customer-invalid-application',
    displayNumber: 9,
    targetKind: 'row-action',
    targetDataReqId: 'invalid-application',
    perRecord: true,
  },
  {
    requirementKey: 'scrm-store-customer-invalid-approval-review',
    displayNumber: 10,
    targetKind: 'row-action',
    targetDataReqId: 'invalid-approval-review',
    perRecord: true,
  },
  {
    requirementKey: 'scrm-store-customer-invalid-approval-detail',
    displayNumber: 11,
    targetKind: 'row-action',
    targetDataReqId: 'invalid-approval-detail',
    perRecord: true,
  },

  // 编号 12 由 prototype-core 的 RequirementModeControl 硬编码
  {
    requirementKey: 'scrm-store-customer-requirement-view-mode',
    displayNumber: 12,
    targetKind: 'mode-control',
    targetDataReqId: 'requirement-view-mode-control',
  },

  // --- 闭环二：抽屉字段（编号与关联菜单共享：opinion/return-remark 共享 10，resubmit 共享 9）---
  {
    requirementKey: 'scrm-store-customer-invalid-approval-opinion',
    displayNumber: 10,
    targetKind: 'drawer-field',
    targetDataReqId: 'invalid-approval-opinion',
  },
  {
    requirementKey: 'scrm-store-customer-invalid-approval-return-remark',
    displayNumber: 10,
    targetKind: 'drawer-field',
    targetDataReqId: 'invalid-approval-return-remark',
  },
  {
    requirementKey: 'scrm-store-customer-invalid-approval-resubmit',
    displayNumber: 9,
    targetKind: 'row-action',
    targetDataReqId: 'invalid-approval-resubmit',
    perRecord: true,
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

/** 检查显示编号是否完整且唯一 */
export function validateDisplayNumbers(): string | null {
  const numbers = REQUIREMENT_POINTS.map((p) => p.displayNumber);
  // 显示编号允许重复（drawer-field 复用菜单编号）
  const distinctNums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  for (const n of distinctNums) {
    if (!numbers.includes(n)) return `缺少显示编号 ${n}`;
  }
  return null;
}

/** 检查 requirement key 是否唯一 */
export function validateRequirementKeys(): string | null {
  const keys = REQUIREMENT_POINTS.map((p) => p.requirementKey);
  const unique = new Set(keys);
  if (unique.size !== 15) return `requirement key 不唯一，预期 15 个，实际 ${unique.size} 个`;
  return null;
}
