import { BEAUTY_REPORTS, type BeautyReport, type BeautyReportItem } from '../../../../shared/beauty-assessment';

export interface CustomerBeautyAssessmentAdminRecord {
  customerId: string;
  deviceSerialNumber: string | null;
  report: BeautyReport;
}

/** Maps only the manufacturer's result.json.SerialNumber field. */
export function mapDeviceSerialNumber(resultJson: unknown): string | null {
  if (!resultJson || typeof resultJson !== 'object' || Array.isArray(resultJson)) return null;
  const serialNumber = (resultJson as { SerialNumber?: unknown }).SerialNumber;
  return typeof serialNumber === 'string' && serialNumber.trim() ? serialNumber.trim() : null;
}

const sanitizedReport = BEAUTY_REPORTS.find((report) => report.sourceId === 'beauty-vendor-sanitized');

if (!sanitizedReport) {
  throw new Error('The shared sanitized beauty report is required by the SCRM admin fixture');
}

const SANITIZED_REPORT: BeautyReport = sanitizedReport;

function createAdminRecord(
  customerId: string,
  recordId: string,
  detectTime: string,
  resultJson?: unknown,
): CustomerBeautyAssessmentAdminRecord {
  return {
    customerId,
    deviceSerialNumber: mapDeviceSerialNumber(resultJson),
    report: {
      ...SANITIZED_REPORT,
      recordId,
      customerId: null,
      basic: { ...SANITIZED_REPORT.basic, detectTime },
    },
  };
}

/** 0021 专用脱敏关联：正文复用 shared BeautyReport，客户与设备序列号由 SCRM view model 维护。 */
export const CUSTOMER_BEAUTY_ASSESSMENT_RECORDS: readonly CustomerBeautyAssessmentAdminRecord[] = [
  createAdminRecord('customer-53395', 'beauty-admin-20260820', '2026-08-20T12:02:51+08:00'),
  createAdminRecord('customer-53395', 'beauty-admin-20260801', '2026-08-01T09:00:00+08:00'),
  createAdminRecord('customer-53394', 'beauty-admin-20260718', '2026-07-18T14:30:00+08:00'),
];

export function formatCustomerBeautyDetectTime(value: string | null): string {
  if (!value) return '--';
  const match = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?$/.exec(value.trim());
  if (!match) return '--';
  const [, yearText, monthText, dayText, hourText, minuteText, secondText] = match;
  const year = Number(yearText); const month = Number(monthText); const day = Number(dayText);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month < 1 || month > 12 || day < 1 || day > (days[month - 1] ?? 0)
    || Number(hourText) > 23 || Number(minuteText) > 59 || Number(secondText ?? 0) > 59) return '--';
  return `${yearText}-${monthText}-${dayText} ${hourText}:${minuteText}`;
}

function compareDetectTime(left: CustomerBeautyAssessmentAdminRecord, right: CustomerBeautyAssessmentAdminRecord): number {
  const leftTime = left.report.basic.detectTime === null ? NaN : Date.parse(left.report.basic.detectTime);
  const rightTime = right.report.basic.detectTime === null ? NaN : Date.parse(right.report.basic.detectTime);
  if (!Number.isFinite(leftTime) || !Number.isFinite(rightTime)) return 0;
  return rightTime - leftTime;
}

export function getCustomerBeautyAssessments(customerId: string): readonly CustomerBeautyAssessmentAdminRecord[] {
  return CUSTOMER_BEAUTY_ASSESSMENT_RECORDS
    .filter((record) => record.customerId === customerId)
    .slice()
    .sort(compareDetectTime);
}

export function getCustomerBeautyAssessmentById(customerId: string, recordId: string | null): CustomerBeautyAssessmentAdminRecord | null {
  if (recordId === null) return null;
  return getCustomerBeautyAssessments(customerId).find((record) => record.report.recordId === recordId) ?? null;
}

export function formatBeautyItemLevel(item: BeautyReportItem): string {
  if (item.levelName) return item.levelName;
  return item.level === null ? '--' : String(item.level);
}
