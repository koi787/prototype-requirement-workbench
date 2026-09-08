import { useMemo, useState } from 'react';
import type { CustomerRecord } from './customerTypes';
import {
  formatCustomerBeautyDetectTime,
  getCustomerBeautyAssessmentById,
  getCustomerBeautyAssessments,
} from './customerBeautyAssessmentViewModel';
import { CustomerBeautyAssessmentDetailDrawer } from './CustomerBeautyAssessmentDetailDrawer';

export interface CustomerBeautyAssessmentPanelProps {
  customer: CustomerRecord;
  initialRecordId?: string;
}

function valueText(value: string | number | null): string {
  return value === null || value === '' ? '--' : String(value);
}

export function CustomerBeautyAssessmentPanel({ customer, initialRecordId }: CustomerBeautyAssessmentPanelProps) {
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(initialRecordId ?? null);
  const records = useMemo(
    () => getCustomerBeautyAssessments(customer.customerId),
    [customer.customerId],
  );
  const selectedRecord = getCustomerBeautyAssessmentById(customer.customerId, selectedRecordId);

  return (
    <div className="customer-beauty-assessment-panel" data-customer-id={customer.customerId}>
      {records.length === 0 ? (
        <div className="customer-assessment-empty-state">暂无美容记录</div>
      ) : (
        <div className="customer-beauty-assessment-table-wrapper">
          <table className="customer-beauty-assessment-table" aria-label="美容记录列表">
            <thead>
              <tr>
                <th>检测时间</th>
                <th>综合得分</th>
                <th>等级</th>
                <th>肤质类型</th>
                <th>肤质标签</th>
                <th>检测设备序列号</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.report.recordId} data-record-id={record.report.recordId}>
                  <td>{formatCustomerBeautyDetectTime(record.report.basic.detectTime)}</td>
                  <td>{valueText(record.report.basic.score)}</td>
                  <td>{valueText(record.report.basic.scoreLevel)}</td>
                  <td>{valueText(record.report.basic.skinType)}</td>
                  <td>{record.report.basic.skinLabels.length > 0 ? record.report.basic.skinLabels.join('、') : '--'}</td>
                  <td>{valueText(record.deviceSerialNumber)}</td>
                  <td>
                    <button
                      type="button"
                      className="customer-assessment-view-action"
                      onClick={() => setSelectedRecordId(record.report.recordId)}
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
        key={selectedRecord?.report.recordId ?? 'closed'}
        open={selectedRecord !== null}
        customer={customer}
        record={selectedRecord}
        onClose={() => setSelectedRecordId(null)}
      />
    </div>
  );
}
