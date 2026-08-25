import { useMemo, useState } from 'react';
import {
  formatAssessmentMetric,
  getBodyAssessmentRecordsByCustomerId,
  type BodyAssessmentReport,
} from '../../../../shared/body-assessment';
import type { CustomerRecord } from './customerTypes';
import { CustomerAssessmentDetailDrawer } from './CustomerAssessmentDetailDrawer';

export type CustomerAssessmentView = 'assessment' | 'beauty';
export type CustomerAssessmentSourceFilter = 'ALL' | 'INBODY' | 'BIACN';

export interface CustomerBodyAssessmentPanelProps {
  customer: CustomerRecord;
  initialView?: CustomerAssessmentView;
  initialSource?: CustomerAssessmentSourceFilter;
  initialRecordId?: string;
}

const SOURCE_FILTERS: readonly { value: CustomerAssessmentSourceFilter; label: string }[] = [
  { value: 'ALL', label: '全部' },
  { value: 'INBODY', label: 'InBody' },
  { value: 'BIACN', label: 'BIACN' },
];

function scoreText(report: BodyAssessmentReport): string {
  if (report.score.value === null) return '--';
  const precision = report.score.precision ?? (Number.isInteger(report.score.value) ? 0 : 1);
  return report.score.value.toFixed(precision);
}

function sourceLabel(source: BodyAssessmentReport['source']): string {
  return source === 'INBODY' ? 'InBody' : 'BIACN';
}

function metricText(report: BodyAssessmentReport, metric: keyof BodyAssessmentReport['core']): string {
  return formatAssessmentMetric(report.core[metric], { emptyValue: '--' });
}

function AssessmentEmptyState() {
  return <div className="customer-assessment-empty-state">暂无美容记录</div>;
}

export function CustomerBodyAssessmentPanel({
  customer,
  initialView = 'assessment',
  initialSource = 'ALL',
  initialRecordId,
}: CustomerBodyAssessmentPanelProps) {
  const [view, setView] = useState<CustomerAssessmentView>(initialView);
  const [source, setSource] = useState<CustomerAssessmentSourceFilter>(initialSource);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(initialRecordId ?? null);
  const records = useMemo(
    () => getBodyAssessmentRecordsByCustomerId(customer.customerId),
    [customer.customerId],
  );
  const visibleRecords = source === 'ALL' ? records : records.filter((record) => record.source === source);
  const selectedRecord = records.find((record) => record.recordId === selectedRecordId) ?? null;

  return (
    <div className="customer-assessment-panel" data-customer-id={customer.customerId}>
      <div className="customer-assessment-subtabs" role="tablist" aria-label="体测美容记录类型">
        <button
          type="button"
          role="tab"
          aria-selected={view === 'assessment'}
          className={view === 'assessment' ? 'is-active' : ''}
          onClick={() => setView('assessment')}
        >
          体测记录
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === 'beauty'}
          className={view === 'beauty' ? 'is-active' : ''}
          onClick={() => setView('beauty')}
        >
          美容记录
        </button>
      </div>

      {view === 'assessment' ? (
        <>
          <div className="customer-assessment-source-filters" aria-label="体测记录来源">
            {SOURCE_FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                className={source === item.value ? 'is-active' : ''}
                aria-pressed={source === item.value}
                onClick={() => {
                  setSource(item.value);
                  setSelectedRecordId(null);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="customer-assessment-table-wrapper">
            <table className="customer-assessment-table" aria-label="体测记录列表">
              <thead>
                <tr>
                  <th>检测时间</th>
                  <th>数据来源</th>
                  <th>身体评分</th>
                  <th>体重</th>
                  <th>体脂率</th>
                  <th>BMI</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {visibleRecords.map((record) => (
                  <tr key={record.recordId} data-record-id={record.recordId}>
                    <td>{record.measuredAt || '--'}</td>
                    <td>{record.source ? sourceLabel(record.source) : '--'}</td>
                    <td>{scoreText(record)}</td>
                    <td>{metricText(record, 'weight')}</td>
                    <td>{formatAssessmentMetric(record.core.bodyFatPercentage, { emptyValue: '--' })}</td>
                    <td>{formatAssessmentMetric(record.recommendations.bmi, { emptyValue: '--' })}</td>
                    <td>
                      <button
                        type="button"
                        className="customer-assessment-view-action"
                        onClick={() => setSelectedRecordId(record.recordId)}
                      >
                        查看
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : <AssessmentEmptyState />}

      <CustomerAssessmentDetailDrawer
        open={selectedRecord !== null}
        customer={customer}
        report={selectedRecord}
        onClose={() => setSelectedRecordId(null)}
      />
    </div>
  );
}
