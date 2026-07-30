/**
 * 0008 闭环二：无效审批状态管理 Hook
 *
 * 在页面本地管理客户审批状态、申请和审核数据。
 * 所有状态变更只作用于当前原型内存，不发起网络请求。
 */
import { useState, useCallback, useMemo, useRef } from 'react';
import type { CustomerRecord } from './mockData';
import rawCustomers from './mockData';
import type {
  ApprovalApplication,
  ApprovalReview,
  AttachmentMeta,
  InvalidApprovalStatus,
} from './approvalTypes';

/** 模拟固定申请人（原型无真实登录） */
const APPLICANT_NAME = '王经理';

/** 模拟固定审核人 */
const REVIEWER_NAME = '系统管理员';

const SEEDED_APPLICATIONS = new Map<string, ApprovalApplication>([
  ['2', {
    customerName: '李四',
    applicant: '王经理',
    applicationTime: '2026-07-20 09:30:00',
    remark: '客户多次未按预约到店，申请标记无效。',
    attachments: [{ id: 'application-2-1', name: '客户沟通记录.png' }],
  }],
  ['5', {
    customerName: '陈晨',
    applicant: '王经理',
    applicationTime: '2026-07-18 14:20:00',
    remark: '客户明确表示近期无课程需求，申请标记无效。',
    attachments: [{ id: 'application-5-1', name: '客户确认记录.pdf' }],
  }],
  ['7', {
    customerName: '周杰',
    applicant: '李顾问',
    applicationTime: '2026-07-19 11:10:00',
    remark: '多次联系未接通，申请标记无效。',
    attachments: [{ id: 'application-7-1', name: '外呼记录.png' }],
  }],
]);

const SEEDED_REVIEWS = new Map<string, ApprovalReview>([
  ['5', {
    opinion: 'approved',
    reviewer: '系统管理员',
    reviewTime: '2026-07-18 16:00:00',
    remark: '核实申请信息无误，同意标记为无效客资。',
    attachments: [{ id: 'review-5-1', name: '审核确认单.pdf' }],
  }],
  ['7', {
    opinion: 'rejected',
    reviewer: '系统管理员',
    reviewTime: '2026-07-19 15:30:00',
    remark: '申请依据不足，请补充近期沟通记录后重新提交。',
    attachments: [{ id: 'review-7-1', name: '审核退回说明.pdf' }],
  }],
]);

/** 生成格式化的模拟时间 */
function now(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export interface ApprovalState {
  /** 当前可变客户数据 */
  customers: CustomerRecord[];
  /** 客户 → 最新申请 */
  applications: Map<string, ApprovalApplication>;
  /** 客户 → 最新审核 */
  reviews: Map<string, ApprovalReview>;
  /** 提交无效申请 */
  submitApplication: (
    recordKey: string,
    remark: string,
    attachments: AttachmentMeta[],
  ) => void;
  /** 提交审核 */
  submitReview: (
    recordKey: string,
    opinion: 'approved' | 'rejected',
    remark: string,
    attachments: AttachmentMeta[],
  ) => void;
  /** 获取指定客户的申请信息 */
  getApplication: (recordKey: string) => ApprovalApplication | undefined;
  /** 获取指定客户的审核信息 */
  getReview: (recordKey: string) => ApprovalReview | undefined;
  /** 获取指定客户的无效审批状态 */
  getStatus: (recordKey: string) => InvalidApprovalStatus;
}

export function useApprovalState(initialData?: CustomerRecord[]): ApprovalState {
  // 深拷贝模拟数据以避免修改静态导入
  const [customers, setCustomers] = useState<CustomerRecord[]>(() =>
    (initialData ?? rawCustomers).map((r) => ({ ...r })),
  );
  const [applications, setApplications] = useState<Map<string, ApprovalApplication>>(
    () => new Map(SEEDED_APPLICATIONS),
  );
  const [reviews, setReviews] = useState<Map<string, ApprovalReview>>(
    () => new Map(SEEDED_REVIEWS),
  );
  const statusRef = useRef(
    new Map<string, InvalidApprovalStatus>(
      (initialData ?? rawCustomers).map((record) => [
        record.key,
        record.invalidApprovalStatus,
      ]),
    ),
  );

  // 使用独立 ref 防重复提交（申请和审核各自独立）
  const applyingRef = useRef(false);
  const reviewingRef = useRef(false);

  const submitApplication = useCallback(
    (recordKey: string, remark: string, attachments: AttachmentMeta[]) => {
      if (applyingRef.current) return;
      const currentStatus = statusRef.current.get(recordKey);
      if (currentStatus !== null && currentStatus !== 'rejected') return;
      const customer = customers.find((record) => record.key === recordKey);
      if (!customer) return;
      applyingRef.current = true;
      statusRef.current.set(recordKey, 'pending');

      const appTime = now();
      const application: ApprovalApplication = {
        customerName: customer.name,
        applicant: APPLICANT_NAME,
        applicationTime: appTime,
        remark,
        attachments,
      };

      setApplications((prev) => {
        const next = new Map(prev);
        next.set(recordKey, application);
        return next;
      });

      // 清除旧审核（重新申请时）
      setReviews((prev) => {
        const next = new Map(prev);
        next.delete(recordKey);
        return next;
      });

      setCustomers((prev) =>
        prev.map((c) =>
          c.key === recordKey ? { ...c, invalidApprovalStatus: 'pending' } : c,
        ),
      );

      // 重置防重复锁
      setTimeout(() => {
        applyingRef.current = false;
      }, 500);
    },
    [customers],
  );

  const submitReview = useCallback(
    (
      recordKey: string,
      opinion: 'approved' | 'rejected',
      remark: string,
      attachments: AttachmentMeta[],
    ) => {
      if (reviewingRef.current) return;
      if (statusRef.current.get(recordKey) !== 'pending') return;
      reviewingRef.current = true;
      statusRef.current.set(recordKey, opinion);

      const reviewTime = now();
      const review: ApprovalReview = {
        opinion,
        remark,
        reviewer: REVIEWER_NAME,
        reviewTime,
        attachments,
      };

      setReviews((prev) => {
        const next = new Map(prev);
        next.set(recordKey, review);
        return next;
      });

      setCustomers((prev) =>
        prev.map((c) =>
          c.key === recordKey
            ? { ...c, invalidApprovalStatus: opinion }
            : c,
        ),
      );

      // 重置防重复锁
      setTimeout(() => {
        reviewingRef.current = false;
      }, 500);
    },
    [],
  );

  const getApplication = useCallback(
    (recordKey: string) => applications.get(recordKey),
    [applications],
  );

  const getReview = useCallback(
    (recordKey: string) => reviews.get(recordKey),
    [reviews],
  );

  const getStatus = useCallback(
    (recordKey: string) => {
      const customer = customers.find((c) => c.key === recordKey);
      return customer?.invalidApprovalStatus ?? null;
    },
    [customers],
  );

  return useMemo(
    () => ({
      customers,
      applications,
      reviews,
      submitApplication,
      submitReview,
      getApplication,
      getReview,
      getStatus,
    }),
    [
      customers,
      applications,
      reviews,
      submitApplication,
      submitReview,
      getApplication,
      getReview,
      getStatus,
    ],
  );
}
