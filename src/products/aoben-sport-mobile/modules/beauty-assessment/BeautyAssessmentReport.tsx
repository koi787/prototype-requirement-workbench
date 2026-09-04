import { useId, useState } from 'react';
import { BEAUTY_REPORTS, selectBeautyReport } from '../../../../shared/beauty-assessment';
import type { BeautyReport, BeautyReportItem } from '../../../../shared/beauty-assessment';
import './beautyAssessment.css';
import { BeautyAssessmentHistorySheet } from './BeautyAssessmentHistorySheet';
import { BeautyAssessmentSharePreview } from './BeautyAssessmentSharePreview';
import { formatBeautyDetectTime } from './beautyAssessmentFormatters';

export interface BeautyAssessmentReportProps {
  records?: readonly BeautyReport[];
  currentRecordId?: string | null;
  loading?: boolean;
  onBack?: () => void;
}

function ReportTextList({ entries }: { entries: readonly string[] }) {
  return <ul className="aoben-beauty-text-list">{entries.map((text, index) => <li key={index}>{text}</li>)}</ul>;
}

function ReportItem({ item }: { item: BeautyReportItem }) {
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();
  return (
    <li className="aoben-beauty-item">
      <button type="button" className="aoben-beauty-item-toggle" aria-expanded={expanded} aria-controls={contentId} onClick={() => setExpanded(!expanded)}>
        <span className="aoben-beauty-item-name"><span className="aoben-beauty-item-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M12 3c-2.4 3.4-6 7.1-6 11a6 6 0 0 0 12 0c0-3.9-3.6-7.6-6-11Z" /><path d="M9 14a3 3 0 0 0 3 3" /></svg></span>{item.name}</span>
        <span className="aoben-beauty-item-score">{item.score === null ? '--' : `${item.score}分`}</span>
        <span className="aoben-beauty-item-level" data-grade={item.levelName ?? undefined}>{item.levelName ?? '--'}</span>
        <span className="aoben-beauty-chevron" aria-hidden="true">{expanded ? '⌄' : '›'}</span>
      </button>
      <div id={contentId} hidden={!expanded}>
        {expanded && <>
          {item.problemAnalysis.length > 0 && <div className="aoben-beauty-item-content"><h3>问题分析</h3><ReportTextList entries={item.problemAnalysis} /></div>}
          {item.careAdvice.length > 0 && <div className="aoben-beauty-item-content"><h3>日常护理建议</h3><ReportTextList entries={item.careAdvice} /></div>}
        </>}
      </div>
    </li>
  );
}

/** An externally changed initial selection starts a fresh local report session. */
export function BeautyAssessmentReport(props: BeautyAssessmentReportProps) {
  return <BeautyReportContent key={props.currentRecordId === undefined ? 'latest' : `record:${props.currentRecordId}`} {...props} />;
}

