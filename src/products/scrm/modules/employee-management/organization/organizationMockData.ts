/**
 * 0014 Cycle A/B - 员工 / 组织架构 稳定 Mock 数据与纯工具函数。
 *
 * 组织、岗位、角色、门店、薪酬类型、在职状态均为只读稳定 Mock 枚举；员工 Runtime
 * 集合是唯一可变数据源（页面刷新恢复初始 Mock）。不接后端、数据库、LocalStorage。
 *
 * Cycle B 新增：薪酬类型、可登录门店（Transfer）、人脸照片占位、绑定角色全量枚举，
 * 以及 EmployeeDrawer 保存所需的 formatDateTime / nextEmployeeId 工具。
 */
import type {
  EmployeeFilter,
  EmployeeRecord,
  OptionItem,
  OrganizationNode,
} from './organizationTypes';

/** 组织树根节点 id（奥本集团）。 */
export const ROOT_ORG_ID = 'aoben-group';

/** 组织架构树稳定 Mock（0014 §5）。 */
export const ORG_TREE: OrganizationNode = {
  id: ROOT_ORG_ID,
  parentId: null,
  name: '奥本集团',
  children: [
    { id: 'president-office', parentId: ROOT_ORG_ID, name: '总裁办' },
    { id: 'finance-center', parentId: ROOT_ORG_ID, name: '财务中心' },
    {
      id: 'hr-admin-center',
      parentId: ROOT_ORG_ID,
      name: '人力行政中心',
      children: [
        { id: 'hr-dept', parentId: 'hr-admin-center', name: '人力资源部' },
        { id: 'admin-dept', parentId: 'hr-admin-center', name: '行政管理部' },
      ],
    },
    { id: 'procurement-center', parentId: ROOT_ORG_ID, name: '采购中心' },
    { id: 'rd-center', parentId: ROOT_ORG_ID, name: '研发中心' },
    { id: 'brand-marketing-center', parentId: ROOT_ORG_ID, name: '品牌营销中心' },
    { id: 'coffee-ops-center', parentId: ROOT_ORG_ID, name: '咖啡运营中心' },
    { id: 'ops-center', parentId: ROOT_ORG_ID, name: '运营中心' },
    { id: 'franchise-center', parentId: ROOT_ORG_ID, name: '招商加盟中心' },
    { id: 'aoben-academy', parentId: ROOT_ORG_ID, name: '奥本学院' },
    { id: 'group-service', parentId: ROOT_ORG_ID, name: '集团客服号' },
  ],
};

/** 岗位枚举（0014 §11 稳定岗位）。 */
export const POSITION_OPTIONS: OptionItem[] = [
  { value: 'yoga-coach', label: '瑜伽教练' },
  { value: 'beautician', label: '美容师' },
  { value: 'beauty-consultant', label: '美容顾问' },
  { value: 'store-manager', label: '店长' },
  { value: 'other', label: '其他' },
];

/**
 * 角色稳定 Mock 枚举（0014 §10/§13 全量，足以还原多列 Checkbox 密度与 Drawer
 * 长滚动；同时作为列表"角色筛选"选项来源）。只保存 roleIds，不复制角色名到
 * 第二个状态源；角色列表业务在 0015，本任务不实现。
 */
