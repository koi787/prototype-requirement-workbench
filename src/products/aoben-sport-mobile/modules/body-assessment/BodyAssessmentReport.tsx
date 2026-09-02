import { type ReactNode } from 'react';
import { ProfileAvatar } from '../../shell/mobileIcons';
import {
  formatAbsoluteAssessmentMetric,
  formatAssessmentMetric,
} from '../../../../shared/body-assessment';
import type {
  AssessmentMetric,
  BodyAssessmentReport as BodyAssessmentReportModel,
} from '../../../../shared/body-assessment';
import { HistoryBottomSheet } from './HistoryBottomSheet';
import './bodyAssessment.css';

const SEGMENT_LABELS: readonly { key: keyof BodyAssessmentReportModel['muscleContent']; label: string }[] = [
  { key: 'rightArm', label: '右上肢' },
  { key: 'leftArm', label: '左上肢' },
  { key: 'trunk', label: '躯干区' },
  { key: 'rightLeg', label: '右下肢' },
  { key: 'leftLeg', label: '左下肢' },
];

function MetricText({ metric: item, signed = false, emptyValue = '' }: { metric: AssessmentMetric; signed?: boolean; emptyValue?: string }) {
  if (item.value === null) return <span className="aoben-report-empty-value" aria-label="无数据">{emptyValue}</span>;
  return <>{formatAssessmentMetric(item, { signed })}</>;
}

function SegmentRows({ segments }: { segments: BodyAssessmentReportModel['muscleContent'] }) {
  return (
    <div className="aoben-report-segment-rows">
      {SEGMENT_LABELS.map(({ key, label }) => {
        const item = segments[key];
        return (
          <div className="aoben-report-segment-row" key={key}>
            <strong>{label}</strong>
            <span className="aoben-report-segment-track"><i style={{ width: item.value === null ? '0%' : `${Math.min(100, Math.max(4, item.value * 3))}%` }} /></span>
            <b><MetricText metric={item} /></b>
          </div>
        );
      })}
    </div>
  );
}

function ReportFigure({ report }: { report: BodyAssessmentReportModel }) {
  const labels = [
    ['体脂肪', report.bodyComposition.bodyFat],
    ['无机盐', report.bodyComposition.mineral],
    ['蛋白质', report.bodyComposition.protein],
    ['成分分数', report.bodyComposition.compositionScore],
    ['脂肪等级', report.bodyComposition.fatGrade],
    ['腰臀比', report.bodyComposition.waistHipRatio],
    ['SMI', report.bodyComposition.smi],
  ] as const;

  return (
    <div className="aoben-report-figure-wrap">
      <svg className="aoben-report-body-figure" viewBox="0 0 110 230" aria-hidden="true">
        <ellipse cx="55" cy="24" rx="12" ry="15" fill="#edf1f0" stroke="#d9dedb" />
        <path d="M45 41c-7 13-8 36-5 63l-5 50 11 1 9-38 9 38 11-1-5-50c3-27 2-50-5-63l-10 13z" fill="#d9f3e6" stroke="#bdddcf" />
        <path d="M45 45 28 93l7 3 19-30 19 30 7-3-17-48" fill="#ccf2e4" stroke="#b5daca" />
        <path d="M44 153 36 213M66 153l8 60" stroke="#c9dcd4" strokeWidth="7" strokeLinecap="round" />
      </svg>
      <div className="aoben-report-figure-labels">
        {labels.map(([label, item]) => <span key={label}><b>{label}</b> <MetricText metric={item} /></span>)}
      </div>
    </div>
  );
}

function ReportSection({ title, children, className = '' }: { title: string; children: ReactNode; className?: string }) {
  return <section className={`aoben-report-card ${className}`}><h2>{title}</h2>{children}</section>;
}

export interface BodyAssessmentReportProps {
  report: BodyAssessmentReportModel | null;
  records: readonly BodyAssessmentReportModel[];
  currentRecordId: string | null;
  historyOpen?: boolean;
  onBack?: () => void;
  onHistoryOpen?: () => void;
  onHistoryClose?: () => void;
  onHistorySelect?: (recordId: string) => void;
}

