/**
 * 0011 门店客户跟进详情 Cycle 1 - 通话记录（13 列）。
 *
 * 列定义保留在 0011 页面模块内，禁止下沉 shared/admin。
 * 通话时长使用蓝色音频样式，但本阶段不实现播放能力；
 * 用户姓名使用蓝色链接视觉；空值显示 `--`；操作列固定在右侧且仅视觉。
 */
import type { ColumnsType } from 'antd/es/table';
import type { CallRecord } from './followUpTypes';
import { RecordNameLink, RecordOperationVisual } from '../../../record-shared';

/** 通话记录完整期望表头（13 列，顺序与 0011 §8 一致） */
export const CALL_RECORD_HEADERS = [
  'ID',
  '用户姓名',
  '用户ID',
  '手机号',
  '通话结果',
  '通话状态',
  '通话时长',
  '通话标签',
  '通话备注',
  '呼出类型',
  '拨打员工',
  '拨打时间',
  '操作',
] as const;

export const CALL_RECORD_COLUMNS: ColumnsType<CallRecord> = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
  {
    title: '用户姓名',
    dataIndex: 'userName',
    key: 'userName',
    width: 110,
    render: (v: string) => <RecordNameLink name={v} />,
  },
  { title: '用户ID', dataIndex: 'userId', key: 'userId', width: 100 },
  { title: '手机号', dataIndex: 'phone', key: 'phone', width: 120 },
  { title: '通话结果', dataIndex: 'callResult', key: 'callResult', width: 110 },
  { title: '通话状态', dataIndex: 'callStatus', key: 'callStatus', width: 110 },
  {
    title: '通话时长',
    dataIndex: 'callDuration',
    key: 'callDuration',
    width: 100,
    render: (v: string) => <span className="store-customer-call-duration">{v}</span>,
  },
  { title: '通话标签', dataIndex: 'callTag', key: 'callTag', width: 110 },
  { title: '通话备注', dataIndex: 'callRemark', key: 'callRemark', width: 140 },
  { title: '呼出类型', dataIndex: 'callType', key: 'callType', width: 100 },
  { title: '拨打员工', dataIndex: 'callEmployee', key: 'callEmployee', width: 110 },
  { title: '拨打时间', dataIndex: 'callTime', key: 'callTime', width: 150 },
  {
    title: '操作',
    key: 'operation',
    width: 90,
    fixed: 'right',
    render: () => <RecordOperationVisual />,
  },
];

/** 通话记录横向滚动总宽度（由列宽自动求和） */
export const CALL_RECORD_SCROLL_X = CALL_RECORD_COLUMNS.reduce(
  (sum, column) => sum + (typeof column.width === 'number' ? column.width : 100),
  0,
);
