import type { BeautyReport, BeautyReportSelection } from './beautyAssessmentTypes';

export function getBeautyReportById(records: readonly BeautyReport[], recordId: string | null): BeautyReport | null {
  if (recordId === null) return null;
  return records.find((record) => record.recordId === recordId) ?? null;
}

export function getLatestBeautyReport(records: readonly BeautyReport[]): BeautyReport | null {
  let latest: BeautyReport | null = null;
  let latestTime = -Infinity;
  for (const record of records) {
    const time = record.basic.detectTime === null ? NaN : Date.parse(record.basic.detectTime);
    // Strictly newer only: equal dates preserve input order, invalid dates cannot win.
    if (Number.isFinite(time) && time > latestTime) {
      latest = record;
      latestTime = time;
    }
  }
  return latest;
}

/** Omitted id selects latest; an explicit unknown id never silently selects another report. */
export function selectBeautyReport(
  records: readonly BeautyReport[],
  currentRecordId?: string | null,
): BeautyReportSelection {
  const currentRecord = currentRecordId === undefined
    ? getLatestBeautyReport(records)
    : getBeautyReportById(records, currentRecordId);
  return { records, currentRecordId: currentRecord?.recordId ?? null, currentRecord };
}
