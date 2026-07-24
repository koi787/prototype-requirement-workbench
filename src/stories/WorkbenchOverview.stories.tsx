import type { Meta, StoryObj } from '@storybook/react-vite';
import { WorkbenchOverview } from './WorkbenchOverview';

const meta = {
  title: '工作台能力演示/基础说明',
  component: WorkbenchOverview,
  parameters: {
    controls: { disable: true },
  },
} satisfies Meta<typeof WorkbenchOverview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const 基础说明: Story = {};

