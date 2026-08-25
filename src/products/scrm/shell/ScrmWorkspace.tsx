/**
 * 0013 - SCRM 产品级工作区组合根（ScrmWorkspace）。
 *
 * 只负责（硬约束一）：
 * - SCRM 产品壳（AdminShell + 顶部系统栏 + 顶部页签 + 左侧导航）
 * - 一级/二级菜单读取（SCRM_MENU，唯一真值）
 * - active page（canonical pageKey 状态与切换）
 * - pageRegistry 页面出口（activePage → normalize → pageRegistry → registration
 *   → 页面内容：整条产品级页面选择链位于本产品壳，是唯一产品级页面出口，
 *   不经过任何业务模块根；Blocking 修复）
 * - 必须跨页面生命周期存在的 Provider（RequirementViewProvider /
 *   RecordRuntimeStoreProvider 单实例，位于页面出口之上）
 *
 * 不得接管：到店/拜访/变更记录/跟进详情/无效审批 Drawer、潜客管理业务操作、
 * Record 业务字段逻辑（均保留在 prospect-management，本文件不引入这些业务）。
 *
 * Provider 生命周期（§5/§17.8）：RecordRuntimeStoreProvider 挂在页面出口之上，
 * 一级业务域切换（content 出口内容组件变化）不会重建 Provider，潜客管理内部
 * 切换与未来跨一级域往返后 create/update 运行时数据均保留。
 *
 * 顶部系统栏/顶部页签/左侧导航自 StoreCustomerList 原样迁移（DOM/CSS 不变，
 * 不搬 CSS）；一级菜单图标复用既有 IconComponents 能力。
 */
import { useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Space } from 'antd';
import { AdminShell } from '../shared/admin';
import { RequirementViewProvider } from '../../../prototype-core/requirement-view';
import { RecordRuntimeStoreProvider } from '../modules/prospect-management/record-shared';
import { SCRM_MENU, normalizePageKey } from '../navigation/scrmMenuConfig';
import { SCRM_PAGE_REGISTRY } from '../navigation/scrmPageRegistry';
import type {
  ScrmLegacyPageKey,
  ScrmPageKey,
  ScrmPageRegistration,
  ScrmPageRenderContext,
} from '../navigation/scrmNavigationTypes';
import {
  MenuIcon,
  NavServiceIcon,
  QrcodeIcon,
  CaretDownIcon,
  LogoutIcon,
  UserIcon,
  FoldIcon,
} from '../modules/prospect-management/pages/StoreCustomerList/IconComponents';
import './scrmWorkspace.css';

/** 产品壳注入给活动页面出口的组合上下文。 */
export interface ScrmShellContext {
  /** 当前活动页面（canonical key，已归一化）。 */
  activePage: ScrmPageKey;
  /** 切换到已注册页面；未知/未注册 key 不切页（保持当前有效页面）。 */
  navigate: (pageKey: ScrmPageKey) => void;
  /**
   * 产品级页面出口：当前活动页面经 pageRegistry 选择后的页面内容
   * （activePage → normalize → pageRegistry → registration → 页面内容整条
   * 产品级页面选择链发生在产品壳，不经过任何业务模块根）。
   */
  outlet: ReactNode;
}

export interface ScrmWorkspaceProps {
  /** 初始活动页面（接受旧 key 或 canonical key，产品入口一次性归一化）。 */
  initialPage?: ScrmLegacyPageKey | ScrmPageKey;
  /** 初始需求查看模式（默认 prototype）。 */
  initialRequirementMode?: 'prototype' | 'requirement';
  /**
   * 产品级页面渲染上下文（模块入口为当前业务域页面提供的渲染输入 slot；
   * 0013 由 StoreCustomerList 兼容入口为潜客管理三个页面接线）。
   */
  renderContext?: ScrmPageRenderContext;
  /**
   * 页面注册表（默认产品级 SCRM_PAGE_REGISTRY；测试可注入 fixture 注册项
   * 验证注册边界——如员工组织架构页由产品壳直接出口渲染，不进入潜客业务根）。
   */
  pageRegistry?: readonly ScrmPageRegistration[];
  /**
   * 活动页面出口覆盖（可选）：测试/特殊入口可自定义出口内容；缺省渲染
   * 产品级页面出口（即 pageRegistry 对当前 activePage 的输出）。
   */
  children?: (shell: ScrmShellContext) => ReactNode;
}

