import { Button, Input, message, Modal, Select, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';
import { UserIcon } from '../prospect-management/pages/StoreCustomerList/IconComponents';
import { CustomerDetailDrawer } from './CustomerDetailDrawer';
import type { CustomerDetailTabKey } from './CustomerDetailDrawer';
import type {
  CustomerAssessmentSourceFilter,
  CustomerAssessmentView,
} from './CustomerBodyAssessmentPanel';
import {
  CUSTOMER_FILTER_OPTIONS,
  CUSTOMER_MOCK,
  CUSTOMER_PAGE_SIZE,
  CUSTOMER_TOTAL,
  filterCustomers,
  getCustomerById,
} from './customerMockData';
import type { CustomerFilter, CustomerRecord } from './customerTypes';
import { EMPTY_CUSTOMER_FILTER } from './customerTypes';
import './customerManagement.css';

interface CustomerTableRow extends CustomerRecord {
  displayKey: string;
  displayId: string;
}

export interface CustomerListPageProps {
  /** Story/测试专用：打开真实客户详情 Drawer 的基本信息状态。 */
  initialDetailCustomerId?: string;
  /** Story/测试专用：打开真实客户详情 Drawer 的初始一级 Tab。 */
  initialDetailTab?: CustomerDetailTabKey;
  /** Story/测试专用：体测美容记录的初始二级状态。 */
  initialAssessmentView?: CustomerAssessmentView;
  /** Story/测试专用：体测记录的初始来源筛选。 */
  initialAssessmentSource?: CustomerAssessmentSourceFilter;
  /** Story/测试专用：直接打开某条体测记录详情。 */
  initialAssessmentRecordId?: string;
  /** Story/测试专用：初始应用筛选状态。 */
  initialAppliedFilter?: CustomerFilter;
}

const CUSTOMER_COLUMNS: ColumnsType<CustomerTableRow> = [
  { title: 'ID', dataIndex: 'displayId', key: 'id', fixed: 'left', width: 82 },
  {
    title: '头像',
    key: 'avatar',
    fixed: 'left',
    width: 66,
    render: () => (
      <span className="customer-avatar" aria-label="客户头像">
        <UserIcon size={16} />
      </span>
    ),
  },
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
    fixed: 'left',
    width: 112,
    render: (value: string) => <span className="customer-name-cell">{value}</span>,
  },
  { title: '注册门店', dataIndex: 'registrationStore', key: 'registrationStore', width: 130 },
  { title: '归属门店', dataIndex: 'affiliatedStore', key: 'affiliatedStore', width: 130 },
  { title: '性别', dataIndex: 'gender', key: 'gender', width: 74 },
  { title: '生日', dataIndex: 'birthday', key: 'birthday', width: 118 },
  { title: '手机号', dataIndex: 'phone', key: 'phone', width: 132 },
  { title: '用户来源', dataIndex: 'userSource', key: 'userSource', width: 102 },
  { title: '会员等级', dataIndex: 'membershipLevel', key: 'membershipLevel', width: 108 },
  { title: '成长值', dataIndex: 'growthValue', key: 'growthValue', width: 82 },
  { title: '瑜伽未到店时间', dataIndex: 'yogaNoVisitTime', key: 'yogaNoVisitTime', width: 148 },
  { title: '瑜伽最近到店时间', dataIndex: 'yogaRecentVisitTime', key: 'yogaRecentVisitTime', width: 160 },
  { title: '瑜伽消费次数', dataIndex: 'yogaConsumptionCount', key: 'yogaConsumptionCount', width: 126 },
  { title: '瑜伽剩余次数', dataIndex: 'yogaRemainingCount', key: 'yogaRemainingCount', width: 126 },
  { title: '瑜伽剩余金额', dataIndex: 'yogaRemainingAmount', key: 'yogaRemainingAmount', width: 126 },
  { title: '瑜伽剩余合同数', dataIndex: 'yogaRemainingContracts', key: 'yogaRemainingContracts', width: 136 },
  { title: '美容未到店时间', dataIndex: 'beautyNoVisitTime', key: 'beautyNoVisitTime', width: 148 },
  { title: '美容最近到店时间', dataIndex: 'beautyRecentVisitTime', key: 'beautyRecentVisitTime', width: 160 },
  { title: '美容消费次数', dataIndex: 'beautyConsumptionCount', key: 'beautyConsumptionCount', width: 126 },
  { title: '美容剩余次数', dataIndex: 'beautyRemainingCount', key: 'beautyRemainingCount', width: 126 },
  { title: '美容剩余金额', dataIndex: 'beautyRemainingAmount', key: 'beautyRemainingAmount', width: 126 },
  { title: '美容剩余合同数', dataIndex: 'beautyRemainingContracts', key: 'beautyRemainingContracts', width: 136 },
  { title: '奥币余额', dataIndex: 'aobiBalance', key: 'aobiBalance', width: 102 },
  { title: '首单业务类型', dataIndex: 'firstOrderType', key: 'firstOrderType', width: 126 },
  { title: '首单成交时间', dataIndex: 'firstOrderAt', key: 'firstOrderAt', width: 150 },
  { title: '业务类型', dataIndex: 'businessType', key: 'businessType', width: 102 },
  { title: '跨业务用户', dataIndex: 'crossBusinessUser', key: 'crossBusinessUser', width: 112 },
  { title: '结转金', dataIndex: 'carryoverAmount', key: 'carryoverAmount', width: 96 },
  { title: '问卷状态', dataIndex: 'questionnaireStatus', key: 'questionnaireStatus', width: 102 },
  { title: '注册日期', dataIndex: 'registeredAt', key: 'registeredAt', width: 160 },
];

