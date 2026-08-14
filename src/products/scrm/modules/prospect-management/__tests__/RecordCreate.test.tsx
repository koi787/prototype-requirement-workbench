/**
 * 0012 Cycle B2 - 新增到店 / 新增拜访记录 create 模式复用与入口接线测试。
 *
 * 通过产品层工作台（StoreCustomerList）驱动真实组件：ArrivalRecordDrawer /
 * VisitRecordDrawer 同一组件两种模式（mode="create"/"edit"），Provider 由产品层
 * 共同祖先挂载，独立页/跟进详情 Tab 与新增抽屉读取同一份运行时状态。覆盖：
 * - 两个真实业务入口：跟进详情操作条"添加到店 / 添加拜访记录"、门店客户行操作
 *   菜单"添加到店 / 添加拜访记录"；
 * - create 状态：标题、用户信息只读上下文、意向度默认 1、无历史记录残留、
 *   下次拜访时间默认空/可填、结果分析默认空；
 * - 保存：新建记录前插到同一运行时状态，独立页与跟进详情 Tab 立即可见同一份记录，
 *   抽屉关闭；取消/×不创建；
 * - 回归：edit 模式回填/保存不受影响、多层 Drawer（跟进详情 70vw 保持在下层、
 *   create 50vw 覆盖其上）、独立归集页无新增按钮。
 *
 * 只验证用户可观察结果与正式 data-req-id，不依赖 Ant Design 私有类名。
 */
import { describe, it, expect, afterEach } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StoreCustomerList } from '../pages/StoreCustomerList/StoreCustomerList';

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

function rowKeys(table: HTMLElement): string[] {
  return dataRows(table).map((row) => row.getAttribute('data-row-key') as string);
}

function cellByIndex(row: HTMLElement, index: number): HTMLElement {
  const cells = row.querySelectorAll('td');
  const cell = cells[index];
  if (!cell) throw new Error(`记录行缺少第 ${index} 列`);
  return cell as HTMLElement;
}

/** 到店记录独立页 32 列表头 */
const EXPECTED_ARRIVAL_HEADERS = [
  'ID', '用户姓名', '用户ID', '微信号', '手机号', '客资来源', '预约门店', '到店时间',
  '是否到店', '是否成交', '成交金额', '课程类型', '是否有体验课', '体验课状态',
  '是否签到', '体验课上课教练', '体验课下课时间', '合同号', '体验课卡合同状态',
  '体验课卡', '实付金额', '体验课卡获取时间', '意向度', '改善需求', '意向课程',
  '预约备注', '结果分析', '创建人', '创建时间', '更新人', '更新时间', '操作',
];

/** 拜访记录独立页 19 列表头 */
const EXPECTED_VISIT_HEADERS = [
  'ID', '用户姓名', '用户ID', '微信号', '手机号', '客资来源', '下次拜访时间',
  '预约门店', '拜访方式', '意向度', '改善需求', '意向课程', '拜访备注', '拜访时间',
  '创建人', '创建时间', '更新人', '更新时间', '操作',
];

/** 从打开的下拉浮层中按 title/aria-label 定位真实选项并返回。
 *  antd 会为已关闭/正在退场（ant-slide-up-leave）的下拉残留 DOM，并渲染
 *  隐藏测量列表（#test-id_list）；这里只匹配"打开中"（无退场动画）下拉内的
 *  .ant-select-item-option，按 title 或 aria-label 定位。 */
async function findVisibleOption(label: string): Promise<HTMLElement> {
  let found: HTMLElement | null = null;
  await waitFor(() => {
    const dropdowns = Array.from(
      document.querySelectorAll<HTMLElement>(
        '.ant-select-dropdown:not(.ant-select-dropdown-hidden):not(.ant-slide-up-leave)',
      ),
    );
    for (const dropdown of dropdowns) {
      const candidate = [...dropdown.querySelectorAll<HTMLElement>('.ant-select-item-option')].find(
        (el) =>
          el.getAttribute('title') === label || el.getAttribute('aria-label') === label,
      );
      if (candidate) {
        found = candidate;
        return;
      }
    }
    throw new Error(`未在可见下拉中找到选项：${label}`);
  });
  if (!found) {
    throw new Error(`未在可见下拉中找到选项：${label}`);
  }
  return found;
}

