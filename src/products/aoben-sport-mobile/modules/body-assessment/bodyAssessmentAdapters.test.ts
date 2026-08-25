import { describe, expect, it } from 'vitest';
import {
  adaptBiacn,
  adaptInBody,
  BODY_ASSESSMENT_REPORTS,
  formatAssessmentMetric,
} from '../../../../shared/body-assessment';

describe('body assessment adapters', () => {
  it('converts the InBody snapshot into the unified report model', () => {
    const report = adaptInBody();
    expect(report.source).toBe('INBODY');
    expect(report.score).toMatchObject({ label: 'InBody评分', value: 67, precision: 1 });
    expect(report.core.weight).toEqual({ value: 80.7, unit: 'kg' });
    expect(report.bodyComposition.smi.value).toBe(8.1);
    expect(report.recommendations.recommendedCalories.value).toBe(2449);
    expect(report.recommendations.muscleControl).toEqual({ value: 2.4, unit: 'kg' });
    expect(report.recommendations.weightControl).toEqual({ value: -7.8, unit: 'kg' });
    expect(report.recommendations.fatControl).toEqual({ value: -10.2, unit: 'kg' });
  });

  it('maps BIACN from the real JSON source and keeps device/customer identities separate', () => {
    const report = adaptBiacn();
    expect(report.recordId).toBe('biacn-676106169');
    expect(report.customerId).not.toBe('676106169');
    expect(report.profile.displayId).toBe('');
    expect(report.device.vendorRecordId).toBe('676106169');
    expect(report.device.deviceMeasureId).toBe('491c4ed1-5a17-4e22-87f4-aad884fb8539');
    expect(report.score).toEqual({ label: '身体评分', value: 70 });
    expect(report.core.weight).toEqual({ value: 75.2, unit: 'kg' });
    expect(report.core.bodyFatPercentage).toEqual({ value: 26, unit: '%' });
    expect(report.muscleContent.rightArm).toEqual({ value: 3, unit: 'kg', precision: 1, status: 'normal' });
    expect(report.muscleContent.leftArm).toEqual({ value: 2.9, unit: 'kg', precision: 1, status: 'normal' });
    expect(report.muscleContent.trunk).toEqual({ value: 24.2, unit: 'kg', precision: 1, status: 'normal' });
    expect(report.fatContent.rightArm).toEqual({ value: 0.78, unit: 'kg', precision: 2, status: 'high' });
    expect(report.fatContent.leftArm).toEqual({ value: 0.89, unit: 'kg', precision: 2, status: 'high' });
    expect(report.fatContent.trunk).toEqual({ value: 10.4, unit: 'kg', precision: 1, status: 'high' });
    expect(report.bodyComposition.smi.value).toBeNull();
    expect(report.recommendations.recommendedCalories.value).toBeNull();
    expect(report.recommendations.weightControl).toEqual({ value: -10.2, unit: 'kg' });
    expect(report.recommendations.targetWeight).toMatchObject({ value: 65, unit: 'kg', precision: 1 });
  });

  it('exposes the same fixed report slots for both sources', () => {
    const inBody = Object.keys(BODY_ASSESSMENT_REPORTS.INBODY.bodyComposition);
    const biacn = Object.keys(BODY_ASSESSMENT_REPORTS.BIACN.bodyComposition);
    expect(biacn).toEqual(inBody);
    expect(Object.keys(BODY_ASSESSMENT_REPORTS.INBODY.recommendations)).toEqual(Object.keys(BODY_ASSESSMENT_REPORTS.BIACN.recommendations));
  });

  it('formats signed control values with explicit positive and zero output', () => {
    expect(formatAssessmentMetric({ value: 2.4, unit: 'kg' }, { signed: true })).toBe('+2.4kg');
    expect(formatAssessmentMetric({ value: -11.6, unit: 'kg' }, { signed: true })).toBe('-11.6kg');
    expect(formatAssessmentMetric({ value: 0, unit: 'kg', precision: 1 }, { signed: true })).toBe('0kg');
  });
});
