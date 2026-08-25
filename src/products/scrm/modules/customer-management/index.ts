/** 0016 Cycle C - SCRM / 客户业务域出口。 */
export { CustomerListPage } from './CustomerListPage';
export type { CustomerListPageProps } from './CustomerListPage';
export { CustomerDetailDrawer } from './CustomerDetailDrawer';
export type { CustomerDetailDrawerProps, CustomerDetailTabKey } from './CustomerDetailDrawer';
export { CustomerBodyAssessmentPanel } from './CustomerBodyAssessmentPanel';
export type {
  CustomerAssessmentSourceFilter,
  CustomerAssessmentView,
  CustomerBodyAssessmentPanelProps,
} from './CustomerBodyAssessmentPanel';
export { CustomerAssessmentDetailDrawer } from './CustomerAssessmentDetailDrawer';
export type { CustomerAssessmentDetailDrawerProps } from './CustomerAssessmentDetailDrawer';
export {
  CUSTOMER_FILTER_OPTIONS,
  CUSTOMER_MOCK,
  CUSTOMER_PAGE_SIZE,
  CUSTOMER_TOTAL,
  filterCustomers,
  getCustomerById,
} from './customerMockData';
export { EMPTY_CUSTOMER_FILTER } from './customerTypes';
export type { CustomerFilter, CustomerFilterOptions, CustomerRecord } from './customerTypes';
