/**
 * 0011 门店客户跟进详情 Cycle 1 - 拜访记录（18 列）。
 *
 * 列定义保留在 0011 页面模块内，禁止下沉 shared/admin。
 * 用户姓名使用蓝色链接视觉；金额统一两位小数、空值显示 `--`；
 * 操作列固定在右侧且仅视觉。
 */
import type { ColumnsType } from 'antd/es/table';
import type { VisitRecord } from './followUpTypes';
import { IntentLevelTag, RecordNameLink, RecordOperationVisual } from './followUpShared';

/** 拜访记录完整期望表头（18 列，顺序与 0011 §7 一致） */
export const VISIT_RECORD_HEADERS = [
  'ID',
  '用户姓名',
  '用户ID',
  '微信号',
  '手机号',
  '客资来源',
  '预约门店',
  '拜访方式',
  '意向度',
  '改善需求',
  '意向课程',
  '拜访备注',
  '拜访时间',
  '创建人',
  '创建时间',
  '更新人',
  '更新时间',
  '操作',
] as const;

export const VISIT_RECORD_COLUMNS: ColumnsType<VisitRecord> = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
  {
    title: '用户姓名',
    dataIndex: 'userName',
    key: 'userName',
    width: 110,
    render: (v: string) => <RecordNameLink name={v} />,
  },
  { title: '用户ID', dataIndex: 'userId', key: 'userId', width: 100 },
  { title: '微信号', dataIndex: 'wechatId', key: 'wechatId', width: 130 },
  { title: '手机号', dataIndex: 'phone', key: 'phone', width: 120 },
  { title: '客资来源', dataIndex: 'source', key: 'source', width: 100 },
  { title: '预约门店', dataIndex: 'appointmentStore', key: 'appointmentStore', width: 120 },
  { title: '拜访方式', dataIndex: 'visitWay', key: 'visitWay', width: 110 },
  {
    title: '意向度',
    dataIndex: 'intentLevel',
    key: 'intentLevel',
    width: 90,
    render: (v: number) => <IntentLevelTag level={v} />,
  },
  { title: '改善需求', dataIndex: 'improvementNeed', key: 'improvementNeed', width: 140 },
  { title: '意向课程', dataIndex: 'intendedCourse', key: 'intendedCourse', width: 140 },
  { title: '拜访备注', dataIndex: 'visitRemark', key: 'visitRemark', width: 130 },
  { title: '拜访时间', dataIndex: 'visitTime', key: 'visitTime', width: 150 },
  { title: '创建人', dataIndex: 'creator', key: 'creator', width: 90 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 150 },
  { title: '更新人', dataIndex: 'updater', key: 'updater', width: 90 },
  { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime', width: 150 },
  {
    title: '操作',
    key: 'operation',
    width: 90,
    fixed: 'right',
    render: () => <RecordOperationVisual />,
  },
];

/** 拜访记录横向滚动总宽度（由列宽自动求和） */
export const VISIT_RECORD_SCROLL_X = VISIT_RECORD_COLUMNS.reduce(
  (sum, column) => sum + (typeof column.width === 'number' ? column.width : 100),
  0,
);
