/**
 * 0012 Cycle A - 拜访记录（19 列）业务模块列定义。
 *
 * 在 0011 §7 的 18 列基础上插入"下次拜访时间"。0017 将跟进判断最常用的
 * 7 个字段前置。独立页（拜访记录）与跟进详情"拜访记录"Tab 共用同一份
 * 列定义，禁止出现第二套拜访 columns。用户姓名使用蓝色链接视觉；意向度
 * 按真实系统显示纯数字（不消费 IntentLevelTag，该标签仅跟进旅程卡使用）；
 * 金额统一两位小数、空值显示 `--`；操作列固定在右侧，为 操作 按钮 +
 * Dropdown（Cycle A 占位：仅 编辑 为 Cycle B 预留入口，点击仅关闭菜单）。
 */
import type { ColumnsType } from 'antd/es/table';
import type { VisitRecord } from './visitRecordTypes';
import { NEXT_VISIT_TIME_EMPTY_TEXT } from './visitRecordTypes';
import { RecordNameLink, RecordOperationCell } from '../record-shared';
import type { RecordOperationItem } from '../record-shared';

/** 拜访记录完整期望表头（19 列，0017 前 7 列为跟进重点字段） */
export const VISIT_RECORD_HEADERS = [
  '用户姓名',
  '手机号',
  '下次拜访时间',
  '意向度',
  '改善需求',
  '意向课程',
  '拜访备注',
  'ID',
  '用户ID',
  '微信号',
  '客资来源',
  '预约门店',
  '拜访方式',
  '拜访时间',
  '创建人',
  '创建时间',
  '更新人',
  '更新时间',
  '操作',
] as const;

/** 拜访记录操作列菜单项（Cycle A 占位，严格仅 编辑 一项） */
export const VISIT_OPERATION_ITEMS: readonly RecordOperationItem[] = [
  { key: 'edit', label: '编辑' },
];

export const VISIT_RECORD_COLUMNS: ColumnsType<VisitRecord> = [
  {
    title: '用户姓名',
    dataIndex: 'userName',
    key: 'userName',
    width: 110,
    render: (v: string) => <RecordNameLink name={v} />,
  },
  { title: '手机号', dataIndex: 'phone', key: 'phone', width: 120 },
  {
    title: '下次拜访时间',
    dataIndex: 'nextVisitTime',
    key: 'nextVisitTime',
    width: 150,
    render: (v: string | null | undefined) => v ?? NEXT_VISIT_TIME_EMPTY_TEXT,
  },
  {
    title: '意向度',
    dataIndex: 'intentLevel',
    key: 'intentLevel',
    width: 90,
    render: (v: number) => String(v),
  },
  { title: '改善需求', dataIndex: 'improvementNeed', key: 'improvementNeed', width: 140 },
  { title: '意向课程', dataIndex: 'intendedCourse', key: 'intendedCourse', width: 140 },
  { title: '拜访备注', dataIndex: 'visitRemark', key: 'visitRemark', width: 130 },
  { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
  { title: '用户ID', dataIndex: 'userId', key: 'userId', width: 100 },
  { title: '微信号', dataIndex: 'wechatId', key: 'wechatId', width: 130 },
  { title: '客资来源', dataIndex: 'source', key: 'source', width: 100 },
  { title: '预约门店', dataIndex: 'appointmentStore', key: 'appointmentStore', width: 120 },
  { title: '拜访方式', dataIndex: 'visitWay', key: 'visitWay', width: 110 },
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
    render: (_: unknown, record: VisitRecord) => (
      <RecordOperationCell
        items={VISIT_OPERATION_ITEMS}
        editKind="visit"
        recordKey={record.key}
        dataReqId={`visit-record-operation-${record.key}`}
      />
    ),
  },
];

/** 拜访记录横向滚动总宽度（由列宽自动求和，避免与实际列宽漂移） */
export const VISIT_RECORD_SCROLL_X = VISIT_RECORD_COLUMNS.reduce(
  (sum, column) => sum + (typeof column.width === 'number' ? column.width : 100),
  0,
);
