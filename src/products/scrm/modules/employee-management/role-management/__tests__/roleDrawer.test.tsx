import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RoleDrawer } from '../RoleDrawer';
import {
  flattenRolePermissionTree,
  MINI_PROGRAM_PERMISSION_IDS,
  normalizePermissionIds,
  ROLE_PERMISSION_NODE_IDS,
  ROLE_PERMISSION_TREE,
} from '../rolePermissions';
import type { RoleRecord } from '../roleTypes';

afterEach(() => cleanup());

function treeItem(name: string): HTMLElement {
  const item = screen.getAllByRole('treeitem').find(
    (candidate) => candidate.querySelector('.ant-tree-title')?.textContent === name,
  );
  if (!item) throw new Error(`No tree item found for ${name}`);
  return item;
}

function treeCheckbox(name: string): HTMLElement {
  return within(treeItem(name)).getByRole('checkbox');
}

function toggleExpansion(name: string): void {
  const item = treeItem(name);
  const switcher = item.querySelector('.ant-tree-switcher');
  if (!switcher) throw new Error(`No switcher found for ${name}`);
  fireEvent.click(switcher);
}

function expectPermissionPath(labels: readonly string[], siblingIndexes: readonly number[]): void {
  let siblings = ROLE_PERMISSION_TREE;
  labels.forEach((label, level) => {
    const siblingIndex = siblingIndexes[level];
    if (siblingIndex === undefined) throw new Error(`Missing expected sibling index for ${label}`);
    const node = siblings[siblingIndex];
    expect(node?.label).toBe(label);
    if (!node) throw new Error(`Missing permission node for ${label}`);
    siblings = node.children ?? [];
  });
}

const role: RoleRecord = {
  id: '72',
  roleName: '美容培训督导',
  roleCode: 'mrdd',
  permissionIds: [
    ROLE_PERMISSION_TREE[0]!.id,
    MINI_PROGRAM_PERMISSION_IDS[0]!,
    ROLE_PERMISSION_TREE[3]!.id,
    ROLE_PERMISSION_TREE[3]!.children![0]!.id,
    ROLE_PERMISSION_TREE[3]!.children![0]!.children![0]!.id,
  ],
  updatedAt: '2026-08-18 10:12:00',
  operatorName: '王经理',
};

const expandedRolePath = [
  ROLE_PERMISSION_TREE[0]!.id,
  ROLE_PERMISSION_TREE[3]!.id,
  ROLE_PERMISSION_TREE[3]!.children![0]!.id,
];

