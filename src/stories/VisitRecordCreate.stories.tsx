import type { Meta, StoryObj } from '@storybook/react-vite';
import { StoreCustomerList } from '../products/scrm/modules/prospect-management/pages/StoreCustomerList';

/**
 * 拜访记录 · 新增 Story：按真实产品菜单归入
 * SCRM → 潜客管理 → 拜访记录 → 新增。
 *
 * 新增状态均渲染真实 VisitRecordDrawer 的 create 模式（同一组件复用，标题
 * "添加拜访记录"、右侧 50vw），入口来自真实业务位置：
 * - 跟进详情（一级 70vw Drawer 保持在下层，create 50vw 覆盖其上）；
 * - 门店客户行操作菜单"添加拜访记录"。
 * create 状态：默认值（意向度 1）、下次拜访时间空/有值，均为同一 create Drawer
 * 的真实状态（initialRecordCreate.draft 仅用于稳定展示"已填写"状态）。
 */
const meta = {
  title: 'SCRM/潜客管理/拜访记录/新增',
  component: StoreCustomerList,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof StoreCustomerList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 从门店客户进入（行操作菜单"添加拜访记录"，客户赵敏） */
export const 从门店客户进入: Story = {
  args: {
    initialRecordCreate: { kind: 'visit', customerKey: '6' },
  },
  parameters: {
    docs: {
      description: {
        story:
          '门店客户列表行操作菜单"添加拜访记录"：在门店客户页某行的操作菜单点击"添加拜访记录"，复用 VisitRecordDrawer 的 create 模式。本 Story 直接打开该入口的 create Drawer 结果（客户赵敏）——展示"添加拜访记录"标题、用户信息只读区、拜访信息 7 个字段与默认意向度 1。独立归集页（拜访记录）不提供新增入口。',
      },
    },
  },
};

/** 从跟进详情进入（跟进详情一级 70vw 保持在下层，create 50vw 覆盖其上） */
export const 从跟进详情进入: Story = {
  args: {
    initialFollowUpDetail: { customerKey: '1', tab: 'process' },
    initialRecordCreate: { kind: 'visit', customerKey: '1' },
  },
  parameters: {
    docs: {
      description: {
        story:
          '门店客户→跟进详情（一级 70vw Drawer）→"添加拜访记录"按钮：在跟进流程 Tab 的用户信息操作条点击"添加拜访记录"，复用 VisitRecordDrawer 的 create 模式（标题"添加拜访记录"、右侧 50vw）。本 Story 直接打开该入口的最终状态——一级跟进详情 Drawer 保持在下层，create Drawer 覆盖其上。拜访信息 7 个字段：拜访方式（系统外呼/自主拨打/企微/微信）、拜访时间、意向度（默认 1）、改善需求、意向课程、下次拜访时间（可空，默认空）、拜访备注（默认空）。',
      },
    },
  },
};

/** 默认值：意向度默认 1，下次拜访时间默认空 */
export const 默认值: Story = {
  args: {
    initialRecordCreate: { kind: 'visit', customerKey: '1' },
  },
  parameters: {
    docs: {
      description: {
        story:
          '添加拜访记录 create Drawer 默认状态（客户张三）：意向度步进器默认 1，拜访方式/拜访时间为空（必填），下次拜访时间默认空（可空），拜访备注默认空。',
      },
    },
  },
};

/** 下次拜访时间为空 */
export const 下次拜访时间为空: Story = {
  args: {
    initialRecordCreate: { kind: 'visit', customerKey: '5' },
  },
  parameters: {
    docs: {
      description: {
        story:
          '添加拜访记录 create（客户陈晨）：下次拜访时间为可空非必填字段，create 默认空；不填写时新建记录 nextVisitTime 为 null，列表该列显示"--"。',
      },
    },
  },
};

/** 下次拜访时间有值 */
export const 下次拜访时间有值: Story = {
  args: {
    initialRecordCreate: {
      kind: 'visit',
      customerKey: '5',
      draft: { nextVisitTime: '2026-08-20 10:00:00' },
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          '添加拜访记录 create（客户陈晨）：下次拜访时间填写"2026-08-20 10:00:00"（YYYY-MM-DD HH:mm:ss）的"已填写"状态展示；保存时新建记录携带该值，列表按时间显示。',
      },
    },
  },
};
