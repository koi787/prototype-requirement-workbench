/**
 * 门店客户列表 - 52列定义
 * 顺序严格按照任务单第12节
 */
import type { ColumnsType } from 'antd/es/table';
import type { CustomerRecord } from './mockData';
import { VisitedTag, DealTag } from './StatusTags';

/**
 * 列级需求锚点注册信息。
 *
 * Ant Design 会为固定列和测量表头重复渲染列标题，因此列标题本身不能作为
 * 唯一 DOM 锚点。页面组件会在表格区域内按此清单一次性注册稳定锚点。
 */
export const COLUMN_REQUIREMENT_ANCHORS = [
  { id: 'customer-name-column', columnKey: 'name', description: '姓名列' },
  {
    id: 'appointment-arrival-time-column',
    columnKey: 'appointmentTime',
    description: '预约到店时间列',
  },
  { id: 'operation-column', columnKey: 'operation', description: '操作列' },
  { id: 'first-allocation-time-column', columnKey: 'firstAssignTime', description: '首次分配时间列' },
  { id: 'latest-allocation-time-column', columnKey: 'lastAssignTime', description: '最新分配时间列' },
  { id: 'is-arrived-column', columnKey: 'isVisited', description: '是否到店列' },
  { id: 'is-deal-column', columnKey: 'isDeal', description: '是否成交列' },
  { id: 'actual-arrival-status-column', columnKey: 'actualVisitStatus', description: '实际到店状态列' },
  { id: 'actual-deal-status-column', columnKey: 'actualDealStatus', description: '实际成交状态列' },
  { id: 'invalid-lead-status-column', columnKey: 'invalidCustomerStatus', description: '无效客资状态列' },
] as const;

