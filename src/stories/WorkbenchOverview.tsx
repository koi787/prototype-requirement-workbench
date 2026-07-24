import { Alert, Card, Col, Row, Space, Tag, Typography } from 'antd';

const { Paragraph, Text, Title } = Typography;

const boundaries = [
  ['主要入口', 'Storybook'],
  ['当前内容', '基础骨架'],
  ['业务数据', '无真实需求'],
] as const;

export function WorkbenchOverview() {
  return (
    <main className="workbench-overview">
      <Space direction="vertical" size="large" className="workbench-stack">
        <div>
          <Tag color="blue">工作台能力演示</Tag>
          <Title level={1}>需求原型工作台</Title>
          <Paragraph className="workbench-lead">
            当前页面仅验证 Storybook 目录、Ant Design 渲染和右侧自定义需求面板，
            不代表任何真实示例 SCRM 页面或业务规则。
          </Paragraph>
        </div>

        <Alert
          type="info"
          showIcon
          message="第一阶段边界"
          description="能力演示数据与正式需求批次严格分离。2026-07 SCRM 推进会目录当前不包含演示内容。"
        />

        <Row gutter={[16, 16]}>
          {boundaries.map(([label, value]) => (
            <Col xs={24} md={8} key={label}>
              <Card className="boundary-card">
                <Text type="secondary">{label}</Text>
                <Title level={3}>{value}</Title>
              </Card>
            </Col>
          ))}
        </Row>
      </Space>
    </main>
  );
}

