import type { ReactNode } from 'react';

/**
 * 筛选区布局容器（FilterBar）。
 *
 * 只渲染筛选卡片的布局容器与插槽，不接管筛选状态、控件值、字段配置或业务逻辑。
 * 类名沿用既有 `store-customer-*` 选择器，保证已验收页面视觉不变。
 */
export interface FilterBarProps {
  children?: ReactNode;
  /** 筛选区锚点 id（默认保留既有值） */
  dataReqId?: string;
  /** 自定义类名（为空时使用既有类名） */
  className?: string;
}

export function FilterBar({
  children,
  dataReqId = 'filter-area',
  className,
}: FilterBarProps) {
  return (
    <div
      className={className ?? 'store-customer-filter-card'}
      data-req-id={dataReqId}
    >
      {children}
    </div>
  );
}

export default FilterBar;
