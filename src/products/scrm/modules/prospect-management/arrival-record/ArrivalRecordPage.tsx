/**
 * 0012 Cycle A - 到店记录独立页。
 *
 * 通过产品层菜单切换进入，仅提供归集、查询、筛选、查看能力：
 * 12 个筛选字段 + 搜索/重置/导出，32 列列表 + 分页。Cycle A 不提供
 * 添加到店 / 新增 / 编辑等录入能力，页面不渲染任何新增按钮。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, DatePicker, Input, Select } from 'antd';
import {
  AdminPagination,
  FilterActions,
  FilterBar,
  FilterField,
} from '../../../shared/admin';
import { ArrivalRecordTable } from './ArrivalRecordTable';
import { useRecordRuntimeStore } from '../record-shared';
import '../record-shared/recordPageList.css';
import {
  applyArrivalRecordFilter,
  ARRIVAL_RECORD_DEFAULT_FILTERS,
  ARRIVAL_SOURCE_OPTIONS,
  ARRIVAL_STORE_OPTIONS,
  ARRIVED_OPTIONS,
  DEAL_OPTIONS,
  SIGNED_IN_OPTIONS,
  TRIAL_CLASS_STATUS_OPTIONS,
} from './arrivalRecordFilters';
import type { ArrivalRecordFilterValues } from './arrivalRecordFilters';

const { RangePicker } = DatePicker;

export interface ArrivalRecordPageProps {
  /** 稳定复现空态：不加载任何到店记录（Story/测试专用）。 */
  initialState?: 'normal' | 'empty';
}