export const ROLE_OPTIONS: OptionItem[] = [
  { value: 'role-beauty-permission', label: '美容权限' },
  { value: 'role-store-manager', label: '美容店长' },
  { value: 'role-sea-store-manager', label: '公海测试-店长' },
  { value: 'role-joint-use', label: '联营使用' },
  { value: 'role-promoter', label: '地推人员' },
  { value: 'role-finance', label: '财务' },
  { value: 'role-cleaner', label: '保洁' },
  { value: 'role-php', label: 'PHP程序员' },
  { value: 'role-platform-ops', label: '平台运营经理' },
  { value: 'role-training', label: '培训专家' },
  { value: 'role-audit', label: '稽核' },
  { value: 'role-beautician', label: '美容师' },
  { value: 'role-salary', label: '薪酬专员' },
  { value: 'role-ui', label: 'UI' },
  { value: 'role-presale-manager', label: '预售经理' },
  { value: 'role-marketing-director', label: '营销总监' },
  { value: 'role-presale', label: '预售专员' },
  { value: 'role-gm-assistant', label: '总经理特助' },
  { value: 'role-hr-manager', label: '人事经理' },
  { value: 'role-sales', label: '销售顾问' },
  { value: 'role-training-manager', label: '培训经理' },
  { value: 'role-host', label: '新媒体-主播' },
  { value: 'role-designer', label: '新媒体-美工' },
  { value: 'role-procurement', label: '采购' },
  { value: 'role-yoga-share', label: '瑜伽共享' },
  { value: 'role-front-desk', label: '前台' },
  { value: 'role-butler', label: '管家' },
  { value: 'role-finance-manager', label: '财务经理' },
  { value: 'role-admin-specialist', label: '行政专员' },
  { value: 'role-recruiter-specialist', label: '人事招聘专员' },
  { value: 'role-recruiter', label: '人事招聘主管' },
  { value: 'role-hr-director', label: '人事总监' },
  { value: 'role-hr-supervisor', label: '人事主管' },
  { value: 'role-cs', label: '客服' },
  { value: 'role-regional', label: '区域经理' },
  { value: 'role-ka-director', label: '大客户总监' },
  { value: 'role-yoga', label: '瑜伽教练' },
  { value: 'role-store-owner', label: '门店主理人' },
  { value: 'role-yoga-training-director', label: '瑜伽教培总监' },
  { value: 'role-yoga-ops-director', label: '瑜伽运营总监' },
  { value: 'role-finance-specialist', label: '财务专员' },
  { value: 'role-finance-supervisor', label: '财务主管' },
  { value: 'role-ops-supervisor', label: '运营主管' },
  { value: 'role-admin', label: '管理员' },
];

/** 业绩门店候选（稳定 Mock，0014 §9/§12）。 */
export const STORE_OPTIONS: OptionItem[] = [
  { value: 'store-qiji', label: '示例旗舰店' },
  { value: 'store-nanshan', label: '示例南山店' },
  { value: 'store-baoan', label: '示例宝安店' },
  { value: 'store-futian', label: '示例福田店' },
  { value: 'store-longhua', label: '示例龙华店' },
];

/** 可登录门店候选（稳定 Mock，0014 §8 Transfer 双栏列表）。 */
export const LOGIN_STORE_OPTIONS: OptionItem[] = [
  { value: 'store-wanxiang', label: '万象美容二店(正常营业)' },
  { value: 'store-lvcheng', label: '绿城鹿鸣东方店(正常营业)' },
  { value: 'store-wuxi', label: '无锡梁溪运河汇店(正常营业)' },
  { value: 'store-wuzhong', label: '吴中惠丰里店(正常营业)' },
  { value: 'store-suzhou-baolong', label: '苏州宝龙广场店(正常营业)' },
  { value: 'store-changshu', label: '常熟印象店(正常营业)' },
  { value: 'store-group', label: '集团总店(正常营业)' },
];

/** 薪酬类型枚举（0014 §6 稳定 Mock，只保存 salaryTypeId，不开发薪酬计算）。 */
export const SALARY_TYPE_OPTIONS: OptionItem[] = [
  { value: 'salary-perf-base', label: '业绩提成+基础课时费' },
  { value: 'salary-fixed', label: '固定薪资' },
  { value: 'salary-perf', label: '业绩提成' },
  { value: 'salary-hourly', label: '课时费' },
];

/** 在职状态选项（固定 在职 / 离职）。 */
export const EMPLOYMENT_STATUS_OPTIONS: OptionItem[] = [
  { value: 'active', label: '在职' },
  { value: 'inactive', label: '离职' },
];

/** 默认筛选条件（重置恢复值）。 */
export const DEFAULT_FILTER: EmployeeFilter = {
  keyword: '',
  positionId: null,
  roleId: null,
  employmentStatus: 'active',
};

/**
 * 人脸照片占位 data URL（只用于展示 Mock 员工"已有照片回填"状态；不接上传服务、
 * 云存储或图片审核）。
 */
export const FACE_PHOTO_MOCK =
  'data:image/svg+xml;utf8,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%22140%22%20height=%22140%22%3E%3Crect%20width=%22140%22%20height=%22140%22%20fill=%22%23dce6f5%22/%3E%3C/svg%3E';

/**
 * 员工 Runtime 初始 Mock（组织架构列表单一真值，0014 §8/§14）。Cycle B 为每名
 * 员工补齐薪酬类型、三个业务 Switch、可登录门店与部分人脸照片，供 Drawer 回填。
 */
