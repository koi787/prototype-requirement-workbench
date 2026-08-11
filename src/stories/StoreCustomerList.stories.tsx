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
// 0008 闭环二：审批流程 Story
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
// 0011 Cycle 1：门店客户跟进详情 Story
// ============================================================================
// 通过 initialFollowUpDetail 夹具直接复现目标状态，无需人工多步操作；
// 记录 Tab Story 刷新即进入对应 Tab。

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

/** 跟进详情默认跟进流程（王五，空旅程空态可复现） */
export const 跟进详情默认跟进流程: Story = {
  args: {
    initialState: 'normal',
    initialFollowUpDetail: {
      customerKey: '3',
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          '抽屉默认落在"跟进流程"Tab（固定五个 Tab 顺序：跟进流程/到店记录/拜访记录/通话记录/分配记录）。内容按 用户信息 → 跟进概览 → 跟进旅程 三段展示；王五暂无旅程事件，旅程区稳定显示空态"暂无数据"，四张概览卡片（主值 + 分组详细统计）与记录列表同步为空态。',
      },
    },
  },
};

/** 跟进旅程有数据（张三，六条事件时间倒序：到店/通话/拜访/客资有效性） */
export const 跟进详情旅程有数据: Story = {
  args: {
    initialState: 'normal',
    initialFollowUpDetail: {
      customerKey: '1',
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          '跟进流程"跟进旅程"展示张三的到店、通话、拜访与客资有效性事件，按时间倒序（最新在前）；筛选 Select 紧跟标题左侧（六项固定选项：全部/到店记录/拜访记录/通话记录/已丢单/客资有效性），默认"全部"混合展示 6 条。旅程卡按真实系统结构还原：header 为左侧状态标签 + 右侧"详情"、下浅分隔线，body 为单列纵向字段（到店卡：到店时间/预约门店/体验课/改善需求/意向课程；拜访卡：拜访时间/改善需求/意向课程；客资有效性卡：标注无效客资/恢复有效客资 标签 + 提交时间/提交员工/备注/附件静态占位）。列表底部为现有后台风格分页（默认 10 条/页，共 6 条，切换筛选后总数与分页状态同步）。',
      },
    },
  },
};

/** 到店记录 Tab（32 列，刷新直接进入） */
export const 跟进详情到店记录: Story = {
  args: {
    initialState: 'normal',
    initialFollowUpDetail: {
      customerKey: '1',
      tab: 'arrival',
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          '刷新即直接进入"到店记录"Tab。表格为 32 列（ID 至 操作），横向滚动，操作列固定在右侧；用户姓名蓝色链接、是否到店/是否成交状态标签、金额统一两位小数（空值显示 --）。',
      },
    },
  },
};

/** 拜访记录 Tab（18 列，刷新直接进入） */
export const 跟进详情拜访记录: Story = {
  args: {
    initialState: 'normal',
    initialFollowUpDetail: {
      customerKey: '1',
      tab: 'visit',
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          '刷新即直接进入"拜访记录"Tab。表格为 18 列（ID 至 操作），横向滚动，操作列固定在右侧；拜访方式与意向度、改善需求、意向课程等字段完整展示。',
      },
    },
  },
};

/** 通话记录 Tab（13 列，刷新直接进入） */
export const 跟进详情通话记录: Story = {
  args: {
    initialState: 'normal',
    initialFollowUpDetail: {
      customerKey: '1',
      tab: 'call',
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          '刷新即直接进入"通话记录"Tab。表格为 13 列（ID 至 操作），横向滚动，操作列固定在右侧；通话时长以蓝色音频样式展示，本阶段不实现播放能力。',
      },
    },
  },
};

/** 分配记录 Tab（2 列，刷新直接进入） */
export const 跟进详情分配记录: Story = {
  args: {
    initialState: 'normal',
    initialFollowUpDetail: {
      customerKey: '1',
      tab: 'assignment',
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          '刷新即直接进入"分配记录"Tab。表格仅 分配人/分配时间 两列，无操作列、不制造横向滚动。',
      },
    },
  },
};

/** 需求查看模式 - 跟进详情（需求点与跟进详情共存） */
export const 需求查看模式跟进详情: Story = {
  args: {
    initialState: 'normal',
    initialRequirementMode: 'requirement',
    initialFollowUpDetail: {
      customerKey: '1',
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          '需求查看模式下打开跟进详情抽屉，验证 0011 页面与既有需求锚点体系兼容：列表中的需求编号点点击只打开需求说明，不触发跟进详情业务；跟进详情抽屉独立展示，两者互不干扰。',
      },
    },
  },
};
