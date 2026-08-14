/**
 * 0012 Cycle A - 到店记录（32 列）业务模块列定义。
 *
 * 独立页（到店记录）与跟进详情"到店记录"Tab 共用同一份列定义，
 * 禁止出现第二套到店 columns。用户姓名使用蓝色链接视觉；是否成交
 * 使用统一风格 Tag（已成交 绿色/未成交 橙色）；意向度按真实系统显示
 * 纯数字（不消费 IntentLevelTag，该标签仅跟进旅程卡使用）；金额统一
 * 两位小数、空值显示 `--`；操作列固定在右侧，为 操作 按钮 + Dropdown
 * （Cycle A 占位：编辑/变更记录 为 Cycle B 预留入口，点击仅关闭菜单）。
 */
import type { ColumnsType } from 'antd/es/table';
import { VisitedTag } from '../pages/StoreCustomerList/StatusTags';
import type { ArrivalRecord } from './arrivalRecordTypes';
import {
  formatRecordAmount,
  DealStatusTag,
  RecordNameLink,
  RecordOperationCell,
} from '../record-shared';
import type { RecordOperationItem } from '../record-shared';

/** 到店记录完整期望表头（32 列，顺序与 0011 §6 一致） */
export const ARRIVAL_RECORD_HEADERS = [
  'ID',
  '用户姓名',
  '用户ID',
  '微信号',
  '手机号',
  '客资来源',
  '预约门店',
  '到店时间',
  '是否到店',
  '是否成交',
  '成交金额',
  '课程类型',
  '是否有体验课',
  '体验课状态',
  '是否签到',
  '体验课上课教练',
  '体验课下课时间',
  '合同号',
  '体验课卡合同状态',
  '体验课卡',
  '实付金额',
  '体验课卡获取时间',
  '意向度',
  '改善需求',
  '意向课程',
  '预约备注',
  '结果分析',
  '创建人',
  '创建时间',
  '更新人',
  '更新时间',
  '操作',
] as const;

/** 到店记录操作列菜单项（Cycle A 占位，顺序固定：编辑 → 变更记录） */
export const ARRIVAL_OPERATION_ITEMS: readonly RecordOperationItem[] = [
  { key: 'edit', label: '编辑' },
  { key: 'change-record', label: '变更记录' },
];

export const ARRIVAL_RECORD_COLUMNS: ColumnsType<ArrivalRecord> = [
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
  { title: '到店时间', dataIndex: 'arrivalTime', key: 'arrivalTime', width: 150 },
  {
    title: '是否到店',
    dataIndex: 'isArrived',
    key: 'isArrived',
    width: 100,
    render: (v: string) => <VisitedTag value={v} />,
  },
  {
    title: '是否成交',
    dataIndex: 'isDeal',
    key: 'isDeal',
    width: 100,
    render: (v: string) => <DealStatusTag value={v} />,
  },
  {
    title: '成交金额',
    dataIndex: 'dealAmount',
    key: 'dealAmount',
    width: 110,
    render: (v: number | null) => formatRecordAmount(v),
  },
  { title: '课程类型', dataIndex: 'courseType', key: 'courseType', width: 100 },
  { title: '是否有体验课', dataIndex: 'hasTrialClass', key: 'hasTrialClass', width: 110 },
  { title: '体验课状态', dataIndex: 'trialClassStatus', key: 'trialClassStatus', width: 110 },
  { title: '是否签到', dataIndex: 'isSignedIn', key: 'isSignedIn', width: 90 },
  { title: '体验课上课教练', dataIndex: 'trialClassCoach', key: 'trialClassCoach', width: 110 },
  { title: '体验课下课时间', dataIndex: 'trialClassEndTime', key: 'trialClassEndTime', width: 150 },
  { title: '合同号', dataIndex: 'contractNo', key: 'contractNo', width: 120 },
  {
    title: '体验课卡合同状态',
    dataIndex: 'trialClassCardContractStatus',
    key: 'trialClassCardContractStatus',
    width: 130,
  },
  { title: '体验课卡', dataIndex: 'trialClassCard', key: 'trialClassCard', width: 110 },
  {
    title: '实付金额',
    dataIndex: 'actualPaidAmount',
    key: 'actualPaidAmount',
    width: 110,
    render: (v: number | null) => formatRecordAmount(v),
  },
  { title: '体验课卡获取时间', dataIndex: 'trialClassGetTime', key: 'trialClassGetTime', width: 150 },
  {
    title: '意向度',
    dataIndex: 'intentLevel',
    key: 'intentLevel',
    width: 90,
    render: (v: number) => String(v),
  },
  { title: '改善需求', dataIndex: 'improvementNeed', key: 'improvementNeed', width: 140 },
  { title: '意向课程', dataIndex: 'intendedCourse', key: 'intendedCourse', width: 140 },
  { title: '预约备注', dataIndex: 'appointmentRemark', key: 'appointmentRemark', width: 130 },
  { title: '结果分析', dataIndex: 'resultAnalysis', key: 'resultAnalysis', width: 150 },
  { title: '创建人', dataIndex: 'creator', key: 'creator', width: 90 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 150 },
  { title: '更新人', dataIndex: 'updater', key: 'updater', width: 90 },
  { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime', width: 150 },
  {
    title: '操作',
    key: 'operation',
    width: 90,
    fixed: 'right',
    render: (_: unknown, record: ArrivalRecord) => (
      <RecordOperationCell
        items={ARRIVAL_OPERATION_ITEMS}
        editKind="arrival"
        recordKey={record.key}
        dataReqId={`arrival-record-operation-${record.key}`}
      />
    ),
  },
];

/** 到店记录横向滚动总宽度（由列宽自动求和，避免与实际列宽漂移） */
export const ARRIVAL_RECORD_SCROLL_X = ARRIVAL_RECORD_COLUMNS.reduce(
  (sum, column) => sum + (typeof column.width === 'number' ? column.width : 100),
  0,
);
