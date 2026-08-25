export type BodyAssessmentSource = 'INBODY' | 'BIACN';

export type SegmentStatus = 'low' | 'normal' | 'high' | 'unknown';

export interface AssessmentMetric {
  value: number | null;
  unit: string | null;
  precision?: number;
}

export interface AssessmentSegmentMetric extends AssessmentMetric {
  status: SegmentStatus | null;
}

export interface AssessmentSegments {
  rightArm: AssessmentSegmentMetric;
  leftArm: AssessmentSegmentMetric;
  trunk: AssessmentSegmentMetric;
  rightLeg: AssessmentSegmentMetric;
  leftLeg: AssessmentSegmentMetric;
}

export interface BodyAssessmentReport {
  source: BodyAssessmentSource;
  recordId: string;
  customerId: string;
  measuredAt: string;
  profile: {
    displayId: string;
    age: number | null;
    height: number | null;
    gender: number | null;
    birthday: string | null;
  };
  device: {
    vendorRecordId: string | null;
    deviceMeasureId: string | null;
    deviceSerialNumber: string | null;
    productName: string | null;
  };
  score: {
    label: string;
    value: number | null;
    precision?: number;
  };
  core: {
    weight: AssessmentMetric;
    bodyFatPercentage: AssessmentMetric;
    skeletalMuscle: AssessmentMetric;
    totalWater: AssessmentMetric;
  };
  muscleContent: AssessmentSegments;
  bodyComposition: {
    bodyFat: AssessmentMetric;
    mineral: AssessmentMetric;
    protein: AssessmentMetric;
    compositionScore: AssessmentMetric;
    fatGrade: AssessmentMetric;
    waistHipRatio: AssessmentMetric;
    smi: AssessmentMetric;
  };
  fatContent: AssessmentSegments;
  recommendations: {
    bmi: AssessmentMetric;
    fatFreeMass: AssessmentMetric;
    targetWeight: AssessmentMetric;
    weightControl: AssessmentMetric;
    fatControl: AssessmentMetric;
    muscleControl: AssessmentMetric;
    recommendedCalories: AssessmentMetric;
  };
}
