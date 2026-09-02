import { describe, expect, it } from 'vitest';
import { BODY_ASSESSMENT_REPORTS } from './bodyAssessmentAdapters';
import { BODY_ASSESSMENT_HISTORY_FIXTURES, createPrototypeHistoryRecords } from './bodyAssessmentHistoryFixtures';

describe('prototype body assessment history fixtures', () => {
  it('provides isolated one, five and more-than-five record sets', () => {
    expect(BODY_ASSESSMENT_HISTORY_FIXTURES.single).toHaveLength(1);
    expect(BODY_ASSESSMENT_HISTORY_FIXTURES.five).toHaveLength(5);
    expect(BODY_ASSESSMENT_HISTORY_FIXTURES.many).toHaveLength(8);
    expect(BODY_ASSESSMENT_HISTORY_FIXTURES.many.map((record) => record.recordId)).toHaveLength(8);
  });

  it('does not add prototype records to canonical source records', () => {
    expect(Object.values(BODY_ASSESSMENT_REPORTS)).toHaveLength(2);
    expect(createPrototypeHistoryRecords(8).some((record) => record.recordId === 'biacn-676106169')).toBe(false);
  });
});
