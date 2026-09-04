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
        // 按真实产品菜单组织左侧树：SCRM → 潜客管理/客户/员工，各业务模块下再按真实菜单
        // 与列表/详情状态排序；不以任务号或开发 Cycle 污染产品目录。
        // →（跟进详情）能力分组排序（0014 员工域新增 新增/编辑，不重排既有 潜客管理）。
        order: [
          '需求实现记录',
          '移动端｜奥本运动',
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
            '客户',
            ['客户列表', ['正常列表'], '客户详情', ['基本信息', '体测美容记录', ['全部记录', 'InBody记录', 'BIACN记录', 'InBody详情', 'BIACN详情', '美容记录空状态']]],
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
