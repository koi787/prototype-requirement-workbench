/**
 * 0012 Cycle B3 - 到店记录变更记录只读模块类型。
 *
 * 变更记录的真实产生机制尚未确认（任务单 §6.6），本模块使用独立只读 Mock，
 * 与运行时 store（RecordRuntimeStore）分离：不实现"编辑到店记录 = 自动生成
 * 变更记录"，不实现课卡合同同步、跨模块事件、审计系统或后端历史查询。
 * create/update 到店记录不会写入变更历史。
 *
 * 每条变更记录 = 一次变更事件内按字段展开的一条明细（变更前 / 变更后），
 * 由 变更时间 + 操作人 + 字段 + 变更前/变更后 组成；同一事件的多字段变更
 * 展开为多行，共享 变更时间/操作人。字段严格限定为任务单 §6.6 列举：
 * 预约门店、合同名称、课程类型、购买金额、购买时间、合同号，不自造字段；
 * 无值以 "--" 占位（与列表空值展示规则一致）。
 */
export interface ArrivalChangeRecord {
  /** 稳定唯一 key（小写英文短横线格式） */
  key: string;
  /** 关联到店记录 key（操作列行 recordKey，Drawer 按此读取变更记录） */
  recordKey: string;
  /** 变更时间（YYYY-MM-DD HH:mm:ss） */
  changeTime: string;
  /** 操作人 */
  operator: string;
  /** 字段名（限任务单 §6.6 列举字段） */
  field: string;
  /** 变更前值（无值 "--"） */
  before: string;
  /** 变更后值（无值 "--"） */
  after: string;
}
