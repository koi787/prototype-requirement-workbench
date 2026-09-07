import type { Meta, StoryObj } from '@storybook/react-vite';
import { CustomerListPage } from '../products/scrm/modules/customer-management';
import { ScrmWorkspace } from '../products/scrm/shell/ScrmWorkspace';

const meta = {
  title: 'SCRM/客户/客户详情/体测美容记录/美容记录',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function renderBeautyRecord(
  props: React.ComponentProps<typeof CustomerListPage> = {},
) {
  return (
    <ScrmWorkspace
      initialPage="customer-list"
      renderContext={{
        customerList: (
          <CustomerListPage
            initialDetailCustomerId="customer-53395"
            initialDetailTab="assessment"
            initialAssessmentView="beauty"
            {...props}
          />
        ),
      }}
    />
  );
}

export const 正常列表: Story = {
  render: () => renderBeautyRecord(),
};

export const 多条记录切换: Story = {
  render: () => renderBeautyRecord(),
};

export const 空数据: Story = {
  render: () => renderBeautyRecord({ initialDetailCustomerId: 'customer-53394' }),
};

export const 报告详情: Story = {
  render: () => renderBeautyRecord({ initialBeautyRecordId: 'beauty-prototype-100' }),
};

export const 单项报告展开: Story = {
  render: () => renderBeautyRecord({ initialBeautyRecordId: 'beauty-prototype-100' }),
};
