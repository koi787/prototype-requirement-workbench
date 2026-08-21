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
        // 按真实产品菜单组织左侧树：SCRM → 潜客管理 → 门店客户/到店记录/拜访记录
        // → 员工 → 组织架构 → 列表/新增/编辑，各业务模块下再按 列表 → 新增 → 编辑
        // →（跟进详情）能力分组排序（0014 员工域新增 新增/编辑，不重排既有 潜客管理）。
        order: [
          '需求实现记录',
          'SCRM',
          [
            '潜客管理',
            [
              '门店客户',
              ['列表', '跟进详情'],
              '到店记录',
              ['列表', '新增', '编辑'],
              '拜访记录',
              ['列表', '新增', '编辑'],
            ],
            '员工',
            ['组织架构', ['列表', '新增', '编辑']],
          ],
          '需求批次',
        ],
      },
    },
  },
};

export default preview;
