/**
 * 0008 闭环二：标记无效客资抽屉
 *
 * 只展示理由和附件，不展示客户姓名、申请人等被申请人信息。
 * 理由必填（红色 *），附件非必填。
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { Drawer, Input, Button, Space } from 'antd';
import type { AttachmentMeta } from './approvalTypes';

const { TextArea } = Input;

export interface InvalidApplicationDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (remark: string, attachments: AttachmentMeta[]) => void;
  /** 审核退回后再次标记时预填旧理由 */
  defaultRemark?: string;
  /** 审核退回后再次标记时预填旧附件 */
  defaultAttachments?: AttachmentMeta[];
}

export function InvalidApplicationDrawer({
  open,
  onClose,
  onSubmit,
  defaultRemark = '',
  defaultAttachments = [],
}: InvalidApplicationDrawerProps) {
  const [form, setForm] = useState({
    remark: defaultRemark,
    attachments: defaultAttachments,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // open 从 false → true 时重置表单状态
  const wasOpen = useRef(open);
  useEffect(() => {
    if (open && !wasOpen.current) {
      setForm({ remark: defaultRemark, attachments: [...defaultAttachments] });
    }
    wasOpen.current = open;
  }, [open, defaultRemark, defaultAttachments]);

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
          id: `att-${Date.now()}-${i}`,
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
    if (form.remark.trim() === '') return;
    onSubmit(form.remark, form.attachments);
    setForm({ remark: '', attachments: [] });
  }, [form.remark, form.attachments, onSubmit]);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Drawer
      title="标记无效客资"
      open={open}
      onClose={onClose}
      width={520}
      destroyOnClose
      data-req-id="invalid-application-drawer"
    >
      <div className="invalid-approval-drawer-body">
        <div className="invalid-approval-drawer-section">
          <div className="invalid-approval-drawer-field">
            <label>
              <span className="invalid-approval-drawer-required">*</span>
              理由
            </label>
            <TextArea
              placeholder="请输入理由（必填，最多200字）"
              value={form.remark}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, remark: e.target.value }))
              }
              maxLength={200}
              rows={4}
              showCount
              data-req-id="invalid-application-remark"
            />
          </div>
        </div>

        <div className="invalid-approval-drawer-section">
          <div className="invalid-approval-drawer-field">
            <label>附件</label>
            <div className="invalid-approval-drawer-attachments">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={handleFileChange}
                data-req-id="invalid-application-file-input"
              />
              <Button onClick={handleFileSelect}>选择附件</Button>
              {form.attachments.length > 0 && (
                <ul
                  className="invalid-approval-drawer-attachment-list"
                  data-req-id="invalid-application-attachments"
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
            data-req-id="invalid-application-submit"
          >
            确认
          </Button>
        </Space>
      </div>
    </Drawer>
  );
}
