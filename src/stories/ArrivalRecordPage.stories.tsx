import type { Meta, StoryObj } from '@storybook/react-vite';
import { StoreCustomerList } from '../products/scrm/modules/prospect-management/pages/StoreCustomerList';

/**
 * 到店记录 · 列表 Story：按真实产品菜单归入
 * SCRM → 潜客管理 → 到店记录 → 列表。
 *
 * 渲染完整 SCRM 后台壳（左侧业务导航 + 顶部系统区域 + 顶部页签 + 主内容容器），
 * 通过 initialPage="arrival-record" 让潜客管理子菜单选中"到店记录"并在内容区
 * 展示 ArrivalRecordPage。列表为归集页：提供查询、筛选、查看能力，不提供录入按钮。
 * 编辑 Drawer 状态在 到店记录 → 编辑；新增 Drawer 状态在 到店记录 → 新增。
 */
const meta = {
  title: 'SCRM/潜客管理/到店记录/列表',
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
    initialPage: 'arrival-record',
    arrivalInitialState: 'normal',
  },
  parameters: {
    docs: {
      description: {
        story:
          '完整 SCRM 后台壳（左侧业务导航 + 顶部系统区域 + 顶部页签）下展示到店记录独立页：潜客管理子菜单选中"到店记录"，内容区为 15 项筛选（用户ID、姓名/手机号、客资来源、预约门店、是否到店、是否成交、体验课状态、是否签到、体验课上课教练、到店时间、体验课卡获取时间、合同号、搜索、重置、导出记录）、32 列列表（ID 至 操作，横向滚动、操作列固定右侧）与分页。页面仅提供归集、查询、筛选、查看能力，不提供添加到店记录等录入按钮。',
      },
    },
  },
};

/** 空数据状态 */
export const 空数据: Story = {
  args: {
    initialPage: 'arrival-record',
    arrivalInitialState: 'empty',
  },
  parameters: {
    docs: {
      description: {
        story:
          '同一完整 SCRM 后台壳下，到店记录空数据状态：不加载任何到店记录，列表与分页均显示 0 条。后台骨架（导航、顶部系统区域、页签）与正常列表一致，不因空态退回裸页面。',
      },
    },
  },
};
