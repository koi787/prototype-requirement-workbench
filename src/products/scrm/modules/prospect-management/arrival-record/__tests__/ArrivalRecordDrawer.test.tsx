/**
 * 0012 Cycle B - 编辑到店记录 Drawer 交互测试。
 *
 * 通过产品层工作台（StoreCustomerList）驱动真实组件：Provider 由产品层共同
 * 祖先挂载，独立页/跟进详情 Tab 与编辑抽屉读取同一份运行时状态。覆盖：
 * 操作→编辑打开、用户信息只读、当前状态 Tag、表单字段完整回填、结果分析
 * 回填/修改/为空、保存后独立页列表与跟进详情 Tab 同步、取消不保存。
 *
 * 只验证用户可观察结果与正式 data-req-id，不依赖 Ant Design 私有类名。
 */
import { describe, it, expect, afterEach } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StoreCustomerList } from '../../pages/StoreCustomerList/StoreCustomerList';

afterEach(() => cleanup());

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

function cellByIndex(row: HTMLElement, index: number): HTMLElement {
  const cells = row.querySelectorAll('td');
  const cell = cells[index];
  if (!cell) throw new Error(`记录行缺少第 ${index} 列`);
  return cell as HTMLElement;
}

/** 到店记录独立页 32 列表头（结果分析为第 27 列，索引 26） */
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

async function openEditDrawer(
  props: {
    initialPage?: 'store-customer' | 'arrival-record' | 'visit-record';
    initialRecordEdit?: { kind: 'arrival' | 'visit'; recordKey: string };
    initialFollowUpDetail?: { customerKey: string; tab: 'process' | 'arrival' | 'visit' | 'call' | 'assignment' };
  } = {},
): Promise<HTMLElement> {
  render(<StoreCustomerList {...props} />);
  await waitFor(() => {
    expect(document.querySelector('[data-req-id="arrival-record-edit-drawer"]')).toBeTruthy();
  });
  return getByReqId('arrival-record-edit-drawer');
}

