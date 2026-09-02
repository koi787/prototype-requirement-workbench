import type { Meta, StoryObj } from '@storybook/react-vite';
import { AobenSportMobileRoot } from '../products/aoben-sport-mobile';
import { BODY_ASSESSMENT_HISTORY_FIXTURES } from '../shared/body-assessment';

const meta = {
  title: '移动端｜奥本运动/体测/历史记录',
  component: AobenSportMobileRoot,
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta<typeof AobenSportMobileRoot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const 单条记录: Story = {
  args: {
    initialView: 'body-assessment',
    assessmentRecords: BODY_ASSESSMENT_HISTORY_FIXTURES.single,
    initialRecordId: BODY_ASSESSMENT_HISTORY_FIXTURES.single[0]!.recordId,
    initialHistoryOpen: true,
  },
};

export const 多条记录: Story = {
  args: {
    initialView: 'body-assessment',
    assessmentRecords: BODY_ASSESSMENT_HISTORY_FIXTURES.many,
    initialRecordId: BODY_ASSESSMENT_HISTORY_FIXTURES.many[0]!.recordId,
    initialHistoryOpen: true,
  },
};
