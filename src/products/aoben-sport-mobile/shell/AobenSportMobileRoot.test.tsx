import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { AobenSportMobileRoot } from './AobenSportMobileRoot';
import beautyStory, { 从用户中心进入, 进入报告 } from '../../../stories/AobenMiddlePlatformBeautyAssessment.stories';

afterEach(cleanup);

describe('AobenSportMobileRoot', () => {
  it('connects the user-center body assessment entry to the unified report and back', () => {
    render(<AobenSportMobileRoot />);
    fireEvent.click(screen.getByRole('button', { name: '体测' }));
    expect(screen.getByTestId('aoben-report-root')).toHaveAttribute('data-report-source', 'INBODY');
    expect(screen.queryByTestId('bottom-nav')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '返回用户中心' }));
    expect(screen.getByTestId('aoben-mobile-root')).toBeInTheDocument();
  });

  it('从用户中心进入美容检测并返回，随后仍可进入体测并返回', () => {
    render(<AobenSportMobileRoot />);
    fireEvent.click(screen.getByRole('button', { name: '美容检测' }));
    expect(screen.getByRole('main', { name: '美容检测报告' })).toBeInTheDocument();
    expect(screen.getByText('46')).toBeInTheDocument();
    expect(screen.queryByTestId('aoben-mobile-root')).not.toBeInTheDocument();
    expect(screen.queryByTestId('aoben-report-root')).not.toBeInTheDocument();
    expect(screen.queryByTestId('bottom-nav')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '返回用户中心' }));
    expect(screen.queryByRole('main', { name: '美容检测报告' })).not.toBeInTheDocument();
    expect(screen.getByTestId('bottom-nav')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '体测' }));
    expect(screen.getByTestId('aoben-report-root')).toHaveAttribute('data-report-source', 'INBODY');
    fireEvent.click(screen.getByRole('button', { name: '返回用户中心' }));
    fireEvent.click(screen.getByRole('button', { name: '美容检测' }));
    expect(screen.getByRole('heading', { name: '美容检测报告' })).toBeInTheDocument();
  });

  it('体测指定来源不受新增美容 view 影响', () => {
    render(<AobenSportMobileRoot initialView="body-assessment" initialSource="BIACN" />);
    expect(screen.getByTestId('aoben-report-root')).toHaveAttribute('data-report-source', 'BIACN');
    fireEvent.click(screen.getByRole('button', { name: '返回用户中心' }));
    fireEvent.click(screen.getByRole('button', { name: '美容检测' }));
    fireEvent.click(screen.getByRole('button', { name: '返回用户中心' }));
    fireEvent.click(screen.getByRole('button', { name: '体测' }));
    expect(screen.getByTestId('aoben-report-root')).toHaveAttribute('data-report-source', 'BIACN');
  });

  it('奥本中台 Story 通过真实 Root 打开报告和返回，不是独立报告 Demo', () => {
    expect(beautyStory.title).toBe('奥本中台/美容检测/移动端报告');
    expect(beautyStory.component).toBe(AobenSportMobileRoot);
    const StoryRoot = beautyStory.component;
    render(<StoryRoot {...进入报告.args} />);
    expect(screen.getByRole('main', { name: '美容检测报告' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '返回用户中心' }));
    expect(screen.getByRole('button', { name: '美容检测' })).toBeInTheDocument();
  });

  it('用户中心入口 Story 真实点击后进入同一美容报告', () => {
    const StoryRoot = beautyStory.component;
    render(<StoryRoot {...从用户中心进入.args} />);
    expect(screen.queryByRole('main', { name: '美容检测报告' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '美容检测' }));
    expect(screen.getByRole('main', { name: '美容检测报告' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '查看历史记录' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '分享报告' })).toBeInTheDocument();
  });
});
