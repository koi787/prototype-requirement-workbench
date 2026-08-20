import type { Meta, StoryObj } from '@storybook/react-vite';
import { ScrmWorkspace } from '../products/scrm/shell/ScrmWorkspace';
import { RoleListPage } from '../products/scrm/modules/employee-management/role-management';

const meta = {
  title: 'SCRM/员工/角色列表/列表',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const 正常列表: Story = {
  render: () => <ScrmWorkspace initialPage="employee-role-list" />,
};

export const 筛选有结果: Story = {
  render: () => (
    <ScrmWorkspace
      initialPage="employee-role-list"
      renderContext={{ employeeRoleList: <RoleListPage initialAppliedFilter={{ roleName: '督导', roleCode: '' }} /> }}
    />
  ),
};

export const 空数据: Story = {
  render: () => (
    <ScrmWorkspace
      initialPage="employee-role-list"
      renderContext={{ employeeRoleList: <RoleListPage initialAppliedFilter={{ roleName: '不存在', roleCode: '' }} /> }}
    />
  ),
};
