import {
  BEAUTY_REPORTS,
  getBeautyReportById,
  type BeautyReport,
} from '../../../../shared/beauty-assessment';

/**
 * SCRM demo association for the existing sanitized shared reports. This is a
 * view-data boundary only; the report shape remains the shared BeautyReport.
 */
const BEAUTY_RECORD_CUSTOMER_ID = 'customer-53395';

const CUSTOMER_BEAUTY_REPORTS: readonly BeautyReport[] = BEAUTY_REPORTS.map((report) => ({
  ...report,
  customerId: BEAUTY_RECORD_CUSTOMER_ID,
}));

function detectTimeValue(report: BeautyReport): number {
  if (report.basic.detectTime === null) return -Infinity;
  const value = Date.parse(report.basic.detectTime);
  return Number.isFinite(value) ? value : -Infinity;
}

export function getBeautyReportsByCustomerId(customerId: string): readonly BeautyReport[] {
  if (customerId !== BEAUTY_RECORD_CUSTOMER_ID) return [];
  return [...CUSTOMER_BEAUTY_REPORTS].sort((left, right) => detectTimeValue(right) - detectTimeValue(left));
}

export function getBeautyReportByCustomerIdAndId(
  customerId: string,
  recordId: string | null,
): BeautyReport | null {
  return getBeautyReportById(getBeautyReportsByCustomerId(customerId), recordId);
}
