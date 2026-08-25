import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BodyAssessmentReport } from './BodyAssessmentReport';

describe('BodyAssessmentReport', () => {
  afterEach(() => cleanup());

  it('renders the fixed report skeleton and switches the whole view model from the score area', () => {
    render(<BodyAssessmentReport />);
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

    fireEvent.click(screen.getByRole('button', { name: '切换体测报告来源' }));
    expect(screen.getByTestId('aoben-report-root')).toHaveAttribute('data-report-source', 'BIACN');
    expect(screen.getByText('75.2kg')).toBeInTheDocument();
    expect(screen.getByText('身体评分')).toBeInTheDocument();
    expect(screen.getByText(/ID：/)).toBeInTheDocument();
    expect(screen.queryByText('ID：676106169')).not.toBeInTheDocument();
    expect(screen.getByText('3.0kg')).toBeInTheDocument();
    expect(screen.getByText('0.78kg')).toBeInTheDocument();
    expect(screen.getByText('10.20kg')).toBeInTheDocument();
    expect(document.querySelector('.aoben-report-recommendation-art b span')).toHaveTextContent('您高于标准体重');
    expect(document.querySelector('.aoben-report-recommendation-art b strong')).toHaveTextContent('10.20kg');
    expect(screen.queryByText('正常')).not.toBeInTheDocument();
    expect(screen.queryByText('偏高')).not.toBeInTheDocument();
    expect(screen.queryByText('偏低')).not.toBeInTheDocument();
    expect(screen.queryByText('7.80kg')).not.toBeInTheDocument();
    expect(screen.queryByText('2449')).not.toBeInTheDocument();
    const emptyCalories = screen.getByText('建议的热量摄入').parentElement?.querySelector('[aria-label="无数据"]');
    expect(emptyCalories).toHaveAttribute('aria-label', '无数据');
    expect(emptyCalories).toHaveTextContent('—');
    expect(screen.queryByText('2515')).not.toBeInTheDocument();
    const emptySmi = screen.getByText('SMI').parentElement?.querySelector('[aria-label="无数据"]');
    expect(emptySmi).toHaveAttribute('aria-label', '无数据');
    expect(emptySmi).not.toHaveTextContent('—');
    expect(screen.getByTestId('aoben-report-scroll-area')).toHaveTextContent('SMI');
  });

  it('supports a fixed BIACN initial story state and back navigation', () => {
    const onBack = vi.fn();
    render(<BodyAssessmentReport initialSource="BIACN" onBack={onBack} />);
    expect(screen.getByTestId('aoben-report-root')).toHaveAttribute('data-report-source', 'BIACN');
    fireEvent.click(screen.getByRole('button', { name: '返回用户中心' }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
