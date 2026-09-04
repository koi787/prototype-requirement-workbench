import { adaptBeautyRecords, adaptBeautyReport, type BeautyReportInput } from './beautyAssessmentAdapter';
import vendorResult from '../../../docs/reference/beauty-assessment-mobile-v1/05-vendor-result-sanitized.json';

/** 工作台能力演示：稳定虚拟数据，不是真实厂家报告或客户资料。 */
const ITEM_SAMPLES = [
  ['oil', '油脂', 74, 'B'], ['pores', '毛孔', 41, 'C'], ['blackheads', '黑头', 61, 'B'],
  ['surface-pigment', '浅层色素', 54, 'C'], ['mixed-spots', '混合斑', 52, 'C'],
  ['acne', '痤疮', 65, 'B'], ['barrier', '屏障', 46, 'C'], ['porphyrin', '卟啉', 58, 'C'],
  ['deep-pigment', '深层色素', 51, 'C'], ['brown-pigment', '棕色色素', 49, 'C'],
  ['uv-spots', '紫外线斑', 55, 'C'], ['sensitive-red', '敏感红素图', 43, 'C'],
  ['sensitive-heat', '敏感热力图', 48, 'C'], ['wrinkles', '皱纹', 56, 'C'],
  ['roughness', '粗糙度', 59, 'C'], ['collagen', '胶原', 62, 'B'],
] as const;

function makePrototypeReport(recordId: string, date: string, score: number, sequence: number): BeautyReportInput {
  return {
    recordId,
    sourceId: 'beauty-prototype',
    vendorReportId: `prototype-report-${sequence}`,
    vendorTaskId: `prototype-task-${sequence + 100}`,
    vendorCustomerId: 'prototype-vendor-customer',
    customerId: 'prototype-aoben-customer',
    basic: {
      score: String(score), skinType: 'DSPW', skinLabels: ['干', '敏', '色', '衰'],
      sex: 'female', age: '30', detectTime: date, testCount: String(sequence),
    },
    // These statements are prototype examples, not manufacturer conclusions or AI output.
    summary: { problemAnalysis: ['原型示例：肌肤状态信息。'], careAdvice: ['原型示例：日常护理信息。'] },
    itemOrder: ITEM_SAMPLES.map(([type]) => type),
    items: ITEM_SAMPLES.map(([type, name, itemScore, levelName]) => ({
      type, name, status: '100', faceType: '2', score: String(itemScore),
      // Numeric codes are prototype values only; no vendor level-code mapping is assumed.
      level: null, levelName,
      problemAnalysis: [], careAdvice: [],
    })),
  };
}

const VENDOR_TYPE_TO_ITEM_TYPE: Record<string, string> = {
  '15': 'brown-pigment',
  '50': 'uv-spots',
  '23': 'porphyrin',
  '25': 'blackheads',
  '22': 'oil',
  '36': 'sensitive-heat',
};

function makeSanitizedVendorReport(): BeautyReportInput {
  const prototype = makePrototypeReport('beauty-prototype-100', vendorResult.ServerCreateTime, 46, 3);
  const vendorItems = vendorResult.ResultDetail.map((detail) => {
    const type = VENDOR_TYPE_TO_ITEM_TYPE[detail.Type];
    if (!type) throw new Error(`Unmapped sanitized beauty vendor item: ${detail.Type}`);
    return {
      type,
      name: detail.Name,
      status: detail.Status,
      faceType: detail.FaceType,
      score: detail.Score,
      level: detail.Level,
      levelName: detail.LevelName,
      content: detail.Content,
    };
  });

  return {
    ...prototype,
    sourceId: 'beauty-vendor-sanitized',
    vendorReportId: null,
    vendorTaskId: null,
    vendorCustomerId: null,
    basic: {
      score: vendorResult.Score,
      skinType: vendorResult.LevelName,
      skinLabels: vendorResult.LevelLabel,
      sex: vendorResult.Customer.Sex,
      age: vendorResult.Customer.Age,
      detectTime: vendorResult.ServerCreateTime,
      testCount: vendorResult.Customer.Count,
    },
    comprehensiveProposal: vendorResult.ComprehensiveProposal,
    items: prototype.items.map((item) => vendorItems.find((vendorItem) => vendorItem.type === item.type) ?? item),
  };
}

// Deliberately not chronological: default selection must use time, not position or id.
export const BEAUTY_REPORT_MOCK_INPUTS: readonly BeautyReportInput[] = [
  makePrototypeReport('beauty-prototype-900', '2026-08-01T09:00:00+08:00', 62, 1),
  makeSanitizedVendorReport(),
  makePrototypeReport('beauty-prototype-500', '2026-08-16T09:00:00+08:00', 55, 2),
];

export const BEAUTY_REPORTS = adaptBeautyRecords(BEAUTY_REPORT_MOCK_INPUTS, adaptBeautyReport);
