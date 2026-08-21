import type { Meta, StoryObj } from '@storybook/react-vite';
import { RequirementHistoryListPage } from '../workbench/requirement-history';

const meta = {
  title: '需求实现记录',
  component: RequirementHistoryListPage,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof RequirementHistoryListPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const 列表: Story = {};