export const ALL_COLUMNS: ColumnsType<CustomerRecord> = [
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
    fixed: 'left',
    width: 140,
  },
  {
    title: '首次分配时间',
    dataIndex: 'firstAssignTime',
    key: 'firstAssignTime',
    width: 150,
  },
  {
    title: '最新分配时间',
    dataIndex: 'lastAssignTime',
    key: 'lastAssignTime',
    width: 150,
  },
  {
    title: '是否到店',
    dataIndex: 'isVisited',
    key: 'isVisited',
    width: 100,
    render: (v: string) => <VisitedTag value={v} />,
  },
  {
    title: '是否成交',
    dataIndex: 'isDeal',
    key: 'isDeal',
    width: 100,
    render: (v: string) => <DealTag value={v} />,
  },
  {
    title: '预约到店时间',
    dataIndex: 'appointmentTime',
    key: 'appointmentTime',
    width: 160,
    sorter: (a, b) => {
      if (a.appointmentTime === '-' && b.appointmentTime === '-') return 0;
      if (a.appointmentTime === '-') return 1;
      if (b.appointmentTime === '-') return -1;
      return a.appointmentTime.localeCompare(b.appointmentTime);
    },
  },
  {
    title: '实际到店状态',
    dataIndex: 'actualVisitStatus',
    key: 'actualVisitStatus',
    width: 130,
  },
  {
    title: '实际成交状态',
    dataIndex: 'actualDealStatus',
    key: 'actualDealStatus',
    width: 130,
  },
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 90,
  },
  {
    title: '用户ID',
    dataIndex: 'userId',
    key: 'userId',
    width: 110,
  },
  {
    title: '微信号',
    dataIndex: 'wechatId',
    key: 'wechatId',
    width: 130,
  },
  {
    title: '手机号',
    dataIndex: 'phone',
    key: 'phone',
    width: 120,
  },
  {
    title: '留资门店',
    dataIndex: 'retainStore',
    key: 'retainStore',
    width: 120,
  },
  {
    title: '留资商家备注',
    dataIndex: 'retainStoreRemark',
    key: 'retainStoreRemark',
    width: 130,
    ellipsis: true,
  },
  {
    title: '性别',
    dataIndex: 'gender',
    key: 'gender',
    width: 60,
  },
  {
    title: '用户年龄',
    dataIndex: 'age',
    key: 'age',
    width: 80,
  },
  {
    title: '客资来源',
    dataIndex: 'source',
    key: 'source',
    width: 100,
  },
  {
    title: '客资类型',
    dataIndex: 'customerType',
    key: 'customerType',
    width: 90,
  },
  {
    title: '是否已分配',
    dataIndex: 'isAssigned',
    key: 'isAssigned',
    width: 100,
  },
  {
    title: '最新跟进人',
    dataIndex: 'latestFollower',
    key: 'latestFollower',
    width: 110,
  },
  {
    title: '共享人',
    dataIndex: 'sharer',
    key: 'sharer',
    width: 100,
  },
  {
    title: '到店次数',
    dataIndex: 'visitCount',
    key: 'visitCount',
    width: 90,
  },
  {
    title: '近7天到店次数',
    dataIndex: 'visitCount7d',
    key: 'visitCount7d',
    width: 120,
  },
  {
    title: '近30天到店次数',
    dataIndex: 'visitCount30d',
    key: 'visitCount30d',
    width: 130,
  },
  {
    title: '拜访次数',
    dataIndex: 'interviewCount',
    key: 'interviewCount',
    width: 90,
  },
  {
    title: '近7天拜访次数',
    dataIndex: 'interviewCount7d',
    key: 'interviewCount7d',
    width: 120,
  },
  {
    title: '近30天拜访次数',
    dataIndex: 'interviewCount30d',
    key: 'interviewCount30d',
    width: 130,
  },
  {
    title: '转化时长（天）',
    dataIndex: 'conversionDays',
    key: 'conversionDays',
    width: 120,
  },
  {
    title: '成交周期（天）',
    dataIndex: 'dealCycleDays',
    key: 'dealCycleDays',
    width: 120,
  },
  {
    title: '最新编辑人',
    dataIndex: 'latestEditor',
    key: 'latestEditor',
    width: 110,
  },
  {
    title: '备注',
    dataIndex: 'remark',
    key: 'remark',
    width: 130,
    ellipsis: true,
  },
  {
    title: '邀请员工编号',
    dataIndex: 'inviteEmployeeId',
    key: 'inviteEmployeeId',
    width: 120,
  },
  {
    title: '邀请员工姓名',
    dataIndex: 'inviteEmployeeName',
    key: 'inviteEmployeeName',
    width: 120,
  },
  {
    title: '地推问卷',
    dataIndex: 'groundPromotionQuestionnaire',
    key: 'groundPromotionQuestionnaire',
    width: 120,
    ellipsis: true,
  },
  {
    title: '答案',
    dataIndex: 'answer',
    key: 'answer',
    width: 90,
  },
  {
    title: '地推问卷提交时间',
    dataIndex: 'questionnaireSubmitTime',
    key: 'questionnaireSubmitTime',
    width: 160,
  },
  {
    title: '预约门店',
    dataIndex: 'appointmentStore',
    key: 'appointmentStore',
    width: 120,
  },
  {
    title: '是否赠送体验课',
    dataIndex: 'isGiftTrialClass',
    key: 'isGiftTrialClass',
    width: 130,
  },
  {
    title: '体验课获取时间',
    dataIndex: 'trialClassGetTime',
    key: 'trialClassGetTime',
    width: 150,
  },
  {
    title: '合同编号',
    dataIndex: 'contractNo',
    key: 'contractNo',
    width: 130,
  },
  {
    title: '是否已预约',
    dataIndex: 'isAppointed',
    key: 'isAppointed',
    width: 100,
  },
  {
    title: '体验课状态',
    dataIndex: 'trialClassStatus',
    key: 'trialClassStatus',
    width: 110,
  },
  {
    title: '体验课下课时间',
    dataIndex: 'trialClassEndTime',
    key: 'trialClassEndTime',
    width: 150,
  },
  {
    title: '用户标签',
    dataIndex: 'userTags',
    key: 'userTags',
    width: 120,
    ellipsis: true,
  },
  {
    title: '体验课支付金额',
    dataIndex: 'trialClassPayAmount',
    key: 'trialClassPayAmount',
    width: 130,
  },
  {
    title: '体验课顾问',
    dataIndex: 'trialClassConsultant',
    key: 'trialClassConsultant',
    width: 110,
  },
  {
    title: '是否已注册',
    dataIndex: 'isRegistered',
    key: 'isRegistered',
    width: 100,
  },
  {
    title: '重复留资次数',
    dataIndex: 'repeatRetainCount',
    key: 'repeatRetainCount',
    width: 110,
  },
  {
    title: '最新留资时间',
    dataIndex: 'latestRetainTime',
    key: 'latestRetainTime',
    width: 150,
  },
  {
    title: '无效客资状态',
    dataIndex: 'invalidCustomerStatus',
    key: 'invalidCustomerStatus',
    width: 120,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 150,
  },
  {
    title: '操作',
    key: 'operation',
    fixed: 'right',
    width: 100,
  },
];

/** 验证52列顺序 */
export const COLUMN_COUNT = ALL_COLUMNS.length;
export const COLUMN_ORDER = ALL_COLUMNS.map((c) => c.key);
