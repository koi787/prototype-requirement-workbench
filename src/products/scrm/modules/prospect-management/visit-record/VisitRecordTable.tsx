/**
 * 0012 Cycle A - 拜访记录表格（独立页与跟进详情 Tab 共享）。
 *
 * 单一来源的 19 列（含下次拜访时间）+ 固定右侧操作列 + 横向滚动；
 * `data-req-id` 默认 `visit-record-table`，跟进详情 Tab 与独立页均可复用，
 * 不产生第二套定义。
 */
import type { ColumnsType } from 'antd/es/table';
import { AdminDataTable } from '../../../shared/admin';
import type { VisitRecord } from './visitRecordTypes';
import { VISIT_RECORD_COLUMNS, VISIT_RECORD_SCROLL_X } from './visitRecordColumns';

export interface VisitRecordTableProps {
  dataSource: VisitRecord[];
  /** 默认使用拜访记录共享列定义；仅在特殊 Story 场景覆盖。 */
  columns?: ColumnsType<VisitRecord>;
}

export function VisitRecordTable({ dataSource, columns = VISIT_RECORD_COLUMNS }: VisitRecordTableProps) {
  return (
    <AdminDataTable<VisitRecord>
      columns={columns}
      dataSource={dataSource}
      rowKey="key"
      scroll={{ x: VISIT_RECORD_SCROLL_X }}
      dataReqId="visit-record-table"
    />
  );
}

export default VisitRecordTable;
