export type BeautyScoreLevel = 'A' | 'B' | 'C' | 'D' | 'E';

export interface BeautyReportItem {
  type: string;
  name: string;
  score: number | null;
  level: number | null;
  levelName: string | null;
  problemAnalysis: readonly string[];
  careAdvice: readonly string[];
}

/** Source-independent business model. No vendor response or image data is retained. */
export interface BeautyReport {
  recordId: string;
  sourceId: string;
  vendorReportId: string | null;
  vendorTaskId: string | null;
  vendorCustomerId: string | null;
  customerId: string | null;
  basic: {
    score: number | null;
    scoreLevel: BeautyScoreLevel | null;
    skinType: string | null;
    skinLabels: readonly string[];
    sex: 'female' | 'male' | null;
    age: number | null;
    detectTime: string | null;
    testCount: number | null;
  };
  summary: {
    problemAnalysis: readonly string[];
    careAdvice: readonly string[];
  };
  items: readonly BeautyReportItem[];
}

/** Each future source supplies its own pure adapter; the page keeps this contract. */
export type BeautyReportAdapter<Input> = (input: Input) => BeautyReport;

export interface BeautyReportSelection {
  records: readonly BeautyReport[];
  currentRecordId: string | null;
  currentRecord: BeautyReport | null;
}
