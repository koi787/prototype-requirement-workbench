import type { Meta, StoryObj } from '@storybook/react-vite';
import { CustomerListPage } from '../products/scrm/modules/customer-management';
import { ScrmWorkspace } from '../products/scrm/shell/ScrmWorkspace';

const meta = {
  title: 'SCRM/客户/客户详情',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const 基本信息: Story = {
  render: () => (
    <ScrmWorkspace
      initialPage="customer-list"
      renderContext={{
        customerList: <CustomerListPage initialDetailCustomerId="customer-53395" />,
      }}
    />
  ),
};
