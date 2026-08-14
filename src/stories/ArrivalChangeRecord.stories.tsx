import type { Meta, StoryObj } from '@storybook/react-vite';
import { StoreCustomerList } from '../products/scrm/modules/prospect-management/pages/StoreCustomerList';

/**
 * 到店记录 · 变更记录 Story：按真实产品菜单归入
 * SCRM → 潜客管理 → 到店记录 → 变更记录。
 *
 * 渲染完整 SCRM 后台壳（左侧业务导航 + 顶部系统区域 + 顶部页签 + 主内容容器），
 * 通过 initialPage="arrival-record" 展示到店记录独立页，并以 initialChangeRecordArrivalKey
 * 直接打开真实 ArrivalChangeRecordDrawer（右侧只读 Drawer、标题「变更记录」、
 * 变更前/变更后 明细表格、前端 Mock 分页）。变更记录为独立只读 Mock（§6.6），
 * 不随编辑/新增到店记录自动生成。
 * 列表状态在 到店记录 → 列表；编辑在 到店记录 → 编辑；新增在 到店记录 → 新增。
 */
const meta = {
  title: 'SCRM/潜客管理/到店记录/变更记录',
  component: StoreCustomerList,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof StoreCustomerList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 有变更记录（到店记录 a1，含分页） */
export const 有变更记录: Story = {
  args: {
    initialPage: 'arrival-record',
    initialChangeRecordArrivalKey: 'a1',
  },
  parameters: {
    docs: {
      description: {
        story:
          '到店记录操作 → 变更记录（到店记录 a1 张三）：右侧只读 Drawer 标题「变更记录」，明细表格按 变更时间 | 操作人 | 字段 | 变更前 | 变更后 展示两个变更事件共 12 行（预约门店/合同名称/课程类型/购买金额/购买时间/合同号），底部后台分页显示"共 12 条记录"（每页 10 条，可翻页）。Drawer 只读，无编辑/确定保存按钮。变更记录为独立只读 Mock，不随编辑/新增到店记录自动生成。',
      },
    },
  },
};

/** 空数据（到店记录 a2 无变更记录，真实后台风格空态） */
export const 空数据: Story = {
  args: {
    initialPage: 'arrival-record',
    initialChangeRecordArrivalKey: 'a2',
    arrivalChangeRecordInitialState: 'empty',
  },
  parameters: {
    docs: {
      description: {
        story:
          '到店记录操作 → 变更记录（到店记录 a2 无变更记录）：只读 Drawer 展示真实后台风格空态——明细表格显示"暂无数据"，分页显示"共 0 条记录"。后台骨架（导航、顶部系统区域、页签、到店记录列表）与有数据状态一致，不因空态退回裸页面。',
      },
    },
  },
};
