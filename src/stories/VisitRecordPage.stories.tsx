import type { Meta, StoryObj } from '@storybook/react-vite';
import { StoreCustomerList } from '../products/scrm/modules/prospect-management/pages/StoreCustomerList';

/**
 * 拜访记录 · 列表 Story：按真实产品菜单归入
 * SCRM → 潜客管理 → 拜访记录 → 列表。
 *
 * 渲染完整 SCRM 后台壳（左侧业务导航 + 顶部系统区域 + 顶部页签 + 主内容容器），
 * 通过 initialPage="visit-record" 让潜客管理子菜单选中"拜访记录"并在内容区
 * 展示 VisitRecordPage。列表为归集页：提供查询、筛选、查看能力，不提供录入按钮。
 * 编辑 Drawer 状态在 拜访记录 → 编辑；新增 Drawer 状态在 拜访记录 → 新增。
 */
const meta = {
  title: 'SCRM/潜客管理/拜访记录/列表',
  component: StoreCustomerList,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof StoreCustomerList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 正常有数据状态 */
export const 正常列表: Story = {
  args: {
    initialPage: 'visit-record',
    visitInitialState: 'normal',
    visitNextVisitTimeFilter: 'all',
  },
  parameters: {
    docs: {
      description: {
        story:
          '完整 SCRM 后台壳（左侧业务导航 + 顶部系统区域 + 顶部页签）下展示拜访记录独立页：潜客管理子菜单选中"拜访记录"，内容区为 11 项筛选（用户ID、姓名/手机号、客资来源、预约门店、拜访方式、拜访时间、创建人、创建时间、搜索、重置、导出记录）、19 列列表（ID 至 操作，含"下次拜访时间"第 7 列，横向滚动、操作列固定右侧）与分页。页面仅提供归集、查询、筛选、查看能力，不提供添加拜访记录等录入按钮。',
      },
    },
  },
};

/** 下次拜访时间有值视角 */
export const 下次拜访时间有值: Story = {
  args: {
    initialPage: 'visit-record',
    visitInitialState: 'normal',
    visitNextVisitTimeFilter: 'has-value',
  },
  parameters: {
    docs: {
      description: {
        story:
          '同一完整 SCRM 后台壳下，以"下次拜访时间有值"视角过滤拜访记录，仅展示已填写下次拜访时间的记录，用于演示第 7 列展示效果。',
      },
    },
  },
};

/** 下次拜访时间为空视角 */
export const 下次拜访时间为空: Story = {
  args: {
    initialPage: 'visit-record',
    visitInitialState: 'normal',
    visitNextVisitTimeFilter: 'empty',
  },
  parameters: {
    docs: {
      description: {
        story:
          '同一完整 SCRM 后台壳下，以"下次拜访时间为空"视角过滤拜访记录，仅展示未填写下次拜访时间的记录，第 7 列统一显示 "--" 占位。',
      },
    },
  },
};

/** 空数据状态 */
export const 空数据: Story = {
  args: {
    initialPage: 'visit-record',
    visitInitialState: 'empty',
    visitNextVisitTimeFilter: 'all',
  },
  parameters: {
    docs: {
      description: {
        story:
          '同一完整 SCRM 后台壳下，拜访记录空数据状态：不加载任何拜访记录，列表与分页均显示 0 条。后台骨架（导航、顶部系统区域、页签）与正常列表一致，不因空态退回裸页面。',
      },
    },
  },
};
