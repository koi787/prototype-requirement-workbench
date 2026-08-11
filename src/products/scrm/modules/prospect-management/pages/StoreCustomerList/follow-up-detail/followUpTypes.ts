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

/** 到店记录（32 列，字段与 0011 §6 一一对应） */
export interface ArrivalRecord {
  key: string;
  id: string;
  userName: string;
  userId: string;
  wechatId: string;
  phone: string;
  source: string;
  appointmentStore: string;
  arrivalTime: string;
  isArrived: string;
  isDeal: string;
  dealAmount: number | null;
  courseType: string;
  hasTrialClass: string;
  trialClassStatus: string;
  isSignedIn: string;
  trialClassCoach: string;
  trialClassEndTime: string;
  contractNo: string;
  trialClassCardContractStatus: string;
  trialClassCard: string;
  actualPaidAmount: number | null;
  trialClassGetTime: string;
  intentLevel: number;
  improvementNeed: string;
  intendedCourse: string;
  appointmentRemark: string;
  resultAnalysis: string;
  creator: string;
  createTime: string;
  updater: string;
  updateTime: string;
}

/** 拜访记录（18 列，字段与 0011 §7 一一对应） */
export interface VisitRecord {
  key: string;
  id: string;
  userName: string;
  userId: string;
  wechatId: string;
  phone: string;
  source: string;
  appointmentStore: string;
  visitWay: string;
  intentLevel: number;
  improvementNeed: string;
  intendedCourse: string;
  visitRemark: string;
  visitTime: string;
  creator: string;
  createTime: string;
  updater: string;
  updateTime: string;
}

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

/** 单个客户的跟进详情 Mock 集合（通过稳定客户 key 关联当前列表客户） */
export interface CustomerFollowUpData {
  arrivalRecords: ArrivalRecord[];
  visitRecords: VisitRecord[];
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

/**
 * 金额展示规则（0011 §10）：
 * - 空值显示 `--`；
 * - 数字统一保留两位小数，`0` 显示 `0.00`。
 */
export function formatRecordAmount(value: number | null | undefined): string {
  if (value === null || value === undefined) return '--';
  if (!Number.isFinite(value)) return '--';
  return value.toFixed(2);
}
