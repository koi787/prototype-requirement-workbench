/**
 * 0012 Cycle A - 到店记录业务模块类型。
 *
 * 与跟进详情到店 Tab 共用，字段与 0011 §6 一一对应（32 列）。
 */
/** 到店记录（32 列，字段与 0011 §6 一一对应） */
export interface ArrivalRecord {
  key: string;
  /** 稳定客户 key（0012 Cycle B 运行时状态按客户归集，独立页/跟进详情共用） */
  customerKey: string;
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
