import { describe, expect, it } from 'vitest';
import { adaptBeautyRecords, adaptBeautyReport, getBeautyScoreLevel, normalizeBeautyNumber, type BeautyReportInput } from './beautyAssessmentAdapter';
import { BEAUTY_REPORT_MOCK_INPUTS, BEAUTY_REPORTS } from './beautyAssessmentMockData';
import type { BeautyReportAdapter } from './beautyAssessmentTypes';

function input(): BeautyReportInput {
  return {
    recordId: 'report-local', sourceId: 'prototype',
    vendorReportId: '0012', vendorTaskId: 1012, vendorCustomerId: 'vendor-12', customerId: 'aoben-12',
    basic: { score: '46', age: '30', testCount: '3', sex: 'female', skinType: 'DSPW', skinLabels: ['干', '敏'], detectTime: '2026-09-01T09:00:00+08:00' },
    summary: { problemAnalysis: ['原文一', '原文二'], careAdvice: ['建议一', '建议二'] },
    itemOrder: ['oil'],
    items: [{ type: 'oil', name: '油脂', status: '100', faceType: '2', score: '74', level: '2', levelName: 'B', careAdvice: ['第一条', '第二条'] }],
  };
}

describe('beauty report adapter', () => {
  it('normalizes numeric strings before selecting front-face results and preserves independent IDs', () => {
    const report = adaptBeautyReport(input());
    expect(report).toMatchObject({
      recordId: 'report-local', sourceId: 'prototype',
      vendorReportId: '0012', vendorTaskId: '1012', vendorCustomerId: 'vendor-12', customerId: 'aoben-12',
      basic: { score: 46, scoreLevel: 'C', age: 30, testCount: 3, sex: 'female' },
    });
    expect(report.items).toEqual([{
      type: 'oil', name: '油脂', score: 74, level: 2, levelName: 'B', problemAnalysis: [], careAdvice: ['第一条', '第二条'],
    }]);
    expect(report.summary).toEqual({ problemAnalysis: ['原文一', '原文二'], careAdvice: ['建议一', '建议二'] });
  });

  it('produces the same business values for numeric and string inputs', () => {
    const strings = input();
    const numbers = {
      ...strings,
      basic: { ...strings.basic, score: 46, age: 30, testCount: 3 },
      items: strings.items.map((item) => ({ ...item, status: 100, faceType: 2, score: 74, level: 2 })),
    };
    expect(adaptBeautyReport(numbers)).toEqual(adaptBeautyReport(strings));
  });

  it('does not substitute a task ID or vendor customer for missing report/Aoben IDs', () => {
    const report = adaptBeautyReport({ ...input(), vendorReportId: null, customerId: null });
    expect(report.vendorReportId).toBeNull();
    expect(report.customerId).toBeNull();
    expect(report.vendorTaskId).toBe('1012');
  });

  it('preserves zero while invalid values become null, including numeric Level', () => {
    const source = input();
    const report = adaptBeautyReport({
      ...source, basic: { score: 0, age: '', testCount: 'invalid', sex: 'unknown' },
      items: source.items.map((item) => ({ ...item, score: '', level: 'B', levelName: 'B' })),
    });
    expect(report.basic).toMatchObject({ score: 0, scoreLevel: 'E', age: null, testCount: null, sex: null });
    expect(report.items[0]).toMatchObject({ score: null, level: null, levelName: 'B' });
  });

  it('uses source order and includes a newly configured project without a hardcoded whitelist', () => {
    const source = input();
    const report = adaptBeautyReport({
      ...source, itemOrder: ['new-project', 'oil'],
      items: [...source.items, { type: 'new-project', name: '新增原型项目', status: '100', faceType: '2', score: 50 }],
    });
    expect(report.items.map((item) => item.name)).toEqual(['新增原型项目', '油脂']);
  });

  it('excludes invalid statuses, side faces and results not in source order', () => {
    const source = input();
    const report = adaptBeautyReport({
      ...source, itemOrder: ['pending', 'side', 'oil'],
      items: [...source.items,
        { type: 'pending', name: '未完成', status: '99', faceType: '2' },
        { type: 'side', name: '侧脸', status: '100', faceType: '1' },
        { type: 'unconfigured', name: '未配置', status: 100, faceType: 2 }],
    });
    expect(report.items.map((item) => item.type)).toEqual(['oil']);
  });

  it('refuses to silently choose between ambiguous valid results', () => {
    const source = input();
    expect(() => adaptBeautyReport({ ...source, items: [...source.items, ...source.items] })).toThrow('Ambiguous front-face');
  });

  it('does not mutate its input or copy unrelated source fields into the business model', () => {
    const source = { ...input(), imageUrl: 'ignored-image', internalName: 'ignored-identity' };
    const before = JSON.stringify(source);
    const report = adaptBeautyReport(source);
    expect(JSON.stringify(source)).toBe(before);
    expect(JSON.stringify(report)).not.toMatch(/ignored-image|ignored-identity/);
    expect(report.basic.skinLabels).not.toBe(source.basic.skinLabels);
  });

  it('accepts a second typed source adapter without adding a global registry or changing the model', () => {
    const otherAdapter: BeautyReportAdapter<{ serial: string; points: number }> = (value) => adaptBeautyReport({
      ...input(), recordId: `other-${value.serial}`, sourceId: 'other-prototype', basic: { score: value.points },
    });
    const reports = adaptBeautyRecords([{ serial: '42', points: 85 }], otherAdapter);
    expect(reports[0]).toMatchObject({ recordId: 'other-42', sourceId: 'other-prototype', basic: { score: 85, scoreLevel: 'A' } });
  });

  it('rejects duplicate record IDs instead of creating ambiguous history selection', () => {
    expect(() => adaptBeautyRecords([input(), input()], adaptBeautyReport)).toThrow('unique non-empty recordIds');
  });

  it('provides stable mock data that exercises record identity and the current configured order', () => {
    const reports = adaptBeautyRecords(BEAUTY_REPORT_MOCK_INPUTS, adaptBeautyReport);
    expect(reports).toHaveLength(3);
    expect(reports.map((report) => report.basic.score)).toEqual([62, 46, 55]);
    expect(reports[0]?.items.map((item) => item.name)).toEqual([
      '油脂', '毛孔', '黑头', '浅层色素', '混合斑', '痤疮', '屏障', '卟啉',
      '深层色素', '棕色色素', '紫外线斑', '敏感红素图', '敏感热力图', '皱纹', '粗糙度', '胶原',
    ]);
  });

  it('maps the sanitized vendor Content into item analysis and care advice without copying unrelated fields', () => {
    const report = BEAUTY_REPORTS.find((item) => item.recordId === 'beauty-prototype-100');
    expect(report?.sourceId).toBe('beauty-vendor-sanitized');

    const oil = report?.items.find((item) => item.type === 'oil');
    expect(oil?.problemAnalysis).toEqual([
      '您的皮脂腺分泌有轻微异常，T 区油脂分泌旺盛，皮肤表面略显油腻感，容易显得暗沉。',
      '成年人的平均皮脂生成速率为每3 h 1 mg/10 cm2，超过数值，就会呈现出油性皮肤的外观。油性皮肤含水量不平衡，pH值偏低，皮肤易泛油光，毛孔粗大、皮肤暗沉且无透明感，当皮脂分泌旺盛时，脂质积聚过多容易导致毛孔堵塞、黑头粉刺、痤疮等问题。',
    ]);
    expect(oil?.careAdvice).toEqual([
      '1.正确清洁。控制洁面频率，最多早晚两次，可使用氨基酸类洁面产品，禁用皂基类产品，同时避免过度使用去角质产品。',
      '2.控油补水。清洁皮肤后，及时补水，可配合外用控油保湿水、保湿凝胶或保湿乳液等调整皮肤水油平衡。',
      '3.日常护理。日常生活可定期做些清洁项目，如出油过旺，可选用一定浓度的果酸或水杨酸进行化学换肤毒素。',
    ]);

    for (const type of ['brown-pigment', 'uv-spots', 'porphyrin', 'blackheads', 'sensitive-heat']) {
      const item = report?.items.find((candidate) => candidate.type === type);
      expect(item?.problemAnalysis.length).toBeGreaterThan(0);
      expect(item?.careAdvice.length).toBeGreaterThan(0);
    }
    const emptyItem = report?.items.find((item) => item.type === 'pores');
    expect(emptyItem).toMatchObject({ problemAnalysis: [], careAdvice: [] });
    expect(JSON.stringify(report)).not.toMatch(/images|Image_|科普知识|imageUrl/);
  });

  it('maps ComprehensiveProposal into the report summary and preserves its source order', () => {
    const source = input();
    const report = adaptBeautyReport({
      ...source,
      summary: { problemAnalysis: ['legacy placeholder'], careAdvice: ['legacy placeholder'] },
      comprehensiveProposal: [
        { title: '问题分析', content: [{ title: '', content: ['厂家综合问题一', '厂家综合问题二'] }] },
        { title: '护理建议', content: [{ title: '', content: ['厂家综合建议一', '厂家综合建议二'] }] },
      ],
    });
    expect(report.summary).toEqual({ problemAnalysis: ['厂家综合问题一', '厂家综合问题二'], careAdvice: ['厂家综合建议一', '厂家综合建议二'] });
    expect(adaptBeautyReport({ ...source, summary: { problemAnalysis: ['legacy placeholder'], careAdvice: ['legacy placeholder'] }, comprehensiveProposal: [] }).summary)
      .toEqual({ problemAnalysis: [], careAdvice: [] });
  });
});

describe('beauty numeric normalization and score level', () => {
  it('rejects empty, boolean, hexadecimal, non-finite and invalid numbers', () => {
    for (const value of ['', '  ', true, null, undefined, '0x10', '74分', 'Infinity', Infinity, NaN]) {
      expect(normalizeBeautyNumber(value)).toBeNull();
    }
    expect(normalizeBeautyNumber(' 46.5 ')).toBe(46.5);
  });

  it.each([
    [0, 'E'], [19, 'E'], [20, 'D'], [39, 'D'], [40, 'C'], [46, 'C'],
    [59.9, 'C'], [60, 'B'], [79.9, 'B'], [80, 'A'], [100, 'A'], [-1, null], [101, null], [null, null],
  ] as const)('maps score %s to %s without rounding or clamping', (score, expected) => {
    expect(getBeautyScoreLevel(score)).toBe(expected);
  });
});
