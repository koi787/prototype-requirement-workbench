import type { ReactNode } from 'react';

/**
 * 后台页面框架（AdminShell）。
 *
 * Phase 1 只负责渲染后台页面框架和插槽：Sidebar / TopHeader / 顶部页签 / Content。
 * 不内置 SCRM 菜单、顶部页签、系统名称或其他业务文字，业务侧以插槽方式传入。
 *
 * 类名沿用既有 `store-customer-*` 选择器，确保已验收页面的 DOM 关系与视觉
 * 不发生任何变化；后续 Phase 复用到其它页面时，可在独立任务中重命名与换肤。
 */
export interface AdminShellProps {
  /** 左侧导航插槽 */
  sidebar?: ReactNode;
  /** 顶部系统栏插槽 */
  topBar?: ReactNode;
  /** 顶部页签插槽 */
  tabs?: ReactNode;
  /** 内容区插槽（位于 Content Layout 内） */
  content?: ReactNode;
  /** 页面根锚点 id（默认保留既有值） */
  rootDataReqId?: string;
}

export function AdminShell({
  sidebar,
  topBar,
  tabs,
  content,
  rootDataReqId = 'store-customer-page-root',
}: AdminShellProps) {
  return (
    <div className="store-customer-page" data-req-id={rootDataReqId}>
      {sidebar}
      <div className="store-customer-main">
        {topBar}
        {tabs}
        <div className="store-customer-content">{content}</div>
      </div>
    </div>
  );
}

export default AdminShell;
