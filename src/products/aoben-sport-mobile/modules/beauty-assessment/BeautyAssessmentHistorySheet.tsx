import type { BeautyReport } from '../../../../shared/beauty-assessment';
import { BeautyAssessmentOverlay } from './BeautyAssessmentOverlay';
import { formatBeautyDetectTime } from './beautyAssessmentFormatters';

export function BeautyAssessmentHistorySheet({ records, currentRecordId, onSelect, onClose }: {
  records: readonly BeautyReport[]; currentRecordId: string | null;
  onSelect: (id: string) => void; onClose: () => void;
}) {
  const time = (record: BeautyReport) => {
    const parsed = Date.parse(record.basic.detectTime ?? '');
    return Number.isFinite(parsed) ? parsed : -Infinity;
  };
  const sorted = [...records].sort((a, b) => {
    const left = time(a); const right = time(b);
    return left === right ? 0 : left > right ? -1 : 1;
  });
  return <BeautyAssessmentOverlay title="美容检测历史记录" onClose={onClose}>
    <ul className="aoben-beauty-history-list" aria-label="美容检测历史列表">
      {sorted.map(({ recordId, basic }) => <li key={recordId}>
        <button type="button" aria-pressed={recordId === currentRecordId} onClick={() => onSelect(recordId)}>
          <span>{formatBeautyDetectTime(basic.detectTime)}</span>
          <span>综合得分 {basic.score ?? '--'} · {basic.scoreLevel ? `${basic.scoreLevel}级` : '--'} · {basic.skinType ?? '--'}</span>
        </button>
      </li>)}
    </ul>
    {sorted.length === 0 && <p className="aoben-beauty-empty">暂无美容检测记录</p>}
  </BeautyAssessmentOverlay>;
}
