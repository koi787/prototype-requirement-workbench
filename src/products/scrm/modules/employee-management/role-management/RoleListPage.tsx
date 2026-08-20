import { useMemo, useState } from 'react';
import { Button, Input, message, Modal, Table } from 'antd';
import { buildRoleColumns } from './roleColumns';
import { RoleDrawer } from './RoleDrawer';
import {
  DEFAULT_ROLE_FILTER,
  DEFAULT_USED_ROLE_IDS,
  filterRoles,
  formatRoleDate,
  nextRoleId,
  ROLE_MOCK,
} from './roleMockData';
import type { RoleFilter, RoleRecord } from './roleTypes';
import type { RoleDraft } from './roleTypes';
import './roleList.css';

const PAGE_SIZE = 10;

export interface RoleListPageProps {
  initialRoles?: readonly RoleRecord[];
  initialDrawer?: { mode: 'create' | 'edit'; roleId?: string; initialDraft?: Partial<RoleDraft> };
  usedRoleIds?: readonly string[];
  initialAppliedFilter?: RoleFilter;
  onCreate?: () => void;
  onEdit?: (record: RoleRecord) => void;
  onDelete?: (record: RoleRecord) => void;
}

export function RoleListPage({
  initialAppliedFilter,
  onCreate = () => undefined,
  onEdit = () => undefined,
  onDelete = () => undefined,
  initialRoles,
  initialDrawer,
  usedRoleIds = DEFAULT_USED_ROLE_IDS,
}: RoleListPageProps) {
  const initialFilter = initialAppliedFilter ?? DEFAULT_ROLE_FILTER;
  const [draftFilters, setDraftFilters] = useState<RoleFilter>(initialFilter);
  const [appliedFilters, setAppliedFilters] = useState<RoleFilter>(initialFilter);
  const [currentPage, setCurrentPage] = useState(1);
  const [jumpPage, setJumpPage] = useState('');
  const [roles, setRoles] = useState<RoleRecord[]>(() =>
    (initialRoles ?? ROLE_MOCK).map((role) => ({ ...role, permissionIds: [...role.permissionIds] })),
  );
  const [drawer, setDrawer] = useState<{ open: boolean; mode: 'create' | 'edit'; roleId?: string; initialDraft?: Partial<RoleDraft> }>({
    open: !!initialDrawer,
    mode: initialDrawer?.mode ?? 'create',
    ...(initialDrawer?.roleId ? { roleId: initialDrawer.roleId } : {}),
    ...(initialDrawer?.initialDraft ? { initialDraft: initialDrawer.initialDraft } : {}),
  });
  const [modal, modalContextHolder] = Modal.useModal();
  const [messageApi, messageContextHolder] = message.useMessage();
  const filteredRoles = useMemo(() => filterRoles(roles, appliedFilters), [roles, appliedFilters]);
  const totalPages = Math.ceil(filteredRoles.length / PAGE_SIZE);
  const displayedPage = totalPages === 0 ? 0 : Math.min(currentPage, totalPages);
  const pagedRoles = filteredRoles.slice(
    Math.max(0, (displayedPage - 1) * PAGE_SIZE),
    displayedPage * PAGE_SIZE,
  );
  const drawerRole = drawer.roleId ? roles.find((role) => role.id === drawer.roleId) ?? null : null;

  const applyFilters = () => {
    setAppliedFilters({ roleName: draftFilters.roleName.trim(), roleCode: draftFilters.roleCode.trim() });
    setCurrentPage(1);
  };
  const resetFilters = () => {
    setDraftFilters(DEFAULT_ROLE_FILTER);
    setAppliedFilters(DEFAULT_ROLE_FILTER);
    setCurrentPage(1);
  };
  const goToPage = (page: number) => {
    if (totalPages > 0) setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };
  const submitJump = () => {
    const page = Number.parseInt(jumpPage, 10);
    if (Number.isInteger(page)) goToPage(page);
    setJumpPage('');
  };

  const openCreate = () => {
    onCreate();
    setDrawer({ open: true, mode: 'create' });
  };

  const openEdit = (record: RoleRecord) => {
    onEdit(record);
    setDrawer({ open: true, mode: 'edit', roleId: record.id });
  };

  const requestDelete = (record: RoleRecord) => {
    onDelete(record);
    if (usedRoleIds.includes(record.id)) {
      messageApi.error('该角色已被员工使用，无法删除');
      return;
    }
    modal.confirm({
      title: '删除角色',
      content: `确认删除角色“${record.roleName}”吗？删除后不可恢复。`,
      okText: '确认删除',
      cancelText: '取消',
      onOk: () => {
        setRoles((currentRoles) => {
          const nextRoles = currentRoles.filter((role) => role.id !== record.id);
          const nextFilteredCount = filterRoles(nextRoles, appliedFilters).length;
          setCurrentPage((currentPageValue) => Math.min(
            currentPageValue,
            Math.max(1, Math.ceil(nextFilteredCount / PAGE_SIZE)),
          ));
          return nextRoles;
        });
      },
    });
  };

  const handleDrawerSubmit = (draft: RoleDraft) => {
    const updatedAt = formatRoleDate(new Date());
    if (drawer.mode === 'create') {
      const newRole: RoleRecord = {
        id: nextRoleId(roles),
        roleName: draft.roleName,
        roleCode: draft.roleCode,
        permissionIds: [...draft.permissionIds],
        updatedAt,
        operatorName: '管理员',
      };
      setRoles((currentRoles) => [newRole, ...currentRoles]);
      setCurrentPage(1);
    } else if (drawerRole) {
      setRoles((currentRoles) => currentRoles.map((role) => (
        role.id === drawerRole.id
          ? {
              ...role,
              roleName: draft.roleName,
              permissionIds: [...draft.permissionIds],
              updatedAt,
              operatorName: '管理员',
            }
          : role
      )));
    }
    setDrawer((current) => ({ ...current, open: false }));
  };

  const columns = buildRoleColumns({ onEdit: openEdit, onDelete: requestDelete });

  return (
    <section className="role-list-page" data-req-id="role-list-page">
      <div className="role-list-main" data-req-id="role-list-main">
        <div className="role-list-filter-bar" data-req-id="role-list-filter-bar">
          <label className="role-list-filter-field">
            <span>职位名称</span>
            <Input placeholder="请输入职位名称" value={draftFilters.roleName} onChange={(event) => setDraftFilters({ ...draftFilters, roleName: event.target.value })} data-req-id="role-list-filter-name" />
          </label>
          <label className="role-list-filter-field">
            <span>职务编码</span>
            <Input placeholder="请输入职务编码" value={draftFilters.roleCode} onChange={(event) => setDraftFilters({ ...draftFilters, roleCode: event.target.value })} data-req-id="role-list-filter-code" />
          </label>
          <div className="role-list-filter-actions">
            <Button type="primary" onClick={applyFilters} data-req-id="role-list-filter-search">搜索</Button>
            <Button onClick={resetFilters} data-req-id="role-list-filter-reset">重置</Button>
          </div>
        </div>
        <div className="role-list-toolbar">
          <Button type="primary" onClick={openCreate} data-req-id="role-list-create">新增角色</Button>
        </div>
        <div className="role-list-table" data-req-id="role-list-table">
          <Table<RoleRecord>
            columns={columns}
            dataSource={pagedRoles}
            rowKey={(record) => record.id}
            pagination={false}
            locale={{ emptyText: <div className="role-list-empty">暂无数据</div> }}
          />
        </div>
        <div className="role-list-pagination" data-req-id="role-list-pagination">
          <span className="role-list-total">共 {filteredRoles.length} 条记录</span>
          <div className="role-list-pagination-controls">
            <span>10条/页</span>
            <Button disabled={totalPages === 0 || displayedPage <= 1} onClick={() => goToPage(displayedPage - 1)}>上一页</Button>
            <span className="role-list-page-buttons" aria-label="页码">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  className={`role-list-page-button ${page === displayedPage ? 'active' : ''}`}
                  aria-current={page === displayedPage ? 'page' : undefined}
                  onClick={() => goToPage(page)}
                >
                  {page}
                </button>
              ))}
            </span>
            <Button disabled={totalPages === 0 || displayedPage >= totalPages} onClick={() => goToPage(displayedPage + 1)}>下一页</Button>
            <span>前往</span>
            <Input aria-label="前往页码" value={jumpPage} onChange={(event) => setJumpPage(event.target.value.replace(/\D/g, ''))} onPressEnter={submitJump} className="role-list-jump-input" />
            <span>页</span>
          </div>
        </div>
      </div>
      {modalContextHolder}
      {messageContextHolder}
      <RoleDrawer
        key={`${drawer.mode}-${drawer.roleId ?? 'new'}-${drawer.open ? 'open' : 'closed'}`}
        mode={drawer.mode}
        open={drawer.open}
        role={drawerRole}
        {...(drawer.initialDraft ? { initialDraft: drawer.initialDraft } : {})}
        onCancel={() => setDrawer((current) => ({ ...current, open: false }))}
        onSubmit={handleDrawerSubmit}
      />
    </section>
  );
}

export default RoleListPage;
