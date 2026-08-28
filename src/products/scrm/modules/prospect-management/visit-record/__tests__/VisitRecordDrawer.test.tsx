/**
 * 0012 Cycle B - 编辑拜访记录 Drawer 交互测试。
 *
 * 通过产品层工作台（StoreCustomerList）驱动真实组件：Provider 由产品层共同
 * 祖先挂载，独立页/跟进详情 Tab 与编辑抽屉读取同一份运行时状态。覆盖：
 * 操作→编辑打开、用户信息只读、7 字段回填、下次拜访时间回填/修改/清空、
 * 保存后独立页列表与跟进详情 Tab 同步、取消不保存。
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

/** 拜访记录独立页 19 列表头（0017 前 7 列为跟进重点字段） */
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

/** 打开编辑拜访记录抽屉并等待其渲染，返回抽屉根元素 */
async function openEditDrawer(
  props: {
    initialPage?: 'store-customer' | 'arrival-record' | 'visit-record';
    initialRecordEdit?: { kind: 'arrival' | 'visit'; recordKey: string };
    initialFollowUpDetail?: { customerKey: string; tab: 'process' | 'arrival' | 'visit' | 'call' | 'assignment' };
  } = {},
): Promise<HTMLElement> {
  render(<StoreCustomerList {...props} />);
  await waitFor(() => {
    expect(document.querySelector('[data-req-id="visit-record-edit-drawer"]')).toBeTruthy();
  });
  return getByReqId('visit-record-edit-drawer');
}

