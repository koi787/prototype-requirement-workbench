/**
 * 0014 Cycle A/B - 员工 / 组织架构主页面。
 *
 * 产品内容区内部双栏业务页面（0014 §4）：
 *   左栏 OrganizationTree（组织架构树）
 *   右栏 员工列表区（筛选区 + 新增员工入口 + 10 列表格 + 分页）
 *
 * 不创建第二套 AdminShell / Sidebar / TopBar（产品壳由 ScrmWorkspace 唯一提供）。
 * 页面由产品壳 pageRegistry 出口直接渲染，绝对不经过 ProspectManagementRoot /
 * 潜客业务根（0014 §3）。
 *
 * 单一真值：本组件管理一份员工 Runtime 集合，表格 / 筛选 / 启用 Switch / 新增 /
 * 编辑读写同一集合（0014 §14）；不使用 LocalStorage，刷新恢复初始 Mock。
 * EmployeeDrawer 只持有临时 draft：打开生成、取消丢弃、保存写回本集合。
 */
import { useMemo, useState } from 'react';
import { Button, Input, Modal, Select, message } from 'antd';
import { AdminPagination } from '../../../shared/admin';
import { OrganizationTree } from './OrganizationTree';
import { EmployeeTable } from './EmployeeTable';
import { EmployeeDrawer } from './EmployeeDrawer';
import { buildEmployeeColumns } from './employeeColumns';
import type { EmployeeDraft, EmployeeFilter, EmployeeRecord } from './organizationTypes';
import {
  DEFAULT_FILTER,
  EMPLOYEE_MOCK,
  EMPLOYMENT_STATUS_OPTIONS,
  POSITION_OPTIONS,
  ROLE_OPTIONS,
  ROOT_ORG_ID,
  filterEmployees,
  formatDateTime,
  nextEmployeeId,
} from './organizationMockData';
import './organization.css';

/** 每页条数（0014 §8：分页按真实截图实现，业务侧保持受控切片）。 */
const DEFAULT_PAGE_SIZE = 10;

/** 当前操作人（Cycle B 保存 create/edit 的稳定 Mock）。 */
const CURRENT_OPERATOR = '王经理';

/** EmployeeDrawer 页面级打开状态（create/edit 复用同一 Drawer）。 */
interface DrawerState {
  open: boolean;
  mode: 'create' | 'edit';
  employee: EmployeeRecord | null;
  createDraft?: Partial<EmployeeDraft>;
}

export interface OrganizationPageProps {
  /** Story/测试专用：初始选中组织节点 id（默认根节点"奥本集团"）。 */
  initialSelectedOrgId?: string;
  /** Story/测试专用：初始应用后筛选条件（稳定展示筛选 / 空数据状态）。 */
  initialAppliedFilter?: EmployeeFilter;
  /** Story/测试专用：初始展开的组织节点 id 集合（默认仅根节点）。 */
  initialExpandedOrgIds?: string[];
  /**
   * Story/测试专用：初始打开 EmployeeDrawer（展示 新增/编辑 真实 Drawer 状态；
   * create 可预填草稿展示"已填写"）。
   */
  initialDrawer?: {
    mode: 'create' | 'edit';
    employee?: EmployeeRecord | null;
    createDraft?: Partial<EmployeeDraft>;
  };
}

