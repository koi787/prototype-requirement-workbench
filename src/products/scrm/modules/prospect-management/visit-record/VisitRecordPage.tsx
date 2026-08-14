/**
 * 0012 Cycle A - 拜访记录独立页。
 *
 * 通过产品层菜单切换进入，仅提供归集、查询、筛选、查看能力：
 * 8 个筛选字段 + 搜索/重置/导出，19 列列表（含下次拜访时间）+ 分页。
 * Cycle A 不提供添加拜访记录 / 新增 / 编辑等录入能力，页面不渲染任何
 * 新增按钮。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, DatePicker, Input, Select } from 'antd';
import {
  AdminPagination,
  FilterActions,
  FilterBar,
  FilterField,
} from '../../../shared/admin';
import { VisitRecordTable } from './VisitRecordTable';
import { useRecordRuntimeStore } from '../record-shared';
import '../record-shared/recordPageList.css';
import {
  applyVisitRecordFilter,
  VISIT_RECORD_DEFAULT_FILTERS,
  VISIT_SOURCE_OPTIONS,
  VISIT_STORE_OPTIONS,
  VISIT_WAY_OPTIONS,
} from './visitRecordFilters';
import type { VisitRecordFilterValues } from './visitRecordFilters';

const { RangePicker } = DatePicker;

export interface VisitRecordPageProps {
  /** 稳定复现空态：不加载任何拜访记录（Story/测试专用）。 */
  initialState?: 'normal' | 'empty';
  /** 下次拜访时间筛选视角：全部 / 有值 / 为空（Story 专用演示）。 */
  nextVisitTimeFilter?: 'all' | 'has-value' | 'empty';
}

export function VisitRecordPage({
  initialState = 'normal',
  nextVisitTimeFilter = 'all',
}: VisitRecordPageProps) {
  const { getVisitRecords } = useRecordRuntimeStore();
  const [pendingFilters, setPendingFilters] = useState<VisitRecordFilterValues>({
    ...VISIT_RECORD_DEFAULT_FILTERS,
  });
  const [appliedFilters, setAppliedFilters] = useState<VisitRecordFilterValues>({
    ...VISIT_RECORD_DEFAULT_FILTERS,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [exportMsg, setExportMsg] = useState<string | null>(null);
  const exportTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updatePending = <K extends keyof VisitRecordFilterValues>(
    key: K,
    value: VisitRecordFilterValues[K],
  ) => {
    setPendingFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filteredRecords = useMemo(() => {
    if (initialState === 'empty') return [];
    const records = applyVisitRecordFilter(getVisitRecords(), appliedFilters);
    if (nextVisitTimeFilter === 'has-value') {
      return records.filter((record) => record.nextVisitTime !== null);
    }
    if (nextVisitTimeFilter === 'empty') {
      return records.filter((record) => record.nextVisitTime === null);
    }
    return records;
  }, [appliedFilters, initialState, nextVisitTimeFilter, getVisitRecords]);

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
    setPendingFilters({ ...VISIT_RECORD_DEFAULT_FILTERS });
    setAppliedFilters({ ...VISIT_RECORD_DEFAULT_FILTERS });
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
      <div className="store-customer-content-header" data-req-id="visit-page-title" />
      <FilterBar dataReqId="visit-record-filter" className="store-customer-filter-card store-customer-record-page">
        <div className="store-customer-filter-row">
          <FilterField label="用户ID" dataReqId="filter-visit-user-id">
            <Input
              placeholder="请输入用户ID"
              value={pendingFilters.userId}
              onChange={(e) => updatePending('userId', e.target.value)}
              allowClear
            />
          </FilterField>
          <FilterField label="姓名/手机号" dataReqId="filter-visit-name-phone">
            <Input
              placeholder="请输入姓名或手机号"
              value={pendingFilters.namePhone}
              onChange={(e) => updatePending('namePhone', e.target.value)}
              allowClear
            />
          </FilterField>
          <FilterField label="客资来源" dataReqId="filter-visit-source">
            <Select
              placeholder="请选择"
              value={pendingFilters.source ?? undefined}
              onChange={(v) => updatePending('source', v ?? null)}
              options={VISIT_SOURCE_OPTIONS}
              allowClear
            />
          </FilterField>
          <FilterField label="预约门店" dataReqId="filter-visit-store">
            <Select
              placeholder="请选择"
              value={pendingFilters.appointmentStore ?? undefined}
              onChange={(v) => updatePending('appointmentStore', v ?? null)}
              options={VISIT_STORE_OPTIONS}
              allowClear
            />
          </FilterField>
          <FilterField label="拜访方式" dataReqId="filter-visit-way">
            <Select
              placeholder="请选择"
              value={pendingFilters.visitWay ?? undefined}
              onChange={(v) => updatePending('visitWay', v ?? null)}
              options={VISIT_WAY_OPTIONS}
              allowClear
            />
          </FilterField>
          <FilterField label="创建人" dataReqId="filter-visit-creator">
            <Input
              placeholder="请输入创建人"
              value={pendingFilters.creator}
              onChange={(e) => updatePending('creator', e.target.value)}
              allowClear
            />
          </FilterField>
          <FilterField label="拜访时间" className="store-customer-filter-item--date-range" dataReqId="filter-visit-time-range">
            <RangePicker
              separator="至"
              onChange={(_dates, dateStrings) => {
                const [start, end] = dateStrings;
                updatePending('visitTimeRange', start && end ? [start, end] : null);
              }}
            />
          </FilterField>
          <FilterField label="创建时间" className="store-customer-filter-item--date-range" dataReqId="filter-visit-create-time-range">
            <RangePicker
              separator="至"
              onChange={(_dates, dateStrings) => {
                const [start, end] = dateStrings;
                updatePending('createTimeRange', start && end ? [start, end] : null);
              }}
            />
          </FilterField>
        </div>
        <FilterActions
          left={
            <>
              <Button type="primary" onClick={handleSearch} data-req-id="visit-record-search-button">
                搜索
              </Button>
              <Button onClick={handleReset} data-req-id="visit-record-reset-button">
                重置
              </Button>
            </>
          }
          right={
            <Button type="primary" onClick={handleExport} data-req-id="visit-record-export-button">
              导出记录
            </Button>
          }
        />
      </FilterBar>

      <div className="store-customer-table-wrapper" data-req-id="visit-record-table-area">
        <VisitRecordTable dataSource={pagedRecords} />
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
        dataReqId="visit-record-pagination"
      />

      {exportMsg && <div className="store-customer-export-toast">{exportMsg}</div>}
    </>
  );
}

export default VisitRecordPage;
