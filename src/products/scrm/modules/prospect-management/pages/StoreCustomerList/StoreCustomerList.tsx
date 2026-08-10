import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  Input,
  Select,
  DatePicker,
  Button,
  Dropdown,
  Space,
  InputNumber,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { CustomerRecord } from './mockData';
import { ALL_COLUMNS, COLUMN_REQUIREMENT_ANCHORS } from './columns';
import { REQUIREMENT_POINTS, getPointByNumber } from './requirementPoints';
import { getRequirement } from '../../../../../../requirements/products/scrm/pages/store-customer';
import {
  RequirementViewProvider,
  useRequirementView,
  RequirementModeControl,
  RequirementMarker,
  RequirementDrawer,
} from '../../../../../../prototype-core/requirement-view';
import { useApprovalState } from './useApprovalState';
import { InvalidApplicationDrawer } from './InvalidApplicationDrawer';
import { InvalidReviewDrawer } from './InvalidReviewDrawer';
import { InvalidApprovalDetailDrawer } from './InvalidApprovalDetailDrawer';
import type { AttachmentMeta, DrawerMode } from './approvalTypes';
import { InvalidApprovalStatusTag } from './StatusTags';
import type { InvalidApprovalStatus } from './approvalTypes';
import {
  NavHomeIcon,
  NavCalendarIcon,
  NavShopIcon,
  NavDollarIcon,
  NavTeamIcon,
  NavFileIcon,
  NavStoreIcon,
  NavContactsIcon,
  NavServiceIcon,
  UserIcon,
  MenuIcon,
  QrcodeIcon,
  LogoutIcon,
  CaretDownIcon,
  FoldIcon,
} from './IconComponents';
import {
  AdminShell,
  FilterBar,
  FilterField,
  FilterActions,
  AdminDataTable,
  AdminPagination,
} from '../../../../shared/admin';
import './StoreCustomerList.css';

const { RangePicker } = DatePicker;

/**
 * 列级需求锚点的正式注册区域。
 *
 * 锚点与列 key 显式关联，只注册一次且不参与视觉布局，避免依赖 Ant Design
 * 表头的重复渲染、私有 DOM 结构或 effect 执行时序。
 */
const ColumnRequirementAnchorRegistry = () => (
  <div
    className="store-customer-column-anchor-registry"
    data-req-anchor-registry="store-customer-columns"
    aria-hidden="true"
  >
    {COLUMN_REQUIREMENT_ANCHORS.map((anchor) => (
      <span
        key={anchor.id}
        data-req-id={anchor.id}
        data-column-key={anchor.columnKey}
        data-anchor-description={anchor.description}
      />
    ))}
  </div>
);

// ============================================================================
// 左侧导航菜单配置
// ============================================================================
interface NavItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { key: 'home', label: '首页', icon: <NavHomeIcon /> },
  { key: 'appointment', label: '预约', icon: <NavCalendarIcon /> },
  { key: 'product', label: '品项', icon: <NavShopIcon /> },
  { key: 'cashier', label: '收银', icon: <NavDollarIcon /> },
  { key: 'staff', label: '门店人员', icon: <NavTeamIcon /> },
  { key: 'order', label: '订单', icon: <NavFileIcon /> },
  { key: 'record', label: '记录', icon: <NavFileIcon /> },
  { key: 'store', label: '门店', icon: <NavStoreIcon /> },
  { key: 'customer', label: '客户', icon: <NavContactsIcon /> },
  {
    key: 'prospect',
    label: '潜客管理',
    icon: <NavServiceIcon />,
    children: [
      { key: 'store-customer', label: '门店客户' },
      { key: 'employee-seat', label: '员工座席' },
      { key: 'customer-sea', label: '客户公海' },
      { key: 'invalid-sea', label: '无效公海' },
      { key: 'my-responsible', label: '我负责的' },
      { key: 'visit-record', label: '到店记录' },
      { key: 'call-record', label: '通话记录' },
      { key: 'tag-group', label: '标签分组' },
      { key: 'visit-record-2', label: '拜访记录' },
    ],
  },
];

// ============================================================================
// 顶部标签
// ============================================================================
const topTabs = [
  { key: 'home', label: '首页', active: false },
  { key: 'customer-list', label: '客户列表', active: false },
  { key: 'store-list', label: '门店列表', active: false },
  { key: 'store-customer', label: '门店客户', active: true },
  { key: 'recruit', label: '人才招募', active: false },
  { key: 'cashier-tab', label: '收银', active: false },
  { key: 'product-category', label: '商品类目', active: false },
  { key: 'store-room', label: '门店房间', active: false },
  { key: 'employee-seat', label: '员工座席', active: false },
  { key: 'contract-center', label: '合同中心', active: false },
  { key: 'order-center', label: '订单中心', active: false },
];

// ============================================================================
// 筛选选项
// ============================================================================
const sourceOptions = [
  { value: '', label: '全部' },
  { value: '地推活动', label: '地推活动' },
  { value: '线上广告', label: '线上广告' },
  { value: '朋友推荐', label: '朋友推荐' },
  { value: '商圈引流', label: '商圈引流' },
  { value: '会员推荐', label: '会员推荐' },
];