export const EMPLOYEE_MOCK: EmployeeRecord[] = [
  // ---- 直接归属集团总部 ----
  { id: 'E-10001', name: '何平', enabled: true, employeeNo: '10001', mobile: '13912341234', organizationId: ROOT_ORG_ID, performanceStoreId: 'store-qiji', positionIds: ['other'], roleIds: ['role-admin'], employmentStatus: 'active', updatedAt: '2026-08-16 10:12:33', operatorName: '王经理', salaryTypeId: 'salary-perf-base', fullMobileVisible: true, franchiseReconciliation: true, jointStoreReconciliation: false, loginStoreIds: ['store-wanxiang', 'store-lvcheng'], facePhoto: FACE_PHOTO_MOCK },
  { id: 'E-10002', name: '曹磊', enabled: true, employeeNo: '10002', mobile: '13900001111', organizationId: ROOT_ORG_ID, performanceStoreId: 'store-qiji', positionIds: ['store-manager'], roleIds: ['role-regional', 'role-store-manager', 'role-sales', 'role-training'], employmentStatus: 'active', updatedAt: '2026-08-16 09:40:15', operatorName: '王经理', salaryTypeId: 'salary-perf-base', fullMobileVisible: false, franchiseReconciliation: true, jointStoreReconciliation: false, loginStoreIds: ['store-wanxiang', 'store-lvcheng'] },
  { id: 'E-10003', name: '方俊', enabled: true, employeeNo: '10003', mobile: '13777778888', organizationId: ROOT_ORG_ID, performanceStoreId: 'store-nanshan', positionIds: ['other'], roleIds: ['role-finance'], employmentStatus: 'active', updatedAt: '2026-08-15 18:22:01', operatorName: '王经理', salaryTypeId: 'salary-fixed', fullMobileVisible: false, franchiseReconciliation: false, jointStoreReconciliation: false, loginStoreIds: ['store-group'] },
  { id: 'E-10004', name: '宋佳', enabled: true, employeeNo: '10004', mobile: '13822223333', organizationId: ROOT_ORG_ID, performanceStoreId: 'store-baoan', positionIds: ['other'], roleIds: ['role-sales'], employmentStatus: 'active', updatedAt: '2026-08-14 16:05:44', operatorName: '王经理', salaryTypeId: 'salary-fixed', fullMobileVisible: false, franchiseReconciliation: false, jointStoreReconciliation: false, loginStoreIds: [] },
  { id: 'E-10005', name: '于华', enabled: true, employeeNo: '10005', mobile: '13933334444', organizationId: ROOT_ORG_ID, performanceStoreId: 'store-futian', positionIds: ['other'], roleIds: ['role-procurement'], employmentStatus: 'active', updatedAt: '2026-08-13 11:30:20', operatorName: '王经理', salaryTypeId: 'salary-fixed', fullMobileVisible: false, franchiseReconciliation: false, jointStoreReconciliation: false, loginStoreIds: [] },
  { id: 'E-10006', name: '高静', enabled: false, employeeNo: '10006', mobile: '13655556666', organizationId: ROOT_ORG_ID, performanceStoreId: 'store-longhua', positionIds: ['other'], roleIds: ['role-cleaner'], employmentStatus: 'inactive', updatedAt: '2026-07-30 14:08:55', operatorName: '王经理', salaryTypeId: 'salary-fixed', fullMobileVisible: false, franchiseReconciliation: false, jointStoreReconciliation: false, loginStoreIds: [] },
  { id: 'E-10024', name: '罗强', enabled: true, employeeNo: '10024', mobile: '13922224444', organizationId: ROOT_ORG_ID, performanceStoreId: 'store-baoan', positionIds: ['yoga-coach'], roleIds: ['role-yoga'], employmentStatus: 'active', updatedAt: '2026-08-11 10:05:18', operatorName: '王经理', salaryTypeId: 'salary-hourly', fullMobileVisible: false, franchiseReconciliation: false, jointStoreReconciliation: false, loginStoreIds: ['store-wanxiang'] },
  { id: 'E-10025', name: '林芳', enabled: true, employeeNo: '10025', mobile: '13911113333', organizationId: ROOT_ORG_ID, performanceStoreId: 'store-nanshan', positionIds: ['beautician'], roleIds: ['role-beautician'], employmentStatus: 'active', updatedAt: '2026-08-10 15:44:02', operatorName: '王经理', salaryTypeId: 'salary-perf', fullMobileVisible: false, franchiseReconciliation: false, jointStoreReconciliation: false, loginStoreIds: ['store-lvcheng'] },
  { id: 'E-10026', name: '谢军', enabled: true, employeeNo: '10026', mobile: '13900002222', organizationId: ROOT_ORG_ID, performanceStoreId: 'store-qiji', positionIds: ['beauty-consultant'], roleIds: ['role-sales'], employmentStatus: 'active', updatedAt: '2026-08-09 17:30:26', operatorName: '王经理', salaryTypeId: 'salary-perf', fullMobileVisible: false, franchiseReconciliation: false, jointStoreReconciliation: false, loginStoreIds: [] },
  { id: 'E-10027', name: '唐娜', enabled: true, employeeNo: '10027', mobile: '13877779999', organizationId: ROOT_ORG_ID, performanceStoreId: 'store-futian', positionIds: ['store-manager'], roleIds: ['role-store-manager'], employmentStatus: 'active', updatedAt: '2026-08-08 09:12:40', operatorName: '王经理', salaryTypeId: 'salary-perf-base', fullMobileVisible: false, franchiseReconciliation: false, jointStoreReconciliation: false, loginStoreIds: ['store-wuzhong'] },
  // ---- 总裁办 ----
  { id: 'E-10007', name: '王芳', enabled: true, employeeNo: '10007', mobile: '15811112222', organizationId: 'president-office', performanceStoreId: 'store-qiji', positionIds: ['other'], roleIds: ['role-hr-manager'], employmentStatus: 'active', updatedAt: '2026-08-12 10:00:00', operatorName: '王经理', salaryTypeId: 'salary-fixed', fullMobileVisible: false, franchiseReconciliation: false, jointStoreReconciliation: false, loginStoreIds: ['store-group'] },
  { id: 'E-10008', name: '朱磊', enabled: true, employeeNo: '10008', mobile: '13988889999', organizationId: 'president-office', performanceStoreId: 'store-qiji', positionIds: ['beauty-consultant'], roleIds: ['role-sales'], employmentStatus: 'active', updatedAt: '2026-08-11 09:15:30', operatorName: '王经理', salaryTypeId: 'salary-perf', fullMobileVisible: false, franchiseReconciliation: false, jointStoreReconciliation: false, loginStoreIds: [] },
  // ---- 财务中心 ----
  { id: 'E-10009', name: '李强', enabled: true, employeeNo: '10009', mobile: '13977776666', organizationId: 'finance-center', performanceStoreId: 'store-qiji', positionIds: ['other'], roleIds: ['role-finance'], employmentStatus: 'active', updatedAt: '2026-08-10 17:45:12', operatorName: '王经理', salaryTypeId: 'salary-fixed', fullMobileVisible: false, franchiseReconciliation: false, jointStoreReconciliation: false, loginStoreIds: [] },
  // ---- 人力行政中心（直接归属） ----
  { id: 'E-10010', name: '张敏', enabled: true, employeeNo: '10010', mobile: '13966665555', organizationId: 'hr-admin-center', performanceStoreId: 'store-nanshan', positionIds: ['other'], roleIds: ['role-hr-manager'], employmentStatus: 'active', updatedAt: '2026-08-09 15:20:40', operatorName: '王经理', salaryTypeId: 'salary-fixed', fullMobileVisible: false, franchiseReconciliation: false, jointStoreReconciliation: false, loginStoreIds: [] },
  // ---- 人力资源部 ----
  { id: 'E-10011', name: '刘洋', enabled: true, employeeNo: '10011', mobile: '13955554444', organizationId: 'hr-dept', performanceStoreId: 'store-nanshan', positionIds: ['yoga-coach'], roleIds: ['role-yoga', 'role-hr-manager'], employmentStatus: 'active', updatedAt: '2026-08-08 14:10:00', operatorName: '王经理', salaryTypeId: 'salary-hourly', fullMobileVisible: false, franchiseReconciliation: false, jointStoreReconciliation: false, loginStoreIds: ['store-wanxiang'] },
  { id: 'E-10012', name: '陈静', enabled: true, employeeNo: '10012', mobile: '13944443333', organizationId: 'hr-dept', performanceStoreId: 'store-baoan', positionIds: ['other'], roleIds: ['role-recruiter'], employmentStatus: 'active', updatedAt: '2026-08-07 11:25:36', operatorName: '王经理', salaryTypeId: 'salary-fixed', fullMobileVisible: false, franchiseReconciliation: false, jointStoreReconciliation: false, loginStoreIds: [] },
  // ---- 行政管理部 ----
  { id: 'E-10013', name: '赵磊', enabled: true, employeeNo: '10013', mobile: '13933332222', organizationId: 'admin-dept', performanceStoreId: 'store-futian', positionIds: ['other'], roleIds: ['role-front-desk'], employmentStatus: 'active', updatedAt: '2026-08-06 10:50:28', operatorName: '王经理', salaryTypeId: 'salary-fixed', fullMobileVisible: false, franchiseReconciliation: false, jointStoreReconciliation: false, loginStoreIds: [] },
  { id: 'E-10014', name: '孙丽', enabled: false, employeeNo: '10014', mobile: '13922221111', organizationId: 'admin-dept', performanceStoreId: 'store-longhua', positionIds: ['other'], roleIds: ['role-cleaner'], employmentStatus: 'inactive', updatedAt: '2026-07-28 16:33:10', operatorName: '王经理', salaryTypeId: 'salary-fixed', fullMobileVisible: false, franchiseReconciliation: false, jointStoreReconciliation: false, loginStoreIds: [] },
  // ---- 采购中心 ----
  { id: 'E-10015', name: '周婷', enabled: true, employeeNo: '10015', mobile: '13911110000', organizationId: 'procurement-center', performanceStoreId: 'store-qiji', positionIds: ['beautician'], roleIds: ['role-beautician'], employmentStatus: 'active', updatedAt: '2026-08-05 09:00:00', operatorName: '王经理', salaryTypeId: 'salary-perf', fullMobileVisible: false, franchiseReconciliation: false, jointStoreReconciliation: false, loginStoreIds: ['store-lvcheng'] },
  // ---- 研发中心 ----
  { id: 'E-10016', name: '吴昊', enabled: true, employeeNo: '10016', mobile: '13900009999', organizationId: 'rd-center', performanceStoreId: 'store-qiji', positionIds: ['other'], roleIds: ['role-php'], employmentStatus: 'active', updatedAt: '2026-08-04 18:20:45', operatorName: '王经理', salaryTypeId: 'salary-fixed', fullMobileVisible: false, franchiseReconciliation: false, jointStoreReconciliation: false, loginStoreIds: [] },
  // ---- 品牌营销中心 ----
  { id: 'E-10017', name: '郑爽', enabled: true, employeeNo: '10017', mobile: '13677778888', organizationId: 'brand-marketing-center', performanceStoreId: 'store-baoan', positionIds: ['other'], roleIds: ['role-sales'], employmentStatus: 'active', updatedAt: '2026-08-03 13:40:12', operatorName: '王经理', salaryTypeId: 'salary-fixed', fullMobileVisible: false, franchiseReconciliation: false, jointStoreReconciliation: false, loginStoreIds: [] },
  // ---- 咖啡运营中心 ----
  { id: 'E-10018', name: '王强', enabled: true, employeeNo: '10018', mobile: '13988887777', organizationId: 'coffee-ops-center', performanceStoreId: 'store-qiji', positionIds: ['store-manager'], roleIds: ['role-store-manager'], employmentStatus: 'active', updatedAt: '2026-08-02 10:15:50', operatorName: '王经理', salaryTypeId: 'salary-perf-base', fullMobileVisible: false, franchiseReconciliation: false, jointStoreReconciliation: false, loginStoreIds: ['store-suzhou-baolong'] },
  // 冯雪：多岗位 / 多角色 / 多门店示例（供编辑 Story 展示"门店选择/多角色/多岗位"）
  { id: 'E-10019', name: '冯雪', enabled: true, employeeNo: '10019', mobile: '13977775555', organizationId: 'coffee-ops-center', performanceStoreId: 'store-nanshan', positionIds: ['beauty-consultant', 'store-manager', 'other'], roleIds: ['role-beautician', 'role-beauty-permission', 'role-sales'], employmentStatus: 'active', updatedAt: '2026-08-01 09:35:00', operatorName: '王经理', salaryTypeId: 'salary-perf-base', fullMobileVisible: true, franchiseReconciliation: false, jointStoreReconciliation: false, loginStoreIds: ['store-wanxiang', 'store-lvcheng', 'store-wuxi'], facePhoto: FACE_PHOTO_MOCK },
  // ---- 运营中心 ----
  { id: 'E-10020', name: '蒋涛', enabled: false, employeeNo: '10020', mobile: '13966664444', organizationId: 'ops-center', performanceStoreId: 'store-futian', positionIds: ['other'], roleIds: ['role-regional'], employmentStatus: 'inactive', updatedAt: '2026-07-25 11:08:18', operatorName: '王经理', salaryTypeId: 'salary-fixed', fullMobileVisible: false, franchiseReconciliation: false, jointStoreReconciliation: false, loginStoreIds: [] },
  // ---- 招商加盟中心 ----
  { id: 'E-10021', name: '沈琳', enabled: true, employeeNo: '10021', mobile: '13955553333', organizationId: 'franchise-center', performanceStoreId: 'store-longhua', positionIds: ['yoga-coach'], roleIds: ['role-yoga'], employmentStatus: 'active', updatedAt: '2026-07-31 15:55:26', operatorName: '王经理', salaryTypeId: 'salary-hourly', fullMobileVisible: false, franchiseReconciliation: false, jointStoreReconciliation: false, loginStoreIds: ['store-changshu'] },
  // ---- 奥本学院 ----
  { id: 'E-10022', name: '韩梅', enabled: true, employeeNo: '10022', mobile: '13944442222', organizationId: 'aoben-academy', performanceStoreId: 'store-baoan', positionIds: ['other'], roleIds: ['role-training'], employmentStatus: 'active', updatedAt: '2026-07-30 09:20:00', operatorName: '王经理', salaryTypeId: 'salary-fixed', fullMobileVisible: false, franchiseReconciliation: false, jointStoreReconciliation: false, loginStoreIds: [] },
  // ---- 集团客服号 ----
  { id: 'E-10023', name: '杨帆', enabled: true, employeeNo: '10023', mobile: '13933331111', organizationId: 'group-service', performanceStoreId: 'store-qiji', positionIds: ['other'], roleIds: ['role-front-desk'], employmentStatus: 'active', updatedAt: '2026-07-29 17:10:42', operatorName: '王经理', salaryTypeId: 'salary-fixed', fullMobileVisible: false, franchiseReconciliation: false, jointStoreReconciliation: false, loginStoreIds: [] },
];

