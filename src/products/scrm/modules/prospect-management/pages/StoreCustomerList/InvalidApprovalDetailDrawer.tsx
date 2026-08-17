/**
 * 0008 闭环二：无效标注详情抽屉（只读）
 *
 * 补全字段：无论待审核、通过还是退回，均使用一致的结构。
 * 没有值时展示 "--"。
 */
import { Drawer } from 'antd';
import type { ApprovalApplication, ApprovalReview, InvalidApprovalStatus } from './approvalTypes';

// 审核状态与审核意见语义分离：状态展示 待审核 / 审核通过 / 审核退回；意见展示 通过 / 退回（待审核时无审核意见，显示 "--"）
const STATUS_LABEL_MAP: Record<Exclude<InvalidApprovalStatus, null>, string> = {
  pending: '待审核',
  approved: '审核通过',
  rejected: '审核退回',
};

export interface InvalidApprovalDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  recordName: string;
  status: InvalidApprovalStatus;
  application: ApprovalApplication | null;
  review: ApprovalReview | null;
}

export function InvalidApprovalDetailDrawer({
  open,
  onClose,
  recordName,
  status,
  application,
  review,
}: InvalidApprovalDetailDrawerProps) {
  return (
    <Drawer
      title="无效标注详情"
      open={open}
      onClose={onClose}
      width={520}
      destroyOnClose
      data-req-id="invalid-approval-detail-drawer"
    >
      <div className="invalid-approval-drawer-body">
        {/* 申请信息 */}
        <div className="invalid-approval-drawer-section">
          <h4 className="invalid-approval-drawer-section-title">申请信息</h4>
          <div className="invalid-approval-drawer-field">
            <label>客户姓名</label>
            <span>{recordName}</span>
          </div>
          <div className="invalid-approval-drawer-field">
            <label>申请人</label>
            <span>{application?.applicant ?? '--'}</span>
          </div>
          <div className="invalid-approval-drawer-field">
            <label>申请时间</label>
            <span>{application?.applicationTime ?? '--'}</span>
          </div>
          <div className="invalid-approval-drawer-field">
            <label>备注</label>
            <span>{application?.remark || '--'}</span>
          </div>
          <div className="invalid-approval-drawer-field">
            <label>申请附件</label>
            {application?.attachments && application.attachments.length > 0 ? (
              <ul className="invalid-approval-drawer-attachment-list">
                {application.attachments.map((att) => (
                  <li key={att.id}>{att.name}</li>
                ))}
              </ul>
            ) : (
              <span>--</span>
            )}
          </div>
        </div>

        {/* 审核信息 */}
        <div className="invalid-approval-drawer-section">
          <h4 className="invalid-approval-drawer-section-title">审核信息</h4>
          <div className="invalid-approval-drawer-field">
            <label>审核状态</label>
            <span>
              {status ? STATUS_LABEL_MAP[status] : '--'}
            </span>
          </div>
          <div className="invalid-approval-drawer-field">
            <label>审核意见</label>
            <span>
              {review
                ? review.opinion === 'approved'
                  ? '通过'
                  : '退回'
                : '--'}
            </span>
          </div>
          <div className="invalid-approval-drawer-field">
            <label>审核人</label>
            <span>{review?.reviewer ?? '--'}</span>
          </div>
          <div className="invalid-approval-drawer-field">
            <label>审核时间</label>
            <span>{review?.reviewTime ?? '--'}</span>
          </div>
          <div className="invalid-approval-drawer-field">
            <label>备注</label>
            <span>{review?.remark || '--'}</span>
          </div>
          <div className="invalid-approval-drawer-field">
            <label>审核附件</label>
            {review?.attachments && review.attachments.length > 0 ? (
              <ul className="invalid-approval-drawer-attachment-list">
                {review.attachments.map((att) => (
                  <li key={att.id}>{att.name}</li>
                ))}
              </ul>
            ) : (
              <span>--</span>
            )}
          </div>
        </div>
      </div>
    </Drawer>
  );
}
