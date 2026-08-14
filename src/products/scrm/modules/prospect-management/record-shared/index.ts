/**
 * 0012 Cycle A/B - 到店/拜访记录共享业务模块统一出口。
 *
 * 独立页（到店记录/拜访记录）与跟进详情两个 Tab 都从这里消费
 * 单元格视觉与格式化，保证单一来源。Cycle B 新增运行时状态
 * （RecordRuntimeStoreProvider / useRecordRuntimeStore）、编辑入口上下文、
 * 表单枚举与日期时间字段，均在本出口统一暴露。
 */
export {
  RecordNameLink,
  IntentLevelTag,
  DealStatusTag,
  RecordOperationButton,
  RecordOperationCell,
  RecordOperationVisual,
} from './RecordCellVisuals';
export type { RecordOperationItem } from './RecordCellVisuals';
export { formatRecordAmount, formatNow } from './recordFormatters';
export {
  RecordRuntimeStoreProvider,
  useRecordRuntimeStore,
} from './recordRuntimeStore';
export type { RecordRuntimeStoreValue } from './recordRuntimeStore';
export { RecordEditActionsContext, useRecordEditActions } from './recordEditContext';
export type {
  RecordEditActions,
  RecordUserContextInfo,
  RecordCreateContext,
} from './recordEditContext';
export { nextRecordKey, nextRecordId } from './recordKeyGen';
export {
  VISIT_WAY_EDIT_OPTIONS,
  IMPROVEMENT_NEED_OPTIONS,
  INTENDED_COURSE_OPTIONS,
} from './recordFormOptions';
export { DateTimeField } from './DateTimeField';
export { IntentLevelStepper } from './IntentLevelStepper';