async function selectOption(user: ReturnType<typeof userEvent.setup>, label: string) {
  await user.click(await findVisibleOption(label));
}

/** 填写到店 create 必填字段（预约门店/到店时间/改善需求/意向课程；意向度默认 1） */
async function fillArrivalCreateForm(user: ReturnType<typeof userEvent.setup>) {
  const storeCombo = within(getByReqId('arrival-edit-appointment-store')).getByRole('combobox');
  await user.click(storeCombo);
  await selectOption(user, '示例旗舰店');

  const arrivalTimeInput = within(getByReqId('arrival-edit-arrival-time')).getByRole('textbox');
  await user.clear(arrivalTimeInput);
  await user.type(arrivalTimeInput, '2026-08-02 10:30:00');

  const needCombo = within(getByReqId('arrival-edit-improvement-need')).getByRole('combobox');
  await user.click(needCombo);
  await selectOption(user, '体态调整');

  const courseCombo = within(getByReqId('arrival-edit-intended-course')).getByRole('combobox');
  await user.click(courseCombo);
  await selectOption(user, '精选团课');
}

/** 填写拜访 create 必填字段（拜访方式/拜访时间/改善需求/意向课程；意向度默认 1；
 *  下次拜访时间可空可填） */
async function fillVisitCreateForm(
  user: ReturnType<typeof userEvent.setup>,
  nextVisitTime?: string,
) {
  const wayCombo = within(getByReqId('visit-edit-visit-way')).getByRole('combobox');
  await user.click(wayCombo);
  await selectOption(user, '微信');

  const visitTimeInput = within(getByReqId('visit-edit-visit-time')).getByRole('textbox');
  await user.clear(visitTimeInput);
  await user.type(visitTimeInput, '2026-08-03 14:00:00');

  const needCombo = within(getByReqId('visit-edit-improvement-need')).getByRole('combobox');
  await user.click(needCombo);
  await selectOption(user, '体态调整');

  const courseCombo = within(getByReqId('visit-edit-intended-course')).getByRole('combobox');
  await user.click(courseCombo);
  await selectOption(user, '精选团课');

  if (nextVisitTime !== undefined) {
    const nextInput = within(getByReqId('visit-edit-next-visit-time')).getByRole('textbox');
    await user.clear(nextInput);
    await user.type(nextInput, nextVisitTime);
  }
}

