import {
  BIACN_REPORT_SOURCE,
  INBODY_LEGACY_SNAPSHOT,
  type BiacnReportSource,
  type InBodyLegacySnapshot,
} from './bodyAssessmentSources';
import type {
  AssessmentMetric,
  AssessmentSegmentMetric,
  AssessmentSegments,
  BodyAssessmentReport,
  SegmentStatus,
} from './bodyAssessmentTypes';

// Cycle C 客户列表建立的稳定客户主键；不得使用 BIACN measurement.id。
const CUSTOMER_ID = 'customer-53395';

const metric = (value: number | null, unit: string | null): AssessmentMetric => ({ value, unit });

const segment = (
  value: number | null,
  unit: string | null,
  status: SegmentStatus | null,
): AssessmentSegmentMetric => ({ value, unit, status });

function segments(
  values: readonly [number, number, number, number, number],
  unit: string,
  statuses: readonly [SegmentStatus, SegmentStatus, SegmentStatus, SegmentStatus, SegmentStatus],
): AssessmentSegments {
  return {
    rightArm: segment(values[0], unit, statuses[0]),
    leftArm: segment(values[1], unit, statuses[1]),
    trunk: segment(values[2], unit, statuses[2]),
    rightLeg: segment(values[3], unit, statuses[3]),
    leftLeg: segment(values[4], unit, statuses[4]),
  };
}

const inBodyStatuses: readonly [SegmentStatus, SegmentStatus, SegmentStatus, SegmentStatus, SegmentStatus] = [
  'normal',
  'normal',
  'normal',
  'normal',
  'normal',
];

const gradeToStatus = (grade: number | null | undefined): SegmentStatus => {
  if (grade === 1) return 'low';
  if (grade === 2) return 'normal';
  if (grade === 3) return 'high';
  return 'unknown';
};

const biacnSegments = (
  values: Record<'ra' | 'la' | 'tr' | 'rl' | 'll', BiacnMetricSource>,
  unit: string,
  precision: Record<'ra' | 'la' | 'tr' | 'rl' | 'll', number>,
): AssessmentSegments => ({
  rightArm: { ...segment(values.ra.value ?? null, unit, gradeToStatus(values.ra.grade)), precision: precision.ra },
  leftArm: { ...segment(values.la.value ?? null, unit, gradeToStatus(values.la.grade)), precision: precision.la },
  trunk: { ...segment(values.tr.value ?? null, unit, gradeToStatus(values.tr.grade)), precision: precision.tr },
  rightLeg: { ...segment(values.rl.value ?? null, unit, gradeToStatus(values.rl.grade)), precision: precision.rl },
  leftLeg: { ...segment(values.ll.value ?? null, unit, gradeToStatus(values.ll.grade)), precision: precision.ll },
});

export function adaptInBody(snapshot: InBodyLegacySnapshot = INBODY_LEGACY_SNAPSHOT): BodyAssessmentReport {
  return {
    source: 'INBODY',
    recordId: 'inbody-legacy-27311',
    customerId: CUSTOMER_ID,
    measuredAt: snapshot.measuredAt,
    profile: {
      displayId: snapshot.displayId,
      age: snapshot.age,
      height: snapshot.height,
      gender: null,
      birthday: null,
    },
    device: {
      vendorRecordId: null,
      deviceMeasureId: null,
      deviceSerialNumber: null,
      productName: null,
    },
    score: { label: 'InBody评分', value: snapshot.score, precision: 1 },
    core: {
      weight: metric(snapshot.weight, 'kg'),
      bodyFatPercentage: metric(snapshot.bodyFatPercentage, '%'),
      skeletalMuscle: metric(snapshot.skeletalMuscle, 'kg'),
      totalWater: metric(snapshot.totalWater, 'kg'),
    },
    muscleContent: segments(snapshot.muscleContent, '%', inBodyStatuses),
    bodyComposition: {
      bodyFat: metric(snapshot.bodyFat, null),
      mineral: metric(snapshot.mineral, null),
      protein: metric(snapshot.protein, null),
      compositionScore: { ...metric(snapshot.compositionScore, null), precision: 1 },
      fatGrade: { ...metric(0, null), precision: 1 },
      waistHipRatio: metric(snapshot.waistHipRatio, null),
      smi: metric(snapshot.smi, null),
    },
    fatContent: segments(snapshot.fatContent, '%', inBodyStatuses),
    recommendations: {
      bmi: metric(snapshot.bmi, null),
      fatFreeMass: metric(snapshot.fatFreeMass, null),
      targetWeight: metric(snapshot.targetWeight, null),
      weightControl: metric(snapshot.weightControl, 'kg'),
      fatControl: metric(snapshot.fatControl, 'kg'),
      muscleControl: metric(snapshot.muscleControl, 'kg'),
      recommendedCalories: metric(snapshot.recommendedCalories, null),
    },
  };
}

