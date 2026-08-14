/**
 * 0012 Cycle B3 - 到店记录变更记录只读 Drawer 测试。
 *
 * 覆盖任务单 §10 规定的 10 个场景：操作菜单 编辑/变更记录、点击打开 Drawer、
 * 标题正确、有数据展示 变更前/变更后/变更时间/操作人、空态、分页、只读无保存、
 * 编辑到店不增加变更记录、新增到店不生成变更记录、到店32列/拜访19列/门店客户52列
 * 无回退。
 *
 * 变更记录为独立只读 Mock（arrivalChangeRecordMockData），与运行时 store 分离：
 * create/update 到店记录不写入变更历史。测试通过产品层工作台（StoreCustomerList）
 * 驱动真实组件，只验证用户可观察结果与正式 data-req-id。
 */
import { describe, it, expect, afterEach } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { StoreCustomerList } from '../../pages/StoreCustomerList/StoreCustomerList';
import { ARRIVAL_RECORD_COLUMNS } from '../arrivalRecordColumns';
import { VISIT_RECORD_COLUMNS } from '../../visit-record/visitRecordColumns';
import { ALL_COLUMNS } from '../../pages/StoreCustomerList/columns';
import {
  getAllArrivalChangeRecords,
  getArrivalChangeRecordsByRecordKey,
} from '../arrivalChangeRecordMockData';
import { RecordRuntimeStoreProvider, useRecordRuntimeStore } from '../../record-shared';

afterEach(() => cleanup());

function getByReqId(id: string): HTMLElement {
  const elements = document.querySelectorAll(`[data-req-id="${id}"]`);
  if (elements.length !== 1) {
    throw new Error(`预期 data-req-id="${id}" 严格唯一，实际为 ${elements.length} 个`);
  }
  return elements[0] as HTMLElement;
}

/** 读取表格数据行（按 data-row-key 首次出现去重） */
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

/** 读取表格内实际渲染表头（按首次出现去重） */
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

/**
 * 变更记录机制 harness：直接调用运行时 store 的编辑/新增方法（与编辑/新增
 * Drawer 保存时相同的代码路径），验证其不会改变独立只读变更记录 Mock。
 */
function StoreMechanismHarness() {
  const { getArrivalRecords, updateArrivalRecord, createArrivalRecord } =
    useRecordRuntimeStore();
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  return (
    <div>
      <span data-testid="a1-change-before">
        {getArrivalChangeRecordsByRecordKey('a1').length}
      </span>
      <button onClick={() => updateArrivalRecord('a1', { appointmentStore: '示例二店' })}>
        编辑保存a1
      </button>
      <span data-testid="a1-change-after">
        {getArrivalChangeRecordsByRecordKey('a1').length}
      </span>
      <span data-testid="total-change-before">{getAllArrivalChangeRecords().length}</span>
      <button
        onClick={() => {
          const base = getArrivalRecords().find((record) => record.key === 'a1');
          if (!base) throw new Error('缺少 a1 到店记录');
          createArrivalRecord({ ...base, key: 'a-b3-new', id: 'AR-B3-NEW' });
          setCreatedKey('a-b3-new');
        }}
      >
        新增到店
      </button>
      <span data-testid="total-change-after">{getAllArrivalChangeRecords().length}</span>
      {createdKey && (
        <span data-testid="new-record-change-count">
          {getArrivalChangeRecordsByRecordKey(createdKey).length}
        </span>
      )}
    </div>
  );
}