describe('编辑到店记录 Drawer（Cycle B）', () => {
  it('操作→编辑打开右侧 Drawer：标题 编辑到店记录、宽度 50vw、不新增路由', async () => {
    const user = userEvent.setup();
    render(<StoreCustomerList initialPage="arrival-record" />);
    const table = getByReqId('arrival-record-table');
    const a1Row = dataRows(table).find((r) => r.getAttribute('data-row-key') === 'a1') as HTMLElement;
    await user.click(a1Row.querySelector('[data-req-id="arrival-record-operation-a1"]') as HTMLElement);
    const editItem = await screen.findByRole('menuitem', { name: '编辑' });
    await user.click(editItem);

    await waitFor(() => {
      expect(document.querySelector('[data-req-id="arrival-record-edit-drawer"]')).toBeTruthy();
    });
    expect(within(getByReqId('arrival-record-edit-drawer')).getByText('编辑到店记录')).toBeTruthy();
    const contentWrapper = document.querySelector('.ant-drawer-content-wrapper') as HTMLElement;
    expect(contentWrapper).toBeTruthy();
    expect(contentWrapper.style.width).toBe('50vw');
    expect(document.querySelectorAll('.ant-drawer')).toHaveLength(1);
  });

  it('编辑回填：用户信息只读、当前状态 Tag、表单字段完整、结果分析回填', async () => {
    const drawer = await openEditDrawer({
      initialPage: 'arrival-record',
      initialRecordEdit: { kind: 'arrival', recordKey: 'a1' },
    });

    // 用户信息只读
    const userSection = drawer.querySelector('.record-drawer-section') as HTMLElement;
    expect(within(userSection).getByText('用户信息')).toBeTruthy();
    expect(within(userSection).getByText('张三')).toBeTruthy();
    expect(within(userSection).getByText('地推活动')).toBeTruthy();
    expect(within(userSection).getByText('2026-07-15 08:00:00')).toBeTruthy();
    expect(userSection.querySelector('input, textarea, .ant-select')).toBeNull();

    // 当前状态只读 Tag：已到店 + 已成交
    const statusRow = getByReqId('arrival-edit-status');
    expect(within(statusRow).getByText('已到店')).toBeTruthy();
    expect(within(statusRow).getByText('已成交')).toBeTruthy();
    expect(statusRow.querySelector('.ant-tag')).toBeTruthy();
    expect(statusRow.querySelector('select, input')).toBeNull();

    // 预约门店（单选）
    expect(within(getByReqId('arrival-edit-appointment-store')).getByText('示例旗舰店')).toBeTruthy();
    // 体验课只读关联信息（状态/体验课编号/课程名称/合同课卡编号）
    const trialContext = getByReqId('arrival-edit-trial-context');
    expect(within(trialContext).getByText('已下课')).toBeTruthy();
    expect(within(trialContext).getByText('HT2026001')).toBeTruthy();
    expect(within(trialContext).getByText('少儿体适能')).toBeTruthy();
    expect(within(trialContext).getByText('体验课A卡')).toBeTruthy();
    expect(trialContext.querySelector('input, textarea, .ant-select')).toBeNull();
    // 到店时间
    const arrivalTimeInput = within(getByReqId('arrival-edit-arrival-time')).getByRole('textbox') as HTMLInputElement;
    expect(arrivalTimeInput.value).toBe('2026-07-22 17:00:00');
    // 意向度：InputNumber 数字步进（非 Tag）
    const intentSpin = within(getByReqId('arrival-edit-intent-level')).getByRole('spinbutton') as HTMLInputElement;
    expect(intentSpin.value).toBe('5');
    expect(getByReqId('arrival-edit-intent-level').querySelector('.ant-tag')).toBeNull();
    // 改善需求（多选）/意向课程（单选）
    expect(within(getByReqId('arrival-edit-improvement-need')).getByText('改善基础体能')).toBeTruthy();
    expect(within(getByReqId('arrival-edit-intended-course')).getByText('少儿体适能课')).toBeTruthy();
    // 预约备注（多行）
    const remarkTextarea = within(getByReqId('arrival-edit-appointment-remark')).getByRole('textbox') as HTMLTextAreaElement;
    expect(remarkTextarea.value).toBe('--');
    // 结果分析分区：独立文本域且回填当前值
    const resultTextarea = within(getByReqId('arrival-edit-result-analysis')).getByRole('textbox') as HTMLTextAreaElement;
    expect(resultTextarea.value).toBe('到店体验良好，家长有明确报名意向');
    // 页脚 取消/确定
    expect(getByReqId('arrival-edit-cancel')).toBeTruthy();
    expect(getByReqId('arrival-edit-submit')).toBeTruthy();
  });

  it('当前状态 Tag：已到店/未成交 展示', async () => {
    await openEditDrawer({
      initialPage: 'arrival-record',
      initialRecordEdit: { kind: 'arrival', recordKey: 'a2' },
    });
    const statusRow = getByReqId('arrival-edit-status');
    expect(within(statusRow).getByText('已到店')).toBeTruthy();
    expect(within(statusRow).getByText('未成交')).toBeTruthy();
  });

  it('结果分析为空记录：文本域为空且不影响保存', async () => {
    await openEditDrawer({
      initialPage: 'arrival-record',
      initialRecordEdit: { kind: 'arrival', recordKey: 'a7' },
    });
    const resultTextarea = within(getByReqId('arrival-edit-result-analysis')).getByRole('textbox') as HTMLTextAreaElement;
    expect(resultTextarea.value).toBe('');
    // 必填字段完整（预约门店/到店时间/意向度/改善需求/意向课程），确定可用
    expect(getByReqId('arrival-edit-submit').getAttribute('disabled')).toBeNull();
  });

  it('修改结果分析保存后，独立页列表结果分析列同步', async () => {
    const user = userEvent.setup();
    render(
      <StoreCustomerList
        initialPage="arrival-record"
        initialRecordEdit={{ kind: 'arrival', recordKey: 'a1' }}
      />,
    );
    await waitFor(() => getByReqId('arrival-record-edit-drawer'));
    const resultTextarea = within(getByReqId('arrival-edit-result-analysis')).getByRole('textbox');
    await user.clear(resultTextarea);
    await user.type(resultTextarea, '到店体验良好，家长已报名少儿体适能');
    await user.click(getByReqId('arrival-edit-submit'));

    const table = getByReqId('arrival-record-table');
    const a1Row = dataRows(table).find((r) => r.getAttribute('data-row-key') === 'a1') as HTMLElement;
    const resultIndex = EXPECTED_ARRIVAL_HEADERS.indexOf('结果分析');
    await waitFor(() => {
      expect(cellByIndex(a1Row, resultIndex).textContent).toBe('到店体验良好，家长已报名少儿体适能');
    });
  });

  it('结果分析分区的确定保存到同一 ArrivalRecord（非第二套业务模型）', async () => {
    const user = userEvent.setup();
    render(
      <StoreCustomerList
        initialPage="arrival-record"
        initialRecordEdit={{ kind: 'arrival', recordKey: 'a1' }}
      />,
    );
    await waitFor(() => getByReqId('arrival-record-edit-drawer'));

    // 结果分析分区自带一组 确定/取消（与到店信息按钮分开）
    const resultSection = getByReqId('arrival-edit-result-analysis').closest(
      '.record-drawer-section',
    ) as HTMLElement;
    expect(resultSection.classList.contains('record-drawer-section-divider')).toBe(true);
    const resultSubmit = getByReqId('arrival-result-submit');
    const resultCancel = getByReqId('arrival-result-cancel');
    expect(resultSection.contains(resultSubmit)).toBe(true);
    expect(resultSection.contains(resultCancel)).toBe(true);

    // 点击结果分析自己的确定：修改结果分析并写入同一 ArrivalRecord
    const resultTextarea = within(getByReqId('arrival-edit-result-analysis')).getByRole('textbox');
    await user.clear(resultTextarea);
    await user.type(resultTextarea, '结果分析分区独立保存');
    await user.click(resultSubmit);

    const table = getByReqId('arrival-record-table');
    const a1Row = dataRows(table).find((r) => r.getAttribute('data-row-key') === 'a1') as HTMLElement;
    const resultIndex = EXPECTED_ARRIVAL_HEADERS.indexOf('结果分析');
    await waitFor(() => {
      expect(cellByIndex(a1Row, resultIndex).textContent).toBe('结果分析分区独立保存');
    });
  });

  it('保存后预约门店/到店时间/意向度同步到独立页列表', async () => {
    const user = userEvent.setup();
    render(
      <StoreCustomerList
        initialPage="arrival-record"
        initialRecordEdit={{ kind: 'arrival', recordKey: 'a1' }}
      />,
    );
    await waitFor(() => getByReqId('arrival-record-edit-drawer'));

    // 切换预约门店
    const storeCombo = within(getByReqId('arrival-edit-appointment-store')).getByRole('combobox');
    await user.click(storeCombo);
    const storeDropdown = (await screen.findByRole('listbox')).closest('.ant-select-dropdown') as HTMLElement;
    const storeOption = await within(storeDropdown).findByTitle('示例宝安店');
    await user.click(storeOption);
    // 修改到店时间
    const arrivalTimeInput = within(getByReqId('arrival-edit-arrival-time')).getByRole('textbox');
    await user.clear(arrivalTimeInput);
    await user.type(arrivalTimeInput, '2026-08-01 15:30:00');
    // 修改意向度
    const intentSpin = within(getByReqId('arrival-edit-intent-level')).getByRole('spinbutton');
    await user.clear(intentSpin);
    await user.type(intentSpin, '4');
    await user.click(getByReqId('arrival-edit-submit'));

    const table = getByReqId('arrival-record-table');
    const a1Row = dataRows(table).find((r) => r.getAttribute('data-row-key') === 'a1') as HTMLElement;
    await waitFor(() => {
      expect(cellByIndex(a1Row, EXPECTED_ARRIVAL_HEADERS.indexOf('预约门店')).textContent).toBe('示例宝安店');
      expect(cellByIndex(a1Row, EXPECTED_ARRIVAL_HEADERS.indexOf('到店时间')).textContent).toBe(
        '2026-08-01 15:30:00',
      );
      expect(cellByIndex(a1Row, EXPECTED_ARRIVAL_HEADERS.indexOf('意向度')).textContent).toBe('4');
    });
  });

  it('取消不保存：修改结果分析后点击取消，列表值不变', async () => {
    const user = userEvent.setup();
    render(
      <StoreCustomerList
        initialPage="arrival-record"
        initialRecordEdit={{ kind: 'arrival', recordKey: 'a1' }}
      />,
    );
    await waitFor(() => getByReqId('arrival-record-edit-drawer'));
    const resultTextarea = within(getByReqId('arrival-edit-result-analysis')).getByRole('textbox');
    await user.clear(resultTextarea);
    await user.type(resultTextarea, '不保存的内容');
    await user.click(getByReqId('arrival-edit-cancel'));

    const table = getByReqId('arrival-record-table');
    const a1Row = dataRows(table).find((r) => r.getAttribute('data-row-key') === 'a1') as HTMLElement;
    const resultIndex = EXPECTED_ARRIVAL_HEADERS.indexOf('结果分析');
    expect(cellByIndex(a1Row, resultIndex).textContent).toBe('到店体验良好，家长有明确报名意向');
  });

  it('跟进详情到店 Tab 读取同一状态实例：编辑保存后同步', async () => {
    const user = userEvent.setup();
    render(
      <StoreCustomerList
        initialFollowUpDetail={{ customerKey: '1', tab: 'arrival' }}
        initialRecordEdit={{ kind: 'arrival', recordKey: 'a1' }}
      />,
    );
    await waitFor(() => getByReqId('arrival-record-edit-drawer'));
    const resultTextarea = within(getByReqId('arrival-edit-result-analysis')).getByRole('textbox');
    await user.clear(resultTextarea);
    await user.type(resultTextarea, '跟进后确认报名，已转签单');
    await user.click(getByReqId('arrival-edit-submit'));

    const followUpTable = getByReqId('arrival-record-table');
    const a1Row = dataRows(followUpTable).find((r) => r.getAttribute('data-row-key') === 'a1') as HTMLElement;
    const resultIndex = EXPECTED_ARRIVAL_HEADERS.indexOf('结果分析');
    await waitFor(() => {
      expect(cellByIndex(a1Row, resultIndex).textContent).toBe('跟进后确认报名，已转签单');
    });
  });

  it('独立页与跟进详情同时挂载：一次保存两端表格同步（单一运行时状态）', async () => {
    const user = userEvent.setup();
    render(
      <StoreCustomerList
        initialPage="arrival-record"
        initialFollowUpDetail={{ customerKey: '1', tab: 'arrival' }}
        initialRecordEdit={{ kind: 'arrival', recordKey: 'a1' }}
      />,
    );
    await waitFor(() => getByReqId('arrival-record-edit-drawer'));

    const tables = document.querySelectorAll('[data-req-id="arrival-record-table"]');
    expect(tables.length).toBe(2);
    const followUpTable = [...tables].find((t) =>
      t.closest('[data-req-id="follow-up-detail-drawer"]'),
    ) as HTMLElement;
    const pageTable = [...tables].find((t) => !t.closest('[data-req-id="follow-up-detail-drawer"]')) as HTMLElement;

    const resultTextarea = within(getByReqId('arrival-edit-result-analysis')).getByRole('textbox');
    await user.clear(resultTextarea);
    await user.type(resultTextarea, '两端同步验证');
    await user.click(getByReqId('arrival-edit-submit'));

    const resultIndex = EXPECTED_ARRIVAL_HEADERS.indexOf('结果分析');
    const findA1Row = (table: HTMLElement) =>
      dataRows(table).find((r) => r.getAttribute('data-row-key') === 'a1') as HTMLElement;
    await waitFor(() => {
      expect(cellByIndex(findA1Row(pageTable), resultIndex).textContent).toBe('两端同步验证');
      expect(cellByIndex(findA1Row(followUpTable), resultIndex).textContent).toBe('两端同步验证');
    });
  });
});