describe('添加到店 create（Cycle B2）', () => {
  it('跟进详情入口：操作条"添加到店"打开 create Drawer（标题/用户上下文/意向度默认 1/无历史残留）', async () => {
    const user = userEvent.setup();
    render(<StoreCustomerList initialFollowUpDetail={{ customerKey: '1', tab: 'process' }} />);
    await waitFor(() => getByReqId('follow-up-detail-drawer'));

    // 跟进流程操作条真实入口
    await user.click(getByReqId('followup-add-arrival'));
    await waitFor(() => getByReqId('arrival-record-create-drawer'));
    const drawer = getByReqId('arrival-record-create-drawer');

    expect(within(drawer).getByText('添加到店')).toBeTruthy();
    // 用户信息只读：当前客户上下文（张三）
    const userSection = drawer.querySelector('.record-drawer-section') as HTMLElement;
    expect(within(userSection).getByText('张三')).toBeTruthy();
    expect(within(userSection).getByText('地推活动')).toBeTruthy();
    expect(within(userSection).getByText('2026-07-15 08:00:00')).toBeTruthy();
    // 意向度默认 1
    const intentSpin = within(getByReqId('arrival-edit-intent-level')).getByRole('spinbutton') as HTMLInputElement;
    expect(intentSpin.value).toBe('1');
    // 无历史记录残留：预约门店/到店时间/结果分析为空，体验课未选
    const storeCombo = within(getByReqId('arrival-edit-appointment-store')).getByRole('combobox');
    expect(storeCombo.getAttribute('value')).toBe('');
    const arrivalTimeInput = within(getByReqId('arrival-edit-arrival-time')).getByRole('textbox') as HTMLInputElement;
    expect(arrivalTimeInput.value).toBe('');
    const resultTextarea = within(getByReqId('arrival-edit-result-analysis')).getByRole('textbox') as HTMLTextAreaElement;
    expect(resultTextarea.value).toBe('');
    // create 无既有状态：不展示 已到店/已成交 只读 Tag
    expect(document.querySelector('[data-req-id="arrival-edit-status"]')).toBeNull();
    // 体验课为课程类型 Select（非只读关联信息）
    expect(getByReqId('arrival-create-trial-course').querySelector('.ant-select')).toBeTruthy();
    expect(document.querySelector('[data-req-id="arrival-edit-trial-context"]')).toBeNull();
    // 多层 Drawer：跟进详情一级 70vw 保持在下层
    expect(document.querySelector('[data-req-id="follow-up-detail-drawer"]')).toBeTruthy();
    const widths = Array.from(
      document.querySelectorAll<HTMLElement>('.ant-drawer-content-wrapper'),
    ).map((el) => el.style.width);
    expect(widths).toContain('70vw');
    expect(widths).toContain('50vw');
  });

  it('门店客户行操作菜单入口："添加到店"打开同一 create Drawer（客户上下文正确）', async () => {
    const user = userEvent.setup();
    render(<StoreCustomerList />);
    await waitFor(() => getByReqId('operation-menu-trigger-1'));
    await user.click(getByReqId('operation-menu-trigger-1'));
    const addArrival = await screen.findByRole('menuitem', { name: '添加到店' });
    await user.click(addArrival);

    await waitFor(() => getByReqId('arrival-record-create-drawer'));
    const drawer = getByReqId('arrival-record-create-drawer');
    expect(within(drawer).getByText('添加到店')).toBeTruthy();
    expect(within(drawer).getByText('张三')).toBeTruthy();
    const intentSpin = within(getByReqId('arrival-edit-intent-level')).getByRole('spinbutton') as HTMLInputElement;
    expect(intentSpin.value).toBe('1');
  });

  it('保存新增到店：独立页与跟进详情 Tab 同步同一份状态，结果分析保存，抽屉关闭', async () => {
    const user = userEvent.setup();
    render(
      <StoreCustomerList
        initialPage="arrival-record"
        initialFollowUpDetail={{ customerKey: '1', tab: 'arrival' }}
        initialRecordCreate={{ kind: 'arrival', customerKey: '1' }}
      />,
    );
    await waitFor(() => getByReqId('arrival-record-create-drawer'));
    // 独立页 + 跟进详情 Tab 两个到店表格均挂载
    const tables = document.querySelectorAll('[data-req-id="arrival-record-table"]');
    expect(tables.length).toBe(2);
    const pageTable = [...tables].find(
      (t) => !t.closest('[data-req-id="follow-up-detail-drawer"]'),
    ) as HTMLElement;
    const followUpTable = [...tables].find((t) =>
      t.closest('[data-req-id="follow-up-detail-drawer"]'),
    ) as HTMLElement;
    expect(rowKeys(pageTable)).toHaveLength(7);

    // 填写必填 + 结果分析 + 体验课课程类型
    await fillArrivalCreateForm(user);
    const resultTextarea = within(getByReqId('arrival-edit-result-analysis')).getByRole('textbox');
    await user.type(resultTextarea, '到店体验良好，意向明确');
    const trialCombo = within(getByReqId('arrival-create-trial-course')).getByRole('combobox');
    await user.click(trialCombo);
    await selectOption(user, '少儿体适能');
    await user.click(getByReqId('arrival-edit-submit'));

    // 保存后：抽屉关闭，独立页 +1（7→8）；跟进详情 Tab 展示同一份状态但按客户过滤
    // （张三原 3 条 + 新增 1 条 = 4）。同一 state 实例，非复制数组。
    await waitFor(() => {
      expect(document.querySelector('[data-req-id="arrival-record-create-drawer"]')).toBeNull();
      expect(rowKeys(pageTable)).toHaveLength(8);
      expect(rowKeys(followUpTable)).toHaveLength(4);
    });
    const resultIndex = EXPECTED_ARRIVAL_HEADERS.indexOf('结果分析');
    const newPageRow = dataRows(pageTable)[0] as HTMLElement;
    const newFollowUpRow = dataRows(followUpTable)[0] as HTMLElement;
    expect(newPageRow.getAttribute('data-row-key')).toBe('a8');
    expect(cellByIndex(newPageRow, resultIndex).textContent).toBe('到店体验良好，意向明确');
    expect(cellByIndex(newFollowUpRow, resultIndex).textContent).toBe('到店体验良好，意向明确');
    // 新记录基础字段：已到店、未成交、意向度 1
    expect(cellByIndex(newPageRow, EXPECTED_ARRIVAL_HEADERS.indexOf('是否到店')).textContent).toBe('已到店');
    expect(cellByIndex(newPageRow, EXPECTED_ARRIVAL_HEADERS.indexOf('是否成交')).textContent).toBe('未成交');
    expect(cellByIndex(newPageRow, EXPECTED_ARRIVAL_HEADERS.indexOf('意向度')).textContent).toBe('1');
  });

  it('取消不创建：点击取消后关闭 Drawer，列表不新增记录', async () => {
    const user = userEvent.setup();
    render(<StoreCustomerList initialPage="arrival-record" initialRecordCreate={{ kind: 'arrival', customerKey: '1' }} />);
    await waitFor(() => getByReqId('arrival-record-create-drawer'));
    await fillArrivalCreateForm(user);
    await user.click(getByReqId('arrival-edit-cancel'));

    await waitFor(() => {
      expect(document.querySelector('[data-req-id="arrival-record-create-drawer"]')).toBeNull();
    });
    expect(rowKeys(getByReqId('arrival-record-table'))).toHaveLength(7);
  });

  it('再次打开 create 复位默认值：无上一次输入残留', async () => {
    const user = userEvent.setup();
    render(<StoreCustomerList initialFollowUpDetail={{ customerKey: '1', tab: 'process' }} />);
    await waitFor(() => getByReqId('follow-up-detail-drawer'));

    // 第一次打开并填写后取消
    await user.click(getByReqId('followup-add-arrival'));
    await waitFor(() => getByReqId('arrival-record-create-drawer'));
    await fillArrivalCreateForm(user);
    const arrivalTimeInput = within(getByReqId('arrival-edit-arrival-time')).getByRole('textbox') as HTMLInputElement;
    expect(arrivalTimeInput.value).toBe('2026-08-02 10:30:00');
    await user.click(getByReqId('arrival-edit-cancel'));
    await waitFor(() => expect(document.querySelector('[data-req-id="arrival-record-create-drawer"]')).toBeNull());

    // 再次从跟进详情入口打开：复位为默认值（无残留）
    await user.click(getByReqId('followup-add-arrival'));
    await waitFor(() => getByReqId('arrival-record-create-drawer'));
    const resetTimeInput = within(getByReqId('arrival-edit-arrival-time')).getByRole('textbox') as HTMLInputElement;
    expect(resetTimeInput.value).toBe('');
    const resetStoreCombo = within(getByReqId('arrival-edit-appointment-store')).getByRole('combobox');
    expect(resetStoreCombo.getAttribute('value')).toBe('');
    const intentSpin = within(getByReqId('arrival-edit-intent-level')).getByRole('spinbutton') as HTMLInputElement;
    expect(intentSpin.value).toBe('1');
  });
});