const storeOptions = [
  { value: '示例旗舰店', label: '示例旗舰店' },
  { value: '示例南山店', label: '示例南山店' },
  { value: '示例福田店', label: '示例福田店' },
  { value: '示例宝安店', label: '示例宝安店' },
  { value: '示例罗湖店', label: '示例罗湖店' },
];

const yesNoOptions = [
  { value: '', label: '全部' },
  { value: '是', label: '是' },
  { value: '否', label: '否' },
];

const assignedOptions = [
  { value: '', label: '全部' },
  { value: '已分配', label: '已分配' },
  { value: '未分配', label: '未分配' },
];

const customerTypeOptions = [
  { value: '', label: '全部' },
  { value: '新客', label: '新客' },
  { value: '老客', label: '老客' },
];

const invalidApprovalStatusOptions = [
  { value: '', label: '全部' },
  { value: 'pending', label: '待审核' },
  { value: 'approved', label: '审核通过' },
  { value: 'rejected', label: '审核退回' },
];

const questionnaireOptions = [
  { value: '', label: '全部' },
  { value: '已填写', label: '已填写' },
  { value: '已提交', label: '已提交' },
  { value: '未填写', label: '未填写' },
];

const trialClassOptions = [
  { value: '', label: '全部' },
  { value: '已下课', label: '已下课' },
  { value: '待上课', label: '待上课' },
];

const tagOptions = [
  { value: '', label: '全部' },
  { value: '意向客户', label: '意向客户' },
  { value: '高意向', label: '高意向' },
  { value: 'VIP', label: 'VIP' },
];

const countFilterOptions = [
  { value: '', label: '全部' },
  { value: '到店次数', label: '到店次数' },
  { value: '拜访次数', label: '拜访次数' },
];

// ============================================================================
// 筛选条件类型
// ============================================================================
interface FilterValues {
  userId: string;
  namePhone: string;
  employeeName: string;
  latestFollower: string;
  source: string;
  retainStore: string[];
  isAssigned: string;
  invalidApprovalStatus: string;
  customerType: string;
  contractNo: string;
  createTimeRange: [string, string] | null;
  questionnaireStatus: string;
  isAppointed: string;
  trialClassType: string;
  trialClassConsultant: string;
  userTag: string;
  appointmentStore: string[];
  appointmentDateRange: [string, string] | null;
  countField: string;
  countMin: number | null;
  countMax: number | null;
}

const defaultFilters: FilterValues = {
  userId: '',
  namePhone: '',
  employeeName: '',
  latestFollower: '',
  source: '',
  retainStore: [],
  isAssigned: '',
  invalidApprovalStatus: '',
  customerType: '',
  contractNo: '',
  createTimeRange: null,
  questionnaireStatus: '',
  isAppointed: '',
  trialClassType: '',
  trialClassConsultant: '',
  userTag: '',
  appointmentStore: [],
  appointmentDateRange: null,
  countField: '',
  countMin: null,
  countMax: null,
};

// ============================================================================
// 动态操作菜单构建（仅根据状态，不使用身份）
// ============================================================================
function buildOperationMenuItems(params: {
  status: InvalidApprovalStatus;
  reqMode: 'prototype' | 'requirement';
  recordKey: string;
  onMarkInvalid: () => void;
  onReview: () => void;
}): Array<{ key: string; label: React.ReactNode }> {
  const { status, reqMode, recordKey, onMarkInvalid, onReview } = params;

  const items: Array<{ key: string; label: React.ReactNode }> = [];

  // 通用菜单项（始终显示）
  items.push({ key: 'follow-detail', label: '跟进详情' });
  items.push({ key: 'remark', label: '备注' });
  items.push({ key: 'transfer', label: '转让' });
  items.push({ key: 'set-tag', label: '设置标签' });
  items.push({ key: 'add-sharer', label: '添加共享人' });
  items.push({ key: 'add-visit-record', label: '添加拜访记录' });

  // 审批相关菜单项（仅根据状态）
  if (status === null || status === 'rejected') {
    // 标记无效客资
    const label = <span style={{ color: '#ff4d4f' }}>标记无效客资</span>;
    if (reqMode === 'requirement') {
      const point = getPointByNumber(9);
      if (point) {
        items.push({
          key: 'mark-invalid',
          label: (
            <RequirementMarker
              requirementKey={point.requirementKey}
              displayNumber={point.displayNumber}
              targetId={`${point.targetDataReqId}-${recordKey}`}
              positionLabel="行操作"
              preventDefaultAction={true}
              onOriginalClick={onMarkInvalid}
              exposeDataReqId={true}
            >
              {label}
            </RequirementMarker>
          ),
        });
        return items;
      }
    }
    items.push({ key: 'mark-invalid', label });
  } else if (status === 'pending') {
    // 审核无效标注
    const reviewLabel = '审核无效标注';
    if (reqMode === 'requirement') {
      const reviewPoint = getPointByNumber(10);
      if (reviewPoint) {
        items.push({
          key: 'review-invalid',
          label: (
            <RequirementMarker
              requirementKey={reviewPoint.requirementKey}
              displayNumber={reviewPoint.displayNumber}
              targetId={`${reviewPoint.targetDataReqId}-${recordKey}`}
              positionLabel="行操作"
              preventDefaultAction={true}
              onOriginalClick={onReview}
              exposeDataReqId={true}
            >
              {reviewLabel}
            </RequirementMarker>
          ),
        });
        return items;
      }
    }
    items.push({ key: 'review-invalid', label: reviewLabel });
  }
  // approved: 不显示任何无效审批相关操作

  return items;
}