export function ArrivalRecordPage({ initialState = 'normal' }: ArrivalRecordPageProps) {
  const { getArrivalRecords } = useRecordRuntimeStore();
  const [pendingFilters, setPendingFilters] = useState<ArrivalRecordFilterValues>({
    ...ARRIVAL_RECORD_DEFAULT_FILTERS,
  });
  const [appliedFilters, setAppliedFilters] = useState<ArrivalRecordFilterValues>({
    ...ARRIVAL_RECORD_DEFAULT_FILTERS,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [exportMsg, setExportMsg] = useState<string | null>(null);
  const exportTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updatePending = <K extends keyof ArrivalRecordFilterValues>(
    key: K,
    value: ArrivalRecordFilterValues[K],
  ) => {
    setPendingFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filteredRecords = useMemo(() => {
    if (initialState === 'empty') return [];
    return applyArrivalRecordFilter(getArrivalRecords(), appliedFilters);
  }, [appliedFilters, initialState, getArrivalRecords]);

  const pagedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // ---------- 搜索 / 重置 ----------
  const handleSearch = useCallback(() => {
    setAppliedFilters({ ...pendingFilters });
    setCurrentPage(1);
  }, [pendingFilters]);

  const handleReset = useCallback(() => {
    setPendingFilters({ ...ARRIVAL_RECORD_DEFAULT_FILTERS });
    setAppliedFilters({ ...ARRIVAL_RECORD_DEFAULT_FILTERS });
    setCurrentPage(1);
  }, []);

  // ---------- 导出（沿用 0011 单一反馈方式，定时器可控）----------
  const handleExport = useCallback(() => {
    if (exportTimerRef.current !== null) {
      clearTimeout(exportTimerRef.current);
    }
    setExportMsg('导出任务已创建');
    exportTimerRef.current = setTimeout(() => {
      setExportMsg(null);
      exportTimerRef.current = null;
    }, 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (exportTimerRef.current !== null) {
        clearTimeout(exportTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      <div className="store-customer-content-header" data-req-id="arrival-page-title" />
      <FilterBar dataReqId="arrival-record-filter" className="store-customer-filter-card store-customer-record-page">
        <div className="store-customer-filter-row">
          <FilterField label="用户ID" dataReqId="filter-arrival-user-id">
            <Input
              placeholder="请输入用户ID"
              value={pendingFilters.userId}
              onChange={(e) => updatePending('userId', e.target.value)}
              allowClear
            />
          </FilterField>
          <FilterField label="姓名/手机号" dataReqId="filter-arrival-name-phone">
            <Input
              placeholder="请输入姓名或手机号"
              value={pendingFilters.namePhone}
              onChange={(e) => updatePending('namePhone', e.target.value)}
              allowClear
            />
          </FilterField>
          <FilterField label="客资来源" dataReqId="filter-arrival-source">
            <Select
              placeholder="请选择"
              value={pendingFilters.source ?? undefined}
              onChange={(v) => updatePending('source', v ?? null)}
              options={ARRIVAL_SOURCE_OPTIONS}
              allowClear
            />
          </FilterField>
          <FilterField label="预约门店" dataReqId="filter-arrival-store">
            <Select
              placeholder="请选择"
              value={pendingFilters.appointmentStore ?? undefined}
              onChange={(v) => updatePending('appointmentStore', v ?? null)}
              options={ARRIVAL_STORE_OPTIONS}
              allowClear
            />
          </FilterField>
          <FilterField label="是否到店" dataReqId="filter-arrival-arrived">
            <Select
              placeholder="请选择"
              value={pendingFilters.isArrived ?? undefined}
              onChange={(v) => updatePending('isArrived', v ?? null)}
              options={ARRIVED_OPTIONS}
              allowClear
            />
          </FilterField>
          <FilterField label="是否成交" dataReqId="filter-arrival-deal">
            <Select
              placeholder="请选择"
              value={pendingFilters.isDeal ?? undefined}
              onChange={(v) => updatePending('isDeal', v ?? null)}
              options={DEAL_OPTIONS}
              allowClear
            />
          </FilterField>
          <FilterField label="体验课状态" dataReqId="filter-arrival-trial-status">
            <Select
              placeholder="请选择"
              value={pendingFilters.trialClassStatus ?? undefined}
              onChange={(v) => updatePending('trialClassStatus', v ?? null)}
              options={TRIAL_CLASS_STATUS_OPTIONS}
              allowClear
            />
          </FilterField>
          <FilterField label="是否签到" dataReqId="filter-arrival-signed-in">
            <Select
              placeholder="请选择"
              value={pendingFilters.isSignedIn ?? undefined}
              onChange={(v) => updatePending('isSignedIn', v ?? null)}
              options={SIGNED_IN_OPTIONS}
              allowClear
            />
          </FilterField>
          <FilterField label="体验课上课教练" dataReqId="filter-arrival-trial-coach">
            <Input
              placeholder="请输入教练姓名"
              value={pendingFilters.trialClassCoach}
              onChange={(e) => updatePending('trialClassCoach', e.target.value)}
              allowClear
            />
          </FilterField>
          <FilterField label="合同号" dataReqId="filter-arrival-contract-no">
            <Input
              placeholder="请输入合同号"
              value={pendingFilters.contractNo}
              onChange={(e) => updatePending('contractNo', e.target.value)}
              allowClear
            />
          </FilterField>
          <FilterField label="到店时间" className="store-customer-filter-item--date-range" dataReqId="filter-arrival-time-range">
            <RangePicker
              separator="至"
              onChange={(_dates, dateStrings) => {
                const [start, end] = dateStrings;
                updatePending('arrivalTimeRange', start && end ? [start, end] : null);
              }}
            />
          </FilterField>
          <FilterField
            label="体验课卡获取时间"
            className="store-customer-filter-item--date-range"
            dataReqId="filter-arrival-trial-get-time-range"
          >
            <RangePicker
              separator="至"
              onChange={(_dates, dateStrings) => {
                const [start, end] = dateStrings;
                updatePending('trialClassGetTimeRange', start && end ? [start, end] : null);
              }}
            />
          </FilterField>
        </div>
        <FilterActions
          left={
            <>
              <Button type="primary" onClick={handleSearch} data-req-id="arrival-record-search-button">
                搜索
              </Button>
              <Button onClick={handleReset} data-req-id="arrival-record-reset-button">
                重置
              </Button>
            </>
          }
          right={
            <Button type="primary" onClick={handleExport} data-req-id="arrival-record-export-button">
              导出记录
            </Button>
          }
        />
      </FilterBar>

      <div className="store-customer-table-wrapper" data-req-id="arrival-record-table-area">
        <ArrivalRecordTable dataSource={pagedRecords} />
      </div>

      <AdminPagination
        totalCount={filteredRecords.length}
        pageSize={pageSize}
        currentPage={currentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        onPageChange={setCurrentPage}
        dataReqId="arrival-record-pagination"
      />

      {exportMsg && <div className="store-customer-export-toast">{exportMsg}</div>}
    </>
  );
}

export default ArrivalRecordPage;
