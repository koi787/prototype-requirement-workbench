import type { Meta, StoryObj } from '@storybook/react-vite';
import { ScrmWorkspace } from '../products/scrm/shell/ScrmWorkspace';
import { RoleListPage } from '../products/scrm/modules/employee-management/role-management';
import { RANKING_PERMISSION_ID } from '../products/scrm/modules/employee-management/role-management/rolePermissions';

const meta = {
  title: 'SCRM/员工/角色列表/新增',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const 默认状态: Story = {
  render: () => (
    <ScrmWorkspace
      initialPage="employee-role-list"
      renderContext={{ employeeRoleList: <RoleListPage initialDrawer={{ mode: 'create' }} /> }}
    />
  ),
};

export const 已填写: Story = {
  render: () => (
    <ScrmWorkspace
      initialPage="employee-role-list"
      renderContext={{
        employeeRoleList: (
          <RoleListPage
            initialDrawer={{
              mode: 'create',
              initialDraft: { roleName: '区域运营经理', roleCode: 'QYYLJ', permissionIds: [RANKING_PERMISSION_ID] },
            }}
          />
        ),
      }}
    />
  ),
};
