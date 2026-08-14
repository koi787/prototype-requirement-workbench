/**
 * 0012 Cycle A - 拜访记录业务模块统一出口。
 *
 * 独立页（拜访记录）与跟进详情"拜访记录"Tab 都从这里消费同一份
 * 类型、列定义、数据选择器与表格组件。
 */
export type { VisitRecord } from './visitRecordTypes';
export { NEXT_VISIT_TIME_EMPTY_TEXT } from './visitRecordTypes';
export {
  VISIT_RECORD_HEADERS,
  VISIT_RECORD_COLUMNS,
  VISIT_RECORD_SCROLL_X,
  VISIT_OPERATION_ITEMS,
} from './visitRecordColumns';
export {
  getAllVisitRecords,
  getVisitRecordsByCustomerKey,
} from './visitRecordMockData';
export { VisitRecordTable } from './VisitRecordTable';
export { VisitRecordPage } from './VisitRecordPage';
export type { VisitRecordPageProps } from './VisitRecordPage';
export { VisitRecordDrawer } from './VisitRecordDrawer';
export type { VisitRecordDrawerProps } from './VisitRecordDrawer';
