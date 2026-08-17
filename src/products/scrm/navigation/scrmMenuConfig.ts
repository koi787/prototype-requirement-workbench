/**
 * 0013 - SCRM 产品级菜单配置（唯一真值）。
 *
 * 一级/二级菜单不再散落在 StoreCustomerList.tsx：本文件是 SCRM 产品级导航的
 * 单一来源（§17.3）。潜客管理子项 key 沿用 0012 稳定旧 key，作为
 * data-prospect-page-key DOM 契约；canonical pageKey 供产品壳与注册表使用。
 *
 * 0013 机械迁入当前实际展示结构，不重排子项顺序（§3.3：真实后台潜客管理子项
 * 顺序是否同步由产品验收另行决定，不在本基础设施任务内改变三个已实现页面的
 * key / 可进入性 / 业务内容）。未注册页面保持 enabled: false 且不渲染空页。
 *
 * 业务域边界：ScrmModuleKey 已在类型层支持 employee-management（0014 员工 →
 * 组织架构）；测试验证第二业务域可注册。但生产左侧导航暂不展示"员工 → 组织架构"
 * 菜单，0014 实现真实页面后再启用（§7.4 / 硬约束二）。
 *
 * icon 复用既有图标能力（IconComponents，无依赖），0013 不设计图标注册系统。
 */
import type { ScrmLegacyPageKey, ScrmMenuNode, ScrmPageKey } from './scrmNavigationTypes';
import {
  NavHomeIcon,
  NavCalendarIcon,
  NavShopIcon,
  NavDollarIcon,
  NavTeamIcon,
  NavFileIcon,
  NavStoreIcon,
  NavContactsIcon,
  NavServiceIcon,
} from '../modules/prospect-management/pages/StoreCustomerList/IconComponents';

/** 潜客管理子菜单（0012 §2.2 顺序，机械迁移；三个真实页面可进入，其余为占位）。 */
const prospectChildren: ScrmMenuNode[] = [
  { key: 'store-customer', label: '门店客户', moduleKey: 'prospect-management', pageKey: 'prospect-store-customer', enabled: true },
  { key: 'arrival-record', label: '到店记录', moduleKey: 'prospect-management', pageKey: 'prospect-arrival-record', enabled: true },
  { key: 'visit-record', label: '拜访记录', moduleKey: 'prospect-management', pageKey: 'prospect-visit-record', enabled: true },
  { key: 'employee-seat', label: '员工座席', moduleKey: 'prospect-management', enabled: false },
  { key: 'customer-sea', label: '客户公海', moduleKey: 'prospect-management', enabled: false },
  { key: 'invalid-sea', label: '无效公海', moduleKey: 'prospect-management', enabled: false },
  { key: 'my-responsible', label: '我负责的', moduleKey: 'prospect-management', enabled: false },
  { key: 'call-record', label: '通话记录', moduleKey: 'prospect-management', enabled: false },
  { key: 'tag-group', label: '标签分组', moduleKey: 'prospect-management', enabled: false },
];

/**
 * SCRM 产品级一级菜单（当前实际展示结构）。
 *
 * 除潜客管理外的一级项为历史占位入口（enabled: false，不渲染空页），后续按
 * 真实业务域逐步补齐（§3.3）。moduleKey 为过渡占位：未映射到独立业务域的入口
 * 暂时归入当前唯一活动域，不改变其渲染与点击行为。
 */
export const SCRM_MENU: readonly ScrmMenuNode[] = [
  { key: 'home', label: '首页', moduleKey: 'prospect-management', enabled: false, icon: NavHomeIcon },
  { key: 'appointment', label: '预约', moduleKey: 'prospect-management', enabled: false, icon: NavCalendarIcon },
  { key: 'product', label: '品项', moduleKey: 'prospect-management', enabled: false, icon: NavShopIcon },
  { key: 'cashier', label: '收银', moduleKey: 'prospect-management', enabled: false, icon: NavDollarIcon },
  { key: 'staff', label: '门店人员', moduleKey: 'prospect-management', enabled: false, icon: NavTeamIcon },
  { key: 'order', label: '订单', moduleKey: 'prospect-management', enabled: false, icon: NavFileIcon },
  { key: 'record', label: '记录', moduleKey: 'prospect-management', enabled: false, icon: NavFileIcon },
  { key: 'store', label: '门店', moduleKey: 'prospect-management', enabled: false, icon: NavStoreIcon },
  { key: 'customer', label: '客户', moduleKey: 'prospect-management', enabled: false, icon: NavContactsIcon },
  {
    key: 'prospect',
    label: '潜客管理',
    moduleKey: 'prospect-management',
    enabled: true,
    defaultPageKey: 'prospect-store-customer',
    icon: NavServiceIcon,
    children: prospectChildren,
  },
];

// ============================================================================
// 旧 pageKey 与 canonical pageKey 的映射（§9.3：只放在导航层）
// ============================================================================

const LEGACY_TO_CANONICAL: Readonly<Record<ScrmLegacyPageKey, ScrmPageKey>> = {
  'store-customer': 'prospect-store-customer',
  'arrival-record': 'prospect-arrival-record',
  'visit-record': 'prospect-visit-record',
};

/** 在页面入口一次性把旧 key（或 canonical key）归一化为 canonical key。 */
export function normalizePageKey(input?: ScrmLegacyPageKey | ScrmPageKey): ScrmPageKey {
  if (!input) return 'prospect-store-customer';
  if (Object.prototype.hasOwnProperty.call(LEGACY_TO_CANONICAL, input)) {
    return LEGACY_TO_CANONICAL[input as ScrmLegacyPageKey];
  }
  return input as ScrmPageKey;
}

/** 潜客管理子菜单（产品壳使用；保持 0012 展示顺序）。 */
export const PROSPECT_SUBMENU: readonly ScrmMenuNode[] = prospectChildren;
