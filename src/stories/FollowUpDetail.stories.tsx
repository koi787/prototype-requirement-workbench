import type { Meta, StoryObj } from '@storybook/react-vite';
import { StoreCustomerList } from '../products/scrm/modules/prospect-management/pages/StoreCustomerList';

/**
 * 门店客户 · 跟进详情 Story：按真实产品菜单归入
 * SCRM → 潜客管理 → 门店客户 → 跟进详情。
 *
 * 通过 initialFollowUpDetail 夹具直接复现各 Tab 目标状态（刷新即进入），
 * 渲染真实 FollowUpDetailDrawer 与列表；跟进详情入口本身在
 * 门店客户 → 列表（操作菜单打开跟进详情）。
 */
const meta = {
  title: 'SCRM/潜客管理/门店客户/跟进详情',
  component: StoreCustomerList,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof StoreCustomerList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 默认流程（王五，空旅程空态可复现） */
export const 默认流程: Story = {
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

/** 旅程有数据（张三，六条事件时间倒序：到店/通话/拜访/客资有效性） */
export const 旅程有数据: Story = {
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
export const 到店记录: Story = {
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

/** 拜访记录 Tab（19 列，含下次拜访时间，刷新直接进入） */
export const 拜访记录: Story = {
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
          '刷新即直接进入"拜访记录"Tab。表格为 19 列，前 7 列为用户姓名、手机号、下次拜访时间、意向度、改善需求、意向课程、拜访备注（下次拜访时间按 YYYY-MM-DD HH:mm:ss 展示，空值显示 --），横向滚动，操作列固定在右侧；其余字段完整展示。该 Tab 与"潜客管理 → 拜访记录"独立页共用同一套共享列定义。',
      },
    },
  },
};

/** 通话记录 Tab（13 列，刷新直接进入） */
export const 通话记录: Story = {
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
export const 分配记录: Story = {
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

/** 需求查看模式（需求点与跟进详情共存） */
export const 需求查看模式: Story = {
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
