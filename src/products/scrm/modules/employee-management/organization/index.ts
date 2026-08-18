/**
 * 0014 Cycle A/B - 员工 / 组织架构模块出口。
 *
 * 本模块为自包含业务页（OrganizationPage），由产品壳 pageRegistry 出口直接渲染，
 * 不经过潜客业务根，不依赖潜客业务组件（0014 §3）。
 */
export { OrganizationPage } from './OrganizationPage';
export type { OrganizationPageProps } from './OrganizationPage';
export { EmployeeDrawer } from './EmployeeDrawer';
export type { EmployeeDrawerProps } from './EmployeeDrawer';
export type {
  EmployeeDraft,
  EmployeeFilter,
  EmployeeRecord,
  EmploymentStatus,
  OrganizationNode,
} from './organizationTypes';
export {
  EMPLOYEE_MOCK,
  FACE_PHOTO_MOCK,
  LOGIN_STORE_OPTIONS,
  ORG_TREE,
  POSITION_OPTIONS,
  ROLE_OPTIONS,
  ROOT_ORG_ID,
  SALARY_TYPE_OPTIONS,
  STORE_OPTIONS,
  filterEmployees,
  formatDateTime,
  maskMobile,
  nextEmployeeId,
} from './organizationMockData';
