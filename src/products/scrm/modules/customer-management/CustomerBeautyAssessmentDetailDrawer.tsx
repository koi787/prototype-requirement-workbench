import { Drawer } from 'antd';
import { useState } from 'react';
import type { CustomerRecord } from './customerTypes';
import {
  formatBeautyItemLevel,
  formatCustomerBeautyDetectTime,
  type CustomerBeautyAssessmentAdminRecord,
} from './customerBeautyAssessmentViewModel';

function valueText(value: string | number | null): string {
  return value === null || value === '' ? '--' : String(value);
}

function sexText(value: 'female' | 'male' | null): string {
  if (value === 'female') return '女';
  if (value === 'male') return '男';
  return '--';
}

function TextList({ items }: { items: readonly string[] }) {
  return (
    <ul className="customer-beauty-assessment-text-list">
      {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  );
}

function BasicInfo({ record }: { record: CustomerBeautyAssessmentAdminRecord }) {
  const { basic } = record.report;
  const fields = [
    ['性别', sexText(basic.sex)],
    ['年龄', valueText(basic.age)],
    ['综合得分', valueText(basic.score)],
    ['等级', valueText(basic.scoreLevel)],
    ['肤质类型', valueText(basic.skinType)],
    ['肤质标签', basic.skinLabels.length > 0 ? basic.skinLabels.join('、') : '--'],
    ['检测时间', formatCustomerBeautyDetectTime(basic.detectTime)],
    ['检测设备序列号', valueText(record.deviceSerialNumber)],
  ] as const;

  return (
    <section className="customer-beauty-assessment-detail-section" aria-labelledby="customer-beauty-basic-title">
      <h3 id="customer-beauty-basic-title">基础信息</h3>
      <dl className="customer-beauty-assessment-basic-grid">
        {fields.map(([label, value]) => (
          <div key={label} className="customer-beauty-assessment-basic-field">
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Summary({ record }: { record: CustomerBeautyAssessmentAdminRecord }) {
  const { summary } = record.report;
  if (summary.problemAnalysis.length === 0 && summary.careAdvice.length === 0) return null;
  return (
    <section className="customer-beauty-assessment-detail-section" aria-labelledby="customer-beauty-summary-title">
      <h3 id="customer-beauty-summary-title">综合建议</h3>
      <div className="customer-beauty-assessment-summary">
        {summary.problemAnalysis.length > 0 && (
          <div className="customer-beauty-assessment-summary-block">
            <h4>问题分析</h4>
            <TextList items={summary.problemAnalysis} />
          </div>
        )}
        {summary.careAdvice.length > 0 && (
          <div className="customer-beauty-assessment-summary-block">
            <h4>护理建议</h4>
            <TextList items={summary.careAdvice} />
          </div>
        )}
      </div>
    </section>
  );
}

export interface CustomerBeautyAssessmentDetailDrawerProps {
  open: boolean;
  customer: CustomerRecord;
  record: CustomerBeautyAssessmentAdminRecord | null;
  onClose: () => void;
}

export function CustomerBeautyAssessmentDetailDrawer({
  open,
  customer,
  record,
  onClose,
}: CustomerBeautyAssessmentDetailDrawerProps) {
  const [expandedItems, setExpandedItems] = useState<ReadonlySet<string>>(new Set());

  const toggleItem = (recordId: string) => {
    setExpandedItems((current) => {
      const next = new Set(current);
      if (next.has(recordId)) next.delete(recordId);
      else next.add(recordId);
      return next;
    });
  };

  return (
    <Drawer
      open={open}
      title="美容检测报告详情"
      size="70vw"
      placement="right"
      zIndex={1100}
      onClose={onClose}
      className="customer-beauty-assessment-detail-drawer"
      destroyOnClose
    >
      {record && (
        <div className="customer-beauty-assessment-detail-body" data-customer-id={customer.customerId}>
          <div className="customer-beauty-assessment-detail-context">
            <span>客户：{customer.name}</span>
            <span>记录时间：{formatCustomerBeautyDetectTime(record.report.basic.detectTime)}</span>
          </div>
          <BasicInfo record={record} />
          <Summary record={record} />
          <section className="customer-beauty-assessment-detail-section" aria-labelledby="customer-beauty-items-title">
            <h3 id="customer-beauty-items-title">单项报告</h3>
            {record.report.items.length === 0 ? (
              <div className="customer-assessment-empty-state">暂无单项报告</div>
            ) : (
              <div className="customer-beauty-assessment-items">
                {record.report.items.map((item) => {
                  const expanded = expandedItems.has(item.type);
                  const hasDetailContent = item.problemAnalysis.length > 0 || item.careAdvice.length > 0;
                  const itemHeader = (
                    <>
                      <span>{item.name}</span>
                      <span className="customer-beauty-assessment-item-metrics">
                        <span>得分 {valueText(item.score)}</span>
                        <span>等级 {formatBeautyItemLevel(item)}</span>
                      </span>
                      {hasDetailContent && <span aria-hidden="true">{expanded ? '收起' : '展开'}</span>}
                    </>
                  );
                  return (
                    <div key={item.type} className="customer-beauty-assessment-item">
                      {hasDetailContent ? (
                        <button
                          type="button"
                          className="customer-beauty-assessment-item-toggle"
                          aria-expanded={expanded}
                          onClick={() => toggleItem(item.type)}
                        >
                          {itemHeader}
                        </button>
                      ) : <div className="customer-beauty-assessment-item-toggle">{itemHeader}</div>}
                      {expanded && hasDetailContent && (
                        <div className="customer-beauty-assessment-item-content">
                          {item.problemAnalysis.length > 0 && (
                            <div><h4>问题分析</h4><TextList items={item.problemAnalysis} /></div>
                          )}
                          {item.careAdvice.length > 0 && (
                            <div><h4>日常护理建议</h4><TextList items={item.careAdvice} /></div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </Drawer>
  );
}
