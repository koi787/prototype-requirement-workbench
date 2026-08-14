import type { Meta, StoryObj } from '@storybook/react-vite';
import { StoreCustomerList } from '../products/scrm/modules/prospect-management/pages/StoreCustomerList';

/**
 * 拜访记录 · 编辑 Story：按真实产品菜单归入
 * SCRM → 潜客管理 → 拜访记录 → 编辑。
 *
 * 编辑状态均渲染真实 VisitRecordDrawer（右侧 50vw、覆盖底部页面、右上角关闭），
 * 通过 initialRecordEdit 打开并回填既有记录，非 Story 定制副本。
 * 列表状态在 拜访记录 → 列表；新增状态在 拜访记录 → 新增。
 */
const meta = {
  title: 'SCRM/潜客管理/拜访记录/编辑',
  component: StoreCustomerList,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof StoreCustomerList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 默认回填（v1 张三） */
export const 默认回填: Story = {
  args: {
    initialPage: 'visit-record',
    initialRecordEdit: { kind: 'visit', recordKey: 'v1' },
  },
  parameters: {
    docs: {
      description: {
        story:
          '编辑拜访记录 Drawer（右侧 50vw、覆盖底部页面、右上角关闭）：打开即回填张三（v1）的记录。"用户信息"只读两行展示 姓名|客资来源 / 注册时间；"拜访信息"按顺序回填 拜访方式/拜访时间/意向度/改善需求/意向课程/下次拜访时间/拜访备注，意向度为 1–5 三键步进器 [－] 1 [＋]，下次拜访时间可修改可清空；窄表单横向 label|control 不铺满，确定/取消在表单主体下方（无 sticky footer），确定校验必填后调用运行时状态原位更新。',
      },
    },
  },
};

/** 下次拜访时间有值（v3 陈晨） */
export const 下次拜访时间有值: Story = {
  args: {
    initialPage: 'visit-record',
    initialRecordEdit: { kind: 'visit', recordKey: 'v3' },
  },
  parameters: {
    docs: {
      description: {
        story:
          '编辑拜访记录 Drawer 展示"下次拜访时间有值"记录（陈晨 v3）：下次拜访时间输入框回填 2026-08-05 15:00:00，格式 YYYY-MM-DD HH:mm:ss，可修改、可清空。',
      },
    },
  },
};

/** 下次拜访时间为空（v2 张三） */
export const 下次拜访时间为空: Story = {
  args: {
    initialPage: 'visit-record',
    initialRecordEdit: { kind: 'visit', recordKey: 'v2' },
  },
  parameters: {
    docs: {
      description: {
        story:
          '编辑拜访记录 Drawer 展示"下次拜访时间为空"记录（张三 v2）：下次拜访时间为可空非必填字段，输入框为空；其余必填字段完整时确定可用，保存后列表该列显示 "--"。',
      },
    },
  },
};
