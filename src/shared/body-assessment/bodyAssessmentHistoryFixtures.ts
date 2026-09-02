import { BODY_ASSESSMENT_REPORTS } from './bodyAssessmentAdapters';
import type { BodyAssessmentReport } from './bodyAssessmentTypes';

function clonePrototypeRecord(
  source: BodyAssessmentReport,
  recordId: string,
  measuredAt: string,
  score: number = source.score.value ?? 0,
): BodyAssessmentReport {
  return {
    ...source,
    recordId,
    measuredAt,
    score: { ...source.score, value: score },
  };
}

const biacn = BODY_ASSESSMENT_REPORTS.BIACN;
const inBody = BODY_ASSESSMENT_REPORTS.INBODY;

const fiveRecords: readonly BodyAssessmentReport[] = [
  clonePrototypeRecord(biacn, 'biacn-history-2026-08-20', '2026-08-20 12:02:51', 70),
  clonePrototypeRecord(inBody, 'inbody-history-2026-07-15', '2026-07-15 09:20:00', 67),
  clonePrototypeRecord(biacn, 'biacn-history-2026-06-18', '2026-06-18 16:45:00', 70),
  clonePrototypeRecord(inBody, 'inbody-history-2026-05-14', '2026-05-14 13:38:53', 67),
  clonePrototypeRecord(biacn, 'biacn-history-2026-04-09', '2026-04-09 11:05:00', 70),
];

export function createPrototypeHistoryRecords(count: number): BodyAssessmentReport[] {
  if (count <= 0) return [];
  const records = [...fiveRecords];
  for (let index = records.length; index < count; index += 1) {
    const source = index % 2 === 0 ? biacn : inBody;
    const month = String(3 - ((index - 5) % 3)).padStart(2, '0');
    records.push(clonePrototypeRecord(
      source,
      `${source.source.toLowerCase()}-history-${index + 1}`,
      `2026-${month}-${String(20 - index).padStart(2, '0')} 10:00:00`,
      source.score.value ?? 0,
    ));
  }
  return records.slice(0, count);
}

export const BODY_ASSESSMENT_HISTORY_FIXTURES = {
  single: [biacn] as readonly BodyAssessmentReport[],
  five: fiveRecords,
  many: createPrototypeHistoryRecords(8),
} as const;
