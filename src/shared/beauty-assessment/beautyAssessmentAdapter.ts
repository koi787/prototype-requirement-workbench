import type { BeautyReport, BeautyReportAdapter, BeautyReportItem, BeautyScoreLevel } from './beautyAssessmentTypes';

/** Internal prototype input, not a vendor JSON contract or a network response. */
export interface BeautyReportContentInput {
  title?: unknown;
  content?: readonly {
    title?: unknown;
    content?: readonly unknown[];
  }[];
}

export interface BeautyReportInput {
  recordId: string;
  sourceId: string;
  vendorReportId?: unknown;
  vendorTaskId?: unknown;
  vendorCustomerId?: unknown;
  customerId?: unknown;
  basic: {
    score?: unknown;
    skinType?: unknown;
    skinLabels?: readonly string[];
    sex?: unknown;
    age?: unknown;
    detectTime?: unknown;
    testCount?: unknown;
  };
  summary?: {
    problemAnalysis?: readonly string[];
    careAdvice?: readonly string[];
  };
  comprehensiveProposal?: readonly BeautyReportContentInput[];
  /** Source-supplied business order, never a permanent list of supported projects. */
  itemOrder: readonly string[];
  items: readonly {
    type: string;
    name: string;
    status: unknown;
    faceType: unknown;
    score?: unknown;
    level?: unknown;
    levelName?: unknown;
    content?: readonly BeautyReportContentInput[];
    problemAnalysis?: readonly string[];
    careAdvice?: readonly string[];
  }[];
}

export function normalizeBeautyNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string') return null;
  const text = value.trim();
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(text)) return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

function normalizeText(value: unknown): string | null {
  return typeof value === 'string' ? value.trim() || null : null;
}

function normalizeId(value: unknown): string | null {
  if (typeof value === 'string') return normalizeText(value);
  return typeof value === 'number' && Number.isSafeInteger(value) ? String(value) : null;
}

function normalizeCount(value: unknown): number | null {
  const number = normalizeBeautyNumber(value);
  return number !== null && Number.isInteger(number) && number >= 0 ? number : null;
}

function normalizeTexts(values: readonly unknown[] = []): string[] {
  return values.map(normalizeText).filter((value): value is string => value !== null);
}

function extractContentTexts(content: readonly BeautyReportContentInput[], titles: readonly string[]): string[] {
  const acceptedTitles = new Set(titles);
  return content
    .filter((block) => {
      const title = normalizeText(block.title);
      return title !== null && acceptedTitles.has(title);
    })
    .flatMap((block) => (block.content ?? []).flatMap((entry) => normalizeTexts(entry.content)));
}

function normalizeItemTexts(item: BeautyReportInput['items'][number]): Pick<BeautyReportItem, 'problemAnalysis' | 'careAdvice'> {
  if (item.content !== undefined) {
    return {
      problemAnalysis: extractContentTexts(item.content, ['问题分析']),
      careAdvice: extractContentTexts(item.content, ['日常护理建议', '护理建议']),
    };
  }
  return {
    problemAnalysis: normalizeTexts(item.problemAnalysis),
    careAdvice: normalizeTexts(item.careAdvice),
  };
}

function normalizeSummary(input: BeautyReportInput): { problemAnalysis: string[]; careAdvice: string[] } {
  if (input.comprehensiveProposal !== undefined) {
    return {
      problemAnalysis: extractContentTexts(input.comprehensiveProposal, ['问题分析']),
      careAdvice: extractContentTexts(input.comprehensiveProposal, ['护理建议']),
    };
  }
  return {
    problemAnalysis: normalizeTexts(input.summary?.problemAnalysis),
    careAdvice: normalizeTexts(input.summary?.careAdvice),
  };
}

export function getBeautyScoreLevel(score: number | null): BeautyScoreLevel | null {
  if (score === null || !Number.isFinite(score) || score < 0 || score > 100) return null;
  if (score >= 80) return 'A';
  if (score >= 60) return 'B';
  if (score >= 40) return 'C';
  if (score >= 20) return 'D';
  return 'E';
}

export const adaptBeautyReport: BeautyReportAdapter<BeautyReportInput> = (input) => {
  const recordId = input.recordId.trim();
  const sourceId = input.sourceId.trim();
  if (!recordId || !sourceId) throw new Error('Beauty report requires a stable recordId and sourceId');

  // Normalize first: both "100"/"2" and 100/2 must select the same front-face result.
  const validItems = input.items.filter((item) => (
    normalizeBeautyNumber(item.status) === 100 && normalizeBeautyNumber(item.faceType) === 2
  ));
  const items: BeautyReportItem[] = [];
  const seen = new Set<string>();
  for (const itemType of input.itemOrder) {
    const type = itemType.trim();
    if (!type || seen.has(type)) throw new Error('Beauty report item order must contain unique non-empty types');
    seen.add(type);
    const matches = validItems.filter((item) => item.type.trim() === type);
    if (matches.length > 1) throw new Error(`Ambiguous front-face beauty result: ${type}`);
    const item = matches[0];
    if (!item) continue;
    const itemTexts = normalizeItemTexts(item);
    items.push({
      type,
      name: item.name.trim(),
      score: normalizeBeautyNumber(item.score),
      level: normalizeBeautyNumber(item.level),
      levelName: normalizeText(item.levelName),
      ...itemTexts,
    });
  }

  const score = normalizeBeautyNumber(input.basic.score);
  const sex = normalizeText(input.basic.sex);
  const summary = normalizeSummary(input);
  return {
    recordId,
    sourceId,
    vendorReportId: normalizeId(input.vendorReportId),
    vendorTaskId: normalizeId(input.vendorTaskId),
    vendorCustomerId: normalizeId(input.vendorCustomerId),
    customerId: normalizeId(input.customerId),
    basic: {
      score,
      scoreLevel: getBeautyScoreLevel(score),
      skinType: normalizeText(input.basic.skinType),
      skinLabels: normalizeTexts(input.basic.skinLabels),
      sex: sex === 'female' || sex === 'male' ? sex : null,
      age: normalizeCount(input.basic.age),
      detectTime: normalizeText(input.basic.detectTime),
      testCount: normalizeCount(input.basic.testCount),
    },
    summary,
    items,
  };
};

export function adaptBeautyRecords<Input>(inputs: readonly Input[], adapter: BeautyReportAdapter<Input>): readonly BeautyReport[] {
  const records = inputs.map(adapter);
  const ids = new Set<string>();
  for (const record of records) {
    if (!record.recordId.trim() || ids.has(record.recordId)) {
      throw new Error('Beauty report records must have unique non-empty recordIds');
    }
    ids.add(record.recordId);
  }
  return records;
}
