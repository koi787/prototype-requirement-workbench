import { describe, it, expect, vi, afterEach } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ColumnsType } from 'antd/es/table';
import { AdminShell } from '../AdminShell';
import { FilterBar } from '../FilterBar';
import { FilterField } from '../FilterField';
import { FilterActions } from '../FilterActions';
import { AdminDataTable } from '../AdminDataTable';
import { AdminPagination } from '../AdminPagination';

afterEach(() => cleanup());

function getByReqId(id: string): HTMLElement {
  const elements = document.querySelectorAll(`[data-req-id="${id}"]`);
  if (elements.length !== 1) {
    throw new Error(`预期 data-req-id="${id}" 严格唯一，实际为 ${elements.length} 个`);
  }
  return elements[0] as HTMLElement;
}

interface Row {
  key: string;
  name: string;
}

const rowColumns: ColumnsType<Row> = [
  { title: '姓名', dataIndex: 'name', key: 'name' },
];

describe('AdminShell', () => {
  it('按 Sidebar / TopHeader / 顶部页签 / Content 顺序渲染插槽', () => {
    render(
      <AdminShell
        sidebar={<aside>侧边栏</aside>}
        topBar={<header>顶部系统栏</header>}
        tabs={<nav>顶部页签</nav>}
        content={<section>内容区</section>}
      />,
    );

    const root = getByReqId('store-customer-page-root');
    expect(root.className).toBe('store-customer-page');
    // 侧边栏是页面根的兄弟级插槽
    expect(root.querySelector('aside')?.textContent).toContain('侧边栏');

    const main = root.querySelector('.store-customer-main');
    expect(main).toBeTruthy();
    expect(main?.contains(screen.getByText('顶部系统栏'))).toBe(true);
    expect(main?.contains(screen.getByText('顶部页签'))).toBe(true);

    const content = root.querySelector('.store-customer-content');
    expect(content?.contains(screen.getByText('内容区'))).toBe(true);
  });

  it('不内置任何业务文字，空插槽时只渲染框架', () => {
    const { container } = render(<AdminShell />);
    expect(container.textContent).toBe('');
    expect(container.querySelector('.store-customer-page')).toBeTruthy();
    expect(container.querySelector('.store-customer-main')).toBeTruthy();
    expect(container.querySelector('.store-customer-content')).toBeTruthy();
  });
});

describe('FilterBar / FilterField / FilterActions', () => {
  it('FilterBar 渲染容器与 children 插槽', () => {
    render(
      <FilterBar>
        <div className="store-customer-filter-row">筛选内容</div>
      </FilterBar>,
    );
    const bar = getByReqId('filter-area');
    expect(bar.className).toBe('store-customer-filter-card');
    expect(bar.textContent).toContain('筛选内容');
  });

  it('FilterField 渲染 label 与控件，支持修饰类名和锚点', () => {
    render(
      <FilterField
        label="创建时间"
        className="store-customer-filter-item--date-range"
        dataReqId="filter-create-time-range"
      >
        <input placeholder="日期控件" />
      </FilterField>,
    );

    const item = screen.getByText('创建时间').closest('.store-customer-filter-item');
    expect(item).toBeTruthy();
    expect(item?.className).toBe(
      'store-customer-filter-item store-customer-filter-item--date-range',
    );
    expect(item?.getAttribute('data-req-id')).toBe('filter-create-time-range');
    expect(screen.getByPlaceholderText('日期控件')).toBeTruthy();
  });

  it('FilterActions 渲染左右操作插槽', () => {
    render(
      <FilterActions
        left={<button>搜索</button>}
        right={<button>导出记录</button>}
      />,
    );
    expect(
      screen.getByText('搜索').closest('.store-customer-filter-actions-left'),
    ).toBeTruthy();
    expect(
      screen.getByText('导出记录').closest('.store-customer-filter-actions-right'),
    ).toBeTruthy();
  });
});

describe('AdminDataTable', () => {
  it('渲染数据行、关闭分页并保留表格锚点', () => {
    render(
      <AdminDataTable<Row>
        columns={rowColumns}
        dataSource={[{ key: '1', name: '张三' }]}
        rowKey="key"
      />,
    );

    expect(screen.getByText('张三')).toBeTruthy();
    expect(document.querySelector('.ant-table-pagination')).toBeNull();
    expect(document.querySelector('[data-req-id="customer-table"]')).toBeTruthy();
  });

  it('透传 locale emptyText 展示空数据文案', () => {
    render(
      <AdminDataTable<Row>
        columns={rowColumns}
        dataSource={[]}
        rowKey="key"
        locale={{ emptyText: '当前暂无数据' }}
      />,
    );
    expect(screen.getByText('当前暂无数据')).toBeTruthy();
  });

  it('透传 loading 展示加载状态', () => {
    render(
      <AdminDataTable<Row>
        columns={rowColumns}
        dataSource={[]}
        rowKey="key"
        loading
      />,
    );
    expect(document.querySelector('[data-req-id="customer-table"]')).toBeTruthy();
    expect(document.querySelector('.ant-spin')).toBeTruthy();
  });
});

describe('AdminPagination', () => {
  it('零数据显示 0 / 0 且前后页禁用', () => {
    render(
      <AdminPagination
        totalCount={0}
        pageSize={10}
        currentPage={1}
        onPageSizeChange={vi.fn()}
        onPageChange={vi.fn()}
      />,
    );

    const pagination = getByReqId('pagination-area');
    expect(pagination.textContent).toContain('共 0 条记录');
    expect(pagination.textContent).toContain('0 / 0');
    expect(pagination.textContent).not.toContain('0 / 1');
    expect(
      (within(pagination).getByRole('button', { name: '上一页' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    expect(
      (within(pagination).getByRole('button', { name: '下一页' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
  });

  it('下一页按钮回调 onPageChange 且显示正确页码', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <AdminPagination
        totalCount={25}
        pageSize={10}
        currentPage={1}
        onPageSizeChange={vi.fn()}
        onPageChange={onPageChange}
      />,
    );

    const pagination = getByReqId('pagination-area');
    expect(pagination.textContent).toContain('共 25 条记录');
    expect(pagination.textContent).toContain('1 / 3');

    const next = within(pagination).getByRole('button', { name: '下一页' });
    expect((next as HTMLButtonElement).disabled).toBe(false);
    await user.click(next);
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('每页条数变更回调 onPageSizeChange', async () => {
    const user = userEvent.setup();
    const onPageSizeChange = vi.fn();
    render(
      <AdminPagination
        totalCount={25}
        pageSize={10}
        currentPage={1}
        onPageSizeChange={onPageSizeChange}
        onPageChange={vi.fn()}
      />,
    );

    const pagination = getByReqId('pagination-area');
    const pageSizeSelect = within(pagination).getByRole('combobox');
    await user.click(pageSizeSelect);
    const option20 = await screen.findByText('20条/页');
    await user.click(option20);
    expect(onPageSizeChange).toHaveBeenCalledWith(20);
  });
});
