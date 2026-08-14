import type { Meta, StoryObj } from '@storybook/react-vite';
import { StoreCustomerList } from '../products/scrm/modules/prospect-management/pages/StoreCustomerList';

/**
 * 门店客户 · 列表 Story：按真实产品菜单归入
 * SCRM → 潜客管理 → 门店客户 → 列表。
 *
 * 列表能力分组下展示既有列表状态（正常/首次加载/筛选无结果/空数据/查询失败/
 * 导出成功反馈/原型体验模式/需求查看模式/无效审批状态/跟进详情入口）。
 * 跟进详情各 Tab 状态在 门店客户 → 跟进详情 分组（FollowUpDetail.stories.tsx）。
 */
const meta = {
  title: 'SCRM/潜客管理/门店客户/列表',
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
  parameters: {
    docs: {
      description: {
        story:
          '第一页展示前 10 条记录，共 52 列：第 9 列为标记无效客资，第 10 列为拜访次数，第 11 列为近7天到店次数，第 12 列为无效审批状态，第 13 列为 ID；标记无效客资与无效审批状态保持独立业务语义；尾部顺序为最新留资时间 → 首次分配时间（第 50 列）→ 创建时间（第 51 列）→ 操作（第 52 列）。',
      },
    },
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

/** 需求查看模式（显示需求编号点，可点击查看需求说明） */
export const 需求查看模式: Story = {
  args: {
    initialState: 'normal',
    initialRequirementMode: 'requirement',
  },
};

// ============================================================================
// 无效客资审批：门店客户列表上的状态 Story
// ============================================================================

/** 待审核状态（第一页有 pending 记录，操作菜单显示"审核无效标注"） */
export const 无效审批待审核: Story = {
  args: {
    initialState: 'normal',
  },
  parameters: {
    docs: {
      description: {
        story:
          '第一页包含李四（待审核）的列表，操作菜单显示"审核无效标注"。点击状态标签可查看详情。',
      },
    },
  },
};

/** 审核通过完整详情（第一页有 approved 记录） */
export const 无效审批通过: Story = {
  args: {
    initialState: 'normal',
  },
  parameters: {
    docs: {
      description: {
        story:
          '第一页包含陈晨（审核通过）的记录，操作菜单不显示无效审批相关操作。点击状态标签可查看完整申请和审核详情。',
      },
    },
  },
};

/** 审核退回完整详情（第一页有 rejected 记录） */
export const 无效审批退回: Story = {
  args: {
    initialState: 'normal',
  },
  parameters: {
    docs: {
      description: {
        story:
          '第一页包含周杰（审核退回）的记录，操作菜单显示"标记无效客资"。点击状态标签可查看完整申请和退回详情。',
      },
    },
  },
};

/** 需求查看模式 - 审批流程需求点可见 */
export const 需求查看模式审批流程: Story = {
  args: {
    initialState: 'normal',
    initialRequirementMode: 'requirement',
  },
  parameters: {
    docs: {
      description: {
        story:
          '需求查看模式下展开操作菜单，可见审批流程需求编号点，点击编号只打开需求说明，不执行申请或审核业务动作。',
      },
    },
  },
};

// ============================================================================
// 跟进详情入口：门店客户列表行操作菜单的入口状态
// ============================================================================

/** 操作菜单打开跟进详情（唯一入口） */
export const 操作菜单打开跟进详情: Story = {
  args: {
    initialState: 'normal',
  },
  parameters: {
    docs: {
      description: {
        story:
          '门店客户列表行级"操作"菜单第一项为"跟进详情"（唯一入口）。点击后在右侧打开一级抽屉：标题"跟进详情"、宽度 70vw、右上角可关闭；抽屉打开期间底层列表的筛选、排序、分页与滚动位置保持不变。本 Story 展示入口所在列表状态，点击任意行操作菜单即可验证打开效果。',
      },
    },
  },
};