function isEmptyFilter(filter: CustomerFilter): boolean {
  return Object.values(filter).every((value) => value.trim() === '');
}

function buildPageRows(
  customers: readonly CustomerRecord[],
  page: number,
): CustomerTableRow[] {
  if (customers.length === 0) return [];

  const start = (page - 1) * CUSTOMER_PAGE_SIZE;
  return Array.from({ length: Math.min(CUSTOMER_PAGE_SIZE, customers.length) }, (_, index) => {
    const customer = customers[(start + index) % customers.length];
    if (!customer) return null;
    return {
      ...customer,
      displayKey: `${customer.customerId}-${page}-${index}`,
      displayId: page === 1 ? customer.id : `${Number(customer.id) + (page - 1) * CUSTOMER_PAGE_SIZE}`,
    };
  }).filter((row): row is CustomerTableRow => row !== null);
}

function getVisiblePages(currentPage: number, totalPages: number): Array<number | 'ellipsis-left' | 'ellipsis-right'> {
  const candidates = new Set<number>([1, 2, totalPages, totalPages - 1, currentPage - 1, currentPage, currentPage + 1]);
  const sorted = [...candidates].filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b);
  const result: Array<number | 'ellipsis-left' | 'ellipsis-right'> = [];
  sorted.forEach((page, index) => {
    const previous = sorted[index - 1];
    if (previous !== undefined && page - previous > 1) {
      result.push(index === 1 ? 'ellipsis-left' : 'ellipsis-right');
    }
    result.push(page);
  });
  return result;
}

