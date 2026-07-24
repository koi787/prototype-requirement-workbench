import type { Preview } from '@storybook/react-vite';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import '../src/styles.css';
import '../src/stories/workbench.css';

const preview: Preview = {
  decorators: [
    (Story) => (
      <ConfigProvider locale={zhCN}>
        <Story />
      </ConfigProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    options: {
      storySort: {
        order: ['工作台能力演示', '示例 SCRM', '需求批次'],
      },
    },
  },
};

export default preview;

