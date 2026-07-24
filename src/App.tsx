import { Button, Card, ConfigProvider, Space, Typography } from 'antd';
import zhCN from 'antd/locale/zh_CN';

const { Paragraph, Text, Title } = Typography;

export function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <main className="app-shell">
        <Card className="intro-card" bordered={false}>
          <Space direction="vertical" size="middle">
            <Text type="secondary">本地启动说明</Text>
            <Title level={1}>需求原型工作台</Title>
            <Paragraph>
              Storybook 是当前唯一主要入口。此 Vite 页面仅用于确认基础应用能够启动，
              不承载产品目录、需求面板或第二套工作台功能。
            </Paragraph>
            <Paragraph>
              请在终端运行 <Text code>pnpm storybook</Text>，然后访问
              <Text code>http://localhost:6006</Text>。
            </Paragraph>
            <Button type="primary" disabled>
              请从 Storybook 进入工作台
            </Button>
          </Space>
        </Card>
      </main>
    </ConfigProvider>
  );
}

