import type { ReactNode } from 'react';

/**
 * 筛选字段插槽（FilterField）。
 *
 * 只渲染单个筛选项的布局：label 与控件插槽，不接管筛选值、onChange 或业务逻辑。
 * 类名沿用既有 `store-customer-*` 选择器，保证已验收页面视觉不变。
 */
export interface FilterFieldProps {
  /** 字段标签（可为字符串或任意节点） */
  label?: ReactNode;
  /** 控件插槽 */
  children?: ReactNode;
  /** 附加类名（与基础类名拼接，例如日期范围跨列修饰） */
  className?: string;
  /** 字段锚点 id */
  dataReqId?: string;
}

export function FilterField({ label, children, className, dataReqId }: FilterFieldProps) {
  const itemClassName = className
    ? `store-customer-filter-item ${className}`
    : 'store-customer-filter-item';

  return (
    <div className={itemClassName} {...(dataReqId ? { 'data-req-id': dataReqId } : {})}>
      {label != null && <label>{label}</label>}
      {children}
    </div>
  );
}

export default FilterField;
