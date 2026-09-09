import { describe, expect, it } from 'vitest';
import { formatBeautyDetectTime } from './beautyAssessmentFormatters';

describe('beauty assessment formatters', () => {
  it('keeps the supplied wall-clock time and removes seconds and timezone suffix', () => {
    expect(formatBeautyDetectTime('2026-08-29T17:21:02+08:00')).toBe('2026-08-29 17:21');
  });

  it('uses the configured empty value for missing or invalid timestamps', () => {
    expect(formatBeautyDetectTime(null)).toBe('--');
    expect(formatBeautyDetectTime('not-a-date')).toBe('--');
  });
});
