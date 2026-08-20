import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RoleListPage } from '../RoleListPage';
import { ROLE_MOCK } from '../roleMockData';
import type { RoleRecord } from '../roleTypes';

afterEach(() => cleanup());

function getRoleTable(): HTMLElement {
  return screen.getByRole('table');
}

function getDrawer(): HTMLElement {
  return screen.getByRole('dialog');
}

describe('0015 Cycle A RoleListPage', () => {
  it('真实 DOM 只渲染严格 6 列和首批分页数据', () => {
    render(<RoleListPage />);
    expect(within(getRoleTable()).getAllByRole('columnheader').map((header) => header.textContent)).toEqual([
      'ID', '职位名称', '职务编码', '更新时间', '操作人', '操作',
    ]);
    expect(ROLE_MOCK).toHaveLength(65);
    expect(screen.getByText('72')).toBeTruthy();
    expect(screen.getByText('mrdd')).toBeTruthy();
    expect(screen.getByText('美容培训督导')).toBeTruthy();
    expect(screen.getByText('融资部数据专员')).toBeTruthy();
    expect(screen.getByText('共 65 条记录')).toBeTruthy();
    expect(screen.getByRole('button', { name: /^1$/ })).toHaveAttribute('aria-current', 'page');
    expect(screen.getAllByRole('button', { name: /^[1-7]$/ })).toHaveLength(7);
    expect(screen.getByText('10条/页')).toBeTruthy();
    expect(screen.getByText('前往')).toBeTruthy();
  });

  it('输入筛选条件不会立即过滤，点击搜索后按包含匹配生效', async () => {
    const user = userEvent.setup();
    render(<RoleListPage />);
    const nameInput = screen.getByPlaceholderText('请输入职位名称');
    await user.type(nameInput, '督导');
    expect(screen.getByText('美容培训督导')).toBeTruthy();
    expect(screen.getByText('美容技术顾问')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /搜\s*索/ }));
    expect(screen.getByText('美容培训督导')).toBeTruthy();
    expect(screen.getByText('瑜伽培训督导')).toBeTruthy();
    expect(screen.queryByText('美容技术顾问')).toBeNull();
    expect(screen.getByText('共 2 条记录')).toBeTruthy();
  });

  it('重置清空 draft/applied 并恢复完整列表第一页', async () => {
    const user = userEvent.setup();
    render(<RoleListPage />);
    await user.type(screen.getByPlaceholderText('请输入职务编码'), 'NOT_FOUND');
    await user.click(screen.getByRole('button', { name: /搜\s*索/ }));
    expect(screen.getByText('暂无数据')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /重\s*置/ }));
    expect(screen.getByText('美容培训督导')).toBeTruthy();
    expect(screen.getByText('共 65 条记录')).toBeTruthy();
    expect(screen.getByPlaceholderText('请输入职务编码')).toHaveValue('');
  });

  it('新增、编辑、删除入口触发稳定回调并进入真实运行时交互', async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();
    const onEdit = vi.fn<(record: RoleRecord) => void>();
    const onDelete = vi.fn<(record: RoleRecord) => void>();
    render(<RoleListPage onCreate={onCreate} onEdit={onEdit} onDelete={onDelete} />);
    await user.click(screen.getByRole('button', { name: '新增角色' }));
    expect(within(getDrawer()).getByText('新增角色')).toBeTruthy();
    await user.click(within(getDrawer()).getByRole('button', { name: /取\s*消/ }));
    const firstEdit = screen.getAllByRole('button', { name: '编辑' })[0];
    const firstDelete = screen.getAllByRole('button', { name: '删除' })[0];
    expect(firstEdit).toBeDefined();
    expect(firstDelete).toBeDefined();
    await user.click(firstEdit!);
    await user.click(firstDelete!);
    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledWith(ROLE_MOCK[0]);
    expect(onDelete).toHaveBeenCalledWith(ROLE_MOCK[0]);
    expect(screen.getByText('修改角色')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(document.querySelector('.ant-drawer')).toBeNull();
    expect(screen.getByText('共 65 条记录')).toBeTruthy();
  });

  it('create 保存写回同一份 Runtime，取消不新增记录', async () => {
    const user = userEvent.setup();
    render(<RoleListPage usedRoleIds={[]} />);
    await user.click(screen.getByRole('button', { name: '新增角色' }));
    const drawer = getDrawer();
    await user.type(within(drawer).getByPlaceholderText('请输入职位名称'), '新建角色');
    await user.type(within(drawer).getByPlaceholderText('请输入职务编码'), 'NEWROLE');
    await user.click(within(screen.getByRole('treeitem', { name: /排行榜/ })).getByRole('checkbox'));
    await user.click(within(drawer).getByRole('button', { name: /确\s*定/ }));
    expect(screen.getByText('新建角色')).toBeTruthy();
    expect(screen.getByText('共 66 条记录')).toBeTruthy();
    expect(screen.getByText('73')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: '新增角色' }));
    const cancelledDrawer = getDrawer();
    await user.type(within(cancelledDrawer).getByPlaceholderText('请输入职位名称'), '取消角色');
    await user.click(within(cancelledDrawer).getByRole('button', { name: /取\s*消/ }));
    expect(screen.queryByText('取消角色')).toBeNull();
    expect(screen.getByText('共 66 条记录')).toBeTruthy();
  });

  it('edit 回填并保存更新原记录，取消不污染 Runtime，编码保持 disabled', async () => {
    const user = userEvent.setup();
    render(<RoleListPage />);
    await user.click(screen.getAllByRole('button', { name: '编辑' })[0]!);
    const drawer = getDrawer();
    const nameInput = within(drawer).getByPlaceholderText('请输入职位名称');
    const codeInput = within(drawer).getByPlaceholderText('请输入职务编码');
    expect(nameInput).toHaveValue('美容培训督导');
    expect(codeInput).toHaveValue('mrdd');
    expect(codeInput).toBeDisabled();
    await user.clear(nameInput);
    await user.type(nameInput, '修改后的角色');
    await user.click(within(drawer).getByRole('button', { name: /确\s*定/ }));
    expect(screen.getByText('修改后的角色')).toBeTruthy();
    expect(screen.queryByText('美容培训督导')).toBeNull();

    await user.click(screen.getAllByRole('button', { name: '编辑' })[0]!);
    const updatedDrawer = getDrawer();
    expect(within(updatedDrawer).getByPlaceholderText('请输入职位名称')).toHaveValue('修改后的角色');
    await user.clear(within(updatedDrawer).getByPlaceholderText('请输入职位名称'));
    await user.type(within(updatedDrawer).getByPlaceholderText('请输入职位名称'), '取消修改');
    await user.click(within(updatedDrawer).getByRole('button', { name: /取\s*消/ }));
    expect(screen.queryByText('取消修改')).toBeNull();
    expect(screen.getByText('修改后的角色')).toBeTruthy();
  });

  it('删除未使用角色二次确认后移除，已使用角色禁止删除', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<RoleListPage usedRoleIds={['72']} />);
    await user.click(screen.getAllByRole('button', { name: '删除' })[0]!);
    expect(screen.getByText('该角色已被员工使用，无法删除')).toBeTruthy();
    expect(screen.getByText('共 65 条记录')).toBeTruthy();
    unmount();

    render(<RoleListPage usedRoleIds={[]} />);
    await user.click(screen.getAllByRole('button', { name: '删除' })[0]!);
    expect(screen.getAllByText('删除角色').length).toBeGreaterThan(0);
    expect(screen.getByText('确认删除角色“美容培训督导”吗？删除后不可恢复。')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /取\s*消/ }));
    expect(screen.getByText('共 65 条记录')).toBeTruthy();
    await user.click(screen.getAllByRole('button', { name: '删除' })[0]!);
    const confirmButtons = screen.getAllByRole('button', { name: '确认删除' });
    await user.click(confirmButtons[confirmButtons.length - 1]!);
    expect(screen.getByText('共 64 条记录')).toBeTruthy();
    expect(screen.queryByText('美容培训督导')).toBeNull();
  });

  it('下一页和跳页会切换当前切片并正确处理首尾按钮', async () => {
    const user = userEvent.setup();
    render(<RoleListPage />);
    const next = screen.getByRole('button', { name: '下一页' });
    expect(next).toBeEnabled();
    await user.click(next);
    expect(within(getRoleTable()).getAllByText('门店运营专员')).toHaveLength(2);
    expect(screen.queryByText('美容培训督导')).toBeNull();
    expect(within(getRoleTable()).getAllByText('区域运营经理')).toHaveLength(2);
    expect(screen.getByRole('button', { name: /^2$/ })).toHaveAttribute('aria-current', 'page');
    expect(next).toBeEnabled();
    await user.click(screen.getByRole('button', { name: /^7$/ }));
    expect(screen.getByRole('button', { name: /^7$/ })).toHaveAttribute('aria-current', 'page');
    expect(within(getRoleTable()).getAllByText('门店运营专员')).toHaveLength(1);
    expect(next).toBeDisabled();
    const jump = screen.getByRole('textbox', { name: '前往页码' });
    await user.type(jump, '1');
    await user.keyboard('{Enter}');
    expect(screen.getByText('美容培训督导')).toBeTruthy();
    expect(screen.getByRole('button', { name: /^1$/ })).toHaveAttribute('aria-current', 'page');
  });
});
