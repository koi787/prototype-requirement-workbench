import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent } from 'storybook/test';
import { AobenSportMobileRoot } from '../products/aoben-sport-mobile';
import { BEAUTY_REPORTS } from '../shared/beauty-assessment';

const meta = {
  title: '移动端｜奥本运动/美容检测/报告详情',
  component: AobenSportMobileRoot,
  args: { initialView: 'beauty-assessment' },
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta<typeof AobenSportMobileRoot>;
export default meta;
type Story = StoryObj<typeof meta>;

export const 最近一次报告: Story = {};
export const 历史报告: Story = { args: { initialBeautyRecordId: 'beauty-prototype-900' } };
export const 单项报告展开: Story = {
  parameters: { docs: { description: { story: '真实 Root 中展开有厂家原文的油脂与黑头；空明细项目保留数值槽位，但不提供展开入口。' } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '油脂 74分 B' }));
    await userEvent.click(canvas.getByRole('button', { name: '黑头 61分 B' }));
  },
};

const gradePreviewSource = BEAUTY_REPORTS[0];
const gradePreviewReport = gradePreviewSource ? {
  ...gradePreviewSource,
  recordId: 'beauty-grade-preview',
  items: ['A', 'B', 'C', 'D'].map((levelName, index) => {
    const baseItem = gradePreviewSource.items[index];
    if (!baseItem) throw new Error(`Expected grade preview item at index ${index}`);
    return { ...baseItem, type: `grade-preview-${levelName}`, name: `等级${levelName}`, levelName };
  }),
} : undefined;

/** 仅用于验收低饱和等级徽章颜色，不改变正式美容检测 fixture。 */
export const 等级徽章颜色预览: Story = {
  ...(gradePreviewReport ? { args: { beautyRecords: [gradePreviewReport], initialBeautyRecordId: 'beauty-grade-preview' } } : {}),
};