describe('编辑拜访记录 Drawer（Cycle B）', () => {
  it('操作→编辑打开右侧 Drawer：标题 编辑拜访记录、宽度 50vw、不新增路由', async () => {
    const user = userEvent.setup();
    render(<StoreCustomerList initialPage="visit-record" />);
    // 从独立页列表操作列点击进入
    const table = getByReqId('visit-record-table');
    const v1Row = dataRows(table).find((r) => r.getAttribute('data-row-key') === 'v1') as HTMLElement;
    await user.click(v1Row.querySelector('[data-req-id="visit-record-operation-v1"]') as HTMLElement);
    const editItem = await screen.findByRole('menuitem', { name: '编辑' });
    await user.click(editItem);

    await waitFor(() => {
      expect(document.querySelector('[data-req-id="visit-record-edit-drawer"]')).toBeTruthy();
    });
    expect(within(getByReqId('visit-record-edit-drawer')).getByText('编辑拜访记录')).toBeTruthy();
    // 右侧 Drawer、宽度 50vw
    const contentWrapper = document.querySelector('.ant-drawer-content-wrapper') as HTMLElement;
    expect(contentWrapper).toBeTruthy();
    expect(contentWrapper.style.width).toBe('50vw');
    // 底部页面保持可见：覆盖在既有页面上，无路由跳转（未出现新页面标题）
    expect(document.querySelectorAll('.ant-drawer')).toHaveLength(1);
  });

  it('编辑回填：用户信息只读、7 个字段顺序与值正确、下次拜访时间回填', async () => {
    const drawer = await openEditDrawer({
      initialPage: 'visit-record',
      initialRecordEdit: { kind: 'visit', recordKey: 'v1' },
    });

    // 用户信息只读（姓名/客资来源/注册时间，来自客户主数据）
    const userSection = drawer.querySelector('.record-drawer-section') as HTMLElement;
    expect(within(userSection).getByText('用户信息')).toBeTruthy();
    expect(within(userSection).getByText('张三')).toBeTruthy();
    expect(within(userSection).getByText('地推活动')).toBeTruthy();
    expect(within(userSection).getByText('2026-07-15 08:00:00')).toBeTruthy();
    // 只读区无任何输入控件
    expect(userSection.querySelector('input, textarea, .ant-select')).toBeNull();

    // 拜访方式（单选）回填历史枚举值
    expect(within(getByReqId('visit-edit-visit-way')).getByText('上门拜访')).toBeTruthy();
    // 拜访时间
    const visitTimeInput = within(getByReqId('visit-edit-visit-time')).getByRole('textbox') as HTMLInputElement;
    expect(visitTimeInput.value).toBe('2026-07-21 09:00:00');
    // 意向度：InputNumber 数字步进（非 Tag）
    const intentSpin = within(getByReqId('visit-edit-intent-level')).getByRole('spinbutton') as HTMLInputElement;
    expect(intentSpin.value).toBe('4');
    expect(getByReqId('visit-edit-intent-level').querySelector('.ant-tag')).toBeNull();
    // 改善需求（多选）回填
    expect(within(getByReqId('visit-edit-improvement-need')).getByText('咨询课程方案')).toBeTruthy();
    // 意向课程（单选）回填历史枚举值
    expect(within(getByReqId('visit-edit-intended-course')).getByText('少儿体适能课')).toBeTruthy();
    // 下次拜访时间：edit 可修改可清空，回填原值
    const nextVisitInput = within(getByReqId('visit-edit-next-visit-time')).getByRole('textbox') as HTMLInputElement;
    expect(nextVisitInput.value).toBe('2026-07-25 10:00:00');
    // 拜访备注（多行）
    const remarkTextarea = within(getByReqId('visit-edit-visit-remark')).getByRole('textbox') as HTMLTextAreaElement;
    expect(remarkTextarea.value).toBe('家长有报名意向，建议本周到店体验');
    // 页脚 取消/确定
    expect(getByReqId('visit-edit-cancel')).toBeTruthy();
    expect(getByReqId('visit-edit-submit')).toBeTruthy();
  });

  it('下次拜访时间为空记录回填空输入框', async () => {
    await openEditDrawer({
      initialPage: 'visit-record',
      initialRecordEdit: { kind: 'visit', recordKey: 'v2' },
    });
    const nextVisitInput = within(getByReqId('visit-edit-next-visit-time')).getByRole('textbox') as HTMLInputElement;
    expect(nextVisitInput.value).toBe('');
    // 空值不影响校验：其余必填字段完整
    expect(getByReqId('visit-edit-submit').getAttribute('disabled')).toBeNull();
  });

  it('修改下次拜访时间保存后，独立页列表立即同步', async () => {
    const user = userEvent.setup();
    render(
      <StoreCustomerList
        initialPage="visit-record"
        initialRecordEdit={{ kind: 'visit', recordKey: 'v1' }}
      />,
    );
    await waitFor(() => getByReqId('visit-record-edit-drawer'));
    const nextVisitInput = within(getByReqId('visit-edit-next-visit-time')).getByRole('textbox');
    await user.clear(nextVisitInput);
    await user.type(nextVisitInput, '2026-08-10 14:00:00');
    await user.click(getByReqId('visit-edit-submit'));

    const table = getByReqId('visit-record-table');
    const v1Row = dataRows(table).find((r) => r.getAttribute('data-row-key') === 'v1') as HTMLElement;
    const nextVisitIndex = EXPECTED_VISIT_HEADERS.indexOf('下次拜访时间');
    await waitFor(() => {
      expect(cellByIndex(v1Row, nextVisitIndex).textContent).toBe('2026-08-10 14:00:00');
    });
  });

  it('清空下次拜访时间保存后，独立页列表显示 --', async () => {
    const user = userEvent.setup();
    render(
      <StoreCustomerList
        initialPage="visit-record"
        initialRecordEdit={{ kind: 'visit', recordKey: 'v1' }}
      />,
    );
    await waitFor(() => getByReqId('visit-record-edit-drawer'));
    const nextVisitInput = within(getByReqId('visit-edit-next-visit-time')).getByRole('textbox');
    await user.clear(nextVisitInput);
    await user.click(getByReqId('visit-edit-submit'));

    const table = getByReqId('visit-record-table');
    const v1Row = dataRows(table).find((r) => r.getAttribute('data-row-key') === 'v1') as HTMLElement;
    const nextVisitIndex = EXPECTED_VISIT_HEADERS.indexOf('下次拜访时间');
    await waitFor(() => {
      expect(cellByIndex(v1Row, nextVisitIndex).textContent).toBe('--');
    });
  });

  it('保存后拜访备注与意向度同步到独立页列表', async () => {
    const user = userEvent.setup();
    render(
      <StoreCustomerList
        initialPage="visit-record"
        initialRecordEdit={{ kind: 'visit', recordKey: 'v1' }}
      />,
    );
    await waitFor(() => getByReqId('visit-record-edit-drawer'));

    const remarkTextarea = within(getByReqId('visit-edit-visit-remark')).getByRole('textbox');
    await user.clear(remarkTextarea);
    await user.type(remarkTextarea, '已重新预约到店体验');
    const intentSpin = within(getByReqId('visit-edit-intent-level')).getByRole('spinbutton');
    await user.clear(intentSpin);
    await user.type(intentSpin, '5');
    await user.click(getByReqId('visit-edit-submit'));

    const table = getByReqId('visit-record-table');
    const v1Row = dataRows(table).find((r) => r.getAttribute('data-row-key') === 'v1') as HTMLElement;
    await waitFor(() => {
      expect(cellByIndex(v1Row, EXPECTED_VISIT_HEADERS.indexOf('拜访备注')).textContent).toBe(
        '已重新预约到店体验',
      );
      expect(cellByIndex(v1Row, EXPECTED_VISIT_HEADERS.indexOf('意向度')).textContent).toBe('5');
    });
  });

  it('保存后改善需求（多选新增）同步到独立页列表', async () => {
    const user = userEvent.setup();
    render(
      <StoreCustomerList
        initialPage="visit-record"
        initialRecordEdit={{ kind: 'visit', recordKey: 'v1' }}
      />,
    );
    await waitFor(() => getByReqId('visit-record-edit-drawer'));

    const impCombo = within(getByReqId('visit-edit-improvement-need')).getByRole('combobox');
    await user.click(impCombo);
    const impDropdown = (await screen.findByRole('listbox')).closest('.ant-select-dropdown') as HTMLElement;
    const impOption = await within(impDropdown).findByTitle('体态调整');
    await user.click(impOption);
    await user.click(getByReqId('visit-edit-submit'));

    const table = getByReqId('visit-record-table');
    const v1Row = dataRows(table).find((r) => r.getAttribute('data-row-key') === 'v1') as HTMLElement;
    await waitFor(() => {
      expect(cellByIndex(v1Row, EXPECTED_VISIT_HEADERS.indexOf('改善需求')).textContent).toBe(
        '咨询课程方案,体态调整',
      );
    });
  });

  it('保存后意向课程（单选切换）同步到独立页列表', async () => {
    const user = userEvent.setup();
    render(
      <StoreCustomerList
        initialPage="visit-record"
        initialRecordEdit={{ kind: 'visit', recordKey: 'v1' }}
      />,
    );
    await waitFor(() => getByReqId('visit-record-edit-drawer'));

    const courseCombo = within(getByReqId('visit-edit-intended-course')).getByRole('combobox');
    await user.click(courseCombo);
    const courseDropdown = (await screen.findByRole('listbox')).closest('.ant-select-dropdown') as HTMLElement;
    const courseOption = await within(courseDropdown).findByTitle('精选私教');
    await user.click(courseOption);
    await user.click(getByReqId('visit-edit-submit'));

    const table = getByReqId('visit-record-table');
    const v1Row = dataRows(table).find((r) => r.getAttribute('data-row-key') === 'v1') as HTMLElement;
    await waitFor(() => {
      expect(cellByIndex(v1Row, EXPECTED_VISIT_HEADERS.indexOf('意向课程')).textContent).toBe('精选私教');
    });
  });

  it('取消不保存：修改后点击取消，列表值不变', async () => {
    const user = userEvent.setup();
    render(
      <StoreCustomerList
        initialPage="visit-record"
        initialRecordEdit={{ kind: 'visit', recordKey: 'v1' }}
      />,
    );
    await waitFor(() => getByReqId('visit-record-edit-drawer'));
    const nextVisitInput = within(getByReqId('visit-edit-next-visit-time')).getByRole('textbox');
    await user.clear(nextVisitInput);
    await user.type(nextVisitInput, '2026-12-31 23:59:59');
    await user.click(getByReqId('visit-edit-cancel'));

    const table = getByReqId('visit-record-table');
    const v1Row = dataRows(table).find((r) => r.getAttribute('data-row-key') === 'v1') as HTMLElement;
    const nextVisitIndex = EXPECTED_VISIT_HEADERS.indexOf('下次拜访时间');
    // 取消未保存，列表仍为原值
    expect(cellByIndex(v1Row, nextVisitIndex).textContent).toBe('2026-07-25 10:00:00');
  });

  it('跟进详情拜访 Tab 读取同一状态实例：编辑保存后同步', async () => {
    const user = userEvent.setup();
    render(
      <StoreCustomerList
        initialFollowUpDetail={{ customerKey: '1', tab: 'visit' }}
        initialRecordEdit={{ kind: 'visit', recordKey: 'v1' }}
      />,
    );
    await waitFor(() => getByReqId('visit-record-edit-drawer'));
    const nextVisitInput = within(getByReqId('visit-edit-next-visit-time')).getByRole('textbox');
    await user.clear(nextVisitInput);
    await user.type(nextVisitInput, '2026-09-01 10:00:00');
    await user.click(getByReqId('visit-edit-submit'));

    // 跟进详情抽屉保持打开，其拜访 Tab 表格立即显示新时间
    const followUpTable = getByReqId('visit-record-table');
    const v1Row = dataRows(followUpTable).find((r) => r.getAttribute('data-row-key') === 'v1') as HTMLElement;
    const nextVisitIndex = EXPECTED_VISIT_HEADERS.indexOf('下次拜访时间');
    await waitFor(() => {
      expect(cellByIndex(v1Row, nextVisitIndex).textContent).toBe('2026-09-01 10:00:00');
    });
  });

  it('独立页与跟进详情同时挂载：一次保存两端表格同步（单一运行时状态）', async () => {
    const user = userEvent.setup();
    render(
      <StoreCustomerList
        initialPage="visit-record"
        initialFollowUpDetail={{ customerKey: '1', tab: 'visit' }}
        initialRecordEdit={{ kind: 'visit', recordKey: 'v1' }}
      />,
    );
    await waitFor(() => getByReqId('visit-record-edit-drawer'));

    // 两端各渲染一张拜访表格（独立页 + 跟进详情 Tab）
    const tables = document.querySelectorAll('[data-req-id="visit-record-table"]');
    expect(tables.length).toBe(2);
    const followUpTable = [...tables].find((t) =>
      t.closest('[data-req-id="follow-up-detail-drawer"]'),
    ) as HTMLElement;
    const pageTable = [...tables].find((t) => !t.closest('[data-req-id="follow-up-detail-drawer"]')) as HTMLElement;

    // 修改拜访备注并保存
    const remarkTextarea = within(getByReqId('visit-edit-visit-remark')).getByRole('textbox');
    await user.clear(remarkTextarea);
    await user.type(remarkTextarea, '两端同步验证');
    await user.click(getByReqId('visit-edit-submit'));

    const remarkIndex = EXPECTED_VISIT_HEADERS.indexOf('拜访备注');
    const findV1Row = (table: HTMLElement) =>
      dataRows(table).find((r) => r.getAttribute('data-row-key') === 'v1') as HTMLElement;
    await waitFor(() => {
      expect(cellByIndex(findV1Row(pageTable), remarkIndex).textContent).toBe('两端同步验证');
      expect(cellByIndex(findV1Row(followUpTable), remarkIndex).textContent).toBe('两端同步验证');
    });
  });
});