function BeautyReportContent({ records = BEAUTY_REPORTS, currentRecordId: initialRecordId, loading = false, onBack }: BeautyAssessmentReportProps) {
  const [selectedId, setSelectedId] = useState(initialRecordId);
  const { currentRecord, currentRecordId } = selectBeautyReport(records, selectedId);
  const [overlay, setOverlay] = useState<'history' | 'share' | null>(null);
  const shareSummary = currentRecord ? {
    score: currentRecord.basic.score, scoreLevel: currentRecord.basic.scoreLevel,
    skinType: currentRecord.basic.skinType, skinLabels: currentRecord.basic.skinLabels,
  } : null;

  return (
    <div className="aoben-beauty-stage">
      <main className="aoben-beauty-viewport" aria-label="美容检测报告" aria-busy={loading}>
        <div className="aoben-beauty-page-content" inert={overlay !== null}>
        <header className="aoben-beauty-header">
          {onBack && <button type="button" className="aoben-beauty-back" aria-label="返回用户中心" onClick={onBack}>‹</button>}
          <h1>美容检测报告</h1>
          <button type="button" className="aoben-beauty-history-entry" disabled={loading || overlay !== null} onClick={() => setOverlay('history')}>查看历史记录</button>
        </header>
        <div className="aoben-beauty-scroll-area">
          {loading ? <p role="status">正在加载美容检测报告</p> : currentRecord ? (
            <>
              <section className="aoben-beauty-card aoben-beauty-overall-card" aria-label="整体情况">
                <h2>整体情况</h2>
                <dl className="aoben-beauty-overall">
                  <div className="aoben-beauty-score-group">
                    <svg className="aoben-beauty-score-ring" viewBox="0 0 120 120" aria-hidden="true" fill="none">
                      <circle cx="60" cy="60" r="53" className="aoben-beauty-score-track" />
                      <circle cx="60" cy="60" r="53" className="aoben-beauty-score-progress" pathLength="100" strokeDasharray={`${currentRecord.basic.score ?? 0} 100`} />
                    </svg>
                    <div className="aoben-beauty-score-value"><dt>综合得分</dt><dd>{currentRecord.basic.score ?? '--'}</dd></div>
                    <div className="aoben-beauty-score-level"><dt className="aoben-beauty-visually-hidden">综合等级</dt><dd>{currentRecord.basic.scoreLevel ? `${currentRecord.basic.scoreLevel}级` : '--'}</dd></div>
                  </div>
                  <div className="aoben-beauty-skin-group">
                    <div className="aoben-beauty-skin-type"><dt>肤质类型</dt><dd>{currentRecord.basic.skinType ?? '--'}</dd></div>
                    <div className="aoben-beauty-skin-labels"><dt className="aoben-beauty-visually-hidden">肤质标签</dt><dd>
                      {currentRecord.basic.skinLabels.length > 0 && <span className="aoben-beauty-tags" aria-hidden="true">{currentRecord.basic.skinLabels.map((label, index) => <span key={index} data-skin-label={label}>{label}</span>)}</span>}
                      <span className="aoben-beauty-label-text">{currentRecord.basic.skinLabels.join(' / ') || '--'}</span>
                    </dd></div>
                  </div>
                </dl>
                <dl className="aoben-beauty-basic-info">
                  <div><dt>性别</dt><dd>{currentRecord.basic.sex === 'female' ? '女' : currentRecord.basic.sex === 'male' ? '男' : '--'}</dd></div>
                  <div><dt>年龄</dt><dd>{currentRecord.basic.age === null ? '--' : `${currentRecord.basic.age}岁`}</dd></div>
                  <div><dt>检测次数</dt><dd>{currentRecord.basic.testCount === null ? '--' : `第${currentRecord.basic.testCount}次`}</dd></div>
                </dl>
                <p className="aoben-beauty-detect-time">检测时间 <time>{formatBeautyDetectTime(currentRecord.basic.detectTime)}</time></p>
              </section>
              {currentRecord.summary.problemAnalysis.length > 0 && <section className="aoben-beauty-card" aria-label="问题分析">
                <h2>问题分析</h2>
                <div className="aoben-beauty-card-body aoben-beauty-problem-text"><ReportTextList entries={currentRecord.summary.problemAnalysis} /></div>
              </section>}
              {currentRecord.summary.careAdvice.length > 0 && <section className="aoben-beauty-card" aria-label="护理建议">
                <h2>护理建议</h2>
                <div className="aoben-beauty-card-body aoben-beauty-care-text"><ReportTextList entries={currentRecord.summary.careAdvice} /></div>
              </section>}
              <section className="aoben-beauty-card" aria-label="详细分析" key={currentRecord.recordId}>
                <h2>详细分析</h2>
                <div className="aoben-beauty-card-body aoben-beauty-items-body">{currentRecord.items.length > 0 ? <ul className="aoben-beauty-items">{currentRecord.items.map((item) => <ReportItem key={item.type} item={item} />)}</ul> : <p className="aoben-beauty-empty">暂无数据</p>}</div>
              </section>
            </>
          ) : <p role="status">{records.length === 0 ? '暂无美容检测记录' : '未找到可展示的美容检测报告'}</p>}
        </div>
        </div>
        {!loading && currentRecord && <button type="button" hidden={overlay !== null} className="aoben-beauty-share-entry" onClick={() => setOverlay('share')}>分享报告</button>}
        {overlay === 'history' && <BeautyAssessmentHistorySheet records={records} currentRecordId={currentRecordId} onClose={() => setOverlay(null)} onSelect={(id) => { setSelectedId(id); setOverlay(null); }} />}
        {overlay === 'share' && shareSummary && <BeautyAssessmentSharePreview summary={shareSummary} onClose={() => setOverlay(null)} />}
      </main>
    </div>
  );
}
