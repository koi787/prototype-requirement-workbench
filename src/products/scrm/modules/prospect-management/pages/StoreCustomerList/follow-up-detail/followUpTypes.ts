/**
 * 0011 门店客户跟进详情 Cycle 1 - 类型、固定 Tab 配置与纯函数。
 *
 * 本文件只包含类型、常量和纯格式化函数，不导出组件，避免混入
 * react-refresh 组件导出规则。
 */

export type FollowUpTabKey = 'process' | 'arrival' | 'visit' | 'call' | 'assignment';

export interface FollowUpTabItem {
  key: FollowUpTabKey;
  label: string;
}

/** 固定五个 Tab：顺序、名称和数量在 Cycle 1 不得通过 Mock 动态变化。 */
export const FOLLOW_UP_TABS: FollowUpTabItem[] = [
  { key: 'process', label: '跟进流程' },
  { key: 'arrival', label: '到店记录' },
  { key: 'visit', label: '拜访记录' },
  { key: 'call', label: '通话记录' },
  { key: 'assignment', label: '分配记录' },
];

/**
 * 到店记录 / 拜访记录的类型已迁移至独立业务模块（0012 Cycle A）：
 * - ArrivalRecord → `prospect-management/arrival-record/arrivalRecordTypes`
 * - VisitRecord → `prospect-management/visit-record/visitRecordTypes`
 * - formatRecordAmount → `prospect-management/record-shared/recordFormatters`
 * 跟进详情统一从上述共享模块消费，不在本文件保留第二套定义。
 */

/** 通话记录（13 列，字段与 0011 §8 一一对应） */
export interface CallRecord {
  key: string;
  id: string;
  userName: string;
  userId: string;
  phone: string;
  callResult: string;
  callStatus: string;
  callDuration: string;
  callTag: string;
  callRemark: string;
  callType: string;
  callEmployee: string;
  callTime: string;
}

/** 分配记录（2 列，字段与 0011 §9 一一对应，无操作列） */
export interface AssignmentRecord {
  key: string;
  assigner: string;
  assignTime: string;
}

/** 跟进旅程事件类型（六项筛选固定，Mock 当前仅提供到店/拜访/通话事件） */
export type JourneyEventType = 'arrival' | 'visit' | 'call' | 'lost' | 'validity';

export interface JourneyEvent {
  key: string;
  type: JourneyEventType;
  /** 展示时间，按此字段倒序排列 */
  time: string;
  /** 到店卡 */
  isArrived?: string;
  isDeal?: string;
  intentLevel?: number;
  appointmentStore?: string;
  trialClass?: string;
  improvementNeed?: string;
  intendedCourse?: string;
  /** 拜访卡 */
  visitWay?: string;
  /** 通话卡 */
  callResult?: string;
  callDuration?: string;
  callEmployee?: string;
  /** 客资有效性卡：header 标签（标注无效客资 / 恢复有效客资） */
  validityLabel?: string;
  /** 客资有效性卡：提交时间 */
  submitTime?: string;
  /** 客资有效性卡：提交员工 */
  submitEmployee?: string;
  /** 客资有效性卡：备注 */
  remark?: string;
  /** 客资有效性卡：附件（静态占位文件名，不真实上传） */
  attachmentName?: string;
}

/**
 * 单个客户的跟进详情 Mock 集合（通过稳定客户 key 关联当前列表客户）。
 * 到店/拜访记录已迁移至独立业务模块，按需通过
 * getArrivalRecordsByCustomerKey / getVisitRecordsByCustomerKey 读取。
 */
export interface CustomerFollowUpData {
  callRecords: CallRecord[];
  assignmentRecords: AssignmentRecord[];
  journeyEvents: JourneyEvent[];
  /** 剩余体验课次数 */
  remainingTrialClasses: number;
  /** 未拜访时长（Mock 字符串，如 "3天" / "--"） */
  noVisitDuration: string;
  /** 剩余价值（元） */
  remainingValue: number;
  /** 总退款金额（元） */
  totalRefundAmount: number;
}
