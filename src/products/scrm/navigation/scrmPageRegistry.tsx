/**
 * 0013 - SCRM 产品级页面注册表（pageKey → 实际页面内容）。
 *
 * 页面切换不在业务页面中写成条件链：注册表集中选择业务内容（§17.4）。
 * 只负责映射，不创建 Provider、不管理 Drawer、不注入权限、不创建路由、
 * 不自动生成菜单、不生成空页面（§8）。未知 key 返回 undefined，调用方保持
 * 当前有效页面，不猜测 fallback 业务页面。
 *
 * 0013 首批注册三个既有页面，全部归潜客管理业务域。三个页面的实际页面内容由
 * 潜客管理模块入口经渲染上下文 slot 机械接线提供（注册表不解释其内部业务，
 * 也不依赖潜客业务组件——员工/组织架构页（0014）注册后同样只经产品壳
 * ScrmWorkspace 出口渲染，不进入潜客业务根）。
 */
import type { ScrmPageKey, ScrmPageRegistration } from './scrmNavigationTypes';

export const SCRM_PAGE_REGISTRY: readonly ScrmPageRegistration[] = [
  {
    pageKey: 'prospect-store-customer',
    moduleKey: 'prospect-management',
    render: (context) => context.prospectStoreCustomer ?? null,
  },
  {
    pageKey: 'prospect-arrival-record',
    moduleKey: 'prospect-management',
    render: (context) => context.prospectArrivalRecord ?? null,
  },
  {
    pageKey: 'prospect-visit-record',
    moduleKey: 'prospect-management',
    render: (context) => context.prospectVisitRecord ?? null,
  },
];

/** 按 canonical pageKey 读取注册项；未知/未注册 key 返回 undefined（不静默映射）。 */
export function getPageRegistration(pageKey: ScrmPageKey): ScrmPageRegistration | undefined {
  return SCRM_PAGE_REGISTRY.find((registration) => registration.pageKey === pageKey);
}

/** 已注册页面 key 列表（测试与产品壳使用）。 */
export function getRegisteredPageKeys(): readonly ScrmPageKey[] {
  return SCRM_PAGE_REGISTRY.map((registration) => registration.pageKey);
}
