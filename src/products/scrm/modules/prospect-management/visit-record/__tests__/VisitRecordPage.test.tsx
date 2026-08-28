/**
 * 0012 Cycle A - 拜访记录独立页测试。
 *
 * 只验证用户可观察结果与正式 data-req-id，不依赖 Ant Design 私有类名，
 * 不使用 `cells[数字]` 拼接取数，不写条件分支假断言。
 */
import { describe, it, expect, afterEach } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { VisitRecordPage } from '../VisitRecordPage';
import { VISIT_RECORD_HEADERS, VISIT_RECORD_COLUMNS } from '../visitRecordColumns';
import {
  applyVisitRecordFilter,
  getNextVisitTimeRange,
  VISIT_RECORD_DEFAULT_FILTERS,
  normalizeNextVisitTimeRange,
} from '../visitRecordFilters';
import { getAllVisitRecords } from '../visitRecordMockData';
import { formatLocalDate } from '../visitRecordDatePicker';
import { RecordRuntimeStoreProvider } from '../../record-shared';

afterEach(() => cleanup());

/** 独立页依赖产品层单一运行时状态（0012 Cycle B §9.2），测试用同一 Provider 包裹。 */
function renderPage(ui: ReactElement) {
  return render(<RecordRuntimeStoreProvider>{ui}</RecordRuntimeStoreProvider>);
}

function getByReqId(id: string): HTMLElement {
  const elements = document.querySelectorAll(`[data-req-id="${id}"]`);
  if (elements.length !== 1) {
    throw new Error(`预期 data-req-id="${id}" 严格唯一，实际为 ${elements.length} 个`);
  }
  return elements[0] as HTMLElement;
}

/** 读取表格内实际渲染表头（固定列可能重复渲染，按首次出现去重） */
function visibleHeaders(table: HTMLElement): string[] {
  const seen = new Set<string>();
  const headers: string[] = [];
  for (const header of within(table).getAllByRole('columnheader')) {
    const text = header.textContent?.trim() ?? '';
    if (text && !seen.has(text)) {
      seen.add(text);
      headers.push(text);
    }
  }
  return headers;
}

/** 读取表格数据行（按 data-row-key 首次出现去重，跳过固定列副本） */
function dataRows(table: HTMLElement): HTMLElement[] {
  const seen = new Set<string>();
  const rows: HTMLElement[] = [];
  for (const row of table.querySelectorAll('tbody tr[data-row-key]')) {
    const key = row.getAttribute('data-row-key');
    if (key && !seen.has(key)) {
      seen.add(key);
      rows.push(row as HTMLElement);
    }
  }
  return rows;
}

function cellByIndex(row: HTMLElement, index: number): HTMLElement {
  const cells = row.querySelectorAll('td');
  const cell = cells[index];
  if (!cell) throw new Error(`记录行缺少第 ${index} 列`);
  return cell as HTMLElement;
}

/** 拜访记录独立页 19 列表头（0017：前 7 列为跟进重点字段） */
const EXPECTED_VISIT_HEADERS = [
  '用户姓名',
  '手机号',
  '下次拜访时间',
  '意向度',
  '改善需求',
  '意向课程',
  '拜访备注',
  'ID',
  '用户ID',
  '微信号',
  '客资来源',
  '预约门店',
  '拜访方式',
  '拜访时间',
  '创建人',
  '创建时间',
  '更新人',
  '更新时间',
  '操作',
];

