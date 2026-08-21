import { Empty, Input, Tag, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { REQUIREMENT_HISTORY_RECORDS } from './requirementHistoryData';
import type { RequirementHistoryRecord, RequirementHistoryType } from './requirementHistoryData';

const { Paragraph, Text, Title } = Typography;
const TYPE_LABELS: Record<RequirementHistoryType, string> = { replica: '原系统复刻', change: '需求改动', mixed: '混合' };
const TYPE_COLORS: Record<RequirementHistoryType, string> = { replica: 'blue', change: 'orange', mixed: 'purple' };

function StoryLinks({ record }: { record: RequirementHistoryRecord }) {
  return <div className="requirement-history-links">{record.storyLinks.map((link) => <a key={link.storyId} className="requirement-history-story-link" href={`/?path=/story/${encodeURIComponent(link.storyId)}`} target="_top">{link.label}</a>)}</div>;
}

function ContentSummary({ record }: { record: RequirementHistoryRecord }) {
  const details = [...record.implementedItems, ...(record.changes ?? [])].slice(0, 2);
  return <div className="requirement-history-content-cell"><Text>{record.summary}</Text><Text type="secondary" className="requirement-history-content-detail">{details.join('；')}</Text></div>;
}

function HistoryRow({ record }: { record: RequirementHistoryRecord }) {
  return <tr data-testid={`requirement-history-row-${record.id}`}>
    <td><div className="requirement-history-date-id"><Text type="secondary">{record.completedAt}</Text><strong>{record.id}</strong></div></td>
    <td><Tag color={TYPE_COLORS[record.type]}>{TYPE_LABELS[record.type]}</Tag></td>
    <td><Text strong className="requirement-history-title-cell">{record.name}</Text></td>
    <td><ContentSummary record={record} /></td>
    <td><Text>{record.module}</Text></td>
    <td><StoryLinks record={record} /></td>
  </tr>;
}

function matchesKeyword(record: RequirementHistoryRecord, keyword: string) {
  return [record.id, record.name, record.module, record.summary, ...record.implementedItems, ...(record.changes ?? [])].join(' ').toLocaleLowerCase().includes(keyword);
}

export function RequirementHistoryListPage() {
  const [keyword, setKeyword] = useState('');
  const sortedRecords = useMemo(() => [...REQUIREMENT_HISTORY_RECORDS].sort((left, right) => right.completedAt.localeCompare(left.completedAt) || right.id.localeCompare(left.id)), []);
  const filteredRecords = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLocaleLowerCase();
    return normalizedKeyword ? sortedRecords.filter((record) => matchesKeyword(record, normalizedKeyword)) : sortedRecords;
  }, [keyword, sortedRecords]);

  return <main className="requirement-history-page">
    <div className="requirement-history-content">
      <header className="requirement-history-list-header">
        <Text className="requirement-history-eyebrow">工作台记录</Text>
        <Title level={1}>需求实现记录</Title>
        <Paragraph className="requirement-history-summary">记录原型中已经实现的正式产品需求，包括原系统复刻与需求改动。</Paragraph>
      </header>
      <div className="requirement-history-search"><Input allowClear aria-label="搜索需求实现记录" placeholder="搜索需求编号 / 标题 / 模块 / 实现或改动内容" value={keyword} onChange={(event) => setKeyword(event.target.value)} /></div>
      <div className="requirement-history-table-wrap">
        <table className="requirement-history-table">
          <caption className="requirement-history-sr-only">需求实现记录列表</caption>
          <thead><tr><th scope="col">时间 / 编号</th><th scope="col">类型</th><th scope="col">需求标题</th><th scope="col">实现 / 改动内容</th><th scope="col">模块</th><th scope="col">原型入口</th></tr></thead>
          <tbody>{filteredRecords.map((record) => <HistoryRow key={record.id} record={record} />)}</tbody>
        </table>
        {filteredRecords.length === 0 && <div className="requirement-history-empty"><Empty description="未找到匹配的需求记录" /></div>}
      </div>
    </div>
  </main>;
}
