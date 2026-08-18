/**
 * 0014 Cycle A/B - 员工 / 组织架构 类型定义。
 *
 * Cycle A 提供组织架构主页面（组织树 + 员工列表）所需类型；Cycle B 扩展
 * EmployeeDrawer 表单字段（薪酬、三个业务 Switch、可登录门店、绑定角色、
 * 人脸照片）到 EmployeeRecord 与 EmployeeDraft。
 */

/** 在职状态：固定 在职 / 离职（非在职），不擅自扩展枚举。 */
export type EmploymentStatus = 'active' | 'inactive';

/** 组织节点（组织树稳定 Mock）。 */
export interface OrganizationNode {
  id: string;
  parentId: string | null;
  name: string;
  children?: OrganizationNode[];
}

/**
 * 员工运行时记录（组织架构列表 / 筛选 / 启用 Switch / EmployeeDrawer 的单一真值）。
 *
 * 表格、筛选、Switch、新增、编辑读写同一份 Runtime 集合（0014 §14）；不复制
 * 第二份员工身份数据。不使用 LocalStorage，刷新恢复初始 Mock。
 */
export interface EmployeeRecord {
  id: string;
  name: string;
  /** 启用状态（列表绿色 Switch 读写同一 Runtime 记录）。 */
  enabled: boolean;
  employeeNo: string;
  /** 原始手机号（列表脱敏展示，搜索匹配原值）。 */
  mobile: string;
  /** 直接归属组织节点 id（Cycle A：选择节点只显示直接归属员工，不递归聚合）。 */
  organizationId: string;
  performanceStoreId: string;
  /** 岗位（允许多值，按截图密度展示）。 */
  positionIds: string[];
  /** 绑定角色（只保存 roleIds，角色为只读稳定 Mock 枚举）。 */
  roleIds: string[];
  employmentStatus: EmploymentStatus;
  updatedAt: string;
  operatorName: string;
  /** 薪酬类型 id（只保存 id，不做薪酬计算）。 */
  salaryTypeId: string;
  /** 用户完整手机号（业务 Switch）。 */
  fullMobileVisible: boolean;
  /** 加盟商对账（业务 Switch）。 */
  franchiseReconciliation: boolean;
  /** 联营店对账（业务 Switch）。 */
  jointStoreReconciliation: boolean;
  /** 可登录门店 id 集合（Transfer 结果）。 */
  loginStoreIds: string[];
  /** 人脸照片本地预览（data URL；无照片时不设置）。 */
  facePhoto?: string;
}

/**
 * EmployeeDrawer 表单草稿（Drawer 内唯一临时状态）。
 *
 * 打开时从 EmployeeRecord / create 默认值生成，取消直接丢弃，保存由
 * OrganizationPage 写回同一份员工 Runtime 集合（0014 §14）。
 */
export interface EmployeeDraft {
  name: string;
  employeeNo: string;
  mobile: string;
  /** 人脸照片本地预览（data URL）；create 默认无照片。 */
  facePhoto?: string;
  positionIds: string[];
  salaryTypeId: string;
  fullMobileVisible: boolean;
  franchiseReconciliation: boolean;
  jointStoreReconciliation: boolean;
  loginStoreIds: string[];
  performanceStoreId: string;
  roleIds: string[];
}

/** 筛选条件（OrganizationPage 管理单一状态；搜索 / 重置提交同一结构）。 */
export interface EmployeeFilter {
  keyword: string;
  positionId: string | null;
  roleId: string | null;
  employmentStatus: EmploymentStatus;
}

/** 下拉选项（岗位 / 角色 / 门店 / 在职状态共用）。 */
export interface OptionItem {
  value: string;
  label: string;
}
