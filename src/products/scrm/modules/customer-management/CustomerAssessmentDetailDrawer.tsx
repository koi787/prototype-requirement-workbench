import { Drawer } from 'antd';
import {
  formatAssessmentMetric,
  type AssessmentMetric,
  type AssessmentSegments,
  type BodyAssessmentReport,
} from '../../../../shared/body-assessment';
import type { CustomerRecord } from './customerTypes';

const SEGMENT_LABELS: readonly { key: keyof AssessmentSegments; label: string }[] = [
  { key: 'rightArm', label: '右上肢' },
  { key: 'leftArm', label: '左上肢' },
  { key: 'trunk', label: '躯干' },
  { key: 'rightLeg', label: '右下肢' },
  { key: 'leftLeg', label: '左下肢' },
];

function scoreText(report: BodyAssessmentReport): string {
  if (report.score.value === null) return '';
  const precision = report.score.precision ?? (Number.isInteger(report.score.value) ? 0 : 1);
  return report.score.value.toFixed(precision);
}

function metricText(metric: AssessmentMetric, emptyValue = '', options: { signed?: boolean } = {}): string {
  return formatAssessmentMetric(metric, { emptyValue, ...options });
}

function sourceLabel(source: BodyAssessmentReport['source']): string {
  return source === 'INBODY' ? 'InBody' : 'BIACN';
}

function DetailMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="customer-assessment-detail-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="customer-assessment-detail-section">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function MetricGrid({ items }: { items: readonly [string, string][] }) {
  return (
    <div className="customer-assessment-detail-grid">
      {items.map(([label, value]) => <DetailMetric key={label} label={label} value={value} />)}
    </div>
  );
}

function SegmentGrid({ segments }: { segments: AssessmentSegments }) {
  return (
    <div className="customer-assessment-segment-grid">
      {SEGMENT_LABELS.map(({ key, label }) => (
        <DetailMetric key={key} label={label} value={metricText(segments[key])} />
      ))}
    </div>
  );
}

export interface CustomerAssessmentDetailDrawerProps {
  open: boolean;
  customer: CustomerRecord;
  report: BodyAssessmentReport | null;
  onClose: () => void;
}

export function CustomerAssessmentDetailDrawer({
  open,
  customer,
  report,
  onClose,
}: CustomerAssessmentDetailDrawerProps) {
  return (
    <Drawer
      open={open}
      title="体测详情"
      size="70vw"
      placement="right"
      zIndex={1100}
      onClose={onClose}
      className="customer-assessment-detail-drawer"
      destroyOnClose
    >
      {report && (
        <div className="customer-assessment-detail-body" data-customer-id={customer.customerId}>
          <div className="customer-assessment-detail-context">
            <span>客户：{customer.name}</span>
            <span>检测时间：{report.measuredAt}</span>
            <span>数据来源：{sourceLabel(report.source)}</span>
          </div>

          <DetailSection title="基本信息">
            <MetricGrid
              items={[
                ['检测时间', report.measuredAt],
                ['数据来源', sourceLabel(report.source)],
                ['年龄', report.profile.age === null ? '' : `${report.profile.age}岁`],
                ['身高', report.profile.height === null ? '' : `${report.profile.height}cm`],
              ]}
            />
          </DetailSection>

          <DetailSection title="核心指标">
            <MetricGrid
              items={[
                ['身体评分', scoreText(report)],
                ['体重', metricText(report.core.weight)],
                ['体脂率', metricText(report.core.bodyFatPercentage)],
                ['骨骼肌', metricText(report.core.skeletalMuscle)],
                ['总水分', metricText(report.core.totalWater)],
              ]}
            />
          </DetailSection>

          <DetailSection title="身体成分">
            <MetricGrid
              items={[
                ['体脂肪', metricText(report.bodyComposition.bodyFat)],
                ['无机盐', metricText(report.bodyComposition.mineral)],
                ['蛋白质', metricText(report.bodyComposition.protein)],
                ['成分分数', metricText(report.bodyComposition.compositionScore)],
                ['腰臀比', metricText(report.bodyComposition.waistHipRatio)],
                ['脂肪等级', metricText(report.bodyComposition.fatGrade)],
                ['SMI', metricText(report.bodyComposition.smi)],
              ]}
            />
          </DetailSection>

          <DetailSection title="肥胖分析">
            <MetricGrid
              items={[
                ['BMI', metricText(report.recommendations.bmi)],
                ['体脂率', metricText(report.core.bodyFatPercentage)],
                ['腰臀比', metricText(report.bodyComposition.waistHipRatio)],
              ]}
            />
          </DetailSection>

          <DetailSection title="节段肌肉">
            <SegmentGrid segments={report.muscleContent} />
          </DetailSection>

          <DetailSection title="节段脂肪">
            <SegmentGrid segments={report.fatContent} />
          </DetailSection>

          <DetailSection title="调节建议">
            <MetricGrid
              items={[
                ['BMI', metricText(report.recommendations.bmi)],
                ['去脂体重', metricText(report.recommendations.fatFreeMass)],
                ['目标体重', metricText(report.recommendations.targetWeight)],
                ['体重控制', metricText(report.recommendations.weightControl, '', { signed: true })],
                ['脂肪控制', metricText(report.recommendations.fatControl, '', { signed: true })],
                ['肌肉控制', metricText(report.recommendations.muscleControl, '', { signed: true })],
                ['建议的热量摄入', metricText(report.recommendations.recommendedCalories, report.source === 'BIACN' ? '—' : '')],
              ]}
            />
          </DetailSection>
        </div>
      )}
    </Drawer>
  );
}