export function BodyAssessmentReport({
  report,
  records,
  currentRecordId,
  historyOpen = false,
  onBack,
  onHistoryOpen,
  onHistoryClose,
  onHistorySelect,
}: BodyAssessmentReportProps) {
  const source = report?.source;
  const scoreMetric: AssessmentMetric = report === null
    ? { value: null, unit: '分' }
    : report.score.precision === undefined
      ? { value: report.score.value, unit: '分' }
      : { value: report.score.value, unit: '分', precision: report.score.precision };
  const excessWeight = report ? formatAbsoluteAssessmentMetric(report.recommendations.weightControl, 2, 'kg') : '';

  return (
    <div className="aoben-mobile-story-stage aoben-report-stage" data-testid="aoben-report-root" data-report-source={source ?? ''} data-report-record-id={currentRecordId ?? ''}>
      <div className="aoben-mobile-viewport aoben-report-viewport">
        <div className="aoben-mobile-scroll-area aoben-report-scroll-area" data-testid="aoben-report-scroll-area">
          <main className="aoben-report-page">
            <header className="aoben-report-header">
              <button type="button" aria-label="返回用户中心" onClick={onBack}>‹</button>
              <h1>身体数据</h1>
            </header>

            {report ? (
              <>
                <div className="aoben-report-history-bar">
                  <button type="button" className="aoben-report-history-trigger" aria-label="打开历史记录" onClick={onHistoryOpen}>历史记录 <span aria-hidden="true">›</span></button>
                </div>
                <section className="aoben-report-hero" aria-label="评分与核心数据">
                  <div className="aoben-report-profile"><span className="aoben-report-avatar"><ProfileAvatar /></span><span>ID：{report.profile.displayId}<br />{report.profile.age}岁 | {report.profile.height}cm</span></div>
                  <div className="aoben-report-score" aria-label="身体评分">
                    <span className="aoben-report-score-arc" aria-hidden="true" />
                    <strong>{report.score.label}<b><MetricText metric={scoreMetric} /></b></strong>
                  </div>
                  <div className="aoben-report-illustration" aria-hidden="true"><span className="aoben-report-figure-head" /><i /><b /><em /></div>
                  <div className="aoben-report-date-row">
                    <time>{report.measuredAt}</time>
                  </div>
                  <div className="aoben-report-core-grid">
                    {([
                      ['体重', report.core.weight],
                      ['体脂率', report.core.bodyFatPercentage],
                      ['骨骼肌', report.core.skeletalMuscle],
                      ['总水分', report.core.totalWater],
                    ] as readonly [string, AssessmentMetric][]).map(([label, item]) => <div key={label}><strong><MetricText metric={item} /></strong><span>{label}</span></div>)}
                  </div>
                </section>

                <ReportSection title="肌肉含量"><div className="aoben-report-legend"><span>低标准</span><span>标准</span><span>超标准</span></div><SegmentRows segments={report.muscleContent} /></ReportSection>
                <ReportSection title="身体成分" className="aoben-report-composition"><ReportFigure report={report} /></ReportSection>
                <ReportSection title="脂肪含量"><div className="aoben-report-legend"><span>低标准</span><span>标准</span><span>超标准</span></div><SegmentRows segments={report.fatContent} /></ReportSection>

                <section className="aoben-report-recommendation" aria-label="调节建议">
                  <div className="aoben-report-recommendation-art" aria-hidden="true">
                    <span>加油～</span>
                    <b><span>您高于标准体重</span><strong>{excessWeight}</strong></b>
                  </div>
                  <div className="aoben-report-recommendation-grid">
                    {([
                      ['BMI', report.recommendations.bmi],
                      ['去脂体重', report.recommendations.fatFreeMass],
                      ['目标体重', report.recommendations.targetWeight],
                      ['体重控制', report.recommendations.weightControl],
                      ['脂肪控制', report.recommendations.fatControl],
                      ['肌肉控制', report.recommendations.muscleControl],
                    ] as readonly [string, AssessmentMetric][]).map(([label, item]) => <div key={label}><span>{label}</span><strong><MetricText metric={item} signed={label === '肌肉控制'} /></strong></div>)}
                    <div className="aoben-report-calorie"><span>建议的热量摄入</span><strong><MetricText metric={report.recommendations.recommendedCalories} emptyValue={source === 'BIACN' ? '—' : ''} /></strong></div>
                  </div>
                </section>
              </>
            ) : <div className="aoben-report-empty-state">暂无历史记录</div>}
          </main>
        </div>
        <div className="aoben-window-controls" aria-hidden="true"><span>•••</span><i /><b /></div>
        {historyOpen && onHistoryClose && onHistorySelect && (
          <HistoryBottomSheet records={records} currentRecordId={currentRecordId} onClose={onHistoryClose} onSelect={onHistorySelect} />
        )}
      </div>
    </div>
  );
}
