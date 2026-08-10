import { Button, Select, Space } from 'antd';

/**
 * 后台分页（AdminPagination）。
 *
 * 完全受控：当前页、每页条数和变更回调均由页面管理，不引入内部分页状态，
 * 不改变总数文案与 `0 / 0` 语义，不改变表格当前页数据计算。
 */
export interface AdminPaginationProps {
  /** 总记录数 */
  totalCount: number;
  /** 每页条数 */
  pageSize: number;
  /** 当前页（从 1 开始） */
  currentPage: number;
  /** 每页条数变更回调 */
  onPageSizeChange: (size: number) => void;
  /** 页码变更回调 */
  onPageChange: (page: number) => void;
  /** 分页锚点 id（默认保留既有值） */
  dataReqId?: string;
}

export function AdminPagination({
  totalCount,
  pageSize,
  currentPage,
  onPageSizeChange,
  onPageChange,
  dataReqId = 'pagination-area',
}: AdminPaginationProps) {
  const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / pageSize);
  const displayedCurrentPage = totalPages === 0 ? 0 : Math.min(currentPage, totalPages);

  return (
    <div className="store-customer-pagination" data-req-id={dataReqId}>
      <div className="store-customer-pagination-left">共 {totalCount} 条记录</div>
      <div className="store-customer-pagination-right">
        <Space>
          <Select
            value={pageSize}
            onChange={(v) => onPageSizeChange(v)}
            options={[
              { value: 10, label: '10条/页' },
              { value: 20, label: '20条/页' },
              { value: 50, label: '50条/页' },
              { value: 100, label: '100条/页' },
            ]}
            style={{ width: 110 }}
          />
          <Button
            disabled={totalPages === 0 || currentPage <= 1}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          >
            上一页
          </Button>
          <span className="store-customer-page-indicator">
            {displayedCurrentPage} / {totalPages}
          </span>
          <Button
            disabled={totalPages === 0 || currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            下一页
          </Button>
        </Space>
      </div>
    </div>
  );
}

export default AdminPagination;