/** 手机号脱敏：139****1234；非 11 位原样返回（当前 Mock 均为 11 位）。 */
export function maskMobile(mobile: string): string {
  if (/^\d{11}$/.test(mobile)) {
    return `${mobile.slice(0, 3)}****${mobile.slice(-4)}`;
  }
  return mobile;
}

/**
 * 按组织节点 + 筛选条件组合过滤员工。
 *
 * 最小规则：选择节点只显示直接归属该节点的员工，父节点不递归聚合子部门员工
 * （0014 §5）。搜索匹配 姓名 / 原始手机号 / 员工编号（列表脱敏展示但搜索使用原值）。
 */
export function filterEmployees(
  records: EmployeeRecord[],
  filter: EmployeeFilter,
  organizationId: string,
): EmployeeRecord[] {
  return records.filter((record) => {
    const keyword = filter.keyword.trim();
    const keywordMatch =
      keyword === '' ||
      record.name.includes(keyword) ||
      record.mobile.includes(keyword) ||
      record.employeeNo.includes(keyword);
    const positionMatch = filter.positionId === null || record.positionIds.includes(filter.positionId);
    const roleMatch = filter.roleId === null || record.roleIds.includes(filter.roleId);
    return (
      record.organizationId === organizationId &&
      keywordMatch &&
      positionMatch &&
      roleMatch &&
      record.employmentStatus === filter.employmentStatus
    );
  });
}

/** 岗位 value → 文案；未知值返回 undefined（空值展示 --）。 */
export function positionLabel(value: string): string | undefined {
  return POSITION_OPTIONS.find((option) => option.value === value)?.label;
}

/** 角色 value → 文案；未知值返回 undefined。 */
export function roleLabel(value: string): string | undefined {
  return ROLE_OPTIONS.find((option) => option.value === value)?.label;
}

/** 门店 value → 文案；未知值返回 undefined。 */
export function storeLabel(value: string): string | undefined {
  return STORE_OPTIONS.find((option) => option.value === value)?.label;
}

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

/** 前端当前时间 → 'YYYY-MM-DD HH:mm:ss'（Cycle B 保存更新 create/edit 时间戳）。 */
export function formatDateTime(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(
    date.getHours(),
  )}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
}

/** 生成下一条员工 id（E-10028…，基于当前集合最大序号 +1，稳定可测）。 */
export function nextEmployeeId(records: EmployeeRecord[]): string {
  const max = records.reduce((acc, record) => {
    const numeric = Number(record.id.replace(/^E-/, ''));
    return Number.isFinite(numeric) ? Math.max(acc, numeric) : acc;
  }, 0);
  return `E-${String(max + 1).padStart(5, '0')}`;
}
