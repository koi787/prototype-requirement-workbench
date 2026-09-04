import type { Meta, StoryObj } from '@storybook/react-vite';
import { AobenSportMobileRoot } from '../products/aoben-sport-mobile';

const meta = {
  title: '奥本中台/美容检测/移动端报告',
  component: AobenSportMobileRoot,
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta<typeof AobenSportMobileRoot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const 进入报告: Story = { args: { initialView: 'beauty-assessment' } };
export const 从用户中心进入: Story = { args: { initialView: 'user-center' } };
