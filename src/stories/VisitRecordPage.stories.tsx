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
          '完整 SCRM 后台壳（左侧业务导航 + 顶部系统区域 + 顶部页签）下展示拜访记录独立页：潜客管理子菜单选中"拜访记录"，内容区为 12 项筛选（含"下次拜访时间"日期范围与今天/未来7天/未来30天/未来半年快捷范围、搜索、重置、导出记录）、19 列列表（前 7 列为用户姓名、手机号、下次拜访时间、意向度、改善需求、意向课程、拜访备注，横向滚动、操作列固定右侧）与分页。页面仅提供归集、查询、筛选、查看能力，不提供添加拜访记录等录入按钮。',
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
          '同一完整 SCRM 后台壳下，以"下次拜访时间有值"视角过滤拜访记录，仅展示已填写下次拜访时间的记录，用于演示重点字段前置后的列表效果。',
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
          '同一完整 SCRM 后台壳下，以"下次拜访时间为空"视角过滤拜访记录，仅展示未填写下次拜访时间的记录，该列统一显示 "--" 占位。',
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
