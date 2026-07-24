/**
 * 门店客户列表 - 状态标签组件
 * 从 columns.tsx 提取，避免同一文件混合导出可刷新组件和普通列配置
 */
import { Tag } from 'antd';

/** 已到店/未到店 标签 */
export function VisitedTag({ value }: { value: string }) {
  if (value === '已到店') {
    return (
      <Tag
        style={{
          color: '#1677ff',
          background: '#e6f4ff',
          border: '1px solid #91caff',
          borderRadius: 4,
          margin: 0,
        }}
      >
        已到店
      </Tag>
    );
  }
  if (value === '未到店') {
    return (
      <Tag
        style={{
          color: '#fa8c16',
          background: '#fff7e6',
          border: '1px solid #ffd591',
          borderRadius: 4,
          margin: 0,
        }}
      >
        未到店
      </Tag>
    );
  }
  return <span>{value}</span>;
}

/** 是否成交 标签 */
export function DealTag({ value }: { value: string }) {
  if (value === '未成交') {
    return (
      <Tag
        style={{
          color: '#fa8c16',
          background: '#fff7e6',
          border: '1px solid #ffd591',
          borderRadius: 4,
          margin: 0,
        }}
      >
        未成交
      </Tag>
    );
  }
  return <span>{value}</span>;
}
