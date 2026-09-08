import { adaptBeautyRecords, adaptBeautyReport, type BeautyReportInput } from './beautyAssessmentAdapter';
import vendorResult from '../../../docs/reference/beauty-assessment-mobile-v1/05-vendor-result-sanitized.json';

type SanitizedVendorResult = typeof vendorResult & { SerialNumber?: unknown };
const sanitizedVendorResult = vendorResult as SanitizedVendorResult;

function makeSanitizedVendorReport(recordId: string, detectTime: string): BeautyReportInput {
  const vendorItems = vendorResult.ResultDetail.map((detail) => ({
    type: detail.Type,
    name: detail.Name,
    status: detail.Status,
    faceType: detail.FaceType,
    score: detail.Score,
    level: detail.Level,
    levelName: detail.LevelName,
    content: detail.Content,
  }));

  return {
    recordId,
    sourceId: 'beauty-vendor-sanitized',
    vendorReportId: null,
    vendorTaskId: null,
    vendorCustomerId: null,
    serialNumber: sanitizedVendorResult.SerialNumber,
    basic: {
      score: vendorResult.Score,
      skinType: vendorResult.LevelName,
      skinLabels: vendorResult.LevelLabel,
      sex: vendorResult.Customer.Sex,
      age: vendorResult.Customer.Age,
      detectTime,
      testCount: vendorResult.Customer.Count,
    },
    comprehensiveProposal: vendorResult.ComprehensiveProposal,
    result: vendorResult.Result,
    resultDetails: vendorItems,
  };
}

/**
 * All fixture records reuse the confirmed, sanitized vendor payload. Only the
 * local record association and history timestamp differ for UI history tests.
 */
export const BEAUTY_REPORT_MOCK_INPUTS: readonly BeautyReportInput[] = [
  makeSanitizedVendorReport('beauty-prototype-900', '2026-08-01T09:00:00+08:00'),
  makeSanitizedVendorReport('beauty-prototype-100', vendorResult.ServerCreateTime),
  makeSanitizedVendorReport('beauty-prototype-500', '2026-08-16T09:00:00+08:00'),
];

export const BEAUTY_REPORTS = adaptBeautyRecords(BEAUTY_REPORT_MOCK_INPUTS, adaptBeautyReport);
