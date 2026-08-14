import type { Meta, StoryObj } from '@storybook/react-vite';
import { StoreCustomerList } from '../products/scrm/modules/prospect-management/pages/StoreCustomerList';

/**
 * 到店记录 · 编辑 Story：按真实产品菜单归入
 * SCRM → 潜客管理 → 到店记录 → 编辑。
 *
 * 编辑状态均渲染真实 ArrivalRecordDrawer（右侧 50vw、覆盖底部页面、右上角关闭），
 * 通过 initialRecordEdit 打开并回填既有记录，非 Story 定制副本。
 * 列表状态在 到店记录 → 列表；新增状态在 到店记录 → 新增。
 */
const meta = {
  title: 'SCRM/潜客管理/到店记录/编辑',
  component: StoreCustomerList,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof StoreCustomerList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 默认回填（a1 张三） */
export const 默认回填: Story = {
  args: {
    initialPage: 'arrival-record',
    initialRecordEdit: { kind: 'arrival', recordKey: 'a1' },
  },
  parameters: {
    docs: {
      description: {
        story:
          '编辑到店记录 Drawer（右侧 50vw、覆盖底部页面、右上角关闭）：打开即回填张三（a1）的记录。"用户信息"只读两行展示 姓名|客资来源 / 注册时间；"到店信息"标题行右侧展示当前状态（已到店/已成交 只读 Tag），按顺序回填 预约门店/体验课（一行只读关联信息）/到店时间/意向度/改善需求/意向课程/预约备注；确定/取消在到店信息表单主体下方（无 sticky footer），其下"结果分析"分区为独立视觉但与其他到店字段一起保存。',
      },
    },
  },
};

/** 已到店未成交（a2 张三） */
export const 已到店未成交: Story = {
  args: {
    initialPage: 'arrival-record',
    initialRecordEdit: { kind: 'arrival', recordKey: 'a2' },
  },
  parameters: {
    docs: {
      description: {
        story:
          '编辑到店记录 Drawer 展示"已到店/未成交"记录（张三 a2）：当前状态区只读显示 已到店（蓝色 Tag）+ 未成交（橙色 Tag），本期不编辑状态字段，仅作业务上下文展示。',
      },
    },
  },
};

/** 结果分析为空（a7 赵敏） */
export const 结果分析为空: Story = {
  args: {
    initialPage: 'arrival-record',
    initialRecordEdit: { kind: 'arrival', recordKey: 'a7' },
  },
  parameters: {
    docs: {
      description: {
        story:
          '编辑到店记录 Drawer 展示"结果分析为空"记录（赵敏 a7）：结果分析文本域为空，结果分析为普通业务字段，不填写不影响必填校验与保存。',
      },
    },
  },
};

/** 结果分析有值（a4 陈晨） */
export const 结果分析有值: Story = {
  args: {
    initialPage: 'arrival-record',
    initialRecordEdit: { kind: 'arrival', recordKey: 'a4' },
  },
  parameters: {
    docs: {
      description: {
        story:
          '编辑到店记录 Drawer 展示"结果分析有值"记录（陈晨 a4）：按钮下方独立"结果分析"分区的文本域回填当前值"体验良好，当天下单"，修改后保存随到店记录原位更新。',
      },
    },
  },
};
