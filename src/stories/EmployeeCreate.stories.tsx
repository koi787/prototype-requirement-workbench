import type { Meta, StoryObj } from '@storybook/react-vite';
import { ScrmWorkspace } from '../products/scrm/shell/ScrmWorkspace';
import { OrganizationPage, FACE_PHOTO_MOCK } from '../products/scrm/modules/employee-management/organization';
import type { OrganizationPageProps } from '../products/scrm/modules/employee-management/organization';

/**
 * 员工 · 组织架构 · 新增 Story（0014 Cycle B §17）。
 *
 * 展示右侧"新增员工"Drawer（create 模式）：标题"新增员工"、大尺寸（720px）、
 * 可纵向滚动、Footer 确定/取消。字段集合与编辑完全复用同一个 EmployeeDrawer
 * （不拆分 Create/Edit 两套 Drawer）：
 *   姓名 / 员工编号（可编辑）/ 手机号 / 人脸照片（create 默认无照片占位）/
 *   岗位多选（瑜伽教练↔美容师互斥）/ 薪酬类型 / 三个业务 Switch（默认关）/
 *   可登录门店 Transfer（左"可添加门店"右"已添加门店"）/ 业绩门店 / 绑定角色多列。
 *
 * 调用链固定为 ScrmWorkspace → employee-organization → OrganizationPage，
 * 使用真实 EmployeeDrawer，不复制业务组件。
 */
const meta = {
  title: 'SCRM/员工/组织架构/新增',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<OrganizationPageProps>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 默认状态：点击"新增员工"后打开的空白 Drawer（无照片占位、三项 Switch 默认关）。 */
export const 默认状态: Story = {
  render: () => (
    <ScrmWorkspace
      initialPage="employee-organization"
      renderContext={{ employeeOrganization: <OrganizationPage initialDrawer={{ mode: 'create' }} /> }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          '完整 SCRM 后台壳下直接打开"新增员工"Drawer（create 模式）：标题"新增员工"，右侧大尺寸 Drawer 可纵向滚动，Footer 确定/取消。姓名 / 员工编号 / 手机号人工填写（员工编号可编辑）；人脸照片显示"相机图标 + 选择照片"占位；岗位默认全不选；薪酬类型待选；用户完整手机号 / 加盟商对账 / 联营店对账三个 Switch 默认关闭（关闭态为红色）；可登录门店左侧"可添加门店"含 7 家稳定 Mock 门店、右侧"已添加门店"为空；业绩门店待选；绑定角色 2 列多选、可长滚动。确定触发必填校验，取消关闭且不保存。',
      },
    },
  },
};

/** 填写后：create Drawer 已填入一整套合法字段的"已填写"状态。 */
export const 填写后: Story = {
  render: () => (
    <ScrmWorkspace
      initialPage="employee-organization"
      renderContext={{
        employeeOrganization: (
          <OrganizationPage
            initialDrawer={{
              mode: 'create',
              createDraft: {
                name: '张小雅',
                employeeNo: '10028',
                mobile: '13912349876',
                facePhoto: FACE_PHOTO_MOCK,
                positionIds: ['beautician', 'store-manager'],
                salaryTypeId: 'salary-perf-base',
                fullMobileVisible: true,
                franchiseReconciliation: true,
                jointStoreReconciliation: false,
                loginStoreIds: ['store-wanxiang', 'store-lvcheng'],
                performanceStoreId: 'store-qiji',
                roleIds: ['role-beautician', 'role-beauty-permission', 'role-sales'],
              },
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
          '新增员工 Drawer 的"已填写"状态：姓名"张小雅"、员工编号"10028"、手机号"13912349876"、人脸照片已选本地预览图、岗位勾选"美容师 + 店长"、薪酬类型"业绩提成+基础课时费"、用户完整手机号与加盟商对账打开、可登录门店已添加"万象美容二店""绿城鹿鸣东方店"两栏同步、业绩门店"示例旗舰店"、绑定角色勾选"美容师/美容权限/销售顾问"两列网格。确定后保存写回员工 Runtime 集合（组织节点绑定当前选中组织），取消关闭且不保存。',
      },
    },
  },
};
