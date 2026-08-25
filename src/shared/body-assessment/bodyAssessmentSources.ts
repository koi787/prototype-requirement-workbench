import biacnReport from '../../../docs/reference/05-biacn-report-676106169.json';

export interface InBodyLegacySnapshot {
  displayId: string;
  age: number;
  height: number;
  measuredAt: string;
  score: number;
  weight: number;
  bodyFatPercentage: number;
  skeletalMuscle: number;
  totalWater: number;
  muscleContent: [number, number, number, number, number];
  bodyFat: number;
  mineral: number;
  protein: number;
  compositionScore: number;
  waistHipRatio: number;
  smi: number;
  fatContent: [number, number, number, number, number];
  bmi: number;
  fatFreeMass: number;
  targetWeight: number;
  weightControl: number;
  fatControl: number;
  muscleControl: number;
  recommendedCalories: number;
}

export const INBODY_LEGACY_SNAPSHOT: InBodyLegacySnapshot = {
  displayId: '27311',
  age: 24,
  height: 182,
  measuredAt: '2025-05-14 13:38:53',
  score: 67,
  weight: 80.7,
  bodyFatPercentage: 26.2,
  skeletalMuscle: 33.7,
  totalWater: 43.7,
  muscleContent: [3.3, 3.3, 26.8, 10.1, 10.1],
  bodyFat: 21.1,
  mineral: 4.1,
  protein: 11.8,
  compositionScore: 67,
  waistHipRatio: 0.9,
  smi: 8.1,
  fatContent: [1.3, 1.3, 11.2, 3.1, 3.1],
  bmi: 24.4,
  fatFreeMass: 59.6,
  targetWeight: 72.9,
  weightControl: -7.8,
  fatControl: -10.2,
  muscleControl: 2.4,
  recommendedCalories: 2449,
};

export type BiacnReportSource = typeof biacnReport;

export const BIACN_REPORT_SOURCE: BiacnReportSource = biacnReport;
