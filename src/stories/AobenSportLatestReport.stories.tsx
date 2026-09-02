import type { Meta, StoryObj } from '@storybook/react-vite';
import { AobenSportMobileRoot } from '../products/aoben-sport-mobile';

const meta = {
  title: '移动端｜奥本运动/体测/体测报告',
  component: AobenSportMobileRoot,
  args: { initialView: 'body-assessment' },
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta<typeof AobenSportMobileRoot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const 最新记录: Story = {};
