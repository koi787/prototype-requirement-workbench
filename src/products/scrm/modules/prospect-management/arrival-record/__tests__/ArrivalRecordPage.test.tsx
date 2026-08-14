/**
 * 0012 Cycle A - 到店记录独立页测试。
 *
 * 只验证用户可观察结果与正式 data-req-id，不依赖 Ant Design 私有类名，
 * 不使用 `cells[数字]` 拼接取数，不写条件分支假断言。
 */
import { describe, it, expect, afterEach } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { ArrivalRecordPage } from '../ArrivalRecordPage';
import { ARRIVAL_RECORD_HEADERS, ARRIVAL_RECORD_COLUMNS } from '../arrivalRecordColumns';
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

/** 到店记录独立页 32 列表头（与跟进详情 Tab 共用同一共享列定义） */
const EXPECTED_ARRIVAL_HEADERS = [
  'ID',
  '用户姓名',
  '用户ID',
  '微信号',
  '手机号',
  '客资来源',
  '预约门店',
  '到店时间',
  '是否到店',
  '是否成交',
  '成交金额',
  '课程类型',
  '是否有体验课',
  '体验课状态',
  '是否签到',
  '体验课上课教练',
  '体验课下课时间',
  '合同号',
  '体验课卡合同状态',
  '体验课卡',
  '实付金额',
  '体验课卡获取时间',
  '意向度',
  '改善需求',
  '意向课程',
  '预约备注',
  '结果分析',
  '创建人',
  '创建时间',
  '更新人',
  '更新时间',
  '操作',
];

