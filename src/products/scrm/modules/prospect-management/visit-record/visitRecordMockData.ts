/**
 * 0012 Cycle A - 拜访记录业务模块 Mock 数据与选择器。
 *
 * 独立页（拜访记录）读取全部记录；跟进详情"拜访记录"Tab 按稳定客户 key
 * 读取当前客户记录。两个入口共用同一份初始数据源，禁止复制两套数组。
 *
 * 0011 迁移：张三（key '1'）两条拜访记录原样迁入并补充 nextVisitTime
 * 演示值（v1 有值、v2 为空），保证跟进详情既有断言与 Story 数据不变；
 * 另补充陈晨（key '5'）一条演示数据用于独立页。所有数据均为虚构演示数据。
 */
import type { VisitRecord } from './visitRecordTypes';

const VISIT_RECORDS_BY_CUSTOMER: Record<string, VisitRecord[]> = {
  '1': [
    {
      key: 'v1',
      customerKey: '1',
      id: 'VS001',
      userName: '张三',
      userId: 'UID1001',
      wechatId: 'wx_zhangsan_01',
      phone: '139****4822',
      source: '地推活动',
      nextVisitTime: '2026-07-25 10:00:00',
      appointmentStore: '示例旗舰店',
      visitWay: '上门拜访',
      intentLevel: 4,
      improvementNeed: '咨询课程方案',
      intendedCourse: '少儿体适能课',
      visitRemark: '家长有报名意向，建议本周到店体验',
      visitTime: '2026-07-21 09:00:00',
      creator: '王经理',
      createTime: '2026-07-21 09:00:00',
      updater: '王经理',
      updateTime: '2026-07-21 16:00:00',
    },
    {
      key: 'v2',
      customerKey: '1',
      id: 'VS002',
      userName: '张三',
      userId: 'UID1001',
      wechatId: 'wx_zhangsan_01',
      phone: '139****4822',
      source: '地推活动',
      nextVisitTime: null,
      appointmentStore: '示例旗舰店',
      visitWay: '电话沟通',
      intentLevel: 3,
      improvementNeed: '了解课程安排',
      intendedCourse: '儿童篮球课',
      visitRemark: '--',
      visitTime: '2026-07-19 10:00:00',
      creator: '王经理',
      createTime: '2026-07-19 10:00:00',
      updater: '王经理',
      updateTime: '2026-07-19 11:00:00',
    },
  ],
  '5': [
    {
      key: 'v3',
      customerKey: '5',
      id: 'VS003',
      userName: '陈晨',
      userId: 'UID1005',
      wechatId: 'wx_chenchen_05',
      phone: '135****3507',
      source: '线上广告',
      nextVisitTime: '2026-08-05 15:00:00',
      appointmentStore: '示例宝安店',
      visitWay: '微信',
      intentLevel: 3,
      improvementNeed: '体态调整',
      intendedCourse: '精品私教',
      visitRemark: '已预约下月到店体验',
      visitTime: '2026-07-20 14:00:00',
      creator: '李顾问',
      createTime: '2026-07-20 14:00:00',
      updater: '李顾问',
      updateTime: '2026-07-21 10:00:00',
    },
  ],
};

/** 独立页拜访记录数据源：全部记录（按客户 key 定义的稳定顺序）。 */
export function getAllVisitRecords(): VisitRecord[] {
  return Object.values(VISIT_RECORDS_BY_CUSTOMER).flat();
}

/** 跟进详情"拜访记录"Tab 数据源：按稳定客户 key 读取当前客户记录。 */
export function getVisitRecordsByCustomerKey(customerKey: string): VisitRecord[] {
  return VISIT_RECORDS_BY_CUSTOMER[customerKey] ?? [];
}
