import { describe, expect, it } from 'vitest';
import {
  getCustomerBeautyAssessmentById,
  getCustomerBeautyAssessments,
  mapDeviceSerialNumber,
} from '../customerBeautyAssessmentViewModel';

describe('SCRM beauty assessment admin view model', () => {
  it('filters the current customer and sorts records by detection time descending', () => {
    const records = getCustomerBeautyAssessments('customer-53395');

    expect(records.map((record) => record.report.recordId)).toEqual([
      'beauty-admin-20260820',
      'beauty-admin-20260801',
    ]);
    expect(records.every((record) => record.customerId === 'customer-53395')).toBe(true);
    expect(records.every((record) => record.deviceSerialNumber === null)).toBe(true);
  });

  it('keeps the shared report body and selects an explicit record without falling back to latest', () => {
    const selected = getCustomerBeautyAssessmentById('customer-53395', 'beauty-admin-20260801');
    const missing = getCustomerBeautyAssessmentById('customer-53395', 'missing-record');

    expect(selected?.report.recordId).toBe('beauty-admin-20260801');
    expect(selected?.report.summary.problemAnalysis.some((text) => text.includes('原型示例'))).toBe(false);
    expect(missing).toBeNull();
  });

  it('isolates customers and returns no fallback report for an empty customer', () => {
    expect(getCustomerBeautyAssessments('customer-53394')).toHaveLength(1);
    expect(getCustomerBeautyAssessments('customer-53393')).toEqual([]);
  });

  it('maps only result.json.SerialNumber for isolated adapter inputs', () => {
    expect(mapDeviceSerialNumber({ SerialNumber: 'K33CH123456789' })).toBe('K33CH123456789');
    expect(mapDeviceSerialNumber({ SerialNumber: '  ' })).toBeNull();
    expect(mapDeviceSerialNumber({ deviceId: 'fallback-device' })).toBeNull();
  });
});
