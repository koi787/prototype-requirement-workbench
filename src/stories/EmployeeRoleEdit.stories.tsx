import type { Meta, StoryObj } from '@storybook/react-vite';
import { ScrmWorkspace } from '../products/scrm/shell/ScrmWorkspace';
import { RoleListPage } from '../products/scrm/modules/employee-management/role-management';
import { ROLE_PERMISSION_TREE } from '../products/scrm/modules/employee-management/role-management/rolePermissionTree';

const meta = {
  title: 'SCRM/员工/角色列表/编辑',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const 默认回填: Story = {
  render: () => (
    <ScrmWorkspace
      initialPage="employee-role-list"
      renderContext={{ employeeRoleList: <RoleListPage initialDrawer={{ mode: 'edit', roleId: '72' }} /> }}
    />
  ),
  parameters: {
    docs: {
      description: { story: '通过真实 Role Runtime 回填角色名称、职务编码和已选权限，打开唯一 RoleDrawer 的修改角色状态。' },
    },
  },
};

export const 父节点独立选中: Story = {
  render: () => (
    <ScrmWorkspace
      initialPage="employee-role-list"
      renderContext={{
        employeeRoleList: (
          <RoleListPage
            initialDrawer={{
              mode: 'edit',
              roleId: '72',
              initialDraft: { permissionIds: [ROLE_PERMISSION_TREE[0]!.id] },
            }}
          />
        ),
      }}
    />
  ),
  parameters: {
    docs: {
      description: { story: '父节点“小程序”保持 checked，其子节点保持 unchecked，展示父子权限独立选择的真实回填状态。' },
    },
  },
};

function expandPermissionNode(label: string): void {
  const treeNode = Array.from(document.querySelectorAll<HTMLElement>('.role-drawer .ant-tree-treenode')).find(
    (candidate) => candidate.querySelector('.ant-tree-title')?.textContent === label,
  );
  if (!treeNode) throw new Error(`权限节点未渲染：${label}`);
  const switcher = treeNode.querySelector<HTMLElement>('.ant-tree-switcher');
  if (!switcher) throw new Error(`权限节点不可展开：${label}`);
  switcher.click();
}

export const 多层权限回填: Story = {
  render: () => {
    const appointment = ROLE_PERMISSION_TREE[3]!;
    const groupClass = appointment.children![0]!;
    const leaf = groupClass.children![0]!;
    return (
      <ScrmWorkspace
        initialPage="employee-role-list"
        renderContext={{
          employeeRoleList: (
            <RoleListPage
              initialDrawer={{
                mode: 'edit',
                roleId: '72',
                initialDraft: { permissionIds: [appointment.id, groupClass.id, leaf.id] },
              }}
            />
          ),
        }}
      />
    );
  },
  play: async () => {
    expandPermissionNode('预约');
    await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
    expandPermissionNode('团课');
  },
  parameters: {
    docs: {
      description: { story: '真实 edit Drawer 回填“预约 → 团课 → 复制课表”三级权限，父节点、中间节点和叶子节点均由 permissionIds 独立回填。' },
    },
  },
};
