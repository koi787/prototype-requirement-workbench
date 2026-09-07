import { useMemo, useState } from 'react';
import {
  formatBeautyDetectTime,
  type BeautyReport,
} from '../../../../shared/beauty-assessment';
import type { CustomerRecord } from './customerTypes';
import {
  getBeautyReportByCustomerIdAndId,
  getBeautyReportsByCustomerId,
} from './customerBeautyAssessmentData';
import { CustomerBeautyAssessmentDetailDrawer } from './CustomerBeautyAssessmentDetailDrawer';

export interface CustomerBeautyAssessmentPanelProps {
  customer: CustomerRecord;
  initialRecordId?: string;
}

function scoreValue(value: number | null): string {
  return value === null ? '--' : String(value);
}

function levelValue(value: BeautyReport['basic']['scoreLevel']): string {
  return value === null ? '--' : `${value}级`;
}

function labelsValue(labels: readonly string[]): string {
  return labels.length > 0 ? labels.join(' / ') : '--';
}

export function CustomerBeautyAssessmentPanel({
  customer,
  initialRecordId,
}: CustomerBeautyAssessmentPanelProps) {
  const records = useMemo(
    () => getBeautyReportsByCustomerId(customer.customerId),
    [customer.customerId],
  );
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(initialRecordId ?? null);
  const selectedRecord = getBeautyReportByCustomerIdAndId(customer.customerId, selectedRecordId);

  return (
    <div className="customer-beauty-assessment-panel" data-customer-id={customer.customerId}>
      {records.length === 0 ? (
        <div className="customer-assessment-empty-state">暂无美容记录</div>
      ) : (
        <div className="customer-assessment-table-wrapper customer-beauty-assessment-table-wrapper">
          <table className="customer-assessment-table customer-beauty-assessment-table" aria-label="美容记录列表">
            <thead>
              <tr>
                <th>检测时间</th>
                <th>综合得分</th>
                <th>等级</th>
                <th>肤质类型</th>
                <th>肤质标签</th>
                <th>检测设备 IP</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.recordId} data-beauty-record-id={record.recordId}>
                  <td>{formatBeautyDetectTime(record.basic.detectTime)}</td>
                  <td>{scoreValue(record.basic.score)}</td>
                  <td>{levelValue(record.basic.scoreLevel)}</td>
                  <td>{record.basic.skinType ?? '--'}</td>
                  <td>{labelsValue(record.basic.skinLabels)}</td>
                  <td>--</td>
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
      )}

      <CustomerBeautyAssessmentDetailDrawer
        open={selectedRecord !== null}
        customer={customer}
        report={selectedRecord}
        onClose={() => setSelectedRecordId(null)}
      />
    </div>
  );
}
