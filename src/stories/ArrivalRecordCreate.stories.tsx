import type { Meta, StoryObj } from '@storybook/react-vite';
import { StoreCustomerList } from '../products/scrm/modules/prospect-management/pages/StoreCustomerList';

/**
 * 到店记录 · 新增 Story：按真实产品菜单归入
 * SCRM → 潜客管理 → 到店记录 → 新增。
 *
 * 新增状态均渲染真实 ArrivalRecordDrawer 的 create 模式（同一组件复用，标题
 * "添加到店"、右侧 50vw），入口来自真实业务位置：
 * - 跟进详情（一级 70vw Drawer 保持在下层，create 50vw 覆盖其上）；
 * - 门店客户行操作菜单"添加到店"。
 * create 状态：默认值（意向度 1）、结果分析空/有值，均为同一 create Drawer
 * 的真实状态（initialRecordCreate.draft 仅用于稳定展示"已填写"状态）。
 */
const meta = {
  title: 'SCRM/潜客管理/到店记录/新增',
  component: StoreCustomerList,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof StoreCustomerList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 从门店客户进入（行操作菜单"添加到店"，客户陈晨） */
export const 从门店客户进入: Story = {
  args: {
    initialRecordCreate: { kind: 'arrival', customerKey: '5' },
  },
  parameters: {
    docs: {
      description: {
        story:
          '门店客户列表行操作菜单"添加到店"：在门店客户页某行的操作菜单点击"添加到店"，复用 ArrivalRecordDrawer 的 create 模式。本 Story 直接打开该入口的 create Drawer 结果（客户陈晨）——展示"添加到店"标题、用户信息只读区、到店信息必填字段与默认意向度 1。独立归集页（到店记录）不提供新增入口。',
      },
    },
  },
};

/** 从跟进详情进入（跟进详情一级 70vw 保持在下层，create 50vw 覆盖其上） */
export const 从跟进详情进入: Story = {
  args: {
    initialFollowUpDetail: { customerKey: '1', tab: 'process' },
    initialRecordCreate: { kind: 'arrival', customerKey: '1' },
  },
  parameters: {
    docs: {
      description: {
        story:
          '门店客户→跟进详情（一级 70vw Drawer）→"添加到店"按钮：在跟进流程 Tab 的用户信息操作条点击"添加到店"，复用 ArrivalRecordDrawer 的 create 模式（标题"添加到店"、右侧 50vw）。本 Story 直接打开该入口的最终状态——一级跟进详情 Drawer 保持在下层，create Drawer 覆盖其上（多层 Drawer 真实业务行为，不关闭一级抽屉）。用户信息只读展示当前客户 姓名|客资来源/注册时间；到店信息必填：预约门店、到店时间、意向度（默认 1）、改善需求、意向课程，体验课为课程类型 Select（非必填）；下方"结果分析"分区与其他到店字段一起保存。',
      },
    },
  },
};

/** 默认值：意向度默认 1，其余字段空 */
export const 默认值: Story = {
  args: {
    initialRecordCreate: { kind: 'arrival', customerKey: '1' },
  },
  parameters: {
    docs: {
      description: {
        story:
          '添加到店 create Drawer 默认状态（客户张三）：意向度步进器默认 1，预约门店/到店时间/改善需求/意向课程为空（必填校验通过前"确定"禁用），体验课课程类型未选择，预约备注与结果分析为空。',
      },
    },
  },
};

/** 结果分析为空 */
export const 结果分析为空: Story = {
  args: {
    initialRecordCreate: { kind: 'arrival', customerKey: '6' },
  },
  parameters: {
    docs: {
      description: {
        story:
          '添加到店 create（客户赵敏）：结果分析分区为普通业务字段，create 默认空；空值不参与必填校验，保存后随到店记录写入（空字符串）。',
      },
    },
  },
};

/** 结果分析有值 */
export const 结果分析有值: Story = {
  args: {
    initialRecordCreate: {
      kind: 'arrival',
      customerKey: '6',
      draft: { resultAnalysis: '到店体验良好，家长意向明确' },
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          '添加到店 create（客户赵敏）：结果分析分区填写"到店体验良好，家长意向明确"的"已填写"状态展示；保存时随到店记录一起写入（结果分析不是独立实体）。',
      },
    },
  },
};
