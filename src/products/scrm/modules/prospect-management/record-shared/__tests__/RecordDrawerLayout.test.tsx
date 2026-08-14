/**
 * 0012 Cycle B - 编辑抽屉 C 级布局测试（真实系统视觉契约）。
 *
 * 视觉以产品经理 Storybook 截图验收为准，这里只做"结构断言"，避免像素级
 * 硬断言导致脆弱测试（§24）。覆盖：
 *  1. Drawer width = 50vw
 *  2. 用户信息不是三列平铺（两行布局：第一行 姓名|客资来源，第二行 注册时间）
 *  3. 表单使用横向 label|control（每个字段 = label + control 兄弟节点）
 *  4. control 不为全宽（存在 .record-drawer-field-control 窄控件包装，无内联
 *     width:100%）
 *  5. 意向度真实三键步进器（减/值/加）且边界 1~5
 *  6. 确定/取消不在 sticky footer（无 .ant-drawer-footer / .record-drawer-footer，
 *     按钮在正文 .record-drawer-actions 内）
 *  7. 拜访备注保持窄多行 textarea
 *  8. 到店预约备注保持窄多行 textarea
 *  9. 到店状态 Tag 保持（标题行右侧只读）
 * 10. 结果分析属于同一 Drawer
 * 11. 到店结果分析分区以浅灰分隔线与到店信息区分，且自带一组 确定/取消
 */
import { describe, it, expect, afterEach } from 'vitest';
import { cleanup, render, waitFor, within } from '@testing-library/react';
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

async function openVisit(): Promise<HTMLElement> {
  render(
    <StoreCustomerList
      initialPage="visit-record"
      initialRecordEdit={{ kind: 'visit', recordKey: 'v1' }}
    />,
  );
  await waitFor(() => {
    expect(document.querySelector('[data-req-id="visit-record-edit-drawer"]')).toBeTruthy();
  });
  return getByReqId('visit-record-edit-drawer');
}

async function openArrival(): Promise<HTMLElement> {
  render(
    <StoreCustomerList
      initialPage="arrival-record"
      initialRecordEdit={{ kind: 'arrival', recordKey: 'a1' }}
    />,
  );
  await waitFor(() => {
    expect(document.querySelector('[data-req-id="arrival-record-edit-drawer"]')).toBeTruthy();
  });
  return getByReqId('arrival-record-edit-drawer');
}