export function CustomerListPage({
  initialDetailCustomerId,
  initialDetailTab,
  initialAssessmentView,
  initialAssessmentSource,
  initialAssessmentRecordId,
  initialAppliedFilter,
}: CustomerListPageProps) {
  const initialFilter = initialAppliedFilter ?? EMPTY_CUSTOMER_FILTER;
  const [draftFilter, setDraftFilter] = useState<CustomerFilter>({ ...initialFilter });
  const [appliedFilter, setAppliedFilter] = useState<CustomerFilter>({ ...initialFilter });
  const [currentPage, setCurrentPage] = useState(1);
  const [jumpPage, setJumpPage] = useState('');
  const [detailCustomer, setDetailCustomer] = useState<CustomerRecord | null>(() =>
    initialDetailCustomerId ? getCustomerById(initialDetailCustomerId) : null,
  );
  const [messageApi, messageContextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();

  const filteredCustomers = useMemo(
    () => filterCustomers(CUSTOMER_MOCK, appliedFilter),
    [appliedFilter],
  );
  const filteredMode = !isEmptyFilter(appliedFilter);
  const totalCount = filteredMode ? filteredCustomers.length : CUSTOMER_TOTAL;
  const totalPages = totalCount > 0 ? Math.ceil(totalCount / CUSTOMER_PAGE_SIZE) : 0;
  const displayedPage = totalPages === 0 ? 0 : Math.min(currentPage, totalPages);
  const pageRows = useMemo(
    () => buildPageRows(filteredCustomers, displayedPage),
    [displayedPage, filteredCustomers],
  );

  const goToPage = (page: number) => {
    if (totalPages === 0) return;
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  const applyFilter = () => {
    setAppliedFilter({ ...draftFilter });
    setCurrentPage(1);
  };

  const resetFilter = () => {
    setDraftFilter({ ...EMPTY_CUSTOMER_FILTER });
    setAppliedFilter({ ...EMPTY_CUSTOMER_FILTER });
    setCurrentPage(1);
  };

  const openDetail = (customer: CustomerRecord) => setDetailCustomer(customer);

  const columns: ColumnsType<CustomerTableRow> = [
    ...CUSTOMER_COLUMNS,
    {
      title: '操作',
      key: 'operations',
      fixed: 'right',
      width: 190,
      render: (_value, customer) => (
        <span className="customer-row-actions">
          <Button type="link" className="customer-row-action" onClick={() => openDetail(customer)}>
            查看详情
          </Button>
          <Button
            type="link"
            className="customer-row-action"
            onClick={() => messageApi.success(`已同步${customer.name}`)}
          >
            同步
          </Button>
          <Button
            type="link"
            danger
            className="customer-row-action is-danger"
            onClick={() =>
              modal.confirm({
                title: '删除用户',
                content: `确认删除用户“${customer.name}”吗？`,
                okText: '确认删除',
                cancelText: '取消',
                onOk: () => messageApi.success('已提交删除用户申请'),
              })
            }
          >
            删除用户
          </Button>
        </span>
      ),
    },
  ];

  const visiblePages = getVisiblePages(displayedPage, totalPages);

  return (
    <div className="customer-list-page" data-req-id="customer-list-page">
      <div className="customer-list-main">
        <div className="customer-filter-card" data-req-id="customer-filter-area">
          <div className="customer-filter-row">
            <div className="customer-filter-field">
              <label htmlFor="customer-filter-name">姓名/手机号</label>
              <Input
                id="customer-filter-name"
                aria-label="姓名/手机号"
                placeholder="请输入姓名/手机号"
                value={draftFilter.nameOrPhone}
                onChange={(event) => setDraftFilter({ ...draftFilter, nameOrPhone: event.target.value })}
              />
            </div>
            <div className="customer-filter-field">
              <label>用户来源</label>
              <Select
                aria-label="用户来源"
                placeholder="请选择"
                allowClear
                value={draftFilter.userSource || undefined}
                options={[...CUSTOMER_FILTER_OPTIONS.userSource]}
                onChange={(value) => setDraftFilter({ ...draftFilter, userSource: value ?? '' })}
              />
            </div>
            <div className="customer-filter-field">
              <label htmlFor="customer-filter-authorized-phone">授权手机号</label>
              <Input
                id="customer-filter-authorized-phone"
                aria-label="授权手机号"
                placeholder="请输入"
                value={draftFilter.authorizedPhone}
                onChange={(event) => setDraftFilter({ ...draftFilter, authorizedPhone: event.target.value })}
              />
            </div>
            <DateRangeFilter
              label="瑜伽未到店时间"
              ariaLabel="瑜伽未到店时间"
              value={draftFilter.yogaNoVisitTime}
              onChange={(value) => setDraftFilter({ ...draftFilter, yogaNoVisitTime: value })}
            />
            <DateRangeFilter
              label="美容未到店时间"
              ariaLabel="美容未到店时间"
              value={draftFilter.beautyNoVisitTime}
              onChange={(value) => setDraftFilter({ ...draftFilter, beautyNoVisitTime: value })}
            />
          </div>
          <div className="customer-filter-row">
            <div className="customer-filter-field">
              <label>跨业务用户</label>
              <Select
                aria-label="跨业务用户"
                placeholder="请选择"
                allowClear
                value={draftFilter.crossBusinessUser || undefined}
                options={[...CUSTOMER_FILTER_OPTIONS.crossBusinessUser]}
                onChange={(value) => setDraftFilter({ ...draftFilter, crossBusinessUser: value ?? '' })}
              />
            </div>
            <DateRangeFilter
              label="成为客户时间"
              ariaLabel="成为客户时间"
              value={draftFilter.customerDate}
              onChange={(value) => setDraftFilter({ ...draftFilter, customerDate: value })}
            />
            <DateRangeFilter
              label="生日"
              ariaLabel="生日"
              value={draftFilter.birthday}
              onChange={(value) => setDraftFilter({ ...draftFilter, birthday: value })}
            />
            <div className="customer-filter-actions">
              <Button type="primary" onClick={applyFilter}>搜索</Button>
              <Button onClick={resetFilter}>重置</Button>
            </div>
          </div>
        </div>

        <div className="customer-toolbar">
          <Button onClick={() => messageApi.info('线下体验核销入口已打开')}>线下体验核销</Button>
          <Button type="primary" onClick={() => messageApi.info('创建用户入口已打开')}>创建用户</Button>
        </div>

        <div className="customer-table-wrapper" data-req-id="customer-table-area">
          <Table<CustomerTableRow>
            className="customer-table"
            columns={columns}
            dataSource={pageRows}
            rowKey="displayKey"
            pagination={false}
            scroll={{ x: 3600 }}
          />
        </div>

        <div className="customer-pagination" data-req-id="customer-pagination">
          <div className="customer-pagination-left">共 {totalCount} 条记录</div>
          <div className="customer-pagination-right">
            <span>10条/页</span>
            <Button
              size="small"
              disabled={totalPages === 0 || displayedPage <= 1}
              onClick={() => goToPage(displayedPage - 1)}
            >
              上一页
            </Button>
            <div className="customer-pagination-pages" aria-label="客户列表页码">
              {visiblePages.map((page) =>
                typeof page === 'number' ? (
                  <button
                    key={page}
                    type="button"
                    className={`customer-page-button ${page === displayedPage ? 'is-current' : ''}`}
                    aria-label={`第${page}页`}
                    aria-current={page === displayedPage ? 'page' : undefined}
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </button>
                ) : (
                  <span key={page} className="customer-page-ellipsis">…</span>
                ),
              )}
            </div>
            <Button
              size="small"
              disabled={totalPages === 0 || displayedPage >= totalPages}
              onClick={() => goToPage(displayedPage + 1)}
            >
              下一页
            </Button>
            <span>前往</span>
            <Input
              aria-label="前往页码"
              className="customer-page-jump-input"
              value={jumpPage}
              onChange={(event) => setJumpPage(event.target.value.replace(/\D/g, ''))}
              onPressEnter={() => {
                const page = Number.parseInt(jumpPage, 10);
                if (Number.isInteger(page)) goToPage(page);
                setJumpPage('');
              }}
            />
            <span>页</span>
          </div>
        </div>
      </div>

      <CustomerDetailDrawer
        open={detailCustomer !== null}
        customer={detailCustomer}
        initialTab={initialDetailTab ?? 'basic'}
        initialAssessmentView={initialAssessmentView ?? 'assessment'}
        initialAssessmentSource={initialAssessmentSource ?? 'ALL'}
        {...(initialAssessmentRecordId ? { initialAssessmentRecordId } : {})}
        onClose={() => setDetailCustomer(null)}
      />
      {modalContextHolder}
      {messageContextHolder}
    </div>
  );
}

interface DateRangeFilterProps {
  label: string;
  ariaLabel: string;
  value: string;
  onChange: (value: string) => void;
}

function DateRangeFilter({ label, ariaLabel, value, onChange }: DateRangeFilterProps) {
  return (
    <div className="customer-filter-field" data-req-id={`customer-filter-${ariaLabel}`}>
      <label>{label}</label>
      <div className="customer-filter-date-range" aria-label={ariaLabel}>
        <Input
          aria-label={`${ariaLabel}-开始日期`}
          placeholder="开始日期"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <span className="customer-filter-date-separator">至</span>
        <Input aria-label={`${ariaLabel}-结束日期`} placeholder="结束日期" />
      </div>
    </div>
  );
}

export { CUSTOMER_COLUMNS };

export default CustomerListPage;
