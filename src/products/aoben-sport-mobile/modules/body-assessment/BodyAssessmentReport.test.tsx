import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BODY_ASSESSMENT_REPORTS } from '../../../../shared/body-assessment';
import { BodyAssessmentReport } from './BodyAssessmentReport';

describe('BodyAssessmentReport', () => {
  afterEach(() => cleanup());

  it('renders the report provided by the current record without owning source state', () => {
    render(<BodyAssessmentReport report={BODY_ASSESSMENT_REPORTS.INBODY} records={[BODY_ASSESSMENT_REPORTS.INBODY]} currentRecordId="inbody-legacy-27311" />);
    expect(screen.getByTestId('aoben-report-root')).toHaveAttribute('data-report-source', 'INBODY');
    expect(screen.getByText('80.7kg')).toBeInTheDocument();
    expect(screen.getByText('建议的热量摄入')).toBeInTheDocument();
    expect(screen.getByText('2449')).toBeInTheDocument();
    expect(screen.getByText('7.80kg')).toBeInTheDocument();
    expect(screen.getByText(/您高于标准体重/)).toBeInTheDocument();
    const recommendationGrid = document.querySelector('.aoben-report-recommendation-grid');
    expect(recommendationGrid).toBeInTheDocument();
    expect(recommendationGrid?.children).toHaveLength(7);
    expect(recommendationGrid?.querySelector('.aoben-report-calorie')).toBeInTheDocument();

    expect(screen.queryByRole('button', { name: '切换体测报告来源' })).not.toBeInTheDocument();
    const historyTrigger = screen.getByRole('button', { name: '打开历史记录' });
    expect(historyTrigger).toBeInTheDocument();
    expect(historyTrigger.parentElement).toHaveClass('aoben-report-history-bar');
    expect(document.querySelector('.aoben-report-date-row')).not.toContainElement(historyTrigger);
  });

  it('supports a fixed BIACN record and back navigation', () => {
    const onBack = vi.fn();
    render(<BodyAssessmentReport report={BODY_ASSESSMENT_REPORTS.BIACN} records={[BODY_ASSESSMENT_REPORTS.BIACN]} currentRecordId="biacn-676106169" onBack={onBack} />);
    expect(screen.getByTestId('aoben-report-root')).toHaveAttribute('data-report-source', 'BIACN');
    fireEvent.click(screen.getByRole('button', { name: '返回用户中心' }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
