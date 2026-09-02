import { describe, expect, it } from 'vitest';
import { getBodyAssessmentScoreMeta } from './bodyAssessmentScoreMeta';

describe('body assessment score meta', () => {
  it.each([
    [69, '待提升'],
    [69.9, '待提升'],
    [70, '标准'],
    [79, '标准'],
    [79.9, '标准'],
    [80, '良好'],
    [89, '良好'],
    [89.9, '良好'],
    [90, '优秀'],
    [100, '优秀'],
    [120, '优秀'],
  ] as const)('maps score %s to %s', (score, label) => {
    expect(getBodyAssessmentScoreMeta(score)?.label).toBe(label);
  });

  it('returns no meta for an empty score', () => {
    expect(getBodyAssessmentScoreMeta(null)).toBeNull();
    expect(getBodyAssessmentScoreMeta(undefined)).toBeNull();
  });
});
