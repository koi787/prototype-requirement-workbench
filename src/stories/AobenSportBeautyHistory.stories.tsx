import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent } from 'storybook/test';
import { AobenSportMobileRoot } from '../products/aoben-sport-mobile';
import { BEAUTY_REPORTS } from '../shared/beauty-assessment';

// 工作台能力演示：仅扩充稳定历史条数以验收滚动，不代表真实检测记录。
const sixRecords = BEAUTY_REPORTS.flatMap((record, index) => [record, {
  ...record, recordId: `history-preview-${index}`, vendorReportId: null, vendorTaskId: null,
  basic: { ...record.basic, detectTime: `2026-07-0${index + 1}T09:00:00+08:00` },
}]);
const meta = {
  title: '移动端｜奥本运动/我的/美容检测/历史记录',
  component: AobenSportMobileRoot,
  args: { initialView: 'beauty-assessment' },
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  play: async ({ canvasElement }) => { await userEvent.click(within(canvasElement).getByRole('button', { name: '查看历史记录' })); },
} satisfies Meta<typeof AobenSportMobileRoot>;
export default meta;
type Story = StoryObj<typeof meta>;
export const 单条记录: Story = { args: { beautyRecords: BEAUTY_REPORTS.filter((record) => record.recordId === 'beauty-prototype-100') } };
export const 多条记录: Story = { args: { beautyRecords: sixRecords } };
