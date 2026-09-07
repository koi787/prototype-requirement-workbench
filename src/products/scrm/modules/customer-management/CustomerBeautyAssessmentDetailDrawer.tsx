import { Drawer } from 'antd';
import { useId, useState } from 'react';
import {
  formatBeautyDetectTime,
  type BeautyReport,
  type BeautyReportItem,
} from '../../../../shared/beauty-assessment';
import type { CustomerRecord } from './customerTypes';

function emptyValue(value: string | null): string {
  return value ?? '--';
}

function scoreValue(value: number | null): string {
  return value === null ? '--' : String(value);
}

function sexValue(value: BeautyReport['basic']['sex']): string {
  if (value === 'female') return '女';
  if (value === 'male') return '男';
  return '--';
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="customer-beauty-detail-field">
      <span className="customer-beauty-detail-label">{label}</span>
      <span className="customer-beauty-detail-value">{value}</span>
    </div>
  );
}

function TextList({ entries }: { entries: readonly string[] }) {
  return (
    <ul className="customer-beauty-detail-text-list">
      {entries.map((entry, index) => <li key={`${entry}-${index}`}>{entry}</li>)}
    </ul>
  );
}

function ContentBlock({ title, entries }: { title: string; entries: readonly string[] }) {
  if (entries.length === 0) return null;
  return (
    <div className="customer-beauty-detail-content-block">
      <h4>{title}</h4>
      <TextList entries={entries} />
    </div>
  );
}

function BeautyReportItemRow({ item }: { item: BeautyReportItem }) {
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();
  return (
    <li className="customer-beauty-report-item">
      <button
        type="button"
        className="customer-beauty-report-item-toggle"
        aria-expanded={expanded}
        aria-controls={contentId}
        onClick={() => setExpanded((current) => !current)}
      >
        <span className="customer-beauty-report-item-name">{item.name}</span>
        <span className="customer-beauty-report-item-score">{scoreValue(item.score)}分</span>
        <span className="customer-beauty-report-item-level">{item.levelName ?? '--'}</span>
        <span className="customer-beauty-report-item-chevron" aria-hidden="true">{expanded ? '⌄' : '›'}</span>
      </button>
      <div id={contentId} className="customer-beauty-report-item-details" hidden={!expanded}>
        {expanded && (
          <>
            <ContentBlock title="问题分析" entries={item.problemAnalysis} />
            <ContentBlock title="日常护理建议" entries={item.careAdvice} />
          </>
        )}
      </div>
    </li>
  );
}

function BeautyAssessmentDetailBody({ report }: { report: BeautyReport }) {
  const level = report.basic.scoreLevel === null ? '--' : `${report.basic.scoreLevel}级`;
  const labels = report.basic.skinLabels.join(' / ') || '--';

  return (
    <div
      className="customer-beauty-assessment-detail-body"
      data-beauty-record-id={report.recordId}
    >
      <section className="customer-beauty-detail-section" aria-label="基础信息">
        <h3>基础信息</h3>
        <div className="customer-beauty-detail-fields">
          <DetailField label="性别" value={sexValue(report.basic.sex)} />
          <DetailField label="年龄" value={report.basic.age === null ? '--' : `${report.basic.age}岁`} />
          <DetailField label="综合得分" value={scoreValue(report.basic.score)} />
          <DetailField label="等级" value={level} />
          <DetailField label="肤质类型" value={emptyValue(report.basic.skinType)} />
          <DetailField label="肤质标签" value={labels} />
          <DetailField label="检测时间" value={formatBeautyDetectTime(report.basic.detectTime)} />
          <DetailField label="检测设备 IP" value="--" />
        </div>
      </section>

      {report.summary.problemAnalysis.length > 0 || report.summary.careAdvice.length > 0 ? (
        <section className="customer-beauty-detail-section" aria-label="综合建议">
          <h3>综合建议</h3>
          <div className="customer-beauty-detail-card">
            <ContentBlock title="问题分析" entries={report.summary.problemAnalysis} />
            <ContentBlock title="护理建议" entries={report.summary.careAdvice} />
          </div>
        </section>
      ) : (
        <section className="customer-beauty-detail-section" aria-label="综合建议">
          <h3>综合建议</h3>
          <div className="customer-beauty-detail-empty">暂无综合建议</div>
        </section>
      )}

      <section className="customer-beauty-detail-section" aria-label="单项报告">
        <h3>单项报告</h3>
        <div className="customer-beauty-detail-card customer-beauty-report-list-card">
          {report.items.length > 0 ? (
            <ul className="customer-beauty-report-list">
              {report.items.map((item) => <BeautyReportItemRow key={item.type} item={item} />)}
            </ul>
          ) : <div className="customer-beauty-detail-empty">暂无单项报告</div>}
        </div>
      </section>
    </div>
  );
}

export interface CustomerBeautyAssessmentDetailDrawerProps {
  open: boolean;
  customer: CustomerRecord;
  report: BeautyReport | null;
  onClose: () => void;
}

export function CustomerBeautyAssessmentDetailDrawer({
  open,
  customer,
  report,
  onClose,
}: CustomerBeautyAssessmentDetailDrawerProps) {
  return (
    <Drawer
      open={open}
      title="美容检测报告详情"
      size="70vw"
      placement="right"
      zIndex={1200}
      onClose={onClose}
      className="customer-beauty-assessment-detail-drawer"
      destroyOnClose
    >
      {report && (
        <div data-customer-id={customer.customerId}>
          <BeautyAssessmentDetailBody key={report.recordId} report={report} />
        </div>
      )}
    </Drawer>
  );
}
