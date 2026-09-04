import { useState } from 'react';
import type { BeautyReport } from '../../../../shared/beauty-assessment';
import { BeautyAssessmentOverlay } from './BeautyAssessmentOverlay';

// Aoben beauty business copy, deliberately separate from vendor report data.
const BEAUTY_BRAND_MESSAGE = '科学了解肌肤，更好地照顾自我。';
export type BeautyShareSummary = Pick<BeautyReport['basic'], 'score' | 'scoreLevel' | 'skinType' | 'skinLabels'>;

export function BeautyAssessmentSharePreview({ summary, onClose }: { summary: BeautyShareSummary; onClose: () => void }) {
  const [feedback, setFeedback] = useState('');
  return <BeautyAssessmentOverlay title="分享报告" onClose={onClose}>
    <div className="aoben-beauty-share-card">
      <p>晒一下我的美容检测报告</p>
      <strong>{summary.score ?? '--'}</strong><span>综合得分 · {summary.scoreLevel ? `${summary.scoreLevel}级` : '--'}</span>
      <h3>{summary.skinType ?? '--'}</h3><p>{summary.skinLabels.join(' / ') || '--'}</p>
      <p className="aoben-beauty-brand-message">{BEAUTY_BRAND_MESSAGE}</p>
    </div>
    <div className="aoben-beauty-share-channels">
      <button type="button" onClick={() => setFeedback('原型演示：暂不保存到相册')}>保存到相册</button>
      <button type="button" onClick={() => setFeedback('原型演示：暂不调用微信分享')}>微信好友</button>
    </div>
    <p role="status" className="aoben-beauty-share-feedback">{feedback}</p>
  </BeautyAssessmentOverlay>;
}
