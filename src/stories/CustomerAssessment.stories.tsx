import type { Meta, StoryObj } from '@storybook/react-vite';
import { CustomerListPage } from '../products/scrm/modules/customer-management';
import { ScrmWorkspace } from '../products/scrm/shell/ScrmWorkspace';

const meta = {
  title: 'SCRM/客户/客户详情/体测美容记录',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function renderAssessment(
  props: React.ComponentProps<typeof CustomerListPage> = {},
) {
  return (
    <ScrmWorkspace
      initialPage="customer-list"
      renderContext={{
        customerList: (
          <CustomerListPage
            initialDetailCustomerId="customer-53395"
            initialDetailTab="assessment"
            {...props}
          />
        ),
      }}
    />
  );
}

export const 全部记录: Story = {
  render: () => renderAssessment(),
};

export const InBody记录: Story = {
  render: () => renderAssessment({ initialAssessmentSource: 'INBODY' }),
};

export const BIACN记录: Story = {
  render: () => renderAssessment({ initialAssessmentSource: 'BIACN' }),
};

export const InBody详情: Story = {
  render: () => renderAssessment({
    initialAssessmentSource: 'INBODY',
    initialAssessmentRecordId: 'inbody-legacy-27311',
  }),
};

export const BIACN详情: Story = {
  render: () => renderAssessment({
    initialAssessmentSource: 'BIACN',
    initialAssessmentRecordId: 'biacn-676106169',
  }),
};

export const 美容记录空状态: Story = {
  render: () => renderAssessment({ initialAssessmentView: 'beauty', initialDetailCustomerId: 'customer-53393' }),
};

export const 美容记录列表: Story = {
  render: () => renderAssessment({ initialAssessmentView: 'beauty' }),
};

export const 美容记录多条切换: Story = {
  render: () => renderAssessment({ initialAssessmentView: 'beauty' }),
};

export const 美容报告详情: Story = {
  render: () => renderAssessment({
    initialAssessmentView: 'beauty',
    initialAssessmentRecordId: 'beauty-admin-20260820',
  }),
};

export const 单项报告展开: Story = {
  render: () => renderAssessment({
    initialAssessmentView: 'beauty',
    initialAssessmentRecordId: 'beauty-admin-20260820',
  }),
};
