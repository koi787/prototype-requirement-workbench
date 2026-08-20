import { useState } from 'react';
import { Button, Drawer, Input, Tree } from 'antd';
import type { Key } from 'react';
import { normalizePermissionIds, permissionTreeToDataNodes, ROLE_PERMISSION_TREE } from './rolePermissions';
import type { RoleDraft, RoleRecord } from './roleTypes';

export interface RoleDrawerProps {
  mode: 'create' | 'edit';
  open: boolean;
  role?: RoleRecord | null;
  initialDraft?: Partial<RoleDraft>;
  initialExpandedKeys?: readonly Key[];
  onCancel: () => void;
  onSubmit: (draft: RoleDraft) => void;
}

interface DraftErrors {
  roleName?: string;
  roleCode?: string;
  permissionIds?: string;
}

const INITIAL_EXPANDED_KEYS: Key[] = ROLE_PERMISSION_TREE[0]?.id ? [ROLE_PERMISSION_TREE[0].id] : [];

export function RoleDrawer({ mode, open, role, initialDraft, initialExpandedKeys, onCancel, onSubmit }: RoleDrawerProps) {
  const [draft, setDraft] = useState<RoleDraft>(() => ({
    roleName: initialDraft?.roleName ?? role?.roleName ?? '',
    roleCode: initialDraft?.roleCode ?? role?.roleCode ?? '',
    permissionIds: normalizePermissionIds(initialDraft?.permissionIds ?? role?.permissionIds ?? []),
  }));
  const [errors, setErrors] = useState<DraftErrors>({});
  const [expandedKeys, setExpandedKeys] = useState<Key[]>(() => [...(initialExpandedKeys ?? INITIAL_EXPANDED_KEYS)]);

  const updateDraft = (patch: Partial<RoleDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
    setErrors((current) => ({ ...current, ...Object.fromEntries(Object.keys(patch).map((key) => [key, undefined])) }));
  };

  const validate = (): RoleDraft | null => {
    const nextErrors: DraftErrors = {};
    const roleName = draft.roleName.trim();
    const roleCode = draft.roleCode.trim();
    if (!roleName) nextErrors.roleName = '请输入职位名称';
    if (!roleCode) nextErrors.roleCode = '请输入职务编码';
    if (draft.permissionIds.length === 0) nextErrors.permissionIds = '请选择菜单';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0
      ? { roleName, roleCode, permissionIds: normalizePermissionIds(draft.permissionIds) }
      : null;
  };

  const handleSubmit = () => {
    const validDraft = validate();
    if (validDraft) onSubmit(validDraft);
  };

  const handleCheck = (checkedKeys: Key[] | { checked: Key[]; halfChecked: Key[] }) => {
    const keys = Array.isArray(checkedKeys) ? checkedKeys : checkedKeys.checked;
    updateDraft({ permissionIds: normalizePermissionIds(keys.map(String)) });
  };

  return (
    <Drawer
      title={mode === 'create' ? '新增角色' : '修改角色'}
      placement="right"
      width="55vw"
      open={open}
      onClose={onCancel}
      destroyOnHidden
      className="role-drawer"
      footer={(
        <div className="role-drawer-footer">
          <Button type="primary" onClick={handleSubmit}>确定</Button>
          <Button onClick={onCancel}>取消</Button>
        </div>
      )}
    >
      <div className="role-drawer-body" data-req-id="role-drawer">
        <div className="role-drawer-field">
          <label htmlFor="role-drawer-name"><span className="role-drawer-required">*</span>职位名称</label>
          <Input
            id="role-drawer-name"
            placeholder="请输入职位名称"
            value={draft.roleName}
            onChange={(event) => updateDraft({ roleName: event.target.value })}
            {...(errors.roleName ? { status: 'error' as const } : {})}
            data-req-id="role-drawer-role-name"
          />
          {errors.roleName && <div className="role-drawer-error" role="alert">{errors.roleName}</div>}
        </div>
        <div className="role-drawer-field">
          <label htmlFor="role-drawer-code"><span className="role-drawer-required">*</span>职务编码</label>
          <Input
            id="role-drawer-code"
            placeholder="请输入职务编码"
            value={draft.roleCode}
            disabled={mode === 'edit'}
            onChange={(event) => updateDraft({ roleCode: event.target.value })}
            {...(errors.roleCode ? { status: 'error' as const } : {})}
            data-req-id="role-drawer-role-code"
          />
          {errors.roleCode && <div className="role-drawer-error" role="alert">{errors.roleCode}</div>}
        </div>
        <div className="role-drawer-field role-drawer-permission-field">
          <label><span className="role-drawer-required">*</span>选择菜单</label>
          <div className={`role-drawer-permission-panel ${errors.permissionIds ? 'has-error' : ''}`}>
            <Tree
              checkable
              checkStrictly
              blockNode
              selectable={false}
              treeData={permissionTreeToDataNodes(ROLE_PERMISSION_TREE)}
              expandedKeys={expandedKeys}
              checkedKeys={{ checked: draft.permissionIds, halfChecked: [] }}
              onExpand={(keys) => setExpandedKeys(keys)}
              onCheck={handleCheck}
              data-req-id="role-drawer-permission-tree"
            />
          </div>
          {errors.permissionIds && <div className="role-drawer-error" role="alert">{errors.permissionIds}</div>}
        </div>
      </div>
    </Drawer>
  );
}

export default RoleDrawer;
