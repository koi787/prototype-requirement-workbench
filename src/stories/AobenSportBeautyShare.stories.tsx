import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent } from 'storybook/test';
import { AobenSportMobileRoot } from '../products/aoben-sport-mobile';

const meta = {
  title: '移动端｜奥本运动/我的/美容检测/分享报告',
  component: AobenSportMobileRoot,
  args: { initialView: 'beauty-assessment' },
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  play: async ({ canvasElement }) => { await userEvent.click(within(canvasElement).getByRole('button', { name: '分享报告' })); },
} satisfies Meta<typeof AobenSportMobileRoot>;
export default meta;
type Story = StoryObj<typeof meta>;
export const 当前报告: Story = {};
export const 历史报告: Story = { args: { initialBeautyRecordId: 'beauty-prototype-900' } };