// ============================================================================
// 筛选函数
// ============================================================================
function applyFilter(record: CustomerRecord, filters: FilterValues): boolean {
  if (filters.userId && !record.userId.toLowerCase().includes(filters.userId.toLowerCase()))
    return false;
  if (
    filters.namePhone &&
    !record.name.includes(filters.namePhone) &&
    !record.phone.includes(filters.namePhone)
  )
    return false;
  if (
    filters.employeeName &&
    !record.inviteEmployeeName.includes(filters.employeeName) &&
    !record.inviteEmployeeId.includes(filters.employeeName)
  )
    return false;
  if (filters.latestFollower && !record.latestFollower.includes(filters.latestFollower))
    return false;
  if (filters.source && record.source !== filters.source) return false;
  if (filters.retainStore.length > 0 && !filters.retainStore.includes(record.retainStore))
    return false;
  if (filters.isAssigned && record.isAssigned !== filters.isAssigned) return false;
  if (filters.invalidApprovalStatus && record.invalidApprovalStatus !== filters.invalidApprovalStatus)
    return false;
  if (filters.customerType && record.customerType !== filters.customerType) return false;
  if (filters.contractNo && !record.contractNo.includes(filters.contractNo)) return false;
  return true;
}

// ============================================================================
// 主组件
// ============================================================================

export interface StoreCustomerListProps {
  data?: CustomerRecord[];
  initialState?: 'normal' | 'loading' | 'empty' | 'error' | 'noResults';
  /** 预设筛选条件（用于 Story 稳定展示筛选无结果） */
  initialFilters?: Partial<FilterValues>;
  /** 预设导出成功消息（用于 Story 稳定展示导出反馈） */
  initialExportMessage?: string;
  /** 初始需求查看模式（默认 prototype） */
  initialRequirementMode?: 'prototype' | 'requirement';
}