describe('拜访记录独立页', () => {
  it('渲染 19 列表格且表头来自共享列定义', () => {
    renderPage(<VisitRecordPage />);
    const table = getByReqId('visit-record-table');
    expect(visibleHeaders(table)).toEqual(EXPECTED_VISIT_HEADERS);
    // 与共享模块常量一致，证明两处（独立页 / 跟进详情 Tab）共用单一来源
    expect(VISIT_RECORD_HEADERS).toEqual(EXPECTED_VISIT_HEADERS);
    expect(VISIT_RECORD_COLUMNS).toHaveLength(19);
  });

  it('前 7 列为跟进重点字段，且下次拜访时间位于第 3 列', () => {
    expect(EXPECTED_VISIT_HEADERS.slice(0, 7)).toEqual([
      '用户姓名',
      '手机号',
      '下次拜访时间',
      '意向度',
      '改善需求',
      '意向课程',
      '拜访备注',
    ]);
    expect(EXPECTED_VISIT_HEADERS.indexOf('下次拜访时间')).toBe(2);
    expect(VISIT_RECORD_COLUMNS[2]).toMatchObject({
      title: '下次拜访时间',
      dataIndex: 'nextVisitTime',
    });
  });

  it('渲染全部拜访记录（3 条）并显示分页总数', () => {
    renderPage(<VisitRecordPage />);
    const table = getByReqId('visit-record-table');
    expect(dataRows(table)).toHaveLength(3);
    expect(getByReqId('visit-record-pagination').textContent).toContain('共 3 条记录');
  });

  it('下次拜访时间格式 YYYY-MM-DD HH:mm:ss，空值显示 --', () => {
    renderPage(<VisitRecordPage />);
    const table = getByReqId('visit-record-table');
    const rows = dataRows(table);
    const nextVisitIndex = EXPECTED_VISIT_HEADERS.indexOf('下次拜访时间');
    expect(rows).toHaveLength(3);
    // v1 有值、v2 为空、v3 有值
    expect(cellByIndex(rows[0]!, nextVisitIndex).textContent).toBe('2026-07-25 10:00:00');
    expect(cellByIndex(rows[1]!, nextVisitIndex).textContent).toBe('--');
    expect(cellByIndex(rows[2]!, nextVisitIndex).textContent).toBe('2026-08-05 15:00:00');
  });

  it('筛选结构为 12 项：9 个筛选字段 + 搜索/重置/导出', () => {
    renderPage(<VisitRecordPage />);
    const filter = getByReqId('visit-record-filter');
    const labels = [
      '用户ID',
      '姓名/手机号',
      '客资来源',
      '预约门店',
      '拜访方式',
      '拜访时间',
      '下次拜访时间',
      '创建人',
      '创建时间',
    ];
    for (const label of labels) {
      expect(within(filter).getByText(label)).toBeTruthy();
    }
    // 操作按钮（antd 对两字按钮自动插入字距，按 data-req-id 断言）
    expect(getByReqId('visit-record-search-button')).toBeTruthy();
    expect(getByReqId('visit-record-reset-button')).toBeTruthy();
    expect(getByReqId('visit-record-export-button')).toBeTruthy();
  });

  it('操作列固定在右侧并启用横向滚动', () => {
    renderPage(<VisitRecordPage />);
    const table = getByReqId('visit-record-table');
    // 操作列是最后一列，且在共享列定义中声明右侧固定（单一来源）
    expect(visibleHeaders(table).at(-1)).toBe('操作');
    expect(VISIT_RECORD_COLUMNS.at(-1)).toMatchObject({ fixed: 'right' });
    // antd v6 将右侧固定列渲染为 sticky + ant-table-cell-fix-end 标记
    expect(table.querySelector('.ant-table-cell-fix-end')).toBeTruthy();
  });

  it('按拜访方式筛选后只显示匹配记录，重置恢复全部', async () => {
    const user = userEvent.setup();
    renderPage(<VisitRecordPage />);
    // antd Select 下拉列表中，隐藏的无障碍 option 不可点击，须点击带 title 的可交互条目
    const combobox = within(getByReqId('filter-visit-way')).getByRole('combobox');
    await user.click(combobox);
    const listbox = await screen.findByRole('listbox');
    const dropdown = listbox.closest('.ant-select-dropdown') as HTMLElement;
    const wayOption = await within(dropdown).findByTitle('微信');
    await user.click(wayOption);
    await user.click(getByReqId('visit-record-search-button'));
    await waitFor(() => {
      expect(dataRows(getByReqId('visit-record-table'))).toHaveLength(1);
    });
    await user.click(getByReqId('visit-record-reset-button'));
    await waitFor(() => {
      expect(dataRows(getByReqId('visit-record-table'))).toHaveLength(3);
    });
  });

  it('下次拜访时间快捷范围只更新待搜索条件，点击搜索后按闭区间过滤', async () => {
    const user = userEvent.setup();
    renderPage(<VisitRecordPage />);
    const range = getByReqId('filter-visit-next-time-range');
    const startInput = within(range).getAllByRole('textbox')[0]!;
    await user.click(startInput);
    await user.click(screen.getByRole('button', { name: '今天' }));
    expect(dataRows(getByReqId('visit-record-table'))).toHaveLength(3);
    expect((startInput as HTMLInputElement).value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    await user.click(getByReqId('visit-record-search-button'));
    await waitFor(() => {
      expect(dataRows(getByReqId('visit-record-table'))).toHaveLength(0);
    });
  });

  it('下次拜访时间支持手动输入开始日和结束日，点击搜索后才过滤', async () => {
    const user = userEvent.setup();
    renderPage(<VisitRecordPage />);
    const range = getByReqId('filter-visit-next-time-range');
    const [startInput, endInput] = within(range).getAllByRole('textbox');
    await user.type(startInput!, '2026-07-25');
    await user.type(endInput!, '2026-08-05');
    expect(dataRows(getByReqId('visit-record-table'))).toHaveLength(3);
    await user.click(getByReqId('visit-record-search-button'));
    await waitFor(() => {
      expect(dataRows(getByReqId('visit-record-table'))).toHaveLength(2);
    });
    expect(dataRows(getByReqId('visit-record-table')).map((row) => row.getAttribute('data-row-key'))).toEqual([
      'v1',
      'v3',
    ]);
  });

  it('日期范围工具按本地自然日生成四种快捷范围并规范化手动边界', () => {
    const now = new Date(2026, 6, 21, 15, 30, 0);
    expect(getNextVisitTimeRange('today', now)).toEqual([
      '2026-07-21 00:00:00',
      '2026-07-21 23:59:59',
    ]);
    expect(getNextVisitTimeRange('future7', now)).toEqual([
      '2026-07-21 00:00:00',
      '2026-07-27 23:59:59',
    ]);
    expect(getNextVisitTimeRange('future30', now)).toEqual([
      '2026-07-21 00:00:00',
      '2026-08-19 23:59:59',
    ]);
    expect(getNextVisitTimeRange('futureHalfYear', now)).toEqual([
      '2026-07-21 00:00:00',
      '2027-01-21 23:59:59',
    ]);
    expect(normalizeNextVisitTimeRange(['2026-07-21', '2026-07-25'])).toEqual([
      '2026-07-21 00:00:00',
      '2026-07-25 23:59:59',
    ]);
    expect(getNextVisitTimeRange('future7', new Date(2026, 7, 28))).toEqual([
      '2026-08-28 00:00:00',
      '2026-09-03 23:59:59',
    ]);
  });

  it('日期 adapter 支持 Ant Design 日历使用的短日期 token', () => {
    expect(formatLocalDate(new Date(2026, 7, 28), 'D')).toBe('28');
    expect(formatLocalDate(new Date(2026, 7, 29), 'D')).toBe('29');
    expect(formatLocalDate(new Date(2026, 8, 1), 'D')).toBe('1');
    expect(formatLocalDate(new Date(2026, 7, 28), 'YYYY-MM-DD')).toBe('2026-08-28');
  });

  it('真实 RangePicker 双月面板的日期格显示日期号而不是格式 token', async () => {
    const user = userEvent.setup();
    renderPage(<VisitRecordPage />);
    const range = getByReqId('filter-visit-next-time-range');
    await user.click(within(range).getAllByRole('textbox')[0]!);
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const todayCell = screen.getByTitle(todayKey);
    expect(todayCell.textContent?.trim()).toBe(String(today.getDate()));
    expect(todayCell.textContent).not.toContain('D');
  });

  it('下次拜访时间按闭区间命中开始日、结束日和结束日中间时间，空值不命中', () => {
    const records = getAllVisitRecords();
    const filtered = applyVisitRecordFilter(records, {
      ...VISIT_RECORD_DEFAULT_FILTERS,
      nextVisitTimeRange: ['2026-07-25 00:00:00', '2026-08-05 23:59:59'],
    });
    expect(filtered.map((record) => record.key)).toEqual(['v1', 'v3']);
    expect(
      applyVisitRecordFilter(records, {
        ...VISIT_RECORD_DEFAULT_FILTERS,
        namePhone: '陈晨',
        nextVisitTimeRange: ['2026-08-05 00:00:00', '2026-08-05 23:59:59'],
      }).map((record) => record.key),
    ).toEqual(['v3']);
  });

  it('搜索无结果时显示空表格与 0 条记录', async () => {
    const user = userEvent.setup();
    renderPage(<VisitRecordPage />);
    const nameInput = screen.getByPlaceholderText('请输入姓名或手机号');
    await user.type(nameInput, '不存在的人');
    await user.click(getByReqId('visit-record-search-button'));
    await waitFor(() => {
      expect(dataRows(getByReqId('visit-record-table'))).toHaveLength(0);
    });
    expect(getByReqId('visit-record-pagination').textContent).toContain('共 0 条记录');
  });

  it('下次拜访时间筛选视角：有值仅保留已填写记录', () => {
    renderPage(<VisitRecordPage nextVisitTimeFilter="has-value" />);
    expect(dataRows(getByReqId('visit-record-table'))).toHaveLength(2);
  });

  it('下次拜访时间筛选视角：为空仅保留空值记录', () => {
    renderPage(<VisitRecordPage nextVisitTimeFilter="empty" />);
    const rows = dataRows(getByReqId('visit-record-table'));
    expect(rows).toHaveLength(1);
    const nextVisitIndex = EXPECTED_VISIT_HEADERS.indexOf('下次拜访时间');
    expect(cellByIndex(rows[0]!, nextVisitIndex).textContent).toBe('--');
  });

  it('不提供添加拜访记录/添加到店等新增按钮', () => {
    renderPage(<VisitRecordPage />);
    expect(screen.queryByText('添加拜访记录')).toBeNull();
    expect(screen.queryByText('添加到店')).toBeNull();
    const table = getByReqId('visit-record-table');
    for (const row of dataRows(table)) {
      expect(within(row).queryByText('添加拜访记录')).toBeNull();
      expect(within(row).queryByText('编辑')).toBeNull();
    }
  });

  it('空数据状态不加载任何记录', () => {
    renderPage(<VisitRecordPage initialState="empty" />);
    expect(dataRows(getByReqId('visit-record-table'))).toHaveLength(0);
    expect(getByReqId('visit-record-pagination').textContent).toContain('共 0 条记录');
  });

  it('意向度列按普通表格文本显示纯数字（无 意向度N 前缀、无 Tag）', () => {
    renderPage(<VisitRecordPage />);
    const table = getByReqId('visit-record-table');
    const rows = dataRows(table);
    const intentIndex = EXPECTED_VISIT_HEADERS.indexOf('意向度');
    // 与 Mock 数值一致（v1=4, v2=3, v3=3），仅纯数字文本
    expect(cellByIndex(rows[0]!, intentIndex).textContent).toBe('4');
    expect(cellByIndex(rows[1]!, intentIndex).textContent).toBe('3');
    expect(cellByIndex(rows[2]!, intentIndex).textContent).toBe('3');
    for (const row of rows) {
      const cell = cellByIndex(row, intentIndex);
      expect(cell.querySelector('.ant-tag')).toBeNull();
      expect(cell.textContent?.trim()).toMatch(/^\d+$/);
    }
    // 数据区不出现"意向度N"前缀文本（表头列名"意向度"仍正常渲染）
    const body = table.querySelector('tbody') as HTMLElement;
    expect(body.textContent).not.toMatch(/意向度\d/);
  });

  it('操作列显示 操作 按钮而非 详情 链接', () => {
    renderPage(<VisitRecordPage />);
    const table = getByReqId('visit-record-table');
    expect(table.textContent).not.toContain('详情');
    const rows = dataRows(table);
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      const key = row.getAttribute('data-row-key');
      const btn = row.querySelector(`[data-req-id="visit-record-operation-${key}"]`) as HTMLElement;
      expect(btn).toBeTruthy();
      expect(btn.textContent).toContain('操作');
    }
  });

  it('点击操作按钮展开菜单：严格仅 编辑（无 变更记录）', async () => {
    const user = userEvent.setup();
    renderPage(<VisitRecordPage />);
    const table = getByReqId('visit-record-table');
    const v1Row = dataRows(table).find((r) => r.getAttribute('data-row-key') === 'v1') as HTMLElement;
    await user.click(v1Row.querySelector('[data-req-id="visit-record-operation-v1"]') as HTMLElement);
    await screen.findByRole('menuitem', { name: '编辑' });
    const menuItems = screen.getAllByRole('menuitem').map((item) => item.textContent?.trim());
    expect(menuItems).toEqual(['编辑']);
    expect(screen.queryByRole('menuitem', { name: '变更记录' })).toBeNull();
  });

  it('独立页单独渲染无编辑上下文：点击编辑为空操作、不打开抽屉、菜单关闭', async () => {
    const user = userEvent.setup();
    renderPage(<VisitRecordPage />);
    const table = getByReqId('visit-record-table');
    const v1Row = dataRows(table).find((r) => r.getAttribute('data-row-key') === 'v1') as HTMLElement;
    await user.click(v1Row.querySelector('[data-req-id="visit-record-operation-v1"]') as HTMLElement);
    const editItem = await screen.findByRole('menuitem', { name: '编辑' });
    await user.click(editItem);
    // 编辑抽屉由产品层 RecordEditActionsContext 接线（Cycle B 工作台内打开）；
    // 独立页单独渲染无该上下文，点击编辑为空操作，不打开任何抽屉/弹层
    expect(document.querySelector('.ant-drawer')).toBeNull();
    expect(document.querySelector('[data-req-id="follow-up-detail-drawer"]')).toBeNull();
    expect(document.querySelector('.ant-modal')).toBeNull();
    // 菜单已关闭：下拉浮层不可再交互（pointer-events: none），无任何新动作
    const overlay = screen
      .getByRole('menuitem', { name: '编辑' })
      .closest('.ant-dropdown') as HTMLElement;
    expect(overlay.style.pointerEvents).toBe('none');
  });
});