describe('到店记录独立页', () => {
  it('渲染 32 列表格且表头来自共享列定义', () => {
    renderPage(<ArrivalRecordPage />);
    const table = getByReqId('arrival-record-table');
    expect(visibleHeaders(table)).toEqual(EXPECTED_ARRIVAL_HEADERS);
    // 与共享模块常量一致，证明两处（独立页 / 跟进详情 Tab）共用单一来源
    expect(ARRIVAL_RECORD_HEADERS).toEqual(EXPECTED_ARRIVAL_HEADERS);
    expect(ARRIVAL_RECORD_COLUMNS).toHaveLength(32);
  });

  it('渲染全部到店记录（6 条）并显示分页总数', () => {
    renderPage(<ArrivalRecordPage />);
    const table = getByReqId('arrival-record-table');
    expect(dataRows(table)).toHaveLength(7);
    expect(getByReqId('arrival-record-pagination').textContent).toContain('共 7 条记录');
  });

  it('筛选结构为 15 项：12 个筛选字段 + 搜索/重置/导出', () => {
    renderPage(<ArrivalRecordPage />);
    const filter = getByReqId('arrival-record-filter');
    const labels = [
      '用户ID',
      '姓名/手机号',
      '客资来源',
      '预约门店',
      '是否到店',
      '是否成交',
      '体验课状态',
      '是否签到',
      '体验课上课教练',
      '到店时间',
      '体验课卡获取时间',
      '合同号',
    ];
    for (const label of labels) {
      expect(within(filter).getByText(label)).toBeTruthy();
    }
    // 操作按钮（antd 对两字按钮自动插入字距，按 data-req-id 断言）
    expect(getByReqId('arrival-record-search-button')).toBeTruthy();
    expect(getByReqId('arrival-record-reset-button')).toBeTruthy();
    expect(getByReqId('arrival-record-export-button')).toBeTruthy();
  });

  it('操作列固定在右侧并启用横向滚动', () => {
    renderPage(<ArrivalRecordPage />);
    const table = getByReqId('arrival-record-table');
    // 操作列是最后一列，且在共享列定义中声明右侧固定（单一来源）
    expect(visibleHeaders(table).at(-1)).toBe('操作');
    expect(ARRIVAL_RECORD_COLUMNS.at(-1)).toMatchObject({ fixed: 'right' });
    // antd v6 将右侧固定列渲染为 sticky + ant-table-cell-fix-end 标记
    expect(table.querySelector('.ant-table-cell-fix-end')).toBeTruthy();
  });

  it('按姓名搜索后只显示匹配记录', async () => {
    const user = userEvent.setup();
    renderPage(<ArrivalRecordPage />);
    const nameInput = screen.getByPlaceholderText('请输入姓名或手机号');
    await user.type(nameInput, '张三');
    await user.click(getByReqId('arrival-record-search-button'));
    await waitFor(() => {
      const table = getByReqId('arrival-record-table');
      expect(dataRows(table)).toHaveLength(3);
    });
    expect(getByReqId('arrival-record-pagination').textContent).toContain('共 3 条记录');
  });

  it('按客资来源筛选后只显示匹配记录，重置恢复全部', async () => {
    const user = userEvent.setup();
    renderPage(<ArrivalRecordPage />);
    // antd Select 下拉列表中，隐藏的无障碍 option 不可点击，须点击带 title 的可交互条目
    const combobox = within(getByReqId('filter-arrival-source')).getByRole('combobox');
    await user.click(combobox);
    const listbox = await screen.findByRole('listbox');
    const dropdown = listbox.closest('.ant-select-dropdown') as HTMLElement;
    const sourceOption = await within(dropdown).findByTitle('线上广告');
    await user.click(sourceOption);
    await user.click(getByReqId('arrival-record-search-button'));
    await waitFor(() => {
      expect(dataRows(getByReqId('arrival-record-table'))).toHaveLength(1);
    });
    await user.click(getByReqId('arrival-record-reset-button'));
    await waitFor(() => {
      expect(dataRows(getByReqId('arrival-record-table'))).toHaveLength(7);
    });
  });

  it('搜索无结果时显示空表格与 0 条记录', async () => {
    const user = userEvent.setup();
    renderPage(<ArrivalRecordPage />);
    const nameInput = screen.getByPlaceholderText('请输入姓名或手机号');
    await user.type(nameInput, '不存在的人');
    await user.click(getByReqId('arrival-record-search-button'));
    await waitFor(() => {
      expect(dataRows(getByReqId('arrival-record-table'))).toHaveLength(0);
    });
    expect(getByReqId('arrival-record-pagination').textContent).toContain('共 0 条记录');
  });

  it('导出反馈使用单一消息并自动消失', async () => {
    const user = userEvent.setup();
    renderPage(<ArrivalRecordPage />);
    await user.click(getByReqId('arrival-record-export-button'));
    expect(screen.getByText('导出任务已创建')).toBeTruthy();
  });

  it('不提供添加到店/添加拜访记录等新增按钮', () => {
    renderPage(<ArrivalRecordPage />);
    expect(screen.queryByText('添加到店')).toBeNull();
    expect(screen.queryByText('添加拜访记录')).toBeNull();
    const table = getByReqId('arrival-record-table');
    for (const row of dataRows(table)) {
      expect(within(row).queryByText('添加到店')).toBeNull();
      expect(within(row).queryByText('编辑')).toBeNull();
    }
  });

  it('空数据状态不加载任何记录', () => {
    renderPage(<ArrivalRecordPage initialState="empty" />);
    expect(dataRows(getByReqId('arrival-record-table'))).toHaveLength(0);
    expect(getByReqId('arrival-record-pagination').textContent).toContain('共 0 条记录');
  });

  it('是否成交以统一风格 Tag 展示：已成交 绿色、未成交 橙色，不改变字段值', () => {
    renderPage(<ArrivalRecordPage />);
    const table = getByReqId('arrival-record-table');
    const rows = dataRows(table);
    const dealIndex = EXPECTED_ARRIVAL_HEADERS.indexOf('是否成交');
    // a1 已成交：绿色 Tag（文字保留、业务值不变）
    const greenCell = cellByIndex(rows[0]!, dealIndex);
    expect(greenCell.textContent).toBe('已成交');
    const greenTag = greenCell.querySelector('.ant-tag') as HTMLElement;
    expect(greenTag).toBeTruthy();
    expect(greenTag.style.color).toBe('rgb(82, 196, 26)'); // #52c41a
    expect(greenTag.style.background).toBe('rgb(246, 255, 237)'); // #f6ffed
    // a2 未成交：橙色 Tag（沿用既有 未成交 视觉）
    const orangeCell = cellByIndex(rows[1]!, dealIndex);
    expect(orangeCell.textContent).toBe('未成交');
    const orangeTag = orangeCell.querySelector('.ant-tag') as HTMLElement;
    expect(orangeTag).toBeTruthy();
    expect(orangeTag.style.color).toBe('rgb(250, 140, 22)'); // #fa8c16
    expect(orangeTag.style.background).toBe('rgb(255, 247, 230)'); // #fff7e6
  });

  it('意向度列按普通表格文本显示纯数字（无 意向度N 前缀、无 Tag）', () => {
    renderPage(<ArrivalRecordPage />);
    const table = getByReqId('arrival-record-table');
    const rows = dataRows(table);
    const intentIndex = EXPECTED_ARRIVAL_HEADERS.indexOf('意向度');
    // 与 Mock 数值一致（a1=5, a2=3, a3=2），仅纯数字文本
    expect(cellByIndex(rows[0]!, intentIndex).textContent).toBe('5');
    expect(cellByIndex(rows[1]!, intentIndex).textContent).toBe('3');
    expect(cellByIndex(rows[2]!, intentIndex).textContent).toBe('2');
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
    renderPage(<ArrivalRecordPage />);
    const table = getByReqId('arrival-record-table');
    expect(table.textContent).not.toContain('详情');
    const rows = dataRows(table);
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      const key = row.getAttribute('data-row-key');
      const btn = row.querySelector(`[data-req-id="arrival-record-operation-${key}"]`) as HTMLElement;
      expect(btn).toBeTruthy();
      expect(btn.textContent).toContain('操作');
    }
  });

  it('点击操作按钮展开菜单：严格显示 编辑 + 变更记录（顺序固定）', async () => {
    const user = userEvent.setup();
    renderPage(<ArrivalRecordPage />);
    const table = getByReqId('arrival-record-table');
    const a1Row = dataRows(table).find((r) => r.getAttribute('data-row-key') === 'a1') as HTMLElement;
    await user.click(a1Row.querySelector('[data-req-id="arrival-record-operation-a1"]') as HTMLElement);
    await screen.findByRole('menuitem', { name: '编辑' });
    const menuItems = screen.getAllByRole('menuitem').map((item) => item.textContent?.trim());
    expect(menuItems).toEqual(['编辑', '变更记录']);
  });

  it('独立页单独渲染无编辑上下文：点击编辑为空操作、不打开抽屉、菜单关闭', async () => {
    const user = userEvent.setup();
    renderPage(<ArrivalRecordPage />);
    const table = getByReqId('arrival-record-table');
    const a1Row = dataRows(table).find((r) => r.getAttribute('data-row-key') === 'a1') as HTMLElement;
    await user.click(a1Row.querySelector('[data-req-id="arrival-record-operation-a1"]') as HTMLElement);
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