describe('到店记录变更记录 Drawer（Cycle B3）', () => {
  it('到店记录操作菜单仍有 编辑 + 变更记录（顺序固定）', async () => {
    const user = userEvent.setup();
    render(<StoreCustomerList initialPage="arrival-record" />);
    const table = getByReqId('arrival-record-table');
    const a1Row = dataRows(table).find((row) => row.getAttribute('data-row-key') === 'a1') as HTMLElement;
    await user.click(a1Row.querySelector('[data-req-id="arrival-record-operation-a1"]') as HTMLElement);
    await screen.findByRole('menuitem', { name: '编辑' });
    const menuItems = screen.getAllByRole('menuitem').map((item) => item.textContent?.trim());
    expect(menuItems).toEqual(['编辑', '变更记录']);
  });

  it('点击操作菜单 变更记录 打开 ArrivalChangeRecordDrawer', async () => {
    const user = userEvent.setup();
    render(<StoreCustomerList initialPage="arrival-record" />);
    const table = getByReqId('arrival-record-table');
    const a1Row = dataRows(table).find((row) => row.getAttribute('data-row-key') === 'a1') as HTMLElement;
    await user.click(a1Row.querySelector('[data-req-id="arrival-record-operation-a1"]') as HTMLElement);
    const changeItem = await screen.findByRole('menuitem', { name: '变更记录' });
    await user.click(changeItem);
    await waitFor(() => {
      expect(document.querySelector('[data-req-id="arrival-change-record-drawer"]')).toBeTruthy();
    });
  });

  it('Drawer 标题为 变更记录（右侧只读 Drawer）', async () => {
    render(<StoreCustomerList initialPage="arrival-record" initialChangeRecordArrivalKey="a1" />);
    await waitFor(() => getByReqId('arrival-change-record-drawer'));
    const drawer = getByReqId('arrival-change-record-drawer');
    expect(within(drawer).getByText('变更记录')).toBeTruthy();
    const contentWrapper = document.querySelector('.ant-drawer-content-wrapper') as HTMLElement;
    expect(contentWrapper).toBeTruthy();
    expect(contentWrapper.style.width).toBe('50vw');
  });

  it('有数据状态展示 变更前/变更后/变更时间/操作人', async () => {
    render(<StoreCustomerList initialPage="arrival-record" initialChangeRecordArrivalKey="a1" />);
    await waitFor(() => getByReqId('arrival-change-record-drawer'));
    const table = getByReqId('arrival-change-record-table');
    expect(visibleHeaders(table)).toEqual(['变更时间', '操作人', '字段', '变更前', '变更后']);
    const body = table.querySelector('tbody') as HTMLElement;
    // 变更时间 / 操作人 / 字段 / 变更前 / 变更后 内容均实际展示
    expect(body.textContent).toContain('2026-07-22 18:00:00');
    expect(body.textContent).toContain('王经理');
    expect(body.textContent).toContain('预约门店');
    expect(body.textContent).toContain('示例旗舰店');
    expect(body.textContent).toContain('示例二店');
  });

  it('空数据状态：真实后台风格空态（暂无数据 + 共 0 条）', async () => {
    // 与 Storybook 一致的中文语言环境（真实后台空态文案 "暂无数据"）
    render(
      <ConfigProvider locale={zhCN}>
        <StoreCustomerList
          initialPage="arrival-record"
          initialChangeRecordArrivalKey="a2"
          arrivalChangeRecordInitialState="empty"
        />
      </ConfigProvider>,
    );
    await waitFor(() => getByReqId('arrival-change-record-drawer'));
    const table = getByReqId('arrival-change-record-table');
    expect(table.textContent).toContain('暂无数据');
    expect(getByReqId('arrival-change-record-pagination').textContent).toContain('共 0 条记录');
  });

  it('前端 Mock 分页正确：a1 共 12 条，第 1 页 10 条，翻页后第 2 页 2 条', async () => {
    const user = userEvent.setup();
    render(<StoreCustomerList initialPage="arrival-record" initialChangeRecordArrivalKey="a1" />);
    await waitFor(() => getByReqId('arrival-change-record-drawer'));
    const pagination = getByReqId('arrival-change-record-pagination');
    expect(pagination.textContent).toContain('共 12 条记录');
    expect(pagination.textContent).toContain('1 / 2');
    expect(dataRows(getByReqId('arrival-change-record-table'))).toHaveLength(10);

    await user.click(within(pagination).getByRole('button', { name: '下一页' }));
    expect(pagination.textContent).toContain('2 / 2');
    expect(dataRows(getByReqId('arrival-change-record-table'))).toHaveLength(2);
  });

  it('Drawer 只读：无编辑/确定/保存业务行为', async () => {
    render(<StoreCustomerList initialPage="arrival-record" initialChangeRecordArrivalKey="a1" />);
    await waitFor(() => getByReqId('arrival-change-record-drawer'));
    const drawer = getByReqId('arrival-change-record-drawer');
    expect(within(drawer).queryByText('确定')).toBeNull();
    expect(within(drawer).queryByText('保存')).toBeNull();
    expect(within(drawer).queryByText('编辑')).toBeNull();
    // 明细为只读文本，无文本输入/多行输入等可编辑表单控件
    expect(drawer.querySelector('.ant-input, textarea')).toBeNull();
  });

  it('编辑到店记录不会自动增加变更记录数量', async () => {
    const user = userEvent.setup();
    render(
      <RecordRuntimeStoreProvider>
        <StoreMechanismHarness />
      </RecordRuntimeStoreProvider>,
    );
    // 基线：a1 变更记录固定 12 条（独立只读 Mock）
    expect(screen.getByTestId('a1-change-before').textContent).toBe('12');
    await user.click(screen.getByRole('button', { name: '编辑保存a1' }));
    // 调用运行时 store 原位更新（与编辑 Drawer 确定保存同一代码路径），不产生变更记录
    expect(screen.getByTestId('a1-change-after').textContent).toBe('12');
  });

  it('新增到店不会自动生成变更记录', async () => {
    const user = userEvent.setup();
    render(
      <RecordRuntimeStoreProvider>
        <StoreMechanismHarness />
      </RecordRuntimeStoreProvider>,
    );
    expect(screen.getByTestId('total-change-before').textContent).toBe('12');
    await user.click(screen.getByRole('button', { name: '新增到店' }));
    // 调用运行时 store 前插新记录（与添加到店 Drawer 确定同一代码路径），不生成变更记录
    expect(screen.getByTestId('total-change-after').textContent).toBe('12');
    expect(screen.getByTestId('new-record-change-count').textContent).toBe('0');
  });

  it('到店32列/拜访19列/门店客户52列无回退', () => {
    expect(ARRIVAL_RECORD_COLUMNS).toHaveLength(32);
    expect(VISIT_RECORD_COLUMNS).toHaveLength(19);
    expect(ALL_COLUMNS).toHaveLength(52);
  });
});
