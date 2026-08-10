import { Table } from 'antd';
import type { TableProps } from 'antd';

/**
 * 后台表格通用外壳（AdminDataTable）。
 *
 * 对 Ant Design Table 的最薄封装：固定 `pagination={false}`，业务列、数据、
 * 排序、滚动参数与状态全部由页面传入和管理。不接管 requirement 包装、
 * 列级锚点注册或任何业务渲染，也不复制 Ant Design 的大量 API。
 */
export interface AdminDataTableProps<RecordType extends object> {
  columns: NonNullable<TableProps<RecordType>['columns']>;
  dataSource: NonNullable<TableProps<RecordType>['dataSource']>;
  rowKey: NonNullable<TableProps<RecordType>['rowKey']>;
  scroll?: NonNullable<TableProps<RecordType>['scroll']>;
  loading?: boolean;
  locale?: NonNullable<TableProps<RecordType>['locale']>;
  /** 表格锚点 id（默认保留既有值） */
  dataReqId?: string;
}

export function AdminDataTable<RecordType extends object>({
  columns,
  dataSource,
  rowKey,
  scroll,
  loading,
  locale,
  dataReqId = 'customer-table',
}: AdminDataTableProps<RecordType>) {
  return (
    <Table<RecordType>
      columns={columns}
      dataSource={dataSource}
      rowKey={rowKey}
      pagination={false}
      {...(scroll !== undefined ? { scroll } : {})}
      {...(loading !== undefined ? { loading } : {})}
      {...(locale !== undefined ? { locale } : {})}
      data-req-id={dataReqId}
    />
  );
}

export default AdminDataTable;
