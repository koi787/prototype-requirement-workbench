import type { Meta, StoryObj } from '@storybook/react-vite';
import { ScrmWorkspace } from '../products/scrm/shell/ScrmWorkspace';
import { OrganizationPage, EMPLOYEE_MOCK } from '../products/scrm/modules/employee-management/organization';
import type { OrganizationPageProps, EmployeeRecord } from '../products/scrm/modules/employee-management/organization';

/**
 * 员工 · 组织架构 · 编辑 Story（0014 Cycle B §17）。
 *
 * 展示右侧"修改资料"Drawer（edit 模式，与新增复用同一个 EmployeeDrawer）：
 * 标题"修改资料"、大尺寸、可纵向滚动、Footer 确定/取消。员工编号回填且 disabled
 * 只读；姓名 / 手机号 / 人脸照片 / 岗位 / 薪酬类型 / 三个业务 Switch /
 * 可登录门店 / 业绩门店 / 绑定角色 完整回填该员工记录。
 *
 * 通过 initialDrawer 直接打开 edit Drawer 展示回填状态；Story 不复制业务组件。
 */
const meta = {
  title: 'SCRM/员工/组织架构/编辑',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<OrganizationPageProps>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 默认回填：修改资料 Drawer 完整回填员工全部字段（何平，含人脸照片回填）。 */
export const 默认回填: Story = {
  render: () => (
    <ScrmWorkspace
      initialPage="employee-organization"
      renderContext={{ employeeOrganization: <OrganizationPage initialDrawer={{ mode: 'edit', employee: employeeById('E-10001') }} /> }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          '编辑 Drawer 的默认回填状态（员工何平）：标题"修改资料"；员工编号"10001"回填且只读（disabled）；姓名/手机号回填；人脸照片回填本地预览图；岗位"其他"勾选；薪酬类型"业绩提成+基础课时费"；用户完整手机号与加盟商对账 Switch 打开、联营店对账关闭；可登录门店右侧"已添加门店"含"万象美容二店""绿城鹿鸣东方店"；业绩门店"示例旗舰店"；绑定角色"管理员"勾选。取消不修改记录，确定写回原记录并刷新更新时间/操作人。',
      },
    },
  },
};

/** 门店选择：可登录门店 Transfer 双栏已选择（曹磊，2 家门店在右侧已添加）。 */
export const 门店选择: Story = {
  render: () => (
    <ScrmWorkspace
      initialPage="employee-organization"
      renderContext={{ employeeOrganization: <OrganizationPage initialDrawer={{ mode: 'edit', employee: employeeById('E-10002') }} /> }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          '编辑 Drawer 的"可登录门店"回填状态（员工曹磊）：Transfer 左栏"可添加门店"含剩余 5 家稳定 Mock 门店，右栏"已添加门店"已含"万象美容二店""绿城鹿鸣东方店"，两栏随加宽 Drawer 自适应伸展，顶部各栏标题与数量、搜索框、中间蓝色方形箭头移动按钮齐全；可通过左右栏搜索、勾选与移动按钮调整后保存写回 loginStoreIds。',
      },
    },
  },
};

/** 多角色：绑定角色多列网格多选回填（曹磊，4 个角色勾选）。 */
export const 多角色: Story = {
  render: () => (
    <ScrmWorkspace
      initialPage="employee-organization"
      renderContext={{ employeeOrganization: <OrganizationPage initialDrawer={{ mode: 'edit', employee: employeeById('E-10002') }} /> }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          '编辑 Drawer 的"绑定角色"多选回填状态（员工曹磊）：绑定角色 2 列网格已勾选"区域经理/美容店长/销售顾问/培训专家"4 个角色，两列间横向留白较大，列表可纵向长滚动（全量 44 个稳定 Mock 角色），只保存 roleIds。',
      },
    },
  },
};

/** 多岗位：岗位多选回填（冯雪，美容顾问/店长/其他 三岗位共存）。 */
export const 多岗位: Story = {
  render: () => (
    <ScrmWorkspace
      initialPage="employee-organization"
      renderContext={{ employeeOrganization: <OrganizationPage initialDrawer={{ mode: 'edit', employee: employeeById('E-10019') }} /> }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          '编辑 Drawer 的"岗位"多选回填状态（员工冯雪）：岗位勾选"美容顾问/店长/其他"三值共存（不含互斥的瑜伽教练/美容师组合），验证岗位与美容顾问、店长、其他可共存；同时可登录门店已添加 3 家门店、绑定角色勾选 3 个，完整展示多岗位编辑回填。',
      },
    },
  },
};
function employeeById(id: string): EmployeeRecord {
  const record = EMPLOYEE_MOCK.find((item) => item.id === id);
  if (!record) throw new Error(`Mock 缺少员工 ${id}`);
  return record;
}
