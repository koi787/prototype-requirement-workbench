import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { RequirementHistoryListPage } from './RequirementHistoryPage';
import { REQUIREMENT_HISTORY_RECORDS } from './requirementHistoryData';

describe('requirement history list', () => {
  afterEach(() => cleanup());

  it('keeps the five confirmed records and sorts them by completed date descending', () => {
    render(<RequirementHistoryListPage />);

    expect(REQUIREMENT_HISTORY_RECORDS.map((record) => record.id)).toEqual(['0016', '0015', '0014', '0013', '0012']);
    expect(screen.getAllByTestId(/requirement-history-row-/).map((row) => row.getAttribute('data-testid'))).toEqual([
      'requirement-history-row-0016',
      'requirement-history-row-0015',
      'requirement-history-row-0014',
      'requirement-history-row-0013',
      'requirement-history-row-0012',
    ]);
  });

  it('searches title, implementation/change content, and module', async () => {
    const user = userEvent.setup();
    render(<RequirementHistoryListPage />);
    const input = screen.getByPlaceholderText('搜索需求编号 / 标题 / 模块 / 实现或改动内容');

    await user.type(input, '员工角色管理');
    expect(screen.getByTestId('requirement-history-row-0015')).toBeInTheDocument();
    expect(screen.queryByTestId('requirement-history-row-0014')).toBeNull();

    await user.clear(input);
    await user.type(input, '权限配置');
    expect(screen.getByTestId('requirement-history-row-0015')).toBeInTheDocument();

    await user.clear(input);
    await user.type(input, '多业务域');
    expect(screen.getByTestId('requirement-history-row-0013')).toBeInTheDocument();

    await user.clear(input);
    await user.type(input, '潜客管理');
    expect(screen.getByTestId('requirement-history-row-0012')).toBeInTheDocument();

    await user.clear(input);
    await user.type(input, '体测');
    expect(screen.getByTestId('requirement-history-row-0016')).toBeInTheDocument();

    await user.clear(input);
    await user.type(input, 'BIACN');
    expect(screen.getByTestId('requirement-history-row-0016')).toBeInTheDocument();
  });

  it('shows the required empty state when there is no match', async () => {
    const user = userEvent.setup();
    render(<RequirementHistoryListPage />);
    await user.type(screen.getByPlaceholderText('搜索需求编号 / 标题 / 模块 / 实现或改动内容'), '不存在的需求');

    expect(screen.getByText('未找到匹配的需求记录')).toBeInTheDocument();
    expect(screen.queryByTestId('requirement-history-row-0015')).toBeNull();
  });

  it('renders direct links to the real Storybook stories', () => {
    render(<RequirementHistoryListPage />);

    const bodyAssessmentRow = screen.getByTestId('requirement-history-row-0016');
    expect(within(bodyAssessmentRow).getByText('混合')).toBeInTheDocument();
    expect(within(bodyAssessmentRow).getAllByRole('link')).toHaveLength(5);
    expect(within(bodyAssessmentRow).getByRole('link', { name: '奥本运动用户中心' })).toHaveAttribute('href', expect.stringContaining(encodeURIComponent('移动端｜奥本运动-我的-用户中心--默认状态')));
    expect(within(bodyAssessmentRow).getByRole('link', { name: 'InBody报告' })).toHaveAttribute('href', expect.stringContaining(encodeURIComponent('移动端｜奥本运动-体测-inbody报告--默认报告')));
    expect(within(bodyAssessmentRow).getByRole('link', { name: 'BIACN报告' })).toHaveAttribute('href', expect.stringContaining(encodeURIComponent('移动端｜奥本运动-体测-biacn报告--默认报告')));
    expect(within(bodyAssessmentRow).getByRole('link', { name: 'SCRM客户列表' })).toHaveAttribute('href', expect.stringContaining(encodeURIComponent('scrm-客户-客户列表--正常列表')));
    expect(within(bodyAssessmentRow).getByRole('link', { name: '体测美容记录' })).toHaveAttribute('href', expect.stringContaining(encodeURIComponent('scrm-客户-客户详情-体测美容记录--全部记录')));

    const row = screen.getByTestId('requirement-history-row-0015');
    const link = within(row).getByRole('link', { name: '角色列表' });
    expect(link).toHaveAttribute('href', expect.stringContaining('/?path=/story/'));
    expect(link).toHaveAttribute('href', expect.stringContaining('scrm-%E5%91%98%E5%B7%A5-%E8%A7%92%E8%89%B2%E5%88%97%E8%A1%A8'));
    expect(screen.queryByText('查看详情')).toBeNull();
  });
});