describe('编辑抽屉 C 级布局（真实系统视觉契约）', () => {
  it('拜访 Drawer：50vw、两行用户信息、横向 label|control、窄控件包装、正文按钮', async () => {
    const drawer = await openVisit();

    // 1. Drawer width = 50vw
    const wrapper = document.querySelector('.ant-drawer-content-wrapper') as HTMLElement;
    expect(wrapper).toBeTruthy();
    expect(wrapper.style.width).toBe('50vw');

    // 2. 用户信息两行（非三列平铺）
    const userSection = drawer.querySelector('.record-drawer-section') as HTMLElement;
    expect(within(userSection).getByText('用户信息')).toBeTruthy();
    const userLines = userSection.querySelectorAll('.record-drawer-user-line');
    expect(userLines.length).toBe(2);
    expect(userLines[0]!.querySelectorAll('.record-drawer-user-field').length).toBe(2);
    expect(userLines[1]!.querySelectorAll('.record-drawer-user-field').length).toBe(1);
    expect(within(userLines[0] as HTMLElement).getByText('张三')).toBeTruthy();
    expect(within(userLines[0] as HTMLElement).getByText('地推活动')).toBeTruthy();
    expect(within(userLines[1] as HTMLElement).getByText('2026-07-15 08:00:00')).toBeTruthy();

    // 3+4. 每个字段 = label + control 兄弟（横向布局）；控件有窄包装且无内联全宽
    const fields = drawer.querySelectorAll('.record-drawer-field');
    expect(fields.length).toBeGreaterThan(0);
    for (const field of fields) {
      const children = Array.from(field.children);
      expect(children.length).toBe(2);
      expect(children[0]!.classList.contains('record-drawer-field-label')).toBe(true);
      expect(children[1]!.classList.contains('record-drawer-field-control')).toBe(true);
      expect(children[1]!.querySelector('[style*="width: 100%"]')).toBeNull();
    }

    // 5. 意向度三段步进器
    const intentField = getByReqId('visit-edit-intent-level');
    const stepper = intentField.querySelector('.record-intent-stepper');
    expect(stepper).toBeTruthy();
    expect(stepper!.querySelectorAll('button').length).toBe(2);
    const spin = stepper!.querySelector('[role="spinbutton"]') as HTMLInputElement;
    expect(spin).toBeTruthy();
    expect(spin.value).toBe('4');

    // 6. 确定/取消在正文 .record-drawer-actions，无 sticky footer
    expect(document.querySelector('.ant-drawer-footer')).toBeNull();
    expect(document.querySelector('.record-drawer-footer')).toBeNull();
    expect(getByReqId('visit-edit-submit').closest('.record-drawer-actions')).toBeTruthy();
    expect(getByReqId('visit-edit-cancel').closest('.record-drawer-actions')).toBeTruthy();
    expect(getByReqId('visit-edit-submit').closest('.record-drawer-body')).toBeTruthy();

    // 7. 拜访备注为多行窄 textarea
    const remark = within(getByReqId('visit-edit-visit-remark')).getByRole('textbox') as HTMLTextAreaElement;
    expect(remark.tagName).toBe('TEXTAREA');
    expect(remark.getAttribute('rows')).toBe('3');
  });

  it('到店 Drawer：两行用户信息、状态 Tag 在标题行、体验课关联行、正文按钮、结果分析同一抽屉', async () => {
    const drawer = await openArrival();

    // 2. 用户信息两行
    const userSection = drawer.querySelector('.record-drawer-section') as HTMLElement;
    expect(userSection.querySelectorAll('.record-drawer-user-line').length).toBe(2);
    expect(within(userSection).getByText('张三')).toBeTruthy();
    expect(within(userSection).getByText('地推活动')).toBeTruthy();
    expect(within(userSection).getByText('2026-07-15 08:00:00')).toBeTruthy();

    // 9. 状态 Tag 保持且位于"到店信息"标题行右侧
    const sectionTitles = [...drawer.querySelectorAll('.record-drawer-section-title')].map((el) =>
      el.textContent?.trim(),
    );
    expect(sectionTitles).toEqual(['用户信息', '到店信息', '结果分析']);
    const statusRow = getByReqId('arrival-edit-status');
    expect(statusRow.querySelectorAll('.ant-tag').length).toBe(2);
    expect(within(statusRow).getByText('已到店')).toBeTruthy();
    expect(within(statusRow).getByText('已成交')).toBeTruthy();
    expect(statusRow.closest('.record-drawer-section-head')).toBeTruthy();
    expect(statusRow.querySelector('select, input, textarea')).toBeNull();

    // 3+4. 横向 label|control + 窄控件包装
    const fields = drawer.querySelectorAll('.record-drawer-field');
    for (const field of fields) {
      const children = Array.from(field.children);
      expect(children.length).toBe(2);
      expect(children[0]!.classList.contains('record-drawer-field-label')).toBe(true);
      expect(children[1]!.classList.contains('record-drawer-field-control')).toBe(true);
    }

    // 5. 意向度三段步进器
    const intentField = getByReqId('arrival-edit-intent-level');
    expect(intentField.querySelector('.record-intent-stepper')).toBeTruthy();
    expect(intentField.querySelector('.record-intent-stepper [role="spinbutton"]')).toBeTruthy();

    // 体验课为只读关联行（文本 + 分隔符，非 Card/大输入框）
    const trial = getByReqId('arrival-edit-trial-context');
    expect(within(trial).getByText('已下课')).toBeTruthy();
    expect(within(trial).getByText('HT2026001')).toBeTruthy();
    expect(within(trial).getByText('少儿体适能')).toBeTruthy();
    expect(within(trial).getByText('体验课A卡')).toBeTruthy();
    expect(trial.querySelector('input, textarea, .ant-select')).toBeNull();

    // 8. 到店预约备注为多行窄 textarea
    const remark = within(getByReqId('arrival-edit-appointment-remark')).getByRole('textbox') as HTMLTextAreaElement;
    expect(remark.tagName).toBe('TEXTAREA');
    expect(remark.getAttribute('rows')).toBe('3');

    // 6. 确定/取消在正文 .record-drawer-actions，无 sticky footer
    expect(document.querySelector('.ant-drawer-footer')).toBeNull();
    expect(document.querySelector('.record-drawer-footer')).toBeNull();
    expect(getByReqId('arrival-edit-submit').closest('.record-drawer-actions')).toBeTruthy();
    expect(getByReqId('arrival-edit-cancel').closest('.record-drawer-actions')).toBeTruthy();

    // 10. 结果分析属于同一 Drawer（位于按钮下方独立分区）
    const resultField = getByReqId('arrival-edit-result-analysis');
    expect(resultField.closest('[data-req-id="arrival-record-edit-drawer"]')).toBeTruthy();
    expect(
      (resultField.querySelector('textarea') as HTMLTextAreaElement).value,
    ).toBe('到店体验良好，家长有明确报名意向');

    // 11. 结果分析分区带浅灰分隔线，且自带一组 确定/取消（与到店信息按钮分开）
    const resultSection = resultField.closest('.record-drawer-section') as HTMLElement;
    expect(resultSection.classList.contains('record-drawer-section-divider')).toBe(true);
    expect(getByReqId('arrival-result-submit').closest('.record-drawer-section')).toBe(resultSection);
    expect(getByReqId('arrival-result-cancel').closest('.record-drawer-section')).toBe(resultSection);
    expect(getByReqId('arrival-result-submit').closest('.record-drawer-actions')).toBeTruthy();
    expect(getByReqId('arrival-result-cancel').closest('.record-drawer-actions')).toBeTruthy();
  });

  it('意向度三键步进器行为：＋自增、－自减、边界 1~5', async () => {
    const user = userEvent.setup();
    await openVisit();
    const field = getByReqId('visit-edit-intent-level');
    const spin = field.querySelector('[role="spinbutton"]') as HTMLInputElement;
    const minus = field.querySelector('[data-req-id="intent-level-minus"]') as HTMLButtonElement;
    const plus = field.querySelector('[data-req-id="intent-level-plus"]') as HTMLButtonElement;
    expect(spin.value).toBe('4');

    // ＋ → 5，到达最大值后加号禁用
    await user.click(plus);
    expect(spin.value).toBe('5');
    expect(plus.disabled).toBe(true);

    // － → 4，加号恢复可用
    await user.click(minus);
    expect(spin.value).toBe('4');
    expect(plus.disabled).toBe(false);

    // 连续减到 1，到达最小值后减号禁用
    await user.click(minus); // 3
    await user.click(minus); // 2
    await user.click(minus); // 1
    expect(spin.value).toBe('1');
    expect(minus.disabled).toBe(true);

    // 加号从 1 可用，回到 2
    await user.click(plus);
    expect(spin.value).toBe('2');
    expect(minus.disabled).toBe(false);
  });
});
