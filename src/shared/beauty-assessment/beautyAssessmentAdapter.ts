import type { BeautyReport, BeautyReportAdapter, BeautyReportItem, BeautyScoreLevel } from './beautyAssessmentTypes';

/** Internal prototype input, not a vendor JSON contract or a network response. */
export interface BeautyReportContentInput {
  title?: unknown;
  content?: readonly {
    title?: unknown;
    content?: readonly unknown[];
  }[];
}

export interface BeautyReportResultChildInput {
  Type?: unknown;
  Name?: unknown;
}

export interface BeautyReportResultGroupInput {
  Name?: unknown;
  Children?: readonly BeautyReportResultChildInput[];
}

export interface BeautyReportInput {
  recordId: string;
  sourceId: string;
  vendorReportId?: unknown;
  vendorTaskId?: unknown;
  vendorCustomerId?: unknown;
  customerId?: unknown;
  /** Vendor result.json.SerialNumber. Kept at the adapter boundary. */
  serialNumber?: unknown;
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
  result?: readonly BeautyReportResultGroupInput[];
  resultDetails: readonly {
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

function normalizeItemTexts(item: BeautyReportInput['resultDetails'][number]): Pick<BeautyReportItem, 'problemAnalysis' | 'careAdvice'> {
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

function normalizeResultChildKey(value: unknown): string | null {
  return normalizeId(value);
}

function getConfiguredChildren(input: BeautyReportInput): BeautyReportResultChildInput[] {
  return (input.result ?? [])
    .filter((group) => {
      const name = normalizeText(group.Name);
      return name === 'skin' || name === 'senility';
    })
    .flatMap((group) => group.Children ?? []);
}

/** “水分” is outside the confirmed V1 report, not a general no-detail filter. */
function isExcludedV1Child(type: string | null, name: string | null): boolean {
  return type === '1' && name === '水分';
}

function emptyReportItem(type: string, name: string): BeautyReportItem {
  return {
    type,
    name,
    score: null,
    level: null,
    levelName: null,
    problemAnalysis: [],
    careAdvice: [],
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
  const validItems = input.resultDetails.filter((item) => (
    normalizeBeautyNumber(item.status) === 100 && normalizeBeautyNumber(item.faceType) === 2
  ));
  const items: BeautyReportItem[] = [];
  for (const child of getConfiguredChildren(input)) {
    const childType = normalizeResultChildKey(child.Type);
    const childName = normalizeText(child.Name);
    if (!childType && !childName) continue;
    if (isExcludedV1Child(childType, childName)) continue;
    const matchesByType = childType ? validItems.filter((item) => normalizeResultChildKey(item.type) === childType) : [];
    const matches = matchesByType.length > 0
      ? matchesByType
      : validItems.filter((item) => childName !== null && normalizeText(item.name) === childName);
    const fallbackType = childType ?? (childName === null ? null : childName);
    const fallbackName = childName ?? fallbackType;
    if (!fallbackType || !fallbackName) continue;
    if (matches.length !== 1) {
      items.push(emptyReportItem(fallbackType, fallbackName));
      continue;
    }
    const item = matches[0];
    if (!item) {
      items.push(emptyReportItem(fallbackType, fallbackName));
      continue;
    }
    const type = childType ?? normalizeResultChildKey(item.type);
    const name = childName ?? normalizeText(item.name);
    if (!type || !name) continue;
    const itemTexts = normalizeItemTexts(item);
    items.push({
      type,
      name,
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
      deviceSerialNumber: normalizeText(input.serialNumber),
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
