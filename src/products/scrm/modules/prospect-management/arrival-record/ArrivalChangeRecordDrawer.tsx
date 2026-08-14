/**
 * 0012 Cycle B3 - 到店记录变更记录只读 Drawer。
 *
 * 入口：到店独立页操作列 → 变更记录（RecordOperationCell → openArrivalChangeRecord）。
 * 只读右侧 Drawer：标题「变更记录」，展示"变更前 / 变更后"明细表格
 * （变更时间 | 操作人 | 字段 | 变更前 | 变更后），不提供编辑 / 保存业务。
 *
 * 数据：独立只读 Mock（arrivalChangeRecordMockData），与运行时 store 分离；
 * 真实产生机制未确认前，create/update 到店记录不写入变更历史。
 * 分页：前端 Mock 分页，复用 AdminPagination（与列表页同一后台分页视觉）。
 * 空态：无变更记录时表格显示真实后台风格空态（"暂无数据"），分页显示 0 条。
 *
 * 视觉：右侧 Drawer、宽度 50vw、轻量标题、正文 record-drawer-body 内边距，
 * 与到店/拜访编辑抽屉（record-shared/recordDrawer.css）同一家族；变更记录
 * 明细表格为独立只读模块，使用本模块自带 arrival-change-record.css（仅新增
 * 前缀类，不改动既有 record-drawer-* 冻结样式）。
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Drawer } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { AdminDataTable, AdminPagination } from '../../../shared/admin';
import type { ArrivalChangeRecord } from './arrivalChangeRecordTypes';
import { getArrivalChangeRecordsByRecordKey } from './arrivalChangeRecordMockData';
import '../record-shared/recordDrawer.css';
import './arrivalChangeRecord.css';

export interface ArrivalChangeRecordDrawerProps {
  open: boolean;
  onClose: () => void;
  /** 关联到店记录 key；变更记录按该记录读取独立只读 Mock（null 时不加载）。 */
  recordKey: string | null;
  /** Story/测试专用：强制空数据（不读取任何变更记录，稳定展示空态）。 */
  initialState?: 'normal' | 'empty';
}

/** 变更记录明细列（只读表格：变更时间 | 操作人 | 字段 | 变更前 | 变更后） */
const CHANGE_RECORD_COLUMNS: ColumnsType<ArrivalChangeRecord> = [
  { title: '变更时间', dataIndex: 'changeTime', key: 'changeTime', width: 150 },
  { title: '操作人', dataIndex: 'operator', key: 'operator', width: 90 },
  { title: '字段', dataIndex: 'field', key: 'field', width: 110 },
  { title: '变更前', dataIndex: 'before', key: 'before', width: 160 },
  { title: '变更后', dataIndex: 'after', key: 'after', width: 160 },
];

export function ArrivalChangeRecordDrawer({
  open,
  onClose,
  recordKey,
  initialState = 'normal',
}: ArrivalChangeRecordDrawerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 打开 Drawer（含挂载即打开）或切换关联到店记录时复位页码（与编辑抽屉回填同构的
  // ref 守卫：只在记录变化时初始化一次，关闭复位 ref 后重开可再次复位，不残留页码）。
  const openedRecordKeyRef = useRef<string | null>(null);
  useEffect(() => {
    if (!open) {
      openedRecordKeyRef.current = null;
      return;
    }
    if (openedRecordKeyRef.current !== recordKey) {
      openedRecordKeyRef.current = recordKey;
      setCurrentPage(1);
    }
  }, [open, recordKey]);

  const filteredRecords = useMemo(() => {
    if (initialState === 'empty' || !recordKey) return [];
    return getArrivalChangeRecordsByRecordKey(recordKey);
  }, [initialState, recordKey]);

  const pagedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  return (
    <Drawer
      title="变更记录"
      open={open}
      onClose={onClose}
      placement="right"
      width="50vw"
      destroyOnClose
      data-req-id="arrival-change-record-drawer"
      classNames={{ header: 'record-drawer-header', body: 'record-drawer-body' }}
    >
      <div className="record-drawer-section">
        <div className="record-drawer-section-title">变更明细</div>
        <div className="arrival-change-table" data-req-id="arrival-change-record-table-area">
          <AdminDataTable<ArrivalChangeRecord>
            columns={CHANGE_RECORD_COLUMNS}
            dataSource={pagedRecords}
            rowKey="key"
            dataReqId="arrival-change-record-table"
          />
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
          dataReqId="arrival-change-record-pagination"
        />
      </div>
    </Drawer>
  );
}

export default ArrivalChangeRecordDrawer;
