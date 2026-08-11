/**
 * 0011 门店客户跟进详情 Cycle 1 - 分配记录（2 列）。
 *
 * 本 Tab 不显示操作列，不实现详情，按实际宽度展示，不强行制造横向滚动。
 */
import type { ColumnsType } from 'antd/es/table';
import type { AssignmentRecord } from './followUpTypes';

/** 分配记录完整期望表头（2 列，顺序与 0011 §9 一致，无操作列） */
export const ASSIGNMENT_RECORD_HEADERS = ['分配人', '分配时间'] as const;

export const ASSIGNMENT_RECORD_COLUMNS: ColumnsType<AssignmentRecord> = [
  { title: '分配人', dataIndex: 'assigner', key: 'assigner', width: 160 },
  { title: '分配时间', dataIndex: 'assignTime', key: 'assignTime', width: 200 },
];
