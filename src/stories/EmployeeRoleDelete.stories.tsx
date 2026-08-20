import type { Meta, StoryObj } from '@storybook/react-vite';
import { ScrmWorkspace } from '../products/scrm/shell/ScrmWorkspace';
import { RoleListPage } from '../products/scrm/modules/employee-management/role-management';

const meta = {
  title: 'SCRM/员工/角色列表/删除',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function clickFirstDeleteAction(): void {
  const deleteButton = document.querySelector<HTMLElement>('.role-list-action-delete');
  if (!deleteButton) throw new Error('角色列表删除按钮未渲染');
  deleteButton.click();
}

export const 未使用角色: Story = {
  render: () => (
    <ScrmWorkspace
      initialPage="employee-role-list"
      renderContext={{ employeeRoleList: <RoleListPage usedRoleIds={[]} /> }}
    />
  ),
  play: async () => {
    clickFirstDeleteAction();
  },
  parameters: {
    docs: {
      description: { story: '通过真实角色列表点击删除，未绑定角色进入真实二次确认弹窗。' },
    },
  },
};

export const 已被员工使用: Story = {
  render: () => (
    <ScrmWorkspace
      initialPage="employee-role-list"
      renderContext={{ employeeRoleList: <RoleListPage usedRoleIds={['72']} /> }}
    />
  ),
  play: async () => {
    clickFirstDeleteAction();
  },
  parameters: {
    docs: {
      description: { story: '通过真实角色列表点击删除，已被员工使用的角色展示真实禁止删除提示且不打开确认弹窗。' },
    },
  },
};