function StoreCustomerListInner({
  data: propData,
  initialState = 'normal',
  initialFilters,
  initialExportMessage,
}: Omit<StoreCustomerListProps, 'initialRequirementMode'>) {
  const reqView = useRequirementView();
  // ---------- 审批状态管理 ----------
  const approval = useApprovalState(propData);

  // ---------- 全局状态 ----------
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [pendingFilters, setPendingFilters] = useState<FilterValues>(() => ({
    ...defaultFilters,
    ...initialFilters,
  }));
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>(() => ({
    ...defaultFilters,
    ...initialFilters,
  }));
  const [pageState, setPageState] = useState<
    'normal' | 'loading' | 'empty' | 'error' | 'noResults'
  >(initialState as 'normal' | 'loading' | 'empty' | 'error' | 'noResults');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [exportMsg, setExportMsg] = useState<string | null>(
    initialExportMessage ?? null,
  );
  const [openMenuKey, setOpenMenuKey] = useState<string | null>(null);

  // ---------- 抽屉状态 ----------
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [drawerRecordKey, setDrawerRecordKey] = useState<string | null>(null);

  // ---------- 数据 ----------
  const allData = useMemo(() => approval.customers, [approval.customers]);

  // ---------- 筛选逻辑（基于 appliedFilters，非 pendingFilters）----------
  const filteredData = useMemo(() => {
    if (pageState !== 'normal' && pageState !== 'noResults') return [];
    return allData.filter((record) => applyFilter(record, appliedFilters));
  }, [allData, appliedFilters, pageState]);

  // ---------- 分页数据 ----------
  const totalCount = useMemo(() => {
    if (pageState === 'empty' || pageState === 'noResults') return 0;
    return filteredData.length;
  }, [filteredData, pageState]);

  const pagedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // ---------- 搜索（F-01：点击搜索按钮才执行过滤）----------
  const handleSearch = useCallback(() => {
    if (initialState === 'empty') return;
    setAppliedFilters({ ...pendingFilters });
    setCurrentPage(1);
    // 基于新条件计算结果决定状态
    const result = allData.filter((record) => applyFilter(record, pendingFilters));
    if (result.length === 0) {
      setPageState('noResults');
    } else {
      setPageState('normal');
    }
  }, [pendingFilters, allData, initialState]);

  // ---------- 重置 ----------
  const handleReset = useCallback(() => {
    setPendingFilters({ ...defaultFilters });
    setAppliedFilters({ ...defaultFilters });
    setCurrentPage(1);
    if (initialState === 'empty') {
      setPageState('empty');
    } else {
      setPageState('normal');
    }
  }, [initialState]);

  // ---------- 导出（F-04：只使用一种反馈方式，定时器可控）----------
  const exportTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleExport = useCallback(() => {
    // 清除旧定时器，避免提前清除新反馈
    if (exportTimerRef.current !== null) {
      clearTimeout(exportTimerRef.current);
    }
    setExportMsg('导出任务已创建');
    exportTimerRef.current = setTimeout(() => {
      setExportMsg(null);
      exportTimerRef.current = null;
    }, 3000);
  }, []);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (exportTimerRef.current !== null) {
        clearTimeout(exportTimerRef.current);
      }
    };
  }, []);

  // ---------- 操作菜单（F-05：受控 open，使用 ref 防止旧关闭回调清除新菜单）----------
  const openMenuKeyRef = useRef<string | null>(null);
  const openMenuModeRef = useRef<'prototype' | 'requirement' | null>(null);

  const closeMenu = useCallback(() => {
    setOpenMenuKey(null);
    openMenuKeyRef.current = null;
    openMenuModeRef.current = null;
  }, []);

  const handleMenuClick = useCallback(
    (key: string, recordKey: string) => {
      closeMenu();
      if (key === 'mark-invalid') {
        setDrawerRecordKey(recordKey);
        setDrawerMode('application');
        return;
      }
      if (key === 'review-invalid') {
        setDrawerRecordKey(recordKey);
        setDrawerMode('review');
        return;
      }
      // 其他菜单项：仅关闭菜单
    },
    [closeMenu],
  );

  // ---------- 状态标签点击 → 打开详情抽屉 ----------
  const handleStatusClick = useCallback(
    (recordKey: string) => {
      if (reqView.mode === 'requirement') {
        // 需求模式：打开需求说明
        const detailPoint = getPointByNumber(11);
        if (detailPoint) {
          reqView.selectRequirement(
            detailPoint.requirementKey,
            `${detailPoint.targetDataReqId}-${recordKey}`,
          );
        }
        return;
      }
      setDrawerRecordKey(recordKey);
      setDrawerMode('detail');
    },
    [reqView],
  );

  // ---------- 抽屉关闭 ----------
  const handleDrawerClose = useCallback(() => {
    setDrawerMode(null);
    setDrawerRecordKey(null);
  }, []);

  // ---------- 提交申请 ----------
  const handleApplicationSubmit = useCallback(
    (remark: string, attachments: AttachmentMeta[]) => {
      if (drawerRecordKey) {
        approval.submitApplication(drawerRecordKey, remark, attachments);
      }
      handleDrawerClose();
    },
    [drawerRecordKey, approval, handleDrawerClose],
  );

  // ---------- 提交审核 ----------
  const handleReviewSubmit = useCallback(
    (
      opinion: 'approved' | 'rejected',
      remark: string,
      attachments: AttachmentMeta[],
    ) => {
      if (drawerRecordKey) {
        approval.submitReview(drawerRecordKey, opinion, remark, attachments);
      }
      handleDrawerClose();
    },
    [drawerRecordKey, approval, handleDrawerClose],
  );

  // ---------- 获取当前抽屉客户的上下文 ----------
  const drawerRecord = useMemo(() => {
    if (!drawerRecordKey) return null;
    return allData.find((c) => c.key === drawerRecordKey) ?? null;
  }, [drawerRecordKey, allData]);

  const drawerApplication = useMemo(() => {
    if (!drawerRecordKey) return null;
    return approval.getApplication(drawerRecordKey) ?? null;
  }, [drawerRecordKey, approval]);

  const drawerReview = useMemo(() => {
    if (!drawerRecordKey) return null;
    return approval.getReview(drawerRecordKey) ?? null;
  }, [drawerRecordKey, approval]);

  // ---------- 行操作按钮点击 ----------
  const handleOperationClick = useCallback(
    (recordKey: string) => {
      if (
        openMenuKey === recordKey &&
        openMenuModeRef.current === reqView.mode
      ) {
        openMenuKeyRef.current = null;
        openMenuModeRef.current = null;
        setOpenMenuKey(null);
      } else {
        openMenuKeyRef.current = recordKey;
        openMenuModeRef.current = reqView.mode;
        setOpenMenuKey(recordKey);
      }
    },
    [openMenuKey, reqView.mode],
  );

  // ---------- 筛选区输入变更 ----------
  const updatePending = useCallback(
    (patch: Partial<FilterValues>) => {
      setPendingFilters((f) => ({ ...f, ...patch }));
    },
    [],
  );

  // ========================================================================
  // 渲染
  // ========================================================================

  // ---------- 顶部系统栏（V-03：白色背景）----------
  const renderTopBar = () => (
    <div className="store-customer-topbar" data-req-id="top-system-bar">
      <div className="store-customer-topbar-left">
        <span className="store-customer-nav-toggle-icon">
          <MenuIcon size={16} style={{ color: '#333' }} />
        </span>
        <span className="store-customer-system-name">SCRM管理系统</span>
      </div>
      <div className="store-customer-topbar-right">
        <Space size="middle">
          <span className="store-customer-topbar-icon" aria-label="助手">
            <NavServiceIcon size={16} />
          </span>
          <span className="store-customer-topbar-icon" aria-label="二维码">
            <QrcodeIcon size={16} />
          </span>
          <span className="store-customer-store-selector" data-req-id="store-selector">
            <span className="store-customer-store-selector-label">示例旗舰店</span>
            <CaretDownIcon size={10} style={{ color: '#595959' }} />
          </span>
          <span className="store-customer-topbar-icon" aria-label="退出">
            <LogoutIcon size={16} />
          </span>
          <span className="store-customer-topbar-icon" aria-label="用户">
            <UserIcon size={16} />
          </span>
          <span className="store-customer-topbar-text">管理员</span>
        </Space>
      </div>
    </div>
  );

  // ---------- 顶部标签 ----------
  const renderTabs = () => (
    <div className="store-customer-tabs" data-req-id="top-tabs">
      {topTabs.map((tab) => (
        <div
          key={tab.key}
          className={`store-customer-tab-item ${tab.active ? 'active' : ''}`}
        >
          {tab.label}
          {tab.active && <span className="store-customer-tab-close">×</span>}
        </div>
      ))}
    </div>
  );

  // ---------- 筛选区 ----------
  const renderFilter = () => (
    <FilterBar>
      {/* 默认10项 */}
      <div className="store-customer-filter-row">
        <FilterField label="用户ID">
          <Input
            placeholder="请输入用户ID"
            value={pendingFilters.userId}
            onChange={(e) => updatePending({ userId: e.target.value })}
            allowClear
          />
        </FilterField>
        <FilterField label="姓名/手机号">
          <Input
            placeholder="请输入姓名或手机号"
            aria-label="姓名或手机号"
            value={pendingFilters.namePhone}
            onChange={(e) => updatePending({ namePhone: e.target.value })}
            allowClear
            data-req-id="filter-name-phone"
          />
        </FilterField>
        <FilterField label="员工姓名/编号">
          <Input
            placeholder="请输入员工姓名或编号"
            value={pendingFilters.employeeName}
            onChange={(e) => updatePending({ employeeName: e.target.value })}
            allowClear
          />
        </FilterField>
        <FilterField label="最新跟进人">
          <Input
            placeholder="请输入跟进人"
            value={pendingFilters.latestFollower}
            onChange={(e) => updatePending({ latestFollower: e.target.value })}
            allowClear
          />
        </FilterField>
        <FilterField label="客资来源">
          <Select
            placeholder="请选择"
            value={pendingFilters.source || undefined}
            onChange={(v) => updatePending({ source: v || '' })}
            options={sourceOptions}
            allowClear
            style={{ width: '100%' }}
            data-req-id="filter-source"
          />
        </FilterField>
        <FilterField label="留资门店">
          <Select
            mode="multiple"
            placeholder="请选择"
            value={pendingFilters.retainStore}
            onChange={(v) => updatePending({ retainStore: v })}
            options={storeOptions}
            allowClear
            style={{ width: '100%' }}
          />
        </FilterField>
        <FilterField label="是否已分配">
          <Select
            placeholder="请选择"
            value={pendingFilters.isAssigned || undefined}
            onChange={(v) => updatePending({ isAssigned: v || '' })}
            options={assignedOptions}
            allowClear
            style={{ width: '100%' }}
          />
        </FilterField>
        <FilterField
          label={
            <RequirementMarker
              requirementKey="scrm-store-customer-invalid-approval-filter"
              displayNumber={8}
              targetId="invalid-approval-filter"
              positionLabel="筛选"
              className="requirement-marker--header"
              preventDefaultAction={true}
            >
              无效审批状态
            </RequirementMarker>
          }
        >
          <Select
            placeholder="请选择"
            value={pendingFilters.invalidApprovalStatus || undefined}
            onChange={(v) => updatePending({ invalidApprovalStatus: v || '' })}
            options={invalidApprovalStatusOptions}
            allowClear
            style={{ width: '100%' }}
          />
        </FilterField>
        <FilterField label="客资类型">
          <Select
            placeholder="请选择"
            value={pendingFilters.customerType || undefined}
            onChange={(v) => updatePending({ customerType: v || '' })}
            options={customerTypeOptions}
            allowClear
            style={{ width: '100%' }}
          />
        </FilterField>
        <FilterField label="合同号">
          <Input
            placeholder="请输入合同号"
            value={pendingFilters.contractNo}
            onChange={(e) => updatePending({ contractNo: e.target.value })}
            allowClear
          />
        </FilterField>
      </div>

      {/* 展开后增加的11项 */}
      {filtersExpanded && (
        <div className="store-customer-filter-row">
          <FilterField
            label="创建时间"
            className="store-customer-filter-item--date-range"
            dataReqId="filter-create-time-range"
          >
            <RangePicker
              separator="至"
              style={{ width: '100%' }}
              onChange={(_dates, dateStrings) =>
                updatePending({
                  createTimeRange:
                    dateStrings[0] && dateStrings[1]
                      ? [dateStrings[0], dateStrings[1]]
                      : null,
                })
              }
            />
          </FilterField>
          <FilterField label="地推问卷状态">
            <Select
              placeholder="请选择"
              value={pendingFilters.questionnaireStatus || undefined}
              onChange={(v) => updatePending({ questionnaireStatus: v || '' })}
              options={questionnaireOptions}
              allowClear
              style={{ width: '100%' }}
            />
          </FilterField>
          <FilterField label="是否已预约">
            <Select
              placeholder="请选择"
              value={pendingFilters.isAppointed || undefined}
              onChange={(v) => updatePending({ isAppointed: v || '' })}
              options={yesNoOptions}
              allowClear
              style={{ width: '100%' }}
            />
          </FilterField>
          <FilterField label="体验课类型">
            <Select
              placeholder="请选择"
              value={pendingFilters.trialClassType || undefined}
              onChange={(v) => updatePending({ trialClassType: v || '' })}
              options={trialClassOptions}
              allowClear
              style={{ width: '100%' }}
            />
          </FilterField>
          <FilterField label="体验课顾问">
            <Input
              placeholder="请输入顾问姓名"
              value={pendingFilters.trialClassConsultant}
              onChange={(e) => updatePending({ trialClassConsultant: e.target.value })}
              allowClear
            />
          </FilterField>
          <FilterField label="用户标签">
            <Select
              placeholder="请选择"
              value={pendingFilters.userTag || undefined}
              onChange={(v) => updatePending({ userTag: v || '' })}
              options={tagOptions}
              allowClear
              style={{ width: '100%' }}
            />
          </FilterField>
          <FilterField label="预约门店">
            <Select
              mode="multiple"
              placeholder="请选择"
              value={pendingFilters.appointmentStore}
              onChange={(v) => updatePending({ appointmentStore: v })}
              options={storeOptions}
              allowClear
              style={{ width: '100%' }}
            />
          </FilterField>
          <FilterField
            label="预约到店日期"
            className="store-customer-filter-item--date-range"
            dataReqId="filter-appointment-date-range"
          >
            <RangePicker
              separator="至"
              style={{ width: '100%' }}
              onChange={(_dates, dateStrings) =>
                updatePending({
                  appointmentDateRange:
                    dateStrings[0] && dateStrings[1]
                      ? [dateStrings[0], dateStrings[1]]
                      : null,
                })
              }
            />
          </FilterField>
          <div className="store-customer-filter-count-group">
            <FilterField label="次数筛选字段">
              <Select
                placeholder="请选择"
                value={pendingFilters.countField || undefined}
                onChange={(v) => updatePending({ countField: v || '' })}
                options={countFilterOptions}
                allowClear
                style={{ width: '100%' }}
              />
            </FilterField>
            <FilterField label="最小值">
              <InputNumber
                placeholder="最小值"
                value={pendingFilters.countMin}
                onChange={(v) => updatePending({ countMin: v })}
                style={{ width: '100%' }}
              />
            </FilterField>
            <FilterField label="最大值">
              <InputNumber
                placeholder="最大值"
                value={pendingFilters.countMax}
                onChange={(v) => updatePending({ countMax: v })}
                style={{ width: '100%' }}
              />
            </FilterField>
          </div>
        </div>
      )}

      {/* 操作按钮行 */}
      <FilterActions
        left={
          <>
            <Button
              type="link"
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              data-req-id="filter-expand-toggle"
            >
              {filtersExpanded ? '收起' : '展开'}
            </Button>
            <Button type="primary" onClick={handleSearch} data-req-id="search-button">
              搜索
            </Button>
            <Button onClick={handleReset} data-req-id="reset-button">
              重置
            </Button>
          </>
        }
        right={
          <Button type="primary" onClick={handleExport} data-req-id="export-button">
            导出记录
          </Button>
        }
      />
    </FilterBar>
  );

  // ---------- 表格 ----------
  const columns = useMemo(() => {
    return ALL_COLUMNS.map((col) => {
      // --- 预约到店时间列（point 3）：需求模式移除排序 ---
      if (col.key === 'appointmentTime') {
        const point = REQUIREMENT_POINTS.find((p) => p.displayNumber === 3);
        if (reqView.mode === 'requirement') {
          return {
            ...col,
            sorter: undefined as unknown as typeof col.sorter,
            title: point ? (
              <RequirementMarker
                requirementKey={point.requirementKey}
                displayNumber={point.displayNumber}
                targetId={point.targetDataReqId}
                positionLabel="表头"
                className="requirement-marker--header"
                exposeDataReqId={false}
              >
                {col.title as React.ReactNode}
              </RequirementMarker>
            ) : col.title,
          };
        }
        return {
          ...col,
          title: point ? (
            <RequirementMarker
              requirementKey={point.requirementKey}
              displayNumber={point.displayNumber}
              targetId={point.targetDataReqId}
              positionLabel="表头"
              className="requirement-marker--header"
              exposeDataReqId={false}
            >
              {col.title as React.ReactNode}
            </RequirementMarker>
          ) : col.title,
        };
      }

      // --- 新办成交金额列（point 6）---
      if (col.key === 'firstDealAmount') {
        const point = REQUIREMENT_POINTS.find((p) => p.displayNumber === 6);
        if (point) {
          return {
            ...col,
            title: (
              <RequirementMarker
                requirementKey={point.requirementKey}
                displayNumber={point.displayNumber}
                targetId={point.targetDataReqId}
                positionLabel="表头"
                className="requirement-marker--header"
                exposeDataReqId={false}
              >
                {col.title as React.ReactNode}
              </RequirementMarker>
            ),
          };
        }
        return col;
      }

      // --- 无效审批状态列（point 7 header + clickable status）---
      if (col.key === 'invalidApprovalStatus') {
        const headerPoint = REQUIREMENT_POINTS.find((p) => p.displayNumber === 7);
        return {
          ...col,
          title: headerPoint ? (
            <RequirementMarker
              requirementKey={headerPoint.requirementKey}
              displayNumber={headerPoint.displayNumber}
              targetId={headerPoint.targetDataReqId}
              positionLabel="表头"
              className="requirement-marker--header"
              exposeDataReqId={false}
            >
              {col.title as React.ReactNode}
            </RequirementMarker>
          ) : col.title,
          render: (_: unknown, record: CustomerRecord) => {
            const statusVal = record.invalidApprovalStatus;
            return (
              <InvalidApprovalStatusTag
                value={statusVal}
                {...(statusVal
                  ? {
                      onClick: () => handleStatusClick(record.key),
                      detailReqId: `invalid-approval-detail-${record.key}`,
                    }
                  : {})}
              />
            );
          },
        };
      }

      // --- 操作列（0008 闭环二：动态菜单 + 需求编号点）---
      if (col.key === 'operation') {
        return {
          ...col,
          render: (_: unknown, record: CustomerRecord) => {
            const isOpen =
              openMenuKey === record.key &&
              openMenuModeRef.current === reqView.mode;

            const menuItems = buildOperationMenuItems({
              status: record.invalidApprovalStatus,
              reqMode: reqView.mode,
              recordKey: record.key,
              onMarkInvalid: () => {
                if (reqView.mode === 'prototype') {
                  setDrawerRecordKey(record.key);
                  setDrawerMode('application');
                }
              },
              onReview: () => {
                if (reqView.mode === 'prototype') {
                  setDrawerRecordKey(record.key);
                  setDrawerMode('review');
                }
              },
            });

            const triggerButton = (
              <Button
                size="small"
                aria-haspopup="menu"
                aria-expanded={isOpen}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOperationClick(record.key);
                }}
                data-req-id={`operation-menu-trigger-${record.key}`}
                className="store-customer-operation-btn"
              >
                操作 <CaretDownIcon />
              </Button>
            );

            if (!isOpen) return triggerButton;

            return (
              <Dropdown
                menu={{
                  items: menuItems,
                  onClick: ({ key }) => handleMenuClick(key, record.key),
                }}
                trigger={['click']}
                destroyOnHidden
                open={isOpen}
                onOpenChange={(open) => {
                  if (!open && openMenuKeyRef.current === record.key) {
                    setOpenMenuKey(null);
                    openMenuKeyRef.current = null;
                    openMenuModeRef.current = null;
                  }
                }}
              >
                {triggerButton}
              </Dropdown>
            );
          },
        };
      }

      // --- 其他列：添加表头需求标记（points 1, 2, 4, 5）---
      // 需求模式下移除排序能力
      const headerPoint = REQUIREMENT_POINTS.find(
        (p) => p.targetKind === 'column-header' && p.columnKey === col.key,
      );
      if (headerPoint) {
        if (reqView.mode === 'requirement') {
          return {
            ...col,
            sorter: undefined as unknown as typeof col.sorter,
            title: (
              <RequirementMarker
                requirementKey={headerPoint.requirementKey}
                displayNumber={headerPoint.displayNumber}
                targetId={headerPoint.targetDataReqId}
                positionLabel="表头"
                className="requirement-marker--header"
                exposeDataReqId={false}
              >
                {col.title as React.ReactNode}
              </RequirementMarker>
            ),
          };
        }
        return {
          ...col,
          title: (
            <RequirementMarker
              requirementKey={headerPoint.requirementKey}
              displayNumber={headerPoint.displayNumber}
              targetId={headerPoint.targetDataReqId}
              positionLabel="表头"
              className="requirement-marker--header"
              exposeDataReqId={false}
            >
              {col.title as React.ReactNode}
            </RequirementMarker>
          ),
        };
      }

      return col;
    }) as ColumnsType<CustomerRecord>;
  }, [handleMenuClick, handleOperationClick, openMenuKey, reqView.mode, handleStatusClick, setDrawerRecordKey, setDrawerMode]);

  const renderTable = () => {
    if (pageState === 'loading') {
      return (
        <AdminDataTable<CustomerRecord>
          columns={columns}
          dataSource={[]}
          loading
          rowKey="key"
          scroll={{ x: 6500 }}
        />
      );
    }

    if (pageState === 'error') {
      return (
        <div className="store-customer-table-error">
          <p>查询失败，请稍后重试</p>
          <Button onClick={() => setPageState('normal')}>重新加载</Button>
        </div>
      );
    }

    if (pageState === 'empty') {
      return (
        <AdminDataTable<CustomerRecord>
          columns={columns}
          dataSource={[]}
          rowKey="key"
          scroll={{ x: 6500 }}
          locale={{ emptyText: '当前暂无数据' }}
        />
      );
    }

    if (pageState === 'noResults') {
      return (
        <AdminDataTable<CustomerRecord>
          columns={columns}
          dataSource={[]}
          rowKey="key"
          scroll={{ x: 6500 }}
          locale={{ emptyText: '筛选无结果，请调整筛选条件' }}
        />
      );
    }

    return (
      <AdminDataTable<CustomerRecord>
        columns={columns}
        dataSource={pagedData}
        rowKey="key"
        scroll={{ x: 6500 }}
      />
    );
  };

  // ---------- 分页 ----------
  const renderPagination = () => {
    if (pageState === 'loading' || pageState === 'error') return null;

    return (
      <AdminPagination
        totalCount={totalCount}
        pageSize={pageSize}
        currentPage={currentPage}
        onPageSizeChange={(v) => {
          setPageSize(v);
          setCurrentPage(1);
        }}
        onPageChange={setCurrentPage}
      />
    );
  };

  // ---------- 左侧导航 ----------
  const renderNav = () => (
    <div
      className={`store-customer-nav ${navCollapsed ? 'collapsed' : ''}`}
      data-req-id="left-navigation"
    >
      <div className="store-customer-nav-header">
        {!navCollapsed && (
          <span className="store-customer-nav-title">
            <span className="store-customer-nav-logo-dot" />
            <span className="store-customer-nav-brand-text">SCRM系统</span>
          </span>
        )}
        <span
          className="store-customer-nav-toggle"
          onClick={() => setNavCollapsed(!navCollapsed)}
        >
          <FoldIcon size={16} style={{ color: 'rgba(255,255,255,0.65)' }} />
        </span>
      </div>
      <div className="store-customer-nav-menu">
        {navItems.map((item) => {
          const isExpanded = item.key === 'prospect';
          const hasChildren = !!item.children;
          // 只有子项被选中，父级不标蓝
          const isParentExpanded = hasChildren && isExpanded;

          return (
            <div key={item.key}>
              <div
                className={`store-customer-nav-item ${isParentExpanded ? 'expanded' : ''}`}
                title={item.label}
              >
                <span className="store-customer-nav-icon">{item.icon}</span>
                {!navCollapsed && (
                  <span className="store-customer-nav-label">{item.label}</span>
                )}
              </div>
              {hasChildren && isExpanded && !navCollapsed && (
                <div className="store-customer-nav-submenu">
                  {item.children!.map((child) => (
                    <div
                      key={child.key}
                      className={`store-customer-nav-subitem ${
                        child.key === 'store-customer' ? 'active' : ''
                      }`}
                    >
                      {child.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <RequirementModeControl />
      <RequirementDrawer getRequirementData={getRequirement} />

      {/* 无效申请抽屉 */}
      <InvalidApplicationDrawer
        open={drawerMode === 'application'}
        onClose={handleDrawerClose}
        onSubmit={handleApplicationSubmit}
        defaultRemark={
          drawerRecord?.invalidApprovalStatus === 'rejected'
            ? (drawerApplication?.remark ?? '')
            : ''
        }
        defaultAttachments={
          drawerRecord?.invalidApprovalStatus === 'rejected'
            ? (drawerApplication?.attachments ?? [])
            : []
        }
      />

      {/* 审核抽屉 */}
      <InvalidReviewDrawer
        open={drawerMode === 'review'}
        onClose={handleDrawerClose}
        onSubmit={handleReviewSubmit}
        recordName={drawerRecord?.name ?? ''}
        application={drawerApplication}
      />

      {/* 详情抽屉 */}
      <InvalidApprovalDetailDrawer
        open={drawerMode === 'detail'}
        onClose={handleDrawerClose}
        recordName={drawerRecord?.name ?? ''}
        status={drawerRecord?.invalidApprovalStatus ?? null}
        application={drawerApplication}
        review={drawerReview}
      />

      <AdminShell
        sidebar={renderNav()}
        topBar={renderTopBar()}
        tabs={renderTabs()}
        content={
          <>
            {/* V-01：隐藏独立大标题块但保留锚点 */}
            <div className="store-customer-content-header" data-req-id="page-title-area" />

            {renderFilter()}

            <div className="store-customer-table-wrapper" data-req-id="table-area">
              <ColumnRequirementAnchorRegistry />
              {renderTable()}
            </div>

            {renderPagination()}

            {exportMsg && (
              <div className="store-customer-export-toast">{exportMsg}</div>
            )}
          </>
        }
      />
    </>
  );
}

export function StoreCustomerList({
  initialRequirementMode = 'prototype',
  ...rest
}: StoreCustomerListProps) {
  return (
    <RequirementViewProvider
      initialMode={initialRequirementMode}
      initialControlExpanded={initialRequirementMode === 'requirement'}
    >
      <StoreCustomerListInner {...rest} />
    </RequirementViewProvider>
  );
}

export default StoreCustomerList;
