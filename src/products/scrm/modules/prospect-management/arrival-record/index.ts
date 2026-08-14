/**
 * 0012 Cycle A - 到店记录业务模块统一出口。
 *
 * 独立页（到店记录）与跟进详情"到店记录"Tab 都从这里消费同一份
 * 类型、列定义、数据选择器与表格组件。
 */
export type { ArrivalRecord } from './arrivalRecordTypes';
export {
  ARRIVAL_RECORD_HEADERS,
  ARRIVAL_RECORD_COLUMNS,
  ARRIVAL_RECORD_SCROLL_X,
  ARRIVAL_OPERATION_ITEMS,
} from './arrivalRecordColumns';
export {
  getAllArrivalRecords,
  getArrivalRecordsByCustomerKey,
} from './arrivalRecordMockData';
export { ArrivalRecordTable } from './ArrivalRecordTable';
export { ArrivalRecordPage } from './ArrivalRecordPage';
export type { ArrivalRecordPageProps } from './ArrivalRecordPage';
export { ArrivalRecordDrawer } from './ArrivalRecordDrawer';
export type { ArrivalRecordDrawerProps } from './ArrivalRecordDrawer';
export type { ArrivalChangeRecord } from './arrivalChangeRecordTypes';
export {
  getAllArrivalChangeRecords,
  getArrivalChangeRecordsByRecordKey,
  ARRIVAL_CHANGE_FIELD_LABELS,
} from './arrivalChangeRecordMockData';
export { ArrivalChangeRecordDrawer } from './ArrivalChangeRecordDrawer';
export type { ArrivalChangeRecordDrawerProps } from './ArrivalChangeRecordDrawer';
