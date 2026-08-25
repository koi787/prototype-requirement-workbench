import type { Meta, StoryObj } from '@storybook/react-vite';
import { AobenSportMobileRoot } from '../products/aoben-sport-mobile';

const meta = {
  title: '移动端｜奥本运动/我的/用户中心',
  component: AobenSportMobileRoot,
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta<typeof AobenSportMobileRoot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const 默认状态: Story = {};
