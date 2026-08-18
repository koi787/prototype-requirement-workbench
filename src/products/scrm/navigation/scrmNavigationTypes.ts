/**
 * 0013/0014 - SCRM 产品级导航与页面注册类型。
 *
 * 产品级菜单（menuConfig）、页面注册表（pageRegistry）与产品壳（ScrmWorkspace）
 * 共享的类型边界。仅放稳定类型与最小契约，不放业务实现。
 *
 * - ScrmModuleKey：SCRM 一级业务域（模块）。0013 仅类型支持并由测试验证可注册；
 *   0014 正式启用 employee-management（员工 → 组织架构），生产左侧导航展示该业务域。
 * - ScrmPageKey：产品级页面 canonical key（带业务域前缀）。
 * - ScrmLegacyPageKey：0012 及更早的既有 pageKey，继续兼容，仅在导航层归一化。
 * - 旧 key 与 canonical key 的映射只放在导航层（scrmMenuConfig.normalizePageKey），
 *   不散落到各业务页面（§9.3）。
 */
import type { ComponentType, CSSProperties, ReactNode } from 'react';

/** 一级菜单图标组件统一 prop 形状（复用既有 IconComponents 的 IconProps）。 */
export interface ScrmMenuIconProps {
  style?: CSSProperties;
  size?: number;
}

/** SCRM 一级业务域（模块）稳定 key。 */
export type ScrmModuleKey = 'prospect-management' | 'employee-management';

/** 产品级页面 canonical key（带业务域前缀）；employee-organization 为 0014 生产页面。 */
export type ScrmPageKey =
  | 'prospect-store-customer'
  | 'prospect-arrival-record'
  | 'prospect-visit-record'
  | 'employee-organization';

/** 0012 及更早的既有 pageKey（Story args / data-prospect-page-key / 既有测试继续使用）。 */
export type ScrmLegacyPageKey = 'store-customer' | 'arrival-record' | 'visit-record';

/** 菜单节点（最小字段 §7）：只描述菜单结构；icon 复用既有图标能力，0013 不设计图标注册系统。 */
export interface ScrmMenuNode {
  /** 菜单节点稳定 key（潜客管理子项沿用旧 pageKey，作为 data-prospect-page-key 契约）。 */
  key: string;
  label: string;
  moduleKey: ScrmModuleKey;
  /** 有真实页面时填写（canonical key）；无页面（占位入口）不填。 */
  pageKey?: ScrmPageKey;
  /** 是否可点击；不以是否有 onClick 推断（未注册页面保持禁用，不渲染空页）。 */
  enabled: boolean;
  /** 模块根的默认落点页面（有子菜单的一级业务域使用）。 */
  defaultPageKey?: ScrmPageKey;
  children?: ScrmMenuNode[];
  /** 一级菜单图标组件（渲染时实例化，复用既有 IconComponents；0013 不设计图标注册系统）。 */
  icon?: ComponentType<ScrmMenuIconProps>;
}

/**
 * 页面注册表渲染上下文。
 *
 * 注册表只负责 pageKey → 实际页面内容（§8）。潜客管理三个页面的实际页面内容由
 * 潜客管理模块入口（StoreCustomerList 兼容入口）以不透明 ReactNode slot 接线提供
 * （产品壳与注册表不解释其内部业务）。员工/组织架构页（0014）为自包含页面，
 * 注册后默认直接渲染；Story 初始化状态可通过同一产品级 renderContext 传入
 * 不透明 ReactNode，不绕过注册表出口。
 */
export interface ScrmPageRenderContext {
  /** 门店客户页面内容（潜客管理模块入口接线提供）。 */
  prospectStoreCustomer?: ReactNode;
  /** 到店记录独立页内容（潜客管理模块入口接线提供）。 */
  prospectArrivalRecord?: ReactNode;
  /** 拜访记录独立页内容（潜客管理模块入口接线提供）。 */
  prospectVisitRecord?: ReactNode;
  /** 员工组织架构页面内容（产品级 Story setup 可提供初始化状态）。 */
  employeeOrganization?: ReactNode;
}

/**
 * 页面注册项：pageKey → 实际页面内容。
 *
 * 注册表不创建 Provider、不管理 Drawer、不注入权限、不创建路由、不自动生成
 * 菜单、不生成空页面。未知 key 不静默映射到错误页面。
 */
export interface ScrmPageRegistration {
  pageKey: ScrmPageKey;
  moduleKey: ScrmModuleKey;
  render: (context: ScrmPageRenderContext) => ReactNode;
}