describe('添加拜访记录 create（Cycle B2）', () => {
  it('跟进详情入口：操作条"添加拜访记录"打开 create Drawer（标题/用户上下文/意向度默认 1/下次拜访时间默认空）', async () => {
    const user = userEvent.setup();
    render(<StoreCustomerList initialFollowUpDetail={{ customerKey: '1', tab: 'process' }} />);
    await waitFor(() => getByReqId('follow-up-detail-drawer'));

    await user.click(getByReqId('followup-add-visit'));
    await waitFor(() => getByReqId('visit-record-create-drawer'));
    const drawer = getByReqId('visit-record-create-drawer');

    expect(within(drawer).getByText('添加拜访记录')).toBeTruthy();
    const userSection = drawer.querySelector('.record-drawer-section') as HTMLElement;
    expect(within(userSection).getByText('张三')).toBeTruthy();
    expect(within(userSection).getByText('地推活动')).toBeTruthy();
    const intentSpin = within(getByReqId('visit-edit-intent-level')).getByRole('spinbutton') as HTMLInputElement;
    expect(intentSpin.value).toBe('1');
    // 下次拜访时间默认空（可空非必填）
    const nextInput = within(getByReqId('visit-edit-next-visit-time')).getByRole('textbox') as HTMLInputElement;
    expect(nextInput.value).toBe('');
    // 拜访方式为空（必填未选）
    const wayCombo = within(getByReqId('visit-edit-visit-way')).getByRole('combobox');
    expect(wayCombo.getAttribute('value')).toBe('');
    // 多层 Drawer：跟进详情 70vw 在下层
    expect(document.querySelector('[data-req-id="follow-up-detail-drawer"]')).toBeTruthy();
  });

  it('门店客户行操作菜单入口："添加拜访记录"打开同一 create Drawer（客户上下文正确）', async () => {
    const user = userEvent.setup();
    render(<StoreCustomerList />);
    await waitFor(() => getByReqId('operation-menu-trigger-1'));
    await user.click(getByReqId('operation-menu-trigger-1'));
    const addVisit = await screen.findByRole('menuitem', { name: '添加拜访记录' });
    await user.click(addVisit);

    await waitFor(() => getByReqId('visit-record-create-drawer'));
    const drawer = getByReqId('visit-record-create-drawer');
    expect(within(drawer).getByText('添加拜访记录')).toBeTruthy();
    expect(within(drawer).getByText('张三')).toBeTruthy();
    const intentSpin = within(getByReqId('visit-edit-intent-level')).getByRole('spinbutton') as HTMLInputElement;
    expect(intentSpin.value).toBe('1');
  });

  it('保存新增拜访记录：下次拜访时间可填，独立页与跟进详情 Tab 同步', async () => {
    const user = userEvent.setup();
    render(
      <StoreCustomerList
        initialPage="visit-record"
        initialFollowUpDetail={{ customerKey: '1', tab: 'visit' }}
        initialRecordCreate={{ kind: 'visit', customerKey: '1' }}
      />,
    );
    await waitFor(() => getByReqId('visit-record-create-drawer'));
    const tables = document.querySelectorAll('[data-req-id="visit-record-table"]');
    expect(tables.length).toBe(2);
    const pageTable = [...tables].find(
      (t) => !t.closest('[data-req-id="follow-up-detail-drawer"]'),
    ) as HTMLElement;
    const followUpTable = [...tables].find((t) =>
      t.closest('[data-req-id="follow-up-detail-drawer"]'),
    ) as HTMLElement;
    expect(rowKeys(pageTable)).toHaveLength(3);

    await fillVisitCreateForm(user, '2026-08-20 10:00:00');
    await user.click(getByReqId('visit-edit-submit'));

    await waitFor(() => {
      expect(document.querySelector('[data-req-id="visit-record-create-drawer"]')).toBeNull();
      expect(rowKeys(pageTable)).toHaveLength(4);
      // 跟进详情 Tab 按客户过滤：张三原 2 条 + 新增 1 条 = 3
      expect(rowKeys(followUpTable)).toHaveLength(3);
    });
    const nextVisitIndex = EXPECTED_VISIT_HEADERS.indexOf('下次拜访时间');
    const newPageRow = dataRows(pageTable)[0] as HTMLElement;
    const newFollowUpRow = dataRows(followUpTable)[0] as HTMLElement;
    expect(newPageRow.getAttribute('data-row-key')).toBe('v4');
    expect(cellByIndex(newPageRow, nextVisitIndex).textContent).toBe('2026-08-20 10:00:00');
    expect(cellByIndex(newFollowUpRow, nextVisitIndex).textContent).toBe('2026-08-20 10:00:00');
  });

  it('下次拜访时间留空保存：新记录该列为空（保存后抽屉关闭，独立页 +1）', async () => {
    const user = userEvent.setup();
    render(<StoreCustomerList initialPage="visit-record" initialRecordCreate={{ kind: 'visit', customerKey: '1' }} />);
    await waitFor(() => getByReqId('visit-record-create-drawer'));
    await fillVisitCreateForm(user);
    await user.click(getByReqId('visit-edit-submit'));
    await waitFor(() => {
      expect(document.querySelector('[data-req-id="visit-record-create-drawer"]')).toBeNull();
      expect(rowKeys(getByReqId('visit-record-table'))).toHaveLength(4);
    });
    const nextVisitIndex = EXPECTED_VISIT_HEADERS.indexOf('下次拜访时间');
    const newPageRow = dataRows(getByReqId('visit-record-table'))[0] as HTMLElement;
    expect(newPageRow.getAttribute('data-row-key')).toBe('v4');
    expect(cellByIndex(newPageRow, nextVisitIndex).textContent).toBe('--');
  });

  it('取消不创建：点击取消后关闭 Drawer，列表不新增记录', async () => {
    const user = userEvent.setup();
    render(<StoreCustomerList initialPage="visit-record" initialRecordCreate={{ kind: 'visit', customerKey: '1' }} />);
    await waitFor(() => getByReqId('visit-record-create-drawer'));
    await fillVisitCreateForm(user);
    await user.click(getByReqId('visit-edit-cancel'));
    await waitFor(() => {
      expect(document.querySelector('[data-req-id="visit-record-create-drawer"]')).toBeNull();
    });
    expect(rowKeys(getByReqId('visit-record-table'))).toHaveLength(3);
  });
});

