/**
 * 0012 Cycle B - DateTimeField 日期时间选择器修复测试。
 *
 * 修复目标：点击到店时间 / 拜访时间 / 下次拜访时间 字段应直接弹出真实的
 * 日期 + 时间选择面板（年月头、日期网格、上一月/下一月、时/分/秒），而不是
 * "外层输入 → 浮层里又出现一个 DatePicker 输入框"的嵌套结构。
 *
 * 覆盖（对应任务单 §七）：
 * 1. 三个字段点击均弹出真实日历面板（共用组件单测 + create 抽屉集成）；
 * 2. 面板内无第二个日期输入框（面板 input 数 = 0）；
 * 3. 日期可选择；
 * 4. 时间可选择（时/分/秒三列）；
 * 5. 确定后输入框展示 YYYY-MM-DD HH:mm:ss；
 * 6. 下次拜访时间 allowClear 可清空（空值回调 null）；
 * 7. edit 回填原值；
 * 8. create 默认空 + 占位符；
 * 9. 选择日期后面板不自动关闭（确定才提交），抽屉不受影响、保持打开；
 * 10. 面板 portal 到 body（不裁切于 Drawer overflow），点击外部关闭。
 *
 * 面板断言只依赖 rc-picker 稳定结构（ant-picker-dropdown / ant-picker-content
 * / ant-picker-time-panel-column），不依赖私有样式类；关闭中的下拉以
 * ant-slide-up-leave 标记（与 Select 下拉一致），不计入可见面板。
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { useState } from 'react';
import { cleanup, render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTimeField } from '../DateTimeField';
import { StoreCustomerList } from '../../pages/StoreCustomerList/StoreCustomerList';

afterEach(() => cleanup());

function getByReqId(id: string): HTMLElement {
  const elements = document.querySelectorAll(`[data-req-id="${id}"]`);
  if (elements.length !== 1) {
    throw new Error(`预期 data-req-id="${id}" 严格唯一，实际为 ${elements.length} 个`);
  }
  return elements[0] as HTMLElement;
}

/** 可见面板：排除 hidden 与关闭动画中的下拉（与 Select 下拉同规则） */
function visibleDropdowns(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('.ant-picker-dropdown')).filter(
    (d) =>
      !d.classList.contains('ant-picker-dropdown-hidden') &&
      !d.classList.contains('ant-slide-up-leave'),
  );
}

