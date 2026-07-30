/**
 * 0008 闭环二：无效审批流程共享类型定义
 *
 * 所有类型不依赖真实用户、后端或文件系统。
 */

/** 附件安全元数据（不保存真实文件） */
export type InvalidApprovalStatus = 'pending' | 'approved' | 'rejected' | null;

export interface AttachmentMeta {
  id: string;
  name: string;
}

/** 无效申请信息 */
export interface ApprovalApplication {
  customerName: string;
  applicant: string;
  applicationTime: string;
  remark: string;
  attachments: AttachmentMeta[];
}

/** 审核结果 */
export interface ApprovalReview {
  opinion: 'approved' | 'rejected';
  remark: string;
  reviewer: string;
  reviewTime: string;
  attachments: AttachmentMeta[];
}

/** 当前打开的抽屉类型 */
export type DrawerMode = 'application' | 'review' | 'detail' | null;
