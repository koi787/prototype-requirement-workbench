/**
 * 0013 - 潜客管理既有导航兼容导出（Derived from SCRM_MENU）。
 *
 * 0012 及更早的潜客管理导航定义已上收为产品级唯一真值（SCRM_MENU，位于
 * navigation/scrmMenuConfig）。本文件保留既有导出名，改为从潜客管理子菜单
 * 派生，避免破坏既有引用与 0012 测试的 DOM 契约。
 *
 * ProspectPageKey 是 0012 旧 pageKey 的兼容别名，与产品级 ScrmLegacyPageKey
 * 等价（§9.3：旧 key 与 canonical key 的映射只放在导航层）；既有 Story args /
 * 测试继续使用别名，新代码应使用产品级类型。
 */
import { PROSPECT_SUBMENU } from '../../../navigation/scrmMenuConfig';
import type { ScrmLegacyPageKey } from '../../../navigation/scrmNavigationTypes';

/** 0012 旧 pageKey 兼容别名（= ScrmLegacyPageKey）。 */
export type ProspectPageKey = ScrmLegacyPageKey;

export interface ProspectNavItem {
  key: string;
  label: string;
}

/** 潜客管理子菜单（派生自产品级 SCRM_MENU，保持 0012 §2.2 顺序）。 */
export const PROSPECT_NAV_ITEMS: ProspectNavItem[] = PROSPECT_SUBMENU.map((node) => ({
  key: node.key,
  label: node.label,
}));

/** 支持在本模块内真实切换的页面（派生自菜单节点 enabled + pageKey；其余为占位入口）。 */
export const SWITCHABLE_PROSPECT_PAGES: readonly ProspectPageKey[] = PROSPECT_SUBMENU.filter(
  (node) => node.enabled && node.pageKey,
).map((node) => node.key as ProspectPageKey);
