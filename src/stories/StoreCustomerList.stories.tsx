import type { Meta, StoryObj } from '@storybook/react-vite';
import { StoreCustomerList } from '../products/scrm/modules/prospect-management/pages/StoreCustomerList';

const meta = {
  title: 'SCRM/潜客管理/门店客户',
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
    initialState: 'normal',
  },
};

/** 首次加载状态 */
export const 首次加载: Story = {
  args: {
    initialState: 'loading',
  },
};

/** 筛选后无结果状态（F-02：通过initialState稳定展示，无需人工操作） */
export const 筛选无结果: Story = {
  args: {
    initialState: 'noResults',
  },
};

/** 空数据状态 */
export const 空数据: Story = {
  args: {
    initialState: 'empty',
  },
};

/** 查询失败状态 */
export const 查询失败: Story = {
  args: {
    initialState: 'error',
  },
};

/** 导出成功反馈（F-03：通过initialExportMessage稳定展示，刷新可复现） */
export const 导出成功反馈: Story = {
  args: {
    initialState: 'normal',
    initialExportMessage: '导出任务已创建',
  },
};

/** 原型体验模式（默认模式，不显示需求编号点） */
export const 原型体验模式: Story = {
  args: {
    initialState: 'normal',
    initialRequirementMode: 'prototype',
  },
};

/** 需求查看模式（显示12个需求编号点，可点击查看需求说明） */
export const 需求查看模式: Story = {
  args: {
    initialState: 'normal',
    initialRequirementMode: 'requirement',
  },
};
