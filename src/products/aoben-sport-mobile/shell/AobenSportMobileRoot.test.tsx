import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  BODY_ASSESSMENT_HISTORY_FIXTURES,
  getBodyAssessmentRecordsByCustomerId,
  BODY_ASSESSMENT_CUSTOMER_ID,
} from '../../../shared/body-assessment';
import { AobenSportMobileRoot } from './AobenSportMobileRoot';

describe('AobenSportMobileRoot', () => {
  afterEach(() => cleanup());

  it('enters the latest canonical BIACN report and does not expose source switching in production', () => {
    render(<AobenSportMobileRoot />);
    fireEvent.click(screen.getByRole('button', { name: '体测' }));
    expect(screen.getByTestId('aoben-report-root')).toHaveAttribute('data-report-source', 'BIACN');
    expect(screen.getByTestId('aoben-report-root')).toHaveAttribute('data-report-record-id', 'biacn-676106169');
    expect(screen.getByText('2026-08-20 12:02:51')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '切换体测报告来源' })).not.toBeInTheDocument();
    expect(screen.queryByTestId('bottom-nav')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '返回用户中心' }));
    expect(screen.getByTestId('aoben-mobile-root')).toBeInTheDocument();
  });

  it('opens and closes the history sheet without changing the current record', () => {
    render(<AobenSportMobileRoot initialView="body-assessment" />);
    const historyTrigger = screen.getByRole('button', { name: '打开历史记录' });
    expect(historyTrigger).toHaveClass('aoben-report-history-trigger');
    expect(historyTrigger).toHaveTextContent('历史记录');
    fireEvent.click(historyTrigger);
    expect(screen.getByRole('dialog', { name: '历史记录' })).toBeInTheDocument();
    expect(screen.getByTestId('aoben-report-root')).toHaveAttribute('data-report-record-id', 'biacn-676106169');
    const historyDialog = screen.getByRole('dialog', { name: '历史记录' });
    fireEvent.click(within(historyDialog).getByRole('button', { name: '关闭历史记录' }));
    expect(screen.queryByRole('dialog', { name: '历史记录' })).not.toBeInTheDocument();
    expect(screen.getByTestId('aoben-report-root')).toHaveAttribute('data-report-source', 'BIACN');
  });

  it('sorts mixed records, selects InBody, closes the sheet, and switches the complete report', () => {
    render(<AobenSportMobileRoot initialView="body-assessment" />);
    fireEvent.click(screen.getByRole('button', { name: '打开历史记录' }));
    const historyList = screen.getByTestId('aoben-history-list');
    const historyItems = within(historyList).getAllByRole('button');
    expect(historyItems[0]).toHaveTextContent('2026-08-20 12:02');
    expect(historyItems[0]).toHaveTextContent('BIACN');
    expect(historyItems[1]).toHaveTextContent('2025-05-14 13:38');
    expect(historyItems[1]).toHaveTextContent('InBody');

    fireEvent.click(historyItems[1]!);
    expect(screen.queryByRole('dialog', { name: '历史记录' })).not.toBeInTheDocument();
    expect(screen.getByTestId('aoben-report-root')).toHaveAttribute('data-report-record-id', 'inbody-legacy-27311');
    expect(screen.getByTestId('aoben-report-root')).toHaveAttribute('data-report-source', 'INBODY');
    expect(screen.getByText('2025-05-14 13:38:53')).toBeInTheDocument();
    expect(screen.getByText('80.7kg')).toBeInTheDocument();
  });

  it.each([
    ['single', BODY_ASSESSMENT_HISTORY_FIXTURES.single, 1],
    ['five', BODY_ASSESSMENT_HISTORY_FIXTURES.five, 5],
    ['many', BODY_ASSESSMENT_HISTORY_FIXTURES.many, 8],
  ] as const)('keeps all %s history records available to the sheet', (_name, records, expectedCount) => {
    render(<AobenSportMobileRoot initialView="body-assessment" assessmentRecords={records} initialHistoryOpen />);
    const historyList = screen.getByTestId('aoben-history-list');
    expect(within(historyList).getAllByRole('button')).toHaveLength(expectedCount);
    expect(historyList).toHaveClass('aoben-history-list');
  });

  it('shows an empty state without a fabricated report', () => {
    render(<AobenSportMobileRoot initialView="body-assessment" assessmentRecords={[]} initialHistoryOpen />);
    expect(screen.getAllByText('暂无历史记录')).toHaveLength(2);
    expect(screen.queryByRole('region', { name: '评分与核心数据' })).not.toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: '历史记录' })).toBeInTheDocument();
  });

  it('keeps the canonical SCRM record collection at two records', () => {
    expect(getBodyAssessmentRecordsByCustomerId(BODY_ASSESSMENT_CUSTOMER_ID)).toHaveLength(2);
  });
});
