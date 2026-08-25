import type { Meta, StoryObj } from '@storybook/react-vite';
import { ScrmWorkspace } from '../products/scrm/shell/ScrmWorkspace';

const meta = {
  title: 'SCRM/客户/客户列表',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const 正常列表: Story = {
  render: () => <ScrmWorkspace initialPage="customer-list" />,
};
