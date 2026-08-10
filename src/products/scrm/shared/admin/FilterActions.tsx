import type { ReactNode } from 'react';

/**
 * 筛选操作按钮区（FilterActions）。
 *
 * 只渲染左右两个操作插槽的布局容器，不接管按钮逻辑。
 * 类名沿用既有 `store-customer-*` 选择器，保证已验收页面视觉不变。
 */
export interface FilterActionsProps {
  /** 左侧操作插槽（展开/搜索/重置等） */
  left?: ReactNode;
  /** 右侧操作插槽（导出等） */
  right?: ReactNode;
}

export function FilterActions({ left, right }: FilterActionsProps) {
  return (
    <div className="store-customer-filter-actions">
      {left != null && <div className="store-customer-filter-actions-left">{left}</div>}
      {right != null && <div className="store-customer-filter-actions-right">{right}</div>}
    </div>
  );
}

export default FilterActions;
