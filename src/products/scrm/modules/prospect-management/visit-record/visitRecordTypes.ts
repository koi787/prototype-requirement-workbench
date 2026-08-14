/**
 * 0012 Cycle A - 拜访记录业务模块类型。
 *
 * 与跟进详情拜访 Tab 共用，在 0011 §7 的 18 列基础上新增
 * 下次拜访时间（nextVisitTime），升级为 19 列。
 */

/** 下次拜访时间展示规则（0012 §7.4）：格式 YYYY-MM-DD HH:mm:ss，空值显示 `--`。 */
export const NEXT_VISIT_TIME_EMPTY_TEXT = '--';

/**
 * 拜访记录（19 列，0011 §7 的 18 列 + 下次拜访时间）。
 * nextVisitTime 表示下一次计划拜访/跟进时间：DateTime 可空、非必填，
 * 0012 仅实现录入/回填/修改/列表展示/运行时 Mock 保存（Cycle B）；
 * 不提供提醒、待办、推送或超期判断。
 */
export interface VisitRecord {
  key: string;
  /** 稳定客户 key（0012 Cycle B 运行时状态按客户归集，独立页/跟进详情共用） */
  customerKey: string;
  id: string;
  userName: string;
  userId: string;
  wechatId: string;
  phone: string;
  source: string;
  /** 下次拜访时间（第 7 列，客资来源之后、预约门店之前）；可空，空值显示 `--`。 */
  nextVisitTime: string | null;
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
