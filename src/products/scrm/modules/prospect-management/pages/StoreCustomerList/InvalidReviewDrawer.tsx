/**
 * 0008 闭环二：审核无效标注抽屉
 *
 * 审核意见水平排列（通过/退回），必填带红色 *。
 * 退回时备注必填（红色 *），通过时非必填（无 *）。
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { Drawer, Radio, Input, Button, Space } from 'antd';
import type { ApprovalApplication, AttachmentMeta } from './approvalTypes';

const { TextArea } = Input;

const INITIAL_REVIEW_FORM = {
  opinion: null as 'approved' | 'rejected' | null,
  remark: '',
  attachments: [] as AttachmentMeta[],
  submitting: false,
  opinionError: '',
  remarkError: '',
};

export interface InvalidReviewDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    opinion: 'approved' | 'rejected',
    remark: string,
    attachments: AttachmentMeta[],
  ) => void;
  recordName: string;
  application: ApprovalApplication | null;
}

export function InvalidReviewDrawer({
  open,
  onClose,
  onSubmit,
  recordName,
  application,
}: InvalidReviewDrawerProps) {
  const [form, setForm] = useState(INITIAL_REVIEW_FORM);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const submittingRef = useRef(false);
  const formRef = useRef(form);

  // 保持 formRef 与最新 form 状态同步，不在 render 期间写 ref
  useEffect(() => {
    formRef.current = form;
  }, [form]);

  const isRejected = form.opinion === 'rejected';

  // 打开、关闭或重新打开时重置表单与同步防重复锁
  useEffect(() => {
    submittingRef.current = false;
    formRef.current = INITIAL_REVIEW_FORM;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 抽屉开关变化时需重置表单
    setForm(INITIAL_REVIEW_FORM);
  }, [open]);

  const handleFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      const newAttachments: AttachmentMeta[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i]!;
        newAttachments.push({
          id: `rev-att-${Date.now()}-${i}`,
          name: file.name,
        });
      }
      setForm((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...newAttachments],
      }));
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [],
  );

  const handleRemoveAttachment = useCallback((id: string) => {
    setForm((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((a) => a.id !== id),
    }));
  }, []);

  const handleConfirm = useCallback(() => {
    // 防重复提交
    if (submittingRef.current) return;

    const currentForm = formRef.current;
    let opinionError = '';
    let remarkError = '';

    if (!currentForm.opinion) {
      opinionError = '请选择审核意见';
    }

    if (currentForm.opinion === 'rejected' && currentForm.remark.trim() === '') {
      remarkError = '退回时请填写备注';
    } else if (currentForm.remark.length > 200) {
      remarkError = '备注不得超过200字';
    }

    if (opinionError || remarkError) {
      setForm((prev) => ({ ...prev, opinionError, remarkError }));
      return;
    }

    // 标记提交中，禁用按钮，防止重复提交
    submittingRef.current = true;
    setForm((prev) => ({ ...prev, submitting: true }));

    // onSubmit 在 setState 回调外部调用
    onSubmit(currentForm.opinion!, currentForm.remark, currentForm.attachments);
  }, [onSubmit]);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Drawer
      title="审核无效标注"
      open={open}
      onClose={onClose}
      width={520}
      destroyOnClose
      data-req-id="invalid-approval-review-drawer"
    >
      <div className="invalid-approval-drawer-body">
        {/* 申请信息区（只读） */}
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
            <label>申请理由</label>
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

        {/* 审核信息区 */}
        <div className="invalid-approval-drawer-section">
          <h4 className="invalid-approval-drawer-section-title">审核信息</h4>

          <div className="invalid-approval-drawer-field">
            <div className="invalid-approval-drawer-opinion-row">
              <div className="invalid-approval-drawer-opinion-label">
                <span className="invalid-approval-drawer-required">*</span>
                <span>审核意见：</span>
              </div>
              <div
                data-req-id="invalid-approval-opinion"
                data-testid="invalid-approval-opinion"
              >
                <Radio.Group
                  className="invalid-approval-drawer-opinion-group"
                  value={form.opinion}
                  onChange={(e) => {
                    setForm((prev) => ({
                      ...prev,
                      opinion: e.target.value,
                      opinionError: '',
                    }));
                  }}
                >
                  <Radio value="approved">通过</Radio>
                  <Radio value="rejected">退回</Radio>
                </Radio.Group>
              </div>
            </div>
            {form.opinionError && (
              <div className="invalid-approval-drawer-error">
                {form.opinionError}
              </div>
            )}
          </div>

          <div className="invalid-approval-drawer-field">
            <label>
              {isRejected && (
                <span className="invalid-approval-drawer-required">*</span>
              )}
              备注
            </label>
            <div
              data-req-id="invalid-approval-return-remark"
              data-testid="invalid-approval-return-remark"
            >
              <TextArea
                placeholder={
                  isRejected
                    ? '退回时请填写备注（必填，最多200字）'
                    : '备注（非必填，最多200字）'
                }
                value={form.remark}
                onChange={(e) => {
                  setForm((prev) => ({
                    ...prev,
                    remark: e.target.value,
                    remarkError: '',
                  }));
                }}
                maxLength={200}
                rows={4}
                showCount
                data-req-id="invalid-approval-review-remark-input"
              />
            </div>
            {form.remarkError && (
              <div className="invalid-approval-drawer-error">
                {form.remarkError}
              </div>
            )}
          </div>

          <div className="invalid-approval-drawer-field">
            <label>上传附件</label>
            <div className="invalid-approval-drawer-attachments">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={handleFileChange}
                data-req-id="invalid-approval-review-file-input"
              />
              <Button onClick={handleFileSelect}>选择附件</Button>
              {form.attachments.length > 0 && (
                <ul
                  className="invalid-approval-drawer-attachment-list"
                  data-req-id="invalid-approval-review-attachments"
                >
                  {form.attachments.map((att) => (
                    <li
                      key={att.id}
                      className="invalid-approval-drawer-attachment-item"
                    >
                      <span className="invalid-approval-drawer-attachment-name">
                        {att.name}
                      </span>
                      <Button
                        type="link"
                        size="small"
                        danger
                        onClick={() => handleRemoveAttachment(att.id)}
                      >
                        移除
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="invalid-approval-drawer-footer">
        <Space>
          <Button onClick={handleCancel}>取消</Button>
          <Button
            type="primary"
            onClick={handleConfirm}
            disabled={form.submitting}
            loading={form.submitting}
            data-req-id="invalid-approval-review-confirm"
          >
            {form.submitting ? '提交中' : '确认'}
          </Button>
        </Space>
      </div>
    </Drawer>
  );
}