function todayStr(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** DateTimeField 受控组件的有状态包装：交互后展示值随 onChange 更新 */
function StatefulDateTimeField({ initialValue = null }: { initialValue?: string | null }) {
  const [value, setValue] = useState<string | null>(initialValue);
  return <DateTimeField value={value} onChange={setValue} dataReqId="dt-field" />;
}

async function openPanel(
  user: ReturnType<typeof userEvent.setup>,
  field: HTMLElement,
): Promise<HTMLElement> {
  await user.click(field);
  await waitFor(() => expect(visibleDropdowns().length).toBe(1));
  const panel = visibleDropdowns()[0];
  if (!panel) throw new Error('点击字段后未出现日期面板');
  return panel;
}

/** 在真实面板中点今天的日期格（title 即 YYYY-MM-DD），再选 时/分/秒，再点确定 */
async function pickDateTime(user: ReturnType<typeof userEvent.setup>, panel: HTMLElement) {
  const target = todayStr();
  const cell = Array.from(panel.querySelectorAll<HTMLElement>('.ant-picker-cell')).find(
    (c) => c.getAttribute('title') === target && !c.classList.contains('ant-picker-cell-disabled'),
  );
  expect(cell).toBeTruthy();
  if (cell) await user.click(cell);
  const cols = panel.querySelectorAll('.ant-picker-time-panel-column');
  expect(cols.length).toBe(3);
  const pickTime = async (colIndex: number, label: string) => {
    const col = cols[colIndex];
    if (!col) throw new Error(`时间面板缺少第 ${colIndex} 列`);
    const option = Array.from(col.querySelectorAll<HTMLElement>(
      '.ant-picker-time-panel-cell',
    )).find((c) => c.textContent?.trim() === label);
    expect(option).toBeTruthy();
    if (option) await user.click(option);
  };
  await pickTime(0, '10');
  await pickTime(1, '30');
  await pickTime(2, '00');
  const okBtn = panel.querySelector('.ant-picker-ok button') as HTMLElement | null;
  expect(okBtn).toBeTruthy();
  if (okBtn) await user.click(okBtn);
}

const DT_REGEX = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

describe('DateTimeField 共用组件（面板修复）', () => {
  it('点击字段弹出真实日历面板：年月头 + 日期网格 + 时/分/秒三列，面板内无第二个日期输入框', async () => {
    const user = userEvent.setup();
    render(<StatefulDateTimeField />);
    const field = getByReqId('dt-field');
    const input = within(field).getByRole('textbox');

    const panel = await openPanel(user, input);

    // 真实日历：年月头部（含上一月/下一月/上一年/下一年）、日期网格、时间面板三列
    const header = panel.querySelector('.ant-picker-header');
    expect(header).toBeTruthy();
    expect(header?.textContent ?? '').toMatch(/\d{4}/);
    expect(panel.querySelector('.ant-picker-header button[aria-label*="Previous month"]')).toBeTruthy();
    expect(panel.querySelector('.ant-picker-header button[aria-label*="Next month"]')).toBeTruthy();
    const grid = panel.querySelector('.ant-picker-content');
    expect(grid).toBeTruthy();
    expect(grid?.querySelectorAll('tbody tr').length).toBeGreaterThanOrEqual(5);
    expect(panel.querySelectorAll('.ant-picker-time-panel-column').length).toBe(3);

    // 不出现"浮层里又一个日期输入框"：面板内没有任何 input
    expect(panel.querySelectorAll('input')).toHaveLength(0);
    // 可见文本输入仅外层一个（隐藏 DatePicker 壳不进无障碍树）
    expect(within(field).getAllByRole('textbox')).toHaveLength(1);
  });

  it('选择日期与时间后点确定：输入框展示 YYYY-MM-DD HH:mm:ss', async () => {
    const user = userEvent.setup();
    render(<StatefulDateTimeField />);
    const input = within(getByReqId('dt-field')).getByRole('textbox') as HTMLInputElement;

    const panel = await openPanel(user, input);
    await pickDateTime(user, panel);

    await waitFor(() => expect(visibleDropdowns()).toHaveLength(0));
    expect(input.value).toBe(`${todayStr()} 10:30:00`);
  });

  it('选择日期后点确定，onChange 回调收到 YYYY-MM-DD HH:mm:ss 字符串', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateTimeField value={null} onChange={onChange} dataReqId="dt-field" />);

    const panel = await openPanel(user, within(getByReqId('dt-field')).getByRole('textbox'));
    await pickDateTime(user, panel);

    await waitFor(() => expect(visibleDropdowns()).toHaveLength(0));
    expect(onChange).toHaveBeenCalledWith(`${todayStr()} 10:30:00`);
  });

  it('选择日期后面板不自动关闭（showTime 需点确定提交），点外部后关闭且值不变', async () => {
    const user = userEvent.setup();
    render(<StatefulDateTimeField />);
    const input = within(getByReqId('dt-field')).getByRole('textbox') as HTMLInputElement;

    const panel = await openPanel(user, input);
    const cell = Array.from(panel.querySelectorAll<HTMLElement>('.ant-picker-cell')).find(
      (c) => c.getAttribute('title') === todayStr(),
    );
    if (cell) await user.click(cell);
    // 点日期不提交，面板保持打开
    expect(visibleDropdowns().length).toBe(1);

    // 点面板外部 → 面板关闭，值未写入
    await user.click(document.body);
    await waitFor(() => expect(visibleDropdowns()).toHaveLength(0));
    expect(input.value).toBe('');
  });

  it('allowClear 清空：值清空并回调 null，且不打开面板（下次拜访时间可清空场景）', async () => {
    const user = userEvent.setup();
    render(<StatefulDateTimeField initialValue="2026-08-10 14:00:00" />);
    const input = within(getByReqId('dt-field')).getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('2026-08-10 14:00:00');

    const clearIcon = (input.closest('.ant-input-affix-wrapper') as HTMLElement)?.querySelector(
      '.ant-input-clear-icon',
    ) as HTMLElement | null;
    expect(clearIcon).toBeTruthy();
    if (clearIcon) await user.click(clearIcon);
    expect(input.value).toBe('');
    // 点清除不打开面板
    expect(visibleDropdowns()).toHaveLength(0);

    // 纯回调断言：清空回调 null
    const spy = vi.fn();
    render(<DateTimeField value="2026-08-10 14:00:00" onChange={spy} dataReqId="dt-clear" />);
    const clearInput = within(getByReqId('dt-clear')).getByRole('textbox') as HTMLInputElement;
    const clearIcon2 = (clearInput.closest('.ant-input-affix-wrapper') as HTMLElement)?.querySelector(
      '.ant-input-clear-icon',
    ) as HTMLElement | null;
    if (clearIcon2) await user.click(clearIcon2);
    expect(spy).toHaveBeenCalledWith(null);
  });

  it('edit 回填：value 原值展示为 YYYY-MM-DD HH:mm:ss', () => {
    render(<DateTimeField value="2026-08-02 10:30:00" onChange={() => {}} dataReqId="dt-field" />);
    const input = within(getByReqId('dt-field')).getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('2026-08-02 10:30:00');
  });

  it('create 默认：value 为 null 时输入框为空并显示占位符', () => {
    render(
      <DateTimeField
        value={null}
        onChange={() => {}}
        placeholder="请选择到店时间"
        dataReqId="dt-field"
      />,
    );
    const input = within(getByReqId('dt-field')).getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('');
    expect(input.getAttribute('placeholder')).toBe('请选择到店时间');
  });
});