describe('create 回归（Cycle B2 不改动既有 edit / 独立页 / 需求）', () => {
  it('edit 模式不受影响：编辑到店记录仍回填既有记录（非 create 默认值）', async () => {
    render(
      <StoreCustomerList
        initialPage="arrival-record"
        initialRecordEdit={{ kind: 'arrival', recordKey: 'a1' }}
      />,
    );
    await waitFor(() => getByReqId('arrival-record-edit-drawer'));
    expect(document.querySelector('[data-req-id="arrival-record-create-drawer"]')).toBeNull();
    const drawer = getByReqId('arrival-record-edit-drawer');
    expect(within(drawer).getByText('编辑到店记录')).toBeTruthy();
    // 状态 Tag 仍在 edit 展示
    expect(getByReqId('arrival-edit-status')).toBeTruthy();
    // 回填 a1 而非 create 默认：意向度 5、结果分析有值
    const intentSpin = within(getByReqId('arrival-edit-intent-level')).getByRole('spinbutton') as HTMLInputElement;
    expect(intentSpin.value).toBe('5');
    const resultTextarea = within(getByReqId('arrival-edit-result-analysis')).getByRole('textbox') as HTMLTextAreaElement;
    expect(resultTextarea.value).toBe('到店体验良好，家长有明确报名意向');
  });

  it('edit 模式不受影响：编辑拜访记录仍回填既有记录', async () => {
    render(
      <StoreCustomerList
        initialPage="visit-record"
        initialRecordEdit={{ kind: 'visit', recordKey: 'v1' }}
      />,
    );
    await waitFor(() => getByReqId('visit-record-edit-drawer'));
    expect(document.querySelector('[data-req-id="visit-record-create-drawer"]')).toBeNull();
    const drawer = getByReqId('visit-record-edit-drawer');
    expect(within(drawer).getByText('编辑拜访记录')).toBeTruthy();
    const nextInput = within(getByReqId('visit-edit-next-visit-time')).getByRole('textbox') as HTMLInputElement;
    expect(nextInput.value).toBe('2026-07-25 10:00:00');
  });

  it('独立归集页无新增按钮：到店/拜访独立页不渲染任何新增入口', () => {
    const { unmount } = render(<StoreCustomerList initialPage="arrival-record" />);
    expect(document.querySelector('[data-req-id="arrival-record-create-drawer"]')).toBeNull();
    expect(document.querySelector('[data-req-id="arrival-page-title"]')).toBeTruthy();
    unmount();
    render(<StoreCustomerList initialPage="visit-record" />);
    expect(document.querySelector('[data-req-id="visit-record-create-drawer"]')).toBeNull();
    expect(document.querySelector('[data-req-id="visit-page-title"]')).toBeTruthy();
  });

  it('列结构不变：到店 32 列、拜访 19 列，下次拜访时间为第 7 列', () => {
    const { unmount } = render(<StoreCustomerList initialPage="arrival-record" />);
    const arrivalHeaders = Array.from(
      getByReqId('arrival-record-table').querySelectorAll('thead th'),
    ).map((th) => (th.textContent ?? '').trim());
    expect(arrivalHeaders).toEqual(EXPECTED_ARRIVAL_HEADERS);
    unmount();

    render(<StoreCustomerList initialPage="visit-record" />);
    const visitHeaders = Array.from(
      getByReqId('visit-record-table').querySelectorAll('thead th'),
    ).map((th) => (th.textContent ?? '').trim());
    expect(visitHeaders).toEqual(EXPECTED_VISIT_HEADERS);
  });
});
