import type { Meta, StoryObj } from '@storybook/react-vite';
import { AobenSportMobileRoot } from '../products/aoben-sport-mobile';

const meta = {
  title: '移动端｜奥本运动/体测/体测报告/InBody记录',
  component: AobenSportMobileRoot,
  args: { initialView: 'body-assessment', initialRecordId: 'inbody-legacy-27311' },
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta<typeof AobenSportMobileRoot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const 固定记录: Story = {};
