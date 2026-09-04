import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent } from 'storybook/test';
import { AobenSportMobileRoot } from '../products/aoben-sport-mobile';
import { BEAUTY_REPORTS } from '../shared/beauty-assessment';

const meta = {
  title: '移动端｜奥本运动/我的/美容检测/报告详情',
  component: AobenSportMobileRoot,
  args: { initialView: 'beauty-assessment' },
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta<typeof AobenSportMobileRoot>;
export default meta;
type Story = StoryObj<typeof meta>;

export const 最近一次报告: Story = {};
export const 历史报告: Story = { args: { initialBeautyRecordId: 'beauty-prototype-900' } };
export const 单项报告展开: Story = {
  parameters: { docs: { description: { story: '真实 Root 中展开油脂与毛孔。当前仓库没有可归属到单项的厂家原文，因此不填造问题或护理建议；空项保持无内容展示。' } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '油脂 74分 B' }));
    await userEvent.click(canvas.getByRole('button', { name: '毛孔 41分 C' }));
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