// 顶部页签（产品壳 chrome；自 StoreCustomerList 原样迁移）
const topTabs = [
  { key: 'home', label: '首页' },
  { key: 'customer-list', label: '客户列表' },
  { key: 'store-list', label: '门店列表' },
  { key: 'store-customer', label: '门店客户' },
  { key: 'recruit', label: '人才招募' },
  { key: 'cashier-tab', label: '收银' },
  { key: 'product-category', label: '商品类目' },
  { key: 'store-room', label: '门店房间' },
  { key: 'employee-seat', label: '员工座席' },
  { key: 'contract-center', label: '合同中心' },
  { key: 'order-center', label: '订单中心' },
];

export function ScrmWorkspace({
  initialPage,
  initialRequirementMode = 'prototype',
  renderContext,
  pageRegistry,
  children,
}: ScrmWorkspaceProps) {
  const registry = pageRegistry ?? SCRM_PAGE_REGISTRY;
  const getRegistration = useCallback(
    (pageKey: ScrmPageKey) =>
      registry.find((registration) => registration.pageKey === pageKey),
    [registry],
  );

  const [activePage, setActivePage] = useState<ScrmPageKey>(() => {
    const normalized = normalizePageKey(initialPage);
    // 未知/未注册 initialPage 不静默落到错误页面，回退默认门店客户
    return getRegistration(normalized) ? normalized : 'prospect-store-customer';
  });
  const [navCollapsed, setNavCollapsed] = useState(false);

  const navigate = useCallback(
    (pageKey: ScrmPageKey) => {
      // 未知或未注册 key 不切页，保持当前有效页面（不猜测 fallback 业务页面）
      if (getRegistration(pageKey)) {
        setActivePage(pageKey);
      }
    },
    [getRegistration],
  );

  // 活动模块由活动页面经注册表推导（模块边界见 ScrmModuleKey）
  const activeModuleKey = useMemo(
    () => getRegistration(activePage)?.moduleKey ?? 'prospect-management',
    [activePage, getRegistration],
  );

  // ---------- 产品级页面出口（Blocking 修复）----------
  // activePage → normalize（initialPage 归一化已在上方完成）→ pageRegistry →
  // registration → 页面内容。整条产品级页面选择链发生在产品壳，是唯一产品级
  // 页面出口：潜客业务根不再查询全产品 pageRegistry，员工/组织架构页（0014）
  // 注册后同样只经本出口渲染，不进入潜客业务根。注册项不创建 Provider、不管理
  // Drawer、不生成空页（未知 key 返回 null，不猜测 fallback 业务页面）。
  const outlet = getRegistration(activePage)?.render(renderContext ?? {}) ?? null;

  // ---------- 顶部系统栏（V-03：白色背景；自 StoreCustomerList 原样迁移） ----------
  const renderTopBar = () => (
    <div className="store-customer-topbar" data-req-id="top-system-bar">
      <div className="store-customer-topbar-left">
        <span className="store-customer-nav-toggle-icon">
          <MenuIcon size={16} style={{ color: '#333' }} />
        </span>
        <span className="store-customer-system-name">SCRM管理系统</span>
      </div>
      <div className="store-customer-topbar-right">
        <Space size="middle">
          <span className="store-customer-topbar-icon" aria-label="助手">
            <NavServiceIcon size={16} />
          </span>
          <span className="store-customer-topbar-icon" aria-label="二维码">
            <QrcodeIcon size={16} />
          </span>
          <span className="store-customer-store-selector" data-req-id="store-selector">
            <span className="store-customer-store-selector-label">示例旗舰店</span>
            <CaretDownIcon size={10} style={{ color: '#595959' }} />
          </span>
          <span className="store-customer-topbar-icon" aria-label="退出">
            <LogoutIcon size={16} />
          </span>
          <span className="store-customer-topbar-icon" aria-label="用户">
            <UserIcon size={16} />
          </span>
          <span className="store-customer-topbar-text">管理员</span>
        </Space>
      </div>
    </div>
  );

  // ---------- 顶部标签（自 StoreCustomerList 原样迁移） ----------
  const renderTabs = () => (
    <div className="store-customer-tabs" data-req-id="top-tabs">
      {topTabs.map((tab) => (
        <div
          key={tab.key}
          className={`store-customer-tab-item ${
            (activePage === 'customer-list' && tab.key === 'customer-list') ||
            (activePage !== 'customer-list' && tab.key === 'store-customer')
              ? 'active'
              : ''
          }`}
        >
          {tab.label}
          {((activePage === 'customer-list' && tab.key === 'customer-list') ||
            (activePage !== 'customer-list' && tab.key === 'store-customer')) && (
            <span className="store-customer-tab-close">×</span>
          )}
        </div>
      ))}
    </div>
  );

  // ---------- 左侧导航（一级/二级菜单读取自 SCRM_MENU，选中态与 activePage 同步） ----------
  const renderNav = () => (
    <div
      className={`store-customer-nav ${navCollapsed ? 'collapsed' : ''}`}
      data-req-id="left-navigation"
    >
      <div className="store-customer-nav-header">
        {!navCollapsed && (
          <span className="store-customer-nav-title">
            <span className="store-customer-nav-logo-dot" />
            <span className="store-customer-nav-brand-text">SCRM系统</span>
          </span>
        )}
        <span
          className="store-customer-nav-toggle"
          onClick={() => setNavCollapsed(!navCollapsed)}
        >
          <FoldIcon size={16} style={{ color: 'rgba(255,255,255,0.65)' }} />
        </span>
      </div>
      <div className="store-customer-nav-menu">
        {SCRM_MENU.map((item) => {
          const hasChildren = !!item.children;
          // 只有子项被选中，父级不标蓝；当前活动业务域的带子菜单节点展开
          const isParentExpanded = hasChildren && item.moduleKey === activeModuleKey;

          return (
            <div key={item.key}>
              {/* 0014 §3.3：一级节点 enabled 且存在 defaultPageKey 时，点击调用现有
                  navigate(defaultPageKey)，激活业务域并展开其子菜单（不重写菜单/壳）。 */}
              <div
                className={`store-customer-nav-item ${isParentExpanded ? 'expanded' : ''}`}
                title={item.label}
                onClick={
                  item.enabled && item.defaultPageKey
                    ? () => navigate(item.defaultPageKey!)
                    : undefined
                }
              >
                <span className="store-customer-nav-icon">
                  {item.icon && <item.icon />}
                </span>
                {!navCollapsed && (
                  <span className="store-customer-nav-label">{item.label}</span>
                )}
              </div>
              {hasChildren && isParentExpanded && !navCollapsed && (
                <div className="store-customer-nav-submenu">
                  {item.children!.map((child) => (
                    <div
                      key={child.key}
                      data-prospect-page-key={child.key}
                      className={`store-customer-nav-subitem ${
                        child.pageKey === activePage ? 'active' : ''
                      }`}
                      onClick={
                        child.enabled && child.pageKey
                          ? () => navigate(child.pageKey!)
                          : undefined
                      }
                    >
                      {child.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <RequirementViewProvider
      initialMode={initialRequirementMode}
      initialControlExpanded={initialRequirementMode === 'requirement'}
    >
      {/* 0012 单一运行时状态：挂在产品层共同祖先（页面出口之上），一级业务域切换
          不重建 Provider，create/update 运行时数据保留（§5/§9.2/§17.8）。 */}
      <RecordRuntimeStoreProvider>
        <AdminShell
          sidebar={renderNav()}
          topBar={renderTopBar()}
          tabs={renderTabs()}
          content={children?.({ activePage, navigate, outlet }) ?? outlet}
        />
      </RecordRuntimeStoreProvider>
    </RequirementViewProvider>
  );
}

export default ScrmWorkspace;
