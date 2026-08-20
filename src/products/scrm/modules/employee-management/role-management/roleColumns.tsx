import type { ReactNode } from 'react';
import type { ColumnsType } from 'antd/es/table';
import type { RoleRecord } from './roleTypes';

export const ROLE_COLUMN_KEYS: readonly string[] = [
  'id', 'roleName', 'roleCode', 'updatedAt', 'operatorName', 'action',
];

function orDash(value: string | undefined | null): string {
  return value ?? '--';
}

export function buildRoleColumns(params: {
  onEdit: (record: RoleRecord) => void;
  onDelete: (record: RoleRecord) => void;
}): ColumnsType<RoleRecord> {
  const { onEdit, onDelete } = params;
  return [
    { key: 'id', title: 'ID', dataIndex: 'id', width: 120, render: orDash },
    { key: 'roleName', title: '职位名称', dataIndex: 'roleName', width: 240, render: orDash },
    { key: 'roleCode', title: '职务编码', dataIndex: 'roleCode', width: 280, render: orDash },
    { key: 'updatedAt', title: '更新时间', dataIndex: 'updatedAt', width: 190, render: orDash },
    { key: 'operatorName', title: '操作人', dataIndex: 'operatorName', width: 120, render: orDash },
    {
      key: 'action', title: '操作', width: 120,
      render: (_: unknown, record: RoleRecord): ReactNode => (
        <span className="role-list-actions">
          <button type="button" className="role-list-action role-list-action-edit" onClick={() => onEdit(record)}>编辑</button>
          <button type="button" className="role-list-action role-list-action-delete" onClick={() => onDelete(record)}>删除</button>
        </span>
      ),
    },
  ];
}
