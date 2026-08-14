/**
 * 0012 Cycle A - 潜客管理产品层菜单与可切换页面定义。
 *
 * 菜单 key 为稳定标识（0012 §2.2）：门店客户 / 到店记录 / 拜访记录，
 * 不得继续用 visit-record 表示"到店记录"，也不得保留 visit-record-2 之类
 * 临时 key。仅到店记录、拜访记录与门店客户三个页面支持在本模块内切换；
 * 其余菜单项仍为既有占位入口（不触发跳转）。
 */
export type ProspectPageKey = 'store-customer' | 'arrival-record' | 'visit-record';

export interface ProspectNavItem {
  key: string;
  label: string;
}

/** 潜客管理子菜单（0012 §2.2 顺序） */
export const PROSPECT_NAV_ITEMS: ProspectNavItem[] = [
  { key: 'store-customer', label: '门店客户' },
  { key: 'arrival-record', label: '到店记录' },
  { key: 'visit-record', label: '拜访记录' },
  { key: 'employee-seat', label: '员工座席' },
  { key: 'customer-sea', label: '客户公海' },
  { key: 'invalid-sea', label: '无效公海' },
  { key: 'my-responsible', label: '我负责的' },
  { key: 'call-record', label: '通话记录' },
  { key: 'tag-group', label: '标签分组' },
];

/** 支持在本模块内真实切换的页面（其余子菜单为占位入口）。 */
export const SWITCHABLE_PROSPECT_PAGES: readonly ProspectPageKey[] = [
  'store-customer',
  'arrival-record',
  'visit-record',
];
