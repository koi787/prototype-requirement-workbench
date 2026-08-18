import type { Meta, StoryObj } from '@storybook/react-vite';
import { ScrmWorkspace } from '../products/scrm/shell/ScrmWorkspace';
import { OrganizationPage } from '../products/scrm/modules/employee-management/organization';
import type { OrganizationPageProps } from '../products/scrm/modules/employee-management/organization';

/**
 * 员工 · 组织架构 · 列表 Story：按真实产品菜单归入
 * SCRM → 员工 → 组织架构 → 列表。
 *
 * 渲染完整 SCRM 后台壳（左侧业务导航 + 顶部系统区域 + 顶部页签 + 主内容容器），
 * 一级菜单"员工"激活并展开"组织架构"子菜单，内容区展示 OrganizationPage
 * （左栏组织架构树 + 右栏筛选区/新增员工入口/员工 10 列表格/分页）。
 *
 * 调用链固定为 ScrmWorkspace → employee-organization → OrganizationPage：
 * 组织架构页由产品级 pageRegistry 出口直接渲染，绝不经过潜客管理业务根。
 * 新增 / 编辑员工（EmployeeDrawer）为 Cycle B，本轮不提供 新增/编辑 Story。
 */
const meta = {
  title: 'SCRM/员工/组织架构/列表',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<OrganizationPageProps>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 正常有数据状态：默认选中根节点"奥本集团"，在职状态默认"在职"。 */
export const 正常列表: Story = {
  render: () => (
    <ScrmWorkspace initialPage="employee-organization" />
  ),
  parameters: {
    docs: {
      description: {
        story:
          '完整 SCRM 后台壳（一级"员工"菜单激活并展开"组织架构"子菜单）下展示组织架构主页面：左栏组织架构树（奥本集团及 11 个一级/二级部门），右栏为筛选区（搜索姓名/手机号/员工编号、岗位、角色筛选、在职状态、搜索、重置）、右上"新增员工"主按钮、员工 10 列表格（ID / 姓名 / 启用状态 / 员工编号 / 手机号 / 业绩门店 / 岗位 / 更新时间 / 操作人 / 操作，启用状态为绿色 Switch，操作菜单仅 编辑/注销登录/消息测试）与分页。默认选中根节点，仅显示直接归属集团的员工，不递归聚合子部门。',
      },
    },
  },
};

/** 选择组织节点：切换左栏组织树节点，仅显示该部门直接归属员工。 */
export const 选择组织节点: Story = {
  render: () => (
    <ScrmWorkspace
      initialPage="employee-organization"
      renderContext={{ employeeOrganization: <OrganizationPage initialSelectedOrgId="coffee-ops-center" /> }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          '同一完整 SCRM 后台壳下，预选中"咖啡运营中心"组织节点：列表仅展示直接归属该部门的在职员工（王强、冯雪），验证 Cycle A 直接归属过滤规则（父节点不递归聚合子部门员工）。',
      },
    },
  },
};

/** 筛选有结果：岗位筛选"其他"，组合组织 + 筛选条件展示结果。 */
export const 筛选有结果: Story = {
  render: () => (
    <ScrmWorkspace
      initialPage="employee-organization"
      renderContext={{
        employeeOrganization: (
          <OrganizationPage
            initialAppliedFilter={{
              keyword: '',
              positionId: 'other',
              roleId: null,
              employmentStatus: 'active',
            }}
          />
        ),
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          '同一完整 SCRM 后台壳下，应用岗位"其他"筛选：根节点在职员工中仅保留岗位为"其他"的记录（何平、方俊、宋佳、于华等），验证组织节点与筛选条件组合过滤。',
      },
    },
  },
};

/** 空数据状态：搜索词无匹配结果。 */
export const 空数据: Story = {
  render: () => (
    <ScrmWorkspace
      initialPage="employee-organization"
      renderContext={{
        employeeOrganization: (
          <OrganizationPage
            initialAppliedFilter={{
              keyword: '不存在',
              positionId: null,
              roleId: null,
              employmentStatus: 'active',
            }}
          />
        ),
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          '同一完整 SCRM 后台壳下，搜索词"不存在"无匹配结果：列表与分页均显示 0 条，后台骨架（导航、顶部系统区域、页签、组织树、筛选区）与正常列表一致，不因空态退回裸页面。',
      },
    },
  },
};
