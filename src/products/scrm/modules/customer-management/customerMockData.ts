import type { CustomerFilter, CustomerRecord } from './customerTypes';

export const CUSTOMER_TOTAL = 30773;
export const CUSTOMER_PAGE_SIZE = 10;

export const CUSTOMER_FILTER_OPTIONS = {
  userSource: [
    { value: '抖音', label: '抖音' },
    { value: '小红书', label: '小红书' },
    { value: '地推', label: '地推' },
    { value: '会员转介绍', label: '会员转介绍' },
  ],
  crossBusinessUser: [
    { value: '是', label: '是' },
    { value: '否', label: '否' },
  ],
} as const;

const BASE_CUSTOMER_FIELDS = {
  registrationStore: '吴江新湖店',
  affiliatedStore: '吴江新湖店',
  gender: '未知',
  birthday: '--',
  membershipLevel: '白银会员',
  growthValue: '0',
  yogaNoVisitTime: '--',
  yogaRecentVisitTime: '--',
  yogaConsumptionCount: '0',
  yogaRemainingCount: '0',
  yogaRemainingAmount: '0.00',
  yogaRemainingContracts: '0',
  beautyNoVisitTime: '--',
  beautyRecentVisitTime: '--',
  beautyConsumptionCount: '0',
  beautyRemainingCount: '0',
  beautyRemainingAmount: '0.00',
  beautyRemainingContracts: '0',
  aobiBalance: '0',
  firstOrderType: '--',
  firstOrderAt: '--',
  businessType: '瑜伽',
  carryoverAmount: '0.00',
  questionnaireStatus: '未提交',
  registeredAt: '2026-08-21 15:50:16',
  remark: '--',
  cancelledOrCancellableBookings: '0/0',
  isNewMember: '否',
  consumptionLevel: '白银会员 无折扣',
  storedValueBalance: '0',
  points: '0',
  fiveDimensionQuestionnaire: '未提交',
  groundPromotionQuestionnaire: '未提交',
} as const;

/** 少量稳定客户资料；总数与当前页数量由 CustomerListPage 独立模拟。 */
export const CUSTOMER_MOCK: readonly CustomerRecord[] = [
  {
    ...BASE_CUSTOMER_FIELDS,
    customerId: 'customer-53395',
    id: '53395',
    name: '游客邦YTHVg',
    avatarLabel: '游',
    phone: '19837512613',
    userSource: '抖音',
    crossBusinessUser: '否',
    measurementId: '676106169',
  },
  {
    ...BASE_CUSTOMER_FIELDS,
    customerId: 'customer-53394',
    id: '53394',
    name: '陈晨',
    avatarLabel: '陈',
    phone: '13800001002',
    userSource: '会员转介绍',
    crossBusinessUser: '是',
    birthday: '1994-05-16',
    businessType: '瑜伽/美容',
  },
  {
    ...BASE_CUSTOMER_FIELDS,
    customerId: 'customer-53393',
    id: '53393',
    name: '张敏',
    avatarLabel: '张',
    phone: '13800001003',
    userSource: '小红书',
    crossBusinessUser: '是',
    gender: '女',
  },
  {
    ...BASE_CUSTOMER_FIELDS,
    customerId: 'customer-53392',
    id: '53392',
    name: '李宁',
    avatarLabel: '李',
    phone: '13800001004',
    userSource: '地推',
    crossBusinessUser: '否',
    gender: '男',
  },
  {
    ...BASE_CUSTOMER_FIELDS,
    customerId: 'customer-53391',
    id: '53391',
    name: '王芳',
    avatarLabel: '王',
    phone: '13800001005',
    userSource: '抖音',
    crossBusinessUser: '否',
    gender: '女',
  },
  {
    ...BASE_CUSTOMER_FIELDS,
    customerId: 'customer-53390',
    id: '53390',
    name: '赵敏',
    avatarLabel: '赵',
    phone: '13800001006',
    userSource: '小红书',
    crossBusinessUser: '否',
    gender: '女',
  },
  {
    ...BASE_CUSTOMER_FIELDS,
    customerId: 'customer-53389',
    id: '53389',
    name: '周杰',
    avatarLabel: '周',
    phone: '13800001007',
    userSource: '会员转介绍',
    crossBusinessUser: '是',
    gender: '男',
  },
  {
    ...BASE_CUSTOMER_FIELDS,
    customerId: 'customer-53388',
    id: '53388',
    name: '刘洋',
    avatarLabel: '刘',
    phone: '13800001008',
    userSource: '地推',
    crossBusinessUser: '否',
    gender: '男',
  },
  {
    ...BASE_CUSTOMER_FIELDS,
    customerId: 'customer-53387',
    id: '53387',
    name: '黄丽',
    avatarLabel: '黄',
    phone: '13800001009',
    userSource: '抖音',
    crossBusinessUser: '否',
    gender: '女',
  },
  {
    ...BASE_CUSTOMER_FIELDS,
    customerId: 'customer-53386',
    id: '53386',
    name: '孙悦',
    avatarLabel: '孙',
    phone: '13800001010',
    userSource: '会员转介绍',
    crossBusinessUser: '是',
    gender: '女',
  },
] as const;

function contains(value: string, query: string): boolean {
  return query.trim() === '' || value.toLowerCase().includes(query.trim().toLowerCase());
}

export function filterCustomers(
  customers: readonly CustomerRecord[],
  filter: CustomerFilter,
): CustomerRecord[] {
  return customers.filter((customer) => {
    const nameOrPhoneMatch =
      filter.nameOrPhone.trim() === '' ||
      contains(customer.name, filter.nameOrPhone) ||
      contains(customer.phone, filter.nameOrPhone);

    return (
      nameOrPhoneMatch &&
      contains(customer.userSource, filter.userSource) &&
      contains(customer.phone, filter.authorizedPhone) &&
      contains(customer.yogaNoVisitTime, filter.yogaNoVisitTime) &&
      contains(customer.beautyNoVisitTime, filter.beautyNoVisitTime) &&
      contains(customer.crossBusinessUser, filter.crossBusinessUser) &&
      contains(customer.registeredAt, filter.customerDate) &&
      contains(customer.birthday, filter.birthday)
    );
  });
}

export function getCustomerById(customerId: string): CustomerRecord | null {
  return CUSTOMER_MOCK.find((customer) => customer.customerId === customerId) ?? null;
}
