import { describe, expect, it } from 'vitest';
import { formatBeautyDetectTime } from './beautyAssessmentFormatters';

describe('beauty detection wall-clock display', () => {
  it.each([
    ['2026-08-16T09:00:00+08:00', '2026-08-16 09:00'],
    ['2026-08-16T09:00:00-07:00', '2026-08-16 09:00'],
    ['2026-08-16T09:00:00Z', '2026-08-16 09:00'],
    ['2026-08-29 17:21:02', '2026-08-29 17:21'],
    ['2026-08-29 17:21', '2026-08-29 17:21'],
    ['2024-02-29T23:59:59.123+0800', '2024-02-29 23:59'],
  ])('formats %s without timezone conversion', (raw, expected) => {
    expect(formatBeautyDetectTime(raw)).toBe(expected);
  });
  it.each([null, '', 'not-a-date', '2026-08-16', '2026-02-29T09:00:00Z', '2026-13-01T09:00:00Z', '2026-08-00T09:00:00Z', '2026-08-16T24:00:00Z', '2026-08-16T09:60:00Z'])('does not invent a date for %s', (raw) => {
    expect(formatBeautyDetectTime(raw)).toBe('--');
  });
});
