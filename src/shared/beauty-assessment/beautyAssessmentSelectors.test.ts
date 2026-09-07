import { describe, expect, it } from 'vitest';
import { BEAUTY_REPORTS } from './beautyAssessmentMockData';
import { getBeautyReportById, getLatestBeautyReport, selectBeautyReport } from './beautyAssessmentSelectors';
import type { BeautyReport } from './beautyAssessmentTypes';

function record(recordId: string, detectTime: string | null): BeautyReport {
  return {
    recordId, sourceId: 'test', vendorReportId: null, vendorTaskId: null, vendorCustomerId: null, customerId: null,
    basic: { detectTime, score: null, scoreLevel: null, skinType: null, skinLabels: [], sex: null, age: null, testCount: null },
    summary: { problemAnalysis: [], careAdvice: [] }, items: [],
  };
}

describe('beauty report selection', () => {
  it('defaults to latest valid time instead of first input or largest id', () => {
    const selection = selectBeautyReport(BEAUTY_REPORTS);
    expect(selection.currentRecordId).toBe('beauty-prototype-100');
    expect(selection.currentRecord?.basic.score).toBe(46);
    expect(selection.records).toBe(BEAUTY_REPORTS);
  });

  it('selects historical reports by stable local recordId, not vendorTaskId', () => {
    const selection = selectBeautyReport(BEAUTY_REPORTS, 'beauty-prototype-900');
    expect(selection.currentRecord?.basic.score).toBe(62);
    expect(selection.currentRecordId).toBe('beauty-prototype-900');
    expect(getBeautyReportById(BEAUTY_REPORTS, 'prototype-task-101')).toBeNull();
  });

  it('preserves input order for equal times without sorting/mutating records', () => {
    const first = record('first', '2026-09-01T01:00:00Z');
    const second = record('second', '2026-09-01T09:00:00+08:00');
    const records = Object.freeze([first, second]);
    expect(getLatestBeautyReport(records)).toBe(first);
    expect(records.map((item) => item.recordId)).toEqual(['first', 'second']);
  });

  it('excludes invalid timestamps from default selection', () => {
    const valid = record('valid', '2026-01-01T00:00:00Z');
    expect(getLatestBeautyReport([record('bad', 'invalid'), record('missing', null), valid])).toBe(valid);
    expect(getLatestBeautyReport([record('bad', 'invalid')])).toBeNull();
  });

  it('returns empty selection for empty data or an explicit missing id', () => {
    expect(selectBeautyReport([])).toEqual({ records: [], currentRecordId: null, currentRecord: null });
    expect(selectBeautyReport(BEAUTY_REPORTS, 'missing').currentRecord).toBeNull();
    expect(selectBeautyReport(BEAUTY_REPORTS, null).currentRecord).toBeNull();
  });
});
