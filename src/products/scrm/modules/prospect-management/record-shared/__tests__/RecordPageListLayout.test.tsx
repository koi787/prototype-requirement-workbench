/**
 * 0012 Cycle C - 到店/拜访记录独立页列表区域固定可视框架布局测试。
 *
 * 产品经理确认：独立业务列表区域应为固定可视框架——数据少时只显示实际数据行，
 * 剩余区域保持空白，横向滚动条位于列表区域底部，分页不随数据条数上下跳动。
 * 实现位于 record-shared/recordPageList.css（对两个独立页 area 内层 antd
 * 横向滚动容器 .ant-table-content 设置 min-height: 600px，空白区在滚动容器
 * 内部、横向滚动条之上；min-height 而非固定 height，数据多时自然增高，不因
 * antd 内联 overflow-y:hidden 裁切数据）。
 *
 * 覆盖：
 *  1. 到店记录独立页 3 条数据时列表容器仍保持固定 min-height；
 *  2. 拜访记录独立页 3 条数据时同样保持；
 *  3. 空数据时列表容器不塌陷，空态占位位于列表主体区域内；
 *  4. 不生成额外假数据行（真实数据行数 = Mock 记录数）；
 *  5. 分页仍位于表格容器之后（DOM 顺序稳定，分页内容完整）；
 *  6. 跟进详情 Drawer 内到店/拜访 Tab 的表格不受固定高度影响；
 *  7. 门店客户 52 列表格不受固定高度影响。
 *
 * 验证方式：以稳定 data-req-id + computed min-height 规则断言，不做像素级
 * 硬断言（jsdom 不进行真实布局，getBoundingClientRect 恒为 0）。
 */
import { describe, it, expect, afterEach } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { ArrivalRecordPage } from '../../arrival-record/ArrivalRecordPage';
import { VisitRecordPage } from '../../visit-record/VisitRecordPage';
import { RecordRuntimeStoreProvider } from '..';
import { StoreCustomerList } from '../../pages/StoreCustomerList/StoreCustomerList';

afterEach(() => cleanup());

/** 独立页依赖产品层单一运行时状态，测试用同一 Provider 包裹。 */
function renderRecordPage(ui: ReactElement) {
  return render(<RecordRuntimeStoreProvider>{ui}</RecordRuntimeStoreProvider>);
}

