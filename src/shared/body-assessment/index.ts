/**
 * 0016 跨产品体测数据只读出口。
 *
 * 适配与固定报告模型仍由奥本运动体测模块维护；SCRM 只通过本出口消费
 * 标准模型和按 customerId 选择历史记录，避免再复制一套设备字段映射。
 */
export {
  adaptBiacn,
  adaptInBody,
  BODY_ASSESSMENT_REPORTS,
  BODY_ASSESSMENT_CUSTOMER_ID,
} from './bodyAssessmentAdapters';
export { BIACN_REPORT_SOURCE, INBODY_LEGACY_SNAPSHOT } from './bodyAssessmentSources';
export {
  formatAbsoluteAssessmentMetric,
  formatAssessmentMetric,
} from './bodyAssessmentFormatters';
export type { AssessmentMetricFormatOptions } from './bodyAssessmentFormatters';
export type {
  AssessmentMetric,
  AssessmentSegmentMetric,
  AssessmentSegments,
  BodyAssessmentReport,
  BodyAssessmentSource,
  SegmentStatus,
} from './bodyAssessmentTypes';
export type { BiacnReportSource, InBodyLegacySnapshot } from './bodyAssessmentSources';
export { getBodyAssessmentScoreMeta } from './bodyAssessmentScoreMeta';
export type { BodyAssessmentScoreMeta } from './bodyAssessmentScoreMeta';
export {
  BODY_ASSESSMENT_HISTORY_FIXTURES,
  createPrototypeHistoryRecords,
} from './bodyAssessmentHistoryFixtures';

import { BODY_ASSESSMENT_REPORTS } from './bodyAssessmentAdapters';
import type { BodyAssessmentReport } from './bodyAssessmentTypes';

/** 稳定客户体测历史：最新记录优先，不生成随机历史。 */
export function getBodyAssessmentRecordsByCustomerId(customerId: string): BodyAssessmentReport[] {
  return Object.values(BODY_ASSESSMENT_REPORTS)
    .filter((report) => report.customerId === customerId)
    .sort((left, right) => right.measuredAt.localeCompare(left.measuredAt));
}
