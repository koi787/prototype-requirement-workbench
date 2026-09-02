import { getBodyAssessmentScoreMeta } from '../../../../shared/body-assessment';
import type { BodyAssessmentReport } from '../../../../shared/body-assessment';

function formatHistoryDate(measuredAt: string): string {
  return measuredAt.length > 16 ? measuredAt.slice(0, 16) : measuredAt;
}

export interface HistoryBottomSheetProps {
  records: readonly BodyAssessmentReport[];
  currentRecordId: string | null;
  onClose: () => void;
  onSelect: (recordId: string) => void;
}

export function HistoryBottomSheet({ records, currentRecordId, onClose, onSelect }: HistoryBottomSheetProps) {
  return (
    <div className="aoben-history-overlay" data-testid="aoben-history-overlay">
      <button type="button" className="aoben-history-backdrop" aria-label="关闭历史记录" onClick={onClose} />
      <section className="aoben-history-sheet" role="dialog" aria-modal="true" aria-label="历史记录">
        <div className="aoben-history-sheet-header">
          <h2>历史记录</h2>
          <button type="button" className="aoben-history-close" aria-label="关闭历史记录" onClick={onClose}>×</button>
        </div>
        {records.length === 0 ? (
          <p className="aoben-history-empty">暂无历史记录</p>
        ) : (
          <div className="aoben-history-list" data-testid="aoben-history-list">
            {records.map((record) => {
              const scoreMeta = getBodyAssessmentScoreMeta(record.score.value);
              const isCurrent = record.recordId === currentRecordId;
              return (
                <button
                  type="button"
                  className={`aoben-history-item${isCurrent ? ' is-current' : ''}`}
                  aria-current={isCurrent ? 'true' : undefined}
                  key={record.recordId}
                  onClick={() => onSelect(record.recordId)}
                >
                  <span className="aoben-history-check" aria-hidden="true">{isCurrent ? '✓' : ''}</span>
                  <span className="aoben-history-date">{formatHistoryDate(record.measuredAt)}</span>
                  <span className="aoben-history-source">{record.source === 'BIACN' ? 'BIACN' : 'InBody'}</span>
                  <span className="aoben-history-score">{record.score.value === null ? '—' : `${record.score.value}分`}</span>
                  <span className="aoben-history-level">{scoreMeta?.label ?? '—'}</span>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
