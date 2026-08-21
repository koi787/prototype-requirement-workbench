import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { RequirementHistoryListPage } from './RequirementHistoryPage';
import { REQUIREMENT_HISTORY_RECORDS } from './requirementHistoryData';

describe('requirement history list', () => {
  afterEach(() => cleanup());

  it('keeps the four confirmed records and sorts them by completed date descending', () => {
    render(<RequirementHistoryListPage />);

    expect(REQUIREMENT_HISTORY_RECORDS.map((record) => record.id)).toEqual(['0015', '0014', '0013', '0012']);
    expect(screen.getAllByTestId(/requirement-history-row-/).map((row) => row.getAttribute('data-testid'))).toEqual([
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

    const row = screen.getByTestId('requirement-history-row-0015');
    const link = within(row).getByRole('link', { name: '角色列表' });
    expect(link).toHaveAttribute('href', expect.stringContaining('/?path=/story/'));
    expect(link).toHaveAttribute('href', expect.stringContaining('scrm-%E5%91%98%E5%B7%A5-%E8%A7%92%E8%89%B2%E5%88%97%E8%A1%A8'));
    expect(screen.queryByText('查看详情')).toBeNull();
  });
});