describe('0015 Cycle B RoleDrawer 独立权限选择', () => {
  it('create 默认空值、职务编码可编辑、权限树首级展开', () => {
    render(<RoleDrawer mode="create" open onCancel={vi.fn()} onSubmit={vi.fn()} />);
    expect(screen.getByText('新增角色')).toBeTruthy();
    expect(screen.getByPlaceholderText('请输入职位名称')).toHaveValue('');
    expect(screen.getByPlaceholderText('请输入职务编码')).toBeEnabled();
    expect(screen.getByRole('tree')).toBeTruthy();
    expect(treeItem('小程序')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('今日数据')).toBeTruthy();
    expect(screen.queryByText('金额，课时是否可见')).toBeNull();
  });

  it('三个必填字段阻止保存，并保存完整 permissionIds', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<RoleDrawer mode="create" open onCancel={vi.fn()} onSubmit={onSubmit} />);
    await user.click(screen.getByRole('button', { name: /确\s*定/ }));
    expect(screen.getAllByRole('alert').map((item) => item.textContent)).toEqual([
      '请输入职位名称', '请输入职务编码', '请选择菜单',
    ]);
    await user.type(screen.getByPlaceholderText('请输入职位名称'), '新角色');
    await user.type(screen.getByPlaceholderText('请输入职务编码'), 'new-role');
    await user.click(treeCheckbox('小程序'));
    await user.click(treeCheckbox('今日数据'));
    await user.click(screen.getByRole('button', { name: /确\s*定/ }));
    expect(onSubmit).toHaveBeenCalledWith({
      roleName: '新角色',
      roleCode: 'new-role',
      permissionIds: [ROLE_PERMISSION_TREE[0]!.id, MINI_PROGRAM_PERMISSION_IDS[0]!],
    });
  });

  it('父节点、子节点独立选择，取消任一节点不影响另一节点', async () => {
    const user = userEvent.setup();
    render(<RoleDrawer mode="create" open onCancel={vi.fn()} onSubmit={vi.fn()} />);
    const parent = treeCheckbox('小程序');
    const child = treeCheckbox('今日数据');
    await user.click(parent);
    expect(parent).toBeChecked();
    expect(child).not.toBeChecked();
    await user.click(child);
    expect(parent).toBeChecked();
    expect(child).toBeChecked();
    await user.click(parent);
    expect(parent).not.toBeChecked();
    expect(child).toBeChecked();
  });

  it('多层父节点可独立保存，展开收起不改变 permissionIds', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<RoleDrawer mode="create" open initialExpandedKeys={expandedRolePath} onCancel={vi.fn()} onSubmit={onSubmit} />);
    const appointment = ROLE_PERMISSION_TREE[3]!;
    const group = appointment.children![0]!;
    const leaf = group.children![0]!;
    await user.click(treeCheckbox('预约'));
    await user.click(treeCheckbox('团课'));
    await user.click(treeCheckbox('复制课表'));
    toggleExpansion('团课');
    expect(treeCheckbox('团课')).toBeChecked();
    toggleExpansion('团课');
    await user.type(screen.getByPlaceholderText('请输入职位名称'), '多层角色');
    await user.type(screen.getByPlaceholderText('请输入职务编码'), 'multi-role');
    await user.click(screen.getByRole('button', { name: /确\s*定/ }));
    expect(onSubmit).toHaveBeenCalledWith({
      roleName: '多层角色',
      roleCode: 'multi-role',
      permissionIds: [appointment.id, group.id, leaf.id],
    });
  });

  it('edit 回填一级、中间父级和叶子节点，编码 disabled，取消不提交', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const onSubmit = vi.fn();
    render(<RoleDrawer mode="edit" open role={role} initialExpandedKeys={expandedRolePath} onCancel={onCancel} onSubmit={onSubmit} />);
    expect(screen.getByText('修改角色')).toBeTruthy();
    expect(screen.getByPlaceholderText('请输入职位名称')).toHaveValue('美容培训督导');
    expect(screen.getByPlaceholderText('请输入职务编码')).toHaveValue('mrdd');
    expect(screen.getByPlaceholderText('请输入职务编码')).toBeDisabled();
    expect(treeCheckbox('小程序')).toBeChecked();
    expect(treeCheckbox('今日数据')).toBeChecked();
    expect(treeCheckbox('预约')).toBeChecked();
    expect(treeCheckbox('团课')).toBeChecked();
    expect(treeCheckbox('复制课表')).toBeChecked();
    await user.click(screen.getByRole('button', { name: /取\s*消/ }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('完整生产权限树节点 ID 唯一且稳定，包含任务单指定路径', () => {
    const flattened = flattenRolePermissionTree();
    expect(flattened).toHaveLength(508);
    expect(new Set(ROLE_PERMISSION_NODE_IDS).size).toBe(508);
    expect(new Set(flattened.map((node) => node.id)).size).toBe(508);
    expect(flattened.map((node) => node.label)).toEqual(expect.arrayContaining([
      '删除用户-慎用（权限别给）', '是否教练', '组织架构-消息测试', '课卡合同-红冲', '公海用户有效期',
    ]));
    expect(ROLE_PERMISSION_TREE.map((node) => node.label)).toEqual([
      '小程序', '排行榜', '首页', '预约', '品项', '教培班', '集训营', '基础资料', '库存管理', '收银',
      '门店人员', '订单', '记录', '门店', '客户', '潜客管理', '员工', '联营', '财务', '加盟', '加盟商',
      '版本发布', '设置', '营销',
    ]);
  });

  it('按真实父子层级和顺序验证任务单六条权限路径', () => {
    expectPermissionPath(['员工', '角色列表', '角色列表-新增'], [16, 0, 0]);
    expectPermissionPath(['潜客管理', '门店客户', '标注无效客资'], [15, 0, 10]);
    expectPermissionPath(['订单', '合同中心', '课卡合同-退款'], [11, 0, 5]);
    expectPermissionPath(['财务', '收款管理', '收款流水', '收款流水-导出'], [18, 2, 0, 0]);
    expectPermissionPath(['设置', '文件', '文件夹列表', '文件夹列表-编辑'], [22, 0, 1, 1]);
    expectPermissionPath(['营销', '优惠券管理', '优惠券列表', '优惠券-赠送'], [23, 2, 0, 3]);
  });

  it('保存权限 ID 时去重并保留任意层级节点', () => {
    const root = ROLE_PERMISSION_TREE[0]!;
    const child = root.children![0]!;
    expect(normalizePermissionIds([child.id, root.id, child.id])).toEqual([root.id, child.id]);
  });
});
