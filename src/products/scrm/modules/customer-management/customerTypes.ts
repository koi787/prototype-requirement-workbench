export interface CustomerRecord {
  customerId: string;
  /** 生产列表展示的客户 ID；不是设备 measurement.id。 */
  id: string;
  name: string;
  avatarLabel: string;
  registrationStore: string;
  affiliatedStore: string;
  gender: string;
  birthday: string;
  phone: string;
  userSource: string;
  membershipLevel: string;
  growthValue: string;
  yogaNoVisitTime: string;
  yogaRecentVisitTime: string;
  yogaConsumptionCount: string;
  yogaRemainingCount: string;
  yogaRemainingAmount: string;
  yogaRemainingContracts: string;
  beautyNoVisitTime: string;
  beautyRecentVisitTime: string;
  beautyConsumptionCount: string;
  beautyRemainingCount: string;
  beautyRemainingAmount: string;
  beautyRemainingContracts: string;
  aobiBalance: string;
  firstOrderType: string;
  firstOrderAt: string;
  businessType: string;
  crossBusinessUser: '是' | '否';
  carryoverAmount: string;
  questionnaireStatus: string;
  registeredAt: string;
  /** 仅作为后续 Cycle D 的数据层关联预留，不在 Cycle C 详情展示。 */
  measurementId?: string;
  remark: string;
  cancelledOrCancellableBookings: string;
  isNewMember: '是' | '否';
  consumptionLevel: string;
  storedValueBalance: string;
  points: string;
  fiveDimensionQuestionnaire: string;
  groundPromotionQuestionnaire: string;
}

export interface CustomerFilter {
  nameOrPhone: string;
  userSource: string;
  authorizedPhone: string;
  yogaNoVisitTime: string;
  beautyNoVisitTime: string;
  crossBusinessUser: string;
  customerDate: string;
  birthday: string;
}

export const EMPTY_CUSTOMER_FILTER: CustomerFilter = {
  nameOrPhone: '',
  userSource: '',
  authorizedPhone: '',
  yogaNoVisitTime: '',
  beautyNoVisitTime: '',
  crossBusinessUser: '',
  customerDate: '',
  birthday: '',
};

export interface CustomerFilterOptions {
  userSource: readonly { value: string; label: string }[];
  crossBusinessUser: readonly { value: string; label: string }[];
}