describe('DateTimeField 在业务抽屉中的三字段集成（面板修复）', () => {
  it('添加到店 create：点击到店时间弹出真实面板（portal 到 body 不被 Drawer 裁切），选择后格式正确、抽屉保持打开', async () => {
    const user = userEvent.setup();
    render(<StoreCustomerList initialRecordCreate={{ kind: 'arrival', customerKey: '1' }} />);
    await waitFor(() => expect(getByReqId('arrival-record-create-drawer')).toBeTruthy());
    const field = getByReqId('arrival-edit-arrival-time');
    const input = within(field).getByRole('textbox') as HTMLInputElement;

    const panel = await openPanel(user, input);
    // 面板是 body 级 portal 子节点（不在 Drawer 内容树内），不被 Drawer overflow 裁切
    expect(document.body.contains(panel)).toBe(true);
    expect(panel.closest('.ant-drawer')).toBeNull();
    expect(panel.querySelectorAll('.ant-picker-time-panel-column').length).toBe(3);

    await pickDateTime(user, panel);
    await waitFor(() => expect(visibleDropdowns()).toHaveLength(0));
    expect(input.value).toBe(`${todayStr()} 10:30:00`);
    // 选择日期不影响业务抽屉（保持打开）
    expect(getByReqId('arrival-record-create-drawer')).toBeTruthy();
  });

  it('添加拜访记录 create：拜访时间与下次拜访时间 均弹出真实面板，面板互不串扰、外部点击关闭', async () => {
    const user = userEvent.setup();
    render(<StoreCustomerList initialRecordCreate={{ kind: 'visit', customerKey: '1' }} />);
    await waitFor(() => expect(getByReqId('visit-record-create-drawer')).toBeTruthy());

    // 拜访时间（必填）
    const visitTimeInput = within(getByReqId('visit-edit-visit-time')).getByRole('textbox');
    const panel1 = await openPanel(user, visitTimeInput);
    expect(panel1.querySelectorAll('.ant-picker-time-panel-column').length).toBe(3);
    await user.click(document.body);
    await waitFor(() => expect(visibleDropdowns()).toHaveLength(0));

    // 下次拜访时间（可空）
    const nextVisitInput = within(getByReqId('visit-edit-next-visit-time')).getByRole('textbox');
    const panel2 = await openPanel(user, nextVisitInput);
    expect(panel2.querySelectorAll('.ant-picker-time-panel-column').length).toBe(3);
    await pickDateTime(user, panel2);
    await waitFor(() => expect(visibleDropdowns()).toHaveLength(0));
    expect((nextVisitInput as HTMLInputElement).value).toBe(`${todayStr()} 10:30:00`);
    // 拜访时间字段不受影响
    expect((visitTimeInput as HTMLInputElement).value).toBe('');
    // 抽屉保持打开
    expect(getByReqId('visit-record-create-drawer')).toBeTruthy();
  });

  it('edit 回填：拜访记录抽屉拜访时间/下次拜访时间回填原值', async () => {
    render(
      <StoreCustomerList
        initialRecordEdit={{ kind: 'visit', recordKey: 'v1' }}
        initialPage="visit-record"
      />,
    );
    await waitFor(() => expect(getByReqId('visit-record-edit-drawer')).toBeTruthy());
    const visitTime = within(getByReqId('visit-edit-visit-time')).getByRole('textbox') as HTMLInputElement;
    const nextVisit = within(getByReqId('visit-edit-next-visit-time')).getByRole('textbox') as HTMLInputElement;
    expect(visitTime.value).toMatch(DT_REGEX);
    expect(nextVisit.value).toMatch(DT_REGEX);
  });
});
