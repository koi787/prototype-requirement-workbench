import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import story from '../../../../stories/AobenSportUserCenter.stories';
import { UserCenterPage } from './UserCenterPage';

describe('奥本运动移动端用户中心', () => {
  afterEach(() => cleanup());

  it('使用独立移动端产品根，不渲染 SCRM 壳', () => {
    render(<UserCenterPage />);

    expect(screen.getByTestId('aoben-mobile-root')).toBeInTheDocument();
    expect(screen.queryByText('SCRM系统')).toBeNull();
    expect(screen.queryByText('SCRM')).toBeNull();
    expect(screen.queryByText('潜客管理')).toBeNull();
    expect(screen.queryByText('门店客户')).toBeNull();
  });

  it('呈现用户中心的关键模块和完整快捷入口顺序', () => {
    render(<UserCenterPage />);

    expect(screen.getByText(/白银VIP/)).toBeInTheDocument();
    expect(screen.getByText('查看权益')).toBeInTheDocument();
    expect(screen.getByText('奥币中心')).toBeInTheDocument();
    expect(screen.getByText('我的积分')).toBeInTheDocument();
    expect(screen.getByText('消息中心')).toBeInTheDocument();
    expect(screen.getByText('我的设置')).toBeInTheDocument();
    expect(screen.getByText('AOBEN奥本')).toBeInTheDocument();

    const quickLabels = within(screen.getByTestId('quick-entry-grid')).getAllByRole('button').map((button) => button.textContent);
    expect(quickLabels).toEqual(['我的预约', '我的品项', '我的订单', '优惠券']);

    const serviceLabels = within(screen.getByTestId('service-entry-grid')).getAllByRole('button').map((button) => button.textContent);
    expect(serviceLabels).toEqual(['教培报名', '奥币', '帮助中心', '分享有礼', '券码兑换', '体测', '美容检测', '人才招聘', '我的推广', '五维问卷']);
  });

  it('其他服务入口不触发体测，体测仍使用原导航回调', async () => {
    const user = userEvent.setup();
    const onBodyAssessmentNavigate = vi.fn();
    render(<UserCenterPage onBodyAssessmentNavigate={onBodyAssessmentNavigate} />);

    const root = screen.getByTestId('aoben-mobile-root');
    const scrollArea = screen.getByTestId('aoben-mobile-scroll-area');
    const serviceGrid = within(screen.getByTestId('service-entry-grid'));
    await user.click(serviceGrid.getByRole('button', { name: '帮助中心' }));
    expect(onBodyAssessmentNavigate).not.toHaveBeenCalled();
    expect(root).toHaveAttribute('data-body-assessment-requested', 'false');

    Object.defineProperty(scrollArea, 'scrollTop', { configurable: true, value: 640, writable: true });
    fireEvent.scroll(scrollArea);
    expect(scrollArea.scrollTop).toBe(640);

    await user.click(serviceGrid.getByRole('button', { name: '体测' }));
    expect(onBodyAssessmentNavigate).toHaveBeenCalledTimes(1);
    expect(root).toHaveAttribute('data-body-assessment-requested', 'true');
    expect(screen.getByText('体测报告入口已触发')).toBeInTheDocument();
  });

  it('美容检测只有一个入口且不误触发体测回调', () => {
    const onBodyAssessmentNavigate = vi.fn();
    const onBeautyAssessmentNavigate = vi.fn();
    render(<UserCenterPage onBodyAssessmentNavigate={onBodyAssessmentNavigate} onBeautyAssessmentNavigate={onBeautyAssessmentNavigate} />);
    expect(screen.getAllByRole('button', { name: '美容检测' })).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: '美容检测' }));
    expect(onBeautyAssessmentNavigate).toHaveBeenCalledTimes(1);
    expect(onBodyAssessmentNavigate).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: '体测' }));
    expect(onBodyAssessmentNavigate).toHaveBeenCalledTimes(1);
    expect(onBeautyAssessmentNavigate).toHaveBeenCalledTimes(1);
  });

  it('呈现五项底部导航并保持我的为选中态', () => {
    render(<UserCenterPage />);

    const viewport = screen.getByTestId('aoben-mobile-viewport');
    const scrollArea = screen.getByTestId('aoben-mobile-scroll-area');
    const nav = screen.getByTestId('bottom-nav');

    expect(viewport).toHaveAttribute('data-viewport-width', '520');
    expect(viewport).toHaveAttribute('data-viewport-height', '980');
    expect(scrollArea.parentElement).toBe(viewport);
    expect(nav.parentElement).toBe(viewport);
    expect(scrollArea).toContainElement(screen.getByText('AOBEN奥本'));
    expect(scrollArea).not.toContainElement(nav);
    expect(within(nav).getAllByRole('button').map((button) => button.textContent)).toEqual(['首页', '预约', '扫码', '日程', '我的']);
    expect(within(nav).getByRole('button', { name: '我的' })).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('button', { name: '首页' })).not.toHaveAttribute('aria-current');
  });

  it('Story 归属于移动端奥本运动真实产品菜单', () => {
    expect(story.title).toBe('移动端｜奥本运动/我的/用户中心');
  });
});
