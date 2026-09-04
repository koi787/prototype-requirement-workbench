import { Drawer } from 'antd';
import type { ReactNode } from 'react';
import {
  formatAssessmentMetric,
  type AssessmentMetric,
  type AssessmentSegments,
  type BodyAssessmentReport,
} from '../../../../shared/body-assessment';
import type { CustomerRecord } from './customerTypes';

function scoreText(report: BodyAssessmentReport): string {
  const scoreMetric: AssessmentMetric = {
    value: report.score.value,
    unit: null,
    ...(report.score.precision === undefined ? {} : { precision: report.score.precision }),
  };
  return formatAssessmentMetric(
    scoreMetric,
    { emptyValue: '' },
  );
}

function metricText(metric: AssessmentMetric, emptyValue = '', options: { signed?: boolean } = {}): string {
  return formatAssessmentMetric(metric, { emptyValue, ...options });
}

function sourceLabel(source: BodyAssessmentReport['source']): string {
  return source === 'INBODY' ? 'InBody' : 'BIACN';
}

type MetricIconKind = 'score' | 'weight' | 'fat' | 'muscle' | 'bmi' | 'water' | 'mineral' | 'protein' | 'ratio' | 'target' | 'control' | 'calories';

function MetricIcon({ kind }: { kind: MetricIconKind }) {
  return (
    <svg className="customer-assessment-metric-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d={kind === 'bmi' ? 'M7 15h10M8 9h8M10 6v12M14 6v12' : kind === 'ratio' ? 'M6 10h12M8 10v6M16 10v6M7 16h10' : kind === 'weight' ? 'M8 9h8l1 9H7l1-9Zm2 0a2 2 0 0 1 4 0' : kind === 'water' || kind === 'fat' ? 'M12 5c2 3 4 5 4 8a4 4 0 0 1-8 0c0-3 2-5 4-8Z' : kind === 'muscle' ? 'M8 8c2-2 6-2 8 0M7 12h10M9 16h6' : kind === 'protein' ? 'M8 8l8 8M16 8l-8 8M6 12h12' : kind === 'mineral' ? 'M12 6v12M6 12h12M8 8l8 8M16 8l-8 8' : kind === 'score' ? 'M8 15a5 5 0 1 1 8 0M12 12l3-3' : kind === 'target' ? 'M12 7v10M7 12h10M9 9l6 6M15 9l-6 6' : kind === 'calories' ? 'M12 6c2 2 4 4 4 7a4 4 0 0 1-8 0c0-2 1-4 4-7Z' : 'M7 12h10M12 7v10'} />
    </svg>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: MetricIconKind }) {
  return (
    <div className="customer-assessment-metric-card">
      <MetricIcon kind={icon} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="customer-assessment-detail-section">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function MetricCardGrid({ items, className = '' }: { items: readonly [string, string, MetricIconKind][]; className?: string }) {
  return (
    <div className={`customer-assessment-metric-card-grid ${className}`.trim()}>
      {items.map(([label, value, icon]) => <MetricCard key={label} label={label} value={value} icon={icon} />)}
    </div>
  );
}

function SegmentBodyMap({ title, segments }: { title: string; segments: AssessmentSegments }) {
  const items = [
    ['rightArm', '右上肢', 'right-arm'],
    ['leftArm', '左上肢', 'left-arm'],
    ['trunk', '躯干', 'trunk'],
    ['rightLeg', '右下肢', 'right-leg'],
    ['leftLeg', '左下肢', 'left-leg'],
  ] as const;

  return (
    <div className="customer-assessment-segment-map" data-segment-map={title}>
      <svg className="customer-assessment-body-silhouette" viewBox="0 0 120 230" role="img" aria-label={`${title}人体定位图`}>
        <circle cx="60" cy="22" r="14" />
        <path d="M47 43c-8 10-9 27-7 45l8 27-7 62c-1 12 5 23 11 29l5-4-2-31 5-39 5 39-2 31 5 4c6-6 12-17 11-29l-7-62 8-27c2-18 1-35-7-45-5 5-10 7-14 7s-9-2-14-7Z" />
        <path d="M43 50 26 92M77 50l17 42M48 116l-12 73M72 116l12 73" />
      </svg>
      {items.map(([key, label, position]) => (
        <div key={key} className={`customer-assessment-segment-label customer-assessment-segment-label--${position}`}>
          <span>{label}</span>
          <strong>{metricText(segments[key])}</strong>
        </div>
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

          <DetailSection title="报告摘要">
            <div className="customer-assessment-summary">
              <div className="customer-assessment-score-card">
                <MetricIcon kind="score" />
                <span>{report.score.label}</span>
                <strong>{scoreText(report)}</strong>
                <small>分</small>
              </div>
              <MetricCardGrid
                className="customer-assessment-core-grid"
                items={[
                  ['体重', metricText(report.core.weight), 'weight'],
                  ['体脂率', metricText(report.core.bodyFatPercentage), 'fat'],
                  ['骨骼肌', metricText(report.core.skeletalMuscle), 'muscle'],
                  ['BMI', metricText(report.recommendations.bmi), 'bmi'],
                ]}
              />
            </div>
          </DetailSection>

          <DetailSection title="身体成分">
            <MetricCardGrid
              className="customer-assessment-composition-grid"
              items={[
                ['体脂肪', metricText(report.bodyComposition.bodyFat), 'fat'],
                ['无机盐', metricText(report.bodyComposition.mineral), 'mineral'],
                ['蛋白质', metricText(report.bodyComposition.protein), 'protein'],
                ['总水分', metricText(report.core.totalWater), 'water'],
                ['成分分数', metricText(report.bodyComposition.compositionScore), 'score'],
                ['腰臀比', metricText(report.bodyComposition.waistHipRatio), 'ratio'],
                ['SMI', metricText(report.bodyComposition.smi), 'muscle'],
              ]}
            />
          </DetailSection>

          <DetailSection title="肥胖分析">
            <MetricCardGrid
              className="customer-assessment-obesity-grid"
              items={[
                ['BMI', metricText(report.recommendations.bmi), 'bmi'],
                ['体脂率', metricText(report.core.bodyFatPercentage), 'fat'],
                ['腰臀比', metricText(report.bodyComposition.waistHipRatio), 'ratio'],
              ]}
            />
          </DetailSection>

          <div className="customer-assessment-segment-pair">
            <DetailSection title="节段肌肉">
              <SegmentBodyMap title="节段肌肉" segments={report.muscleContent} />
            </DetailSection>
            <DetailSection title="节段脂肪">
              <SegmentBodyMap title="节段脂肪" segments={report.fatContent} />
            </DetailSection>
          </div>

          <DetailSection title="体重控制目标">
            <MetricCardGrid
              className="customer-assessment-control-grid"
              items={[
                ['目标体重', metricText(report.recommendations.targetWeight), 'target'],
                ['去脂体重', metricText(report.recommendations.fatFreeMass), 'muscle'],
                ['体重控制', metricText(report.recommendations.weightControl, '', { signed: true }), 'control'],
                ['脂肪控制', metricText(report.recommendations.fatControl, '', { signed: true }), 'fat'],
                ['肌肉控制', metricText(report.recommendations.muscleControl, '', { signed: true }), 'muscle'],
                ['建议热量摄入', metricText(report.recommendations.recommendedCalories, report.source === 'BIACN' ? '—' : ''), 'calories'],
              ]}
            />
          </DetailSection>
        </div>
      )}
    </Drawer>
  );
}
