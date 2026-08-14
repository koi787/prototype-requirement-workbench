/**
 * 0012 Cycle B3 - 到店记录变更记录独立只读 Mock。
 *
 * 独立于运行时 store（RecordRuntimeStore）：变更记录与到店记录本体分离，
 * 不随 createArrivalRecord / updateArrivalRecord 自动追加（真实产生机制未确认，
 * 任务单 §6.6）。本 Mock 是变更记录的唯一数据源，只读不改写。
 *
 * 按到店记录 key（recordKey）归集：仅 a1（张三）预置 12 条变更明细（两个变更
 * 事件，每事件 6 字段），用于演示"有数据 + 前端 Mock 分页"（每页 10 条 → 2 页）；
 * 其余到店记录（a2–a7）无变更记录，用于演示真实后台风格空态。
 * 所有数据均为虚构演示数据，字段严格限定为任务单 §6.6 列举六项。
 */
import type { ArrivalChangeRecord } from './arrivalChangeRecordTypes';

/** 变更记录可展示字段（任务单 §6.6 列举，顺序固定，不自造字段） */
export const ARRIVAL_CHANGE_FIELD_LABELS = [
  '预约门店',
  '合同名称',
  '课程类型',
  '购买金额',
  '购买时间',
  '合同号',
] as const;

/**
 * 到店记录 a1（张三）变更明细：两个变更事件 × 6 字段 = 12 行。
 * 事件一（王经理）补全购买信息：预约门店调整 + 课程类型调整 + 合同/金额/时间补录；
 * 事件二（张顾问）正式报名：预约门店回改 + 课程类型回改 + 合同升级 + 金额/时间更新。
 */
const A1_CHANGE_RECORDS: ArrivalChangeRecord[] = [
  // ---- 事件一：2026-07-22 18:00:00 王经理 ----
  {
    key: 'a1-chg-001',
    recordKey: 'a1',
    changeTime: '2026-07-22 18:00:00',
    operator: '王经理',
    field: '预约门店',
    before: '示例旗舰店',
    after: '示例二店',
  },
  {
    key: 'a1-chg-002',
    recordKey: 'a1',
    changeTime: '2026-07-22 18:00:00',
    operator: '王经理',
    field: '合同名称',
    before: '--',
    after: '少儿体适能体验合同',
  },
  {
    key: 'a1-chg-003',
    recordKey: 'a1',
    changeTime: '2026-07-22 18:00:00',
    operator: '王经理',
    field: '课程类型',
    before: '少儿体适能',
    after: '青少年体能',
  },
  {
    key: 'a1-chg-004',
    recordKey: 'a1',
    changeTime: '2026-07-22 18:00:00',
    operator: '王经理',
    field: '购买金额',
    before: '--',
    after: '299.90',
  },
  {
    key: 'a1-chg-005',
    recordKey: 'a1',
    changeTime: '2026-07-22 18:00:00',
    operator: '王经理',
    field: '购买时间',
    before: '--',
    after: '2026-07-22 18:30:00',
  },
  {
    key: 'a1-chg-006',
    recordKey: 'a1',
    changeTime: '2026-07-22 18:00:00',
    operator: '王经理',
    field: '合同号',
    before: '--',
    after: 'HT2026001',
  },
  // ---- 事件二：2026-07-22 19:30:00 张顾问 ----
  {
    key: 'a1-chg-007',
    recordKey: 'a1',
    changeTime: '2026-07-22 19:30:00',
    operator: '张顾问',
    field: '预约门店',
    before: '示例二店',
    after: '示例旗舰店',
  },
  {
    key: 'a1-chg-008',
    recordKey: 'a1',
    changeTime: '2026-07-22 19:30:00',
    operator: '张顾问',
    field: '合同名称',
    before: '少儿体适能体验合同',
    after: '少儿体适能正式合同',
  },
  {
    key: 'a1-chg-009',
    recordKey: 'a1',
    changeTime: '2026-07-22 19:30:00',
    operator: '张顾问',
    field: '课程类型',
    before: '青少年体能',
    after: '少儿体适能',
  },
  {
    key: 'a1-chg-010',
    recordKey: 'a1',
    changeTime: '2026-07-22 19:30:00',
    operator: '张顾问',
    field: '购买金额',
    before: '299.90',
    after: '2999.00',
  },
  {
    key: 'a1-chg-011',
    recordKey: 'a1',
    changeTime: '2026-07-22 19:30:00',
    operator: '张顾问',
    field: '购买时间',
    before: '2026-07-22 18:30:00',
    after: '2026-07-22 19:00:00',
  },
  {
    key: 'a1-chg-012',
    recordKey: 'a1',
    changeTime: '2026-07-22 19:30:00',
    operator: '张顾问',
    field: '合同号',
    before: 'HT2026001',
    after: 'HT2026001-A',
  },
];

const ARRIVAL_CHANGE_RECORDS: ArrivalChangeRecord[] = [...A1_CHANGE_RECORDS];

/** 全部变更记录（只读 Mock，不改写） */
export function getAllArrivalChangeRecords(): ArrivalChangeRecord[] {
  return ARRIVAL_CHANGE_RECORDS;
}

/** 按到店记录 key 读取变更记录；无变更记录的记录返回空数组（空态）。 */
export function getArrivalChangeRecordsByRecordKey(recordKey: string): ArrivalChangeRecord[] {
  return ARRIVAL_CHANGE_RECORDS.filter((record) => record.recordKey === recordKey);
}