export function OrganizationPage({
  initialSelectedOrgId,
  initialAppliedFilter,
  initialExpandedOrgIds,
  initialDrawer,
}: OrganizationPageProps) {
  const [selectedOrgId, setSelectedOrgId] = useState(initialSelectedOrgId ?? ROOT_ORG_ID);
  const [expandedKeys, setExpandedKeys] = useState<string[]>(
    initialExpandedOrgIds ?? [ROOT_ORG_ID],
  );
  // 待提交筛选（输入态）与已应用筛选分离：搜索应用当前待筛选条件，重置恢复默认
  const [draft, setDraft] = useState<EmployeeFilter>(initialAppliedFilter ?? DEFAULT_FILTER);
  const [applied, setApplied] = useState<EmployeeFilter>(initialAppliedFilter ?? DEFAULT_FILTER);
  const [employees, setEmployees] = useState<EmployeeRecord[]>(EMPLOYEE_MOCK);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [drawer, setDrawer] = useState<DrawerState>({
    open: !!initialDrawer,
    mode: initialDrawer?.mode ?? 'create',
    employee: initialDrawer?.employee ?? null,
    ...(initialDrawer?.createDraft ? { createDraft: initialDrawer.createDraft } : {}),
  });

  // 注销登录二次确认 / 消息测试与岗位互斥的轻量反馈（组件树内 contextHolder）
  const [modal, modalContextHolder] = Modal.useModal();
  const [messageApi, messageContextHolder] = message.useMessage();

  const filtered = useMemo(
    () => filterEmployees(employees, applied, selectedOrgId),
    [employees, applied, selectedOrgId],
  );

  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  // ---------- 筛选 ----------
  const applyDraft = () => {
    setApplied({ ...draft });
    setCurrentPage(1);
  };

  const resetFilters = () => {
    // 重置恢复搜索为空、岗位/角色为空、在职状态为"在职"
    const defaults: EmployeeFilter = { ...DEFAULT_FILTER };
    setDraft(defaults);
    setApplied(defaults);
    setCurrentPage(1);
  };

  // ---------- 组织树 ----------
  const handleSelectOrg = (orgId: string) => {
    setSelectedOrgId(orgId);
    setCurrentPage(1);
  };

  // ---------- 启用状态 Switch（读写同一 Runtime 员工记录） ----------
  const handleToggleEnabled = (id: string, checked: boolean) => {
    setEmployees((prev) =>
      prev.map((record) => (record.id === id ? { ...record, enabled: checked } : record)),
    );
  };

  // ---------- 操作菜单（Cycle B：编辑打开 Drawer；注销/消息测试前端反馈） ----------
  const handleAction = (record: EmployeeRecord, actionKey: string) => {
    if (actionKey === 'edit') {
      setDrawer({ open: true, mode: 'edit', employee: record });
      return;
    }
    if (actionKey === 'logout') {
      // 0014 §14：注销登录二次确认；确认仅前端成功反馈，不修改员工数据/登录状态
      modal.confirm({
        title: '注销登录',
        content: '确定要注销该员工当前登录状态吗？',
        okText: '确定',
        cancelText: '取消',
        onOk: () => {
          messageApi.success('已注销该员工登录状态');
        },
      });
      return;
    }
    if (actionKey === 'message') {
      // 0014 §15：消息测试仅前端成功反馈，不接企微/短信/Push/API
      messageApi.success('消息测试发送成功');
    }
  };

  // ---------- 新增员工入口（Cycle B：打开 EmployeeDrawer create 模式） ----------
  const handleAddEmployee = () => {
    setDrawer({ open: true, mode: 'create', employee: null });
  };

  // ---------- Drawer 保存：写回同一份员工 Runtime（0014 §14） ----------
  const handleDrawerSubmit = (employeeDraft: EmployeeDraft) => {
    if (drawer.mode === 'create') {
      // 新增：生成稳定前端 id，绑定当前选中组织节点，updatedAt 当前时间、操作人稳定 Mock
      const newRecord: EmployeeRecord = {
        id: nextEmployeeId(employees),
        name: employeeDraft.name,
        enabled: true,
        employeeNo: employeeDraft.employeeNo,
        mobile: employeeDraft.mobile,
        organizationId: selectedOrgId,
        performanceStoreId: employeeDraft.performanceStoreId,
        positionIds: employeeDraft.positionIds,
        roleIds: employeeDraft.roleIds,
        employmentStatus: 'active',
        updatedAt: formatDateTime(new Date()),
        operatorName: CURRENT_OPERATOR,
        salaryTypeId: employeeDraft.salaryTypeId,
        fullMobileVisible: employeeDraft.fullMobileVisible,
        franchiseReconciliation: employeeDraft.franchiseReconciliation,
        jointStoreReconciliation: employeeDraft.jointStoreReconciliation,
        loginStoreIds: employeeDraft.loginStoreIds,
        ...(employeeDraft.facePhoto !== undefined ? { facePhoto: employeeDraft.facePhoto } : {}),
      };
      setEmployees((prev) => [newRecord, ...prev]);
    } else {
      setEmployees((prev) =>
        prev.map((record) => {
          if (record.id !== drawer.employee?.id) return record;
          return {
            ...record,
            name: employeeDraft.name,
            mobile: employeeDraft.mobile,
            performanceStoreId: employeeDraft.performanceStoreId,
            positionIds: employeeDraft.positionIds,
            roleIds: employeeDraft.roleIds,
            salaryTypeId: employeeDraft.salaryTypeId,
            fullMobileVisible: employeeDraft.fullMobileVisible,
            franchiseReconciliation: employeeDraft.franchiseReconciliation,
            jointStoreReconciliation: employeeDraft.jointStoreReconciliation,
            loginStoreIds: employeeDraft.loginStoreIds,
            updatedAt: formatDateTime(new Date()),
            operatorName: CURRENT_OPERATOR,
            ...(employeeDraft.facePhoto !== undefined ? { facePhoto: employeeDraft.facePhoto } : {}),
          };
        }),
      );
    }
    setDrawer((current) => ({ ...current, open: false }));
  };

  const columns = useMemo(
    () =>
      buildEmployeeColumns({
        onToggleEnabled: handleToggleEnabled,
        onAction: handleAction,
      }),
    // handleToggleEnabled / handleAction 只引用 setEmployees 等稳定引用，可安全复用
    [],
  );

  return (
    <div className="organization-page" data-req-id="organization-page">
      <OrganizationTree
        selectedOrgId={selectedOrgId}
        expandedKeys={expandedKeys}
        onSelectOrg={handleSelectOrg}
        onExpand={setExpandedKeys}
      />

      <div className="organization-main" data-req-id="employee-list-area">
        {/* 筛选区（0014 §6：搜索 / 岗位 / 角色筛选 / 在职状态 + 搜索 / 重置）。
            纯视觉布局：按真实后台分两行——第一行 搜索/岗位/角色筛选，第二行 在职状态/搜索/重置；
            字段与筛选逻辑完全不变。 */}
        <div className="organization-filter-bar" data-req-id="employee-filter-area">
          <div className="organization-filter-row">
            <div className="organization-filter-item">
              <label>搜索</label>
              <Input
                className="organization-search-input"
                placeholder="姓名 / 手机号 / 员工编号"
                allowClear
                value={draft.keyword}
                onChange={(event) => setDraft({ ...draft, keyword: event.target.value })}
                onPressEnter={applyDraft}
                data-req-id="employee-filter-search"
              />
            </div>
            <div className="organization-filter-item">
              <label>岗位</label>
              <Select
                className="organization-select"
                placeholder="请选择"
                allowClear
                options={POSITION_OPTIONS}
                value={draft.positionId ?? undefined}
                onChange={(value) => setDraft({ ...draft, positionId: value ?? null })}
                data-req-id="employee-filter-position"
              />
            </div>
            <div className="organization-filter-item">
              <label>角色筛选</label>
              <Select
                className="organization-select"
                placeholder="请选择"
                allowClear
                options={ROLE_OPTIONS}
                value={draft.roleId ?? undefined}
                onChange={(value) => setDraft({ ...draft, roleId: value ?? null })}
                data-req-id="employee-filter-role"
              />
            </div>
          </div>
          <div className="organization-filter-row">
            <div className="organization-filter-item">
              <label>在职状态</label>
              <Select
                className="organization-select"
                options={EMPLOYMENT_STATUS_OPTIONS}
                value={draft.employmentStatus}
                onChange={(value) => setDraft({ ...draft, employmentStatus: value })}
                data-req-id="employee-filter-status"
              />
            </div>
            <div className="organization-filter-actions">
              <Button type="primary" onClick={applyDraft} data-req-id="employee-filter-search-btn">
                搜索
              </Button>
              <Button onClick={resetFilters} data-req-id="employee-filter-reset-btn">
                重置
              </Button>
            </div>
          </div>
        </div>

        {/* 新增员工入口（0014 §8：员工列表主区域右上方蓝色主按钮） */}
        <div className="organization-toolbar">
          <Button
            type="primary"
            className="organization-add-button"
            onClick={handleAddEmployee}
            data-req-id="employee-add-button"
          >
            新增员工
          </Button>
        </div>

        {/* 员工 10 列表格 */}
        <div className="organization-table-wrapper">
          <EmployeeTable dataSource={paged} columns={columns} />
        </div>

        {/* 分页（业务侧保持受控切片，公共组件不接管员工数据） */}
        <AdminPagination
          totalCount={filtered.length}
          pageSize={pageSize}
          currentPage={currentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          onPageChange={setCurrentPage}
          dataReqId="employee-pagination"
        />
      </div>

      {/* EmployeeDrawer（create/edit 复用；Drawer 只持有临时 draft） */}
      <EmployeeDrawer
        mode={drawer.mode}
        open={drawer.open}
        employee={drawer.mode === 'edit' ? drawer.employee : null}
        initialCreateDraft={drawer.createDraft ?? null}
        onCancel={() => setDrawer((current) => ({ ...current, open: false }))}
        onSubmit={handleDrawerSubmit}
      />

      {/* 注销确认 / 消息反馈的组件树 contextHolder */}
      {modalContextHolder}
      {messageContextHolder}
    </div>
  );
}

export default OrganizationPage;
