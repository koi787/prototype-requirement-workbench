/**
 * 0012 Cycle B - 到店/拜访记录单一运行时状态测试。
 *
 * §9.2：Provider 必须挂在产品层共同祖先，三个消费者读取同一份 state 实例。
 * 这里用探针组件直接消费 Store API，验证初始化、按客户归集、原位更新即时
 * 反映、刷新恢复初始 Mock、未包裹 Provider 时严格抛错。
 */
import { describe, it, expect, afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  RecordRuntimeStoreProvider,
  useRecordRuntimeStore,
} from '../recordRuntimeStore';

afterEach(() => cleanup());

/** 探针：把 Store API 的可观察结果暴露为 data-testid，便于断言即时同步。 */
function StoreProbe() {
  const store = useRecordRuntimeStore();
  const arrivals = store.getArrivalRecords();
  const visits = store.getVisitRecords();
  const a1 = arrivals.find((r) => r.key === 'a1');
  const v1 = visits.find((r) => r.key === 'v1');
  return (
    <div>
      <div data-testid="arrival-count">{arrivals.length}</div>
      <div data-testid="visit-count">{visits.length}</div>
      <div data-testid="customer-1-arrivals">{store.getArrivalRecordsByCustomerKey('1').length}</div>
      <div data-testid="customer-1-visits">{store.getVisitRecordsByCustomerKey('1').length}</div>
      <div data-testid="a1-result-analysis">{a1?.resultAnalysis ?? '--'}</div>
      <div data-testid="a1-appointment-store">{a1?.appointmentStore ?? '--'}</div>
      <div data-testid="v1-next-visit-time">{v1?.nextVisitTime ?? '--'}</div>
      <div data-testid="v1-visit-remark">{v1?.visitRemark ?? '--'}</div>
      <button onClick={() => store.updateArrivalRecord('a1', { resultAnalysis: '运行时更新后的结果分析' })}>
        更新到店a1
      </button>
      <button onClick={() => store.updateVisitRecord('v1', { nextVisitTime: null })}>
        清空拜访v1下次拜访时间
      </button>
      <button onClick={() => store.updateVisitRecord('v1', { visitRemark: '运行时更新后的拜访备注' })}>
        更新拜访v1备注
      </button>
    </div>
  );
}

function renderProbe() {
  return render(
    <RecordRuntimeStoreProvider>
      <StoreProbe />
    </RecordRuntimeStoreProvider>,
  );
}

describe('recordRuntimeStore（单一运行时状态）', () => {
  it('Provider 初始化全部 Mock 记录，并按稳定客户 key 归集读取', () => {
    renderProbe();
    expect(screen.getByTestId('arrival-count').textContent).toBe('7');
    expect(screen.getByTestId('visit-count').textContent).toBe('3');
    // 张三（key 1）：3 条到店、2 条拜访（与跟进详情 Tab 归集口径一致）
    expect(screen.getByTestId('customer-1-arrivals').textContent).toBe('3');
    expect(screen.getByTestId('customer-1-visits').textContent).toBe('2');
    expect(screen.getByTestId('a1-result-analysis').textContent).toBe(
      '到店体验良好，家长有明确报名意向',
    );
    expect(screen.getByTestId('v1-next-visit-time').textContent).toBe('2026-07-25 10:00:00');
  });

  it('updateArrivalRecord 按 key 原位更新并立即反映到 getters', async () => {
    const user = userEvent.setup();
    renderProbe();
    await user.click(screen.getByText('更新到店a1'));
    expect(screen.getByTestId('a1-result-analysis').textContent).toBe('运行时更新后的结果分析');
    // 未修改字段保持不变
    expect(screen.getByTestId('a1-appointment-store').textContent).toBe('示例旗舰店');
  });

  it('updateVisitRecord 修改与清空下次拜访时间立即反映到 getters', async () => {
    const user = userEvent.setup();
    renderProbe();
    await user.click(screen.getByText('清空拜访v1下次拜访时间'));
    expect(screen.getByTestId('v1-next-visit-time').textContent).toBe('--');
    await user.click(screen.getByText('更新拜访v1备注'));
    expect(screen.getByTestId('v1-visit-remark').textContent).toBe('运行时更新后的拜访备注');
  });

  it('刷新不持久化：运行时更新后重新挂载恢复初始 Mock', async () => {
    const user = userEvent.setup();
    const { unmount } = renderProbe();
    await user.click(screen.getByText('更新到店a1'));
    expect(screen.getByTestId('a1-result-analysis').textContent).toBe('运行时更新后的结果分析');
    // 卸载再挂载，等价于刷新页面：不落盘（无 LocalStorage/API/数据库），恢复初始 Mock
    unmount();
    renderProbe();
    expect(screen.getByTestId('a1-result-analysis').textContent).toBe(
      '到店体验良好，家长有明确报名意向',
    );
  });

  it('未包裹 Provider 时严格抛错，防止各页面自建状态', () => {
    expect(() => render(<StoreProbe />)).toThrow(/RecordRuntimeStoreProvider/);
  });
});