interface BiacnMetricSource {
  value?: number;
  grade?: number;
}

interface BiacnSourceShape {
  data: {
    measurement: {
      id: number;
      device_measure_id: string;
      device_sn: string;
      pro_name: string;
      start_time: string;
      height: number;
      age: number;
      gender: number;
      birthday: string;
      score_constitute?: { composition?: number };
    };
    composition: {
      body_score: BiacnMetricSource;
      weight: BiacnMetricSource;
      pbf: BiacnMetricSource;
      smm: BiacnMetricSource;
      tbw: BiacnMetricSource;
      fat: BiacnMetricSource;
      mineral: BiacnMetricSource;
      protein: BiacnMetricSource;
      whfr: BiacnMetricSource;
      bmi: BiacnMetricSource;
      ffm: BiacnMetricSource;
      muscle_control: BiacnMetricSource;
      fat_control: BiacnMetricSource;
      segmental_muscle: Record<'ra' | 'la' | 'tr' | 'rl' | 'll', BiacnMetricSource>;
      segmental_fat: Record<'ra' | 'la' | 'tr' | 'rl' | 'll', BiacnMetricSource>;
    };
  };
}

const valueOrNull = (source: BiacnMetricSource): number | null => source.value ?? null;

export function adaptBiacn(source: BiacnReportSource = BIACN_REPORT_SOURCE): BodyAssessmentReport {
  const raw = source as unknown as BiacnSourceShape;
  const { measurement, composition } = raw.data;
  const weightControl = valueOrNull(composition.muscle_control) === null || valueOrNull(composition.fat_control) === null
    ? null
    : valueOrNull(composition.muscle_control)! - valueOrNull(composition.fat_control)!;

  return {
    source: 'BIACN',
    recordId: `biacn-${measurement.id}`,
    customerId: CUSTOMER_ID,
    measuredAt: measurement.start_time,
    profile: {
      displayId: '',
      age: measurement.age,
      height: measurement.height,
      gender: measurement.gender,
      birthday: measurement.birthday,
    },
    device: {
      vendorRecordId: String(measurement.id),
      deviceMeasureId: measurement.device_measure_id,
      deviceSerialNumber: measurement.device_sn,
      productName: measurement.pro_name,
    },
    score: { label: '身体评分', value: valueOrNull(composition.body_score) },
    core: {
      weight: metric(valueOrNull(composition.weight), 'kg'),
      bodyFatPercentage: metric(valueOrNull(composition.pbf), '%'),
      skeletalMuscle: metric(valueOrNull(composition.smm), 'kg'),
      totalWater: metric(valueOrNull(composition.tbw), 'kg'),
    },
    muscleContent: biacnSegments(composition.segmental_muscle, 'kg', { ra: 1, la: 1, tr: 1, rl: 1, ll: 1 }),
    bodyComposition: {
      bodyFat: metric(valueOrNull(composition.fat), 'kg'),
      mineral: metric(valueOrNull(composition.mineral), 'kg'),
      protein: metric(valueOrNull(composition.protein), 'kg'),
      compositionScore: metric(measurement.score_constitute?.composition ?? null, null),
      fatGrade: metric(null, null),
      waistHipRatio: metric(valueOrNull(composition.whfr), null),
      smi: metric(null, null),
    },
    fatContent: biacnSegments(composition.segmental_fat, 'kg', { ra: 2, la: 2, tr: 1, rl: 1, ll: 1 }),
    recommendations: {
      bmi: { ...metric(valueOrNull(composition.bmi), null), precision: 1 },
      fatFreeMass: metric(valueOrNull(composition.ffm), 'kg'),
      targetWeight: { ...metric(65, 'kg'), precision: 1 },
      weightControl: metric(weightControl, 'kg'),
      fatControl: metric(valueOrNull(composition.fat_control) === null ? null : -valueOrNull(composition.fat_control)!, 'kg'),
      muscleControl: metric(valueOrNull(composition.muscle_control), 'kg'),
      recommendedCalories: metric(null, null),
    },
  };
}

export const BODY_ASSESSMENT_REPORTS: Record<'INBODY' | 'BIACN', BodyAssessmentReport> = {
  INBODY: adaptInBody(),
  BIACN: adaptBiacn(),
};
