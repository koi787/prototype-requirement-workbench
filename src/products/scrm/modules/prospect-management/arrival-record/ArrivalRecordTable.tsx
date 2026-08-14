/**
 * 0012 Cycle A - 到店记录表格（独立页与跟进详情 Tab 共享）。
 *
 * 单一来源的 32 列 + 固定右侧操作列 + 横向滚动；`data-req-id` 默认
 * `arrival-record-table`，跟进详情 Tab 与独立页均可复用，不产生第二套定义。
 */
import type { ColumnsType } from 'antd/es/table';
import { AdminDataTable } from '../../../shared/admin';
import type { ArrivalRecord } from './arrivalRecordTypes';
import { ARRIVAL_RECORD_COLUMNS, ARRIVAL_RECORD_SCROLL_X } from './arrivalRecordColumns';

export interface ArrivalRecordTableProps {
  dataSource: ArrivalRecord[];
  /** 默认使用到店记录共享列定义；仅在特殊 Story 场景覆盖。 */
  columns?: ColumnsType<ArrivalRecord>;
}

export function ArrivalRecordTable({ dataSource, columns = ARRIVAL_RECORD_COLUMNS }: ArrivalRecordTableProps) {
  return (
    <AdminDataTable<ArrivalRecord>
      columns={columns}
      dataSource={dataSource}
      rowKey="key"
      scroll={{ x: ARRIVAL_RECORD_SCROLL_X }}
      dataReqId="arrival-record-table"
    />
  );
}

export default ArrivalRecordTable;
