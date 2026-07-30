/**
 * 门店客户列表 - 状态标签组件
 * 从 columns.tsx 提取，避免同一文件混合导出可刷新组件和普通列配置
 */
import { Tag } from 'antd';
import type { InvalidApprovalStatus } from './approvalTypes';

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

/** 无效审批状态映射：数据值 → 展示文本 */
const INVALID_APPROVAL_STATUS_MAP: Record<Exclude<InvalidApprovalStatus, null>, string> = {
  pending: '待审核',
  approved: '审核通过',
  rejected: '审核退回',
};

/** 无效审批状态 标签 */
export function InvalidApprovalStatusTag({
  value,
  onClick,
  detailReqId,
}: {
  value: InvalidApprovalStatus;
  onClick?: () => void;
  detailReqId?: string;
}) {
  if (value === null) {
    return <span style={{ color: '#8c8c8c' }}>--</span>;
  }

  const label = INVALID_APPROVAL_STATUS_MAP[value];

  const renderTag = (color: string, bg: string, border: string) => (
    <Tag
      style={{
        color,
        background: bg,
        border,
        borderRadius: 4,
        margin: 0,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {label}
    </Tag>
  );

  let element: React.ReactNode;
  if (value === 'pending') {
    element = renderTag('#fa8c16', '#fff7e6', '1px solid #ffd591');
  } else if (value === 'approved') {
    element = renderTag('#52c41a', '#f6ffed', '1px solid #b7eb8f');
  } else if (value === 'rejected') {
    element = renderTag('#ff4d4f', '#fff2f0', '1px solid #ffccc7');
  }

  if (onClick && detailReqId) {
    return (
      <span
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        style={{ cursor: 'pointer' }}
        data-req-id={detailReqId}
      >
        {element}
      </span>
    );
  }

  return element;
}
