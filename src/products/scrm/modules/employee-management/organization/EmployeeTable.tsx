/**
 * 0014 Cycle A - 员工列表（右侧 10 列表格薄外壳）。
 *
 * 复用 AdminDataTable（固定 pagination=false，列定义与数据由页面传入）；列定义、
 * 业务 render 与操作菜单保留在 employee-management（0014 §8/§16）。
 */
import { AdminDataTable } from '../../../shared/admin';
import type { ColumnsType } from 'antd/es/table';
import type { EmployeeRecord } from './organizationTypes';

export interface EmployeeTableProps {
  dataSource: EmployeeRecord[];
  columns: ColumnsType<EmployeeRecord>;
}

export function EmployeeTable({ dataSource, columns }: EmployeeTableProps) {
  return (
    <AdminDataTable<EmployeeRecord>
      columns={columns}
      dataSource={dataSource}
      rowKey={(record) => record.id}
      scroll={{ x: 1160 }}
      dataReqId="employee-table"
    />
  );
}