function getByReqId(id: string): HTMLElement {
  const elements = document.querySelectorAll(`[data-req-id="${id}"]`);
  if (elements.length !== 1) {
    throw new Error(`预期 data-req-id="${id}" 严格唯一，实际为 ${elements.length} 个`);
  }
  return elements[0] as HTMLElement;
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

/** 独立页列表区域实际数据行 key（Mock 记录 key，用于证明无额外假数据行） */
function rowKeys(table: HTMLElement): string[] {
  return dataRows(table).map((row) => row.getAttribute('data-row-key') as string);
}

/** 读取独立页 area 内层 antd 横向滚动容器的 computed min-height */
function contentMinHeight(areaReqId: string): string {
  const area = getByReqId(areaReqId);
  const content = area.querySelector('.ant-table-content') as HTMLElement;
  expect(content).toBeTruthy();
  return getComputedStyle(content).minHeight;
}

describe('记录页列表区域固定可视框架（Cycle C）', () => {
  it('到店记录独立页 3 条数据时列表容器仍保持固定 min-height', async () => {
    const user = userEvent.setup();
    renderRecordPage(<ArrivalRecordPage />);
    // 先以全部 7 条渲染，再按 张三 搜索得到 3 条，验证框架不随数据条数缩短
    const nameInput = screen.getByPlaceholderText('请输入姓名或手机号');
    await user.type(nameInput, '张三');
    await user.click(getByReqId('arrival-record-search-button'));
    await waitFor(() => {
      expect(dataRows(getByReqId('arrival-record-table'))).toHaveLength(3);
    });
    expect(contentMinHeight('arrival-record-table-area')).toBe('600px');
    // 横向滚动容器仍在（滚动条位于列表区域底部）
    const content = getByReqId('arrival-record-table-area').querySelector(
      '.ant-table-content',
    ) as HTMLElement;
    expect(getComputedStyle(content).overflowX).toBe('auto');
  });

  it('拜访记录独立页 3 条数据时同样保持固定 min-height', () => {
    renderRecordPage(<VisitRecordPage />);
    expect(dataRows(getByReqId('visit-record-table'))).toHaveLength(3);
    expect(contentMinHeight('visit-record-table-area')).toBe('600px');
  });

  it('空数据时列表容器不塌陷，空态占位位于列表主体区域内', () => {
    renderRecordPage(<ArrivalRecordPage initialState="empty" />);
    const table = getByReqId('arrival-record-table');
    expect(dataRows(table)).toHaveLength(0);
    expect(contentMinHeight('arrival-record-table-area')).toBe('600px');
    // 空态占位在滚动容器（.ant-table-content）内部 = 列表主体区域内，且带实际文案
    const content = getByReqId('arrival-record-table-area').querySelector(
      '.ant-table-content',
    ) as HTMLElement;
    const placeholder = content.querySelector('.ant-table-placeholder') as HTMLElement;
    expect(placeholder).toBeTruthy();
    expect(placeholder.textContent?.trim().length).toBeGreaterThan(0);
  });

  it('不生成额外假数据行（真实数据行数 = Mock 记录数）', () => {
    // 到店：全部 7 条 Mock，行 key 恰好为 a1..a7，无重复数据行
    renderRecordPage(<ArrivalRecordPage />);
    const arrivalTable = getByReqId('arrival-record-table');
    expect(rowKeys(arrivalTable)).toEqual(['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7']);
    expect(arrivalTable.querySelectorAll('tbody tr[data-row-key]').length).toBe(7);
    // tbody 中唯一非数据行是 antd 宽度测量行，不是伪造的空白占位行
    const arrivalTbody = arrivalTable.querySelector('tbody') as HTMLElement;
    const arrivalNonData = [...arrivalTbody.querySelectorAll('tr:not([data-row-key])')];
    expect(arrivalNonData.length).toBe(1);
    expect(arrivalNonData[0]!.classList.contains('ant-table-measure-row')).toBe(true);
    cleanup();

    // 拜访：全部 3 条 Mock，行 key 恰好为 v1..v3，无重复数据行
    renderRecordPage(<VisitRecordPage />);
    const visitTable = getByReqId('visit-record-table');
    expect(rowKeys(visitTable)).toEqual(['v1', 'v2', 'v3']);
    expect(visitTable.querySelectorAll('tbody tr[data-row-key]').length).toBe(3);
    const visitTbody = visitTable.querySelector('tbody') as HTMLElement;
    const visitNonData = [...visitTbody.querySelectorAll('tr:not([data-row-key])')];
    expect(visitNonData.length).toBe(1);
    expect(visitNonData[0]!.classList.contains('ant-table-measure-row')).toBe(true);
  });

  it('分页仍位于表格容器之后，分页内容完整', () => {
    renderRecordPage(<VisitRecordPage />);
    const area = getByReqId('visit-record-table-area');
    const pagination = getByReqId('visit-record-pagination');
    // 分页整体位于列表容器之后（DOM 顺序稳定）
    expect(area.compareDocumentPosition(pagination) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    // 分页内容完整：左侧总条数 + 右侧 每页条数/上一页/页码/下一页
    expect(within(pagination).getByText('共 3 条记录')).toBeTruthy();
    expect(within(pagination).getByText('10条/页')).toBeTruthy();
    expect(within(pagination).getByText('上一页')).toBeTruthy();
    expect(within(pagination).getByText('1 / 1')).toBeTruthy();
    expect(within(pagination).getByText('下一页')).toBeTruthy();
  });

  it('跟进详情 Drawer 内到店/拜访 Tab 表格不受固定高度影响', () => {
    render(
      <StoreCustomerList
        initialFollowUpDetail={{ customerKey: '1', tab: 'arrival' }}
      />,
    );
    const drawerArrivalTable = document.querySelector(
      '[data-req-id="follow-up-detail-drawer"] [data-req-id="arrival-record-table"]',
    ) as HTMLElement;
    expect(drawerArrivalTable).toBeTruthy();
    // 该表格不在独立页 area 容器内，故不命中固定高度规则
    expect(drawerArrivalTable.closest('[data-req-id="arrival-record-table-area"]')).toBeNull();
    const arrivalContent = drawerArrivalTable.querySelector('.ant-table-content') as HTMLElement;
    expect(getComputedStyle(arrivalContent).minHeight).not.toBe('600px');
    cleanup();

    render(
      <StoreCustomerList
        initialFollowUpDetail={{ customerKey: '1', tab: 'visit' }}
      />,
    );
    const drawerVisitTable = document.querySelector(
      '[data-req-id="follow-up-detail-drawer"] [data-req-id="visit-record-table"]',
    ) as HTMLElement;
    expect(drawerVisitTable).toBeTruthy();
    const visitContent = drawerVisitTable.querySelector('.ant-table-content') as HTMLElement;
    expect(getComputedStyle(visitContent).minHeight).not.toBe('600px');
  });

  it('门店客户 52 列表格不受固定高度影响', () => {
    render(<StoreCustomerList />);
    const customerArea = document.querySelector('[data-req-id="table-area"]') as HTMLElement;
    expect(customerArea).toBeTruthy();
    const content = customerArea.querySelector('.ant-table-content') as HTMLElement;
    expect(content).toBeTruthy();
    expect(getComputedStyle(content).minHeight).not.toBe('600px');
  });
});
