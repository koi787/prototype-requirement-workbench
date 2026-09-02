export interface BodyAssessmentScoreMeta {
  label: '待提升' | '标准' | '良好' | '优秀';
  encouragement: string;
  color: string;
  iconKey: 'growth' | 'confirm' | 'fist' | 'crown';
}

const SCORE_META: readonly { minimum: number; meta: BodyAssessmentScoreMeta }[] = [
  {
    minimum: 90,
    meta: { label: '优秀', encouragement: '状态很棒，继续保持这份自律。', color: '#FFB11B', iconKey: 'crown' },
  },
  {
    minimum: 80,
    meta: { label: '良好', encouragement: '状态不错，离优秀又近了一步。', color: '#FFC96B', iconKey: 'fist' },
  },
  {
    minimum: 70,
    meta: { label: '标准', encouragement: '状态在线，保持好节奏，继续稳步提升。', color: '#42C7B6', iconKey: 'confirm' },
  },
  {
    minimum: Number.NEGATIVE_INFINITY,
    meta: { label: '待提升', encouragement: '还有进步空间，坚持一下，下次会更好。', color: '#FFB648', iconKey: 'growth' },
  },
];

export function getBodyAssessmentScoreMeta(score: number | null | undefined): BodyAssessmentScoreMeta | null {
  if (score === null || score === undefined) return null;
  return SCORE_META.find(({ minimum }) => score >= minimum)?.meta ?? null;
}
