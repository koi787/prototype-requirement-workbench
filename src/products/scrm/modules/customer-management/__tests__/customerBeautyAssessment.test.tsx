import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { ScrmWorkspace } from '../../../shell/ScrmWorkspace';
import { CustomerListPage } from '../CustomerListPage';
import { getCustomerBeautyAssessments } from '../customerBeautyAssessmentViewModel';

afterEach(() => cleanup());

function renderBeautyCustomer(customerId = 'customer-53395') {
  render(
    <ScrmWorkspace
      initialPage="customer-list"
      renderContext={{
        customerList: (
          <CustomerListPage
            initialDetailCustomerId={customerId}
            initialDetailTab="assessment"
            initialAssessmentView="beauty"
          />
        ),
      }}
    />,
  );
}

function openBeautyTable(customerId = 'customer-53395') {
  renderBeautyCustomer(customerId);
  return screen.getByRole('table', { name: '美容记录列表' });
}

describe('SCRM 美容记录后台查看', () => {
  it('在真实客户链路展示当前客户的七列美容记录列表并按检测时间倒序', () => {
    const table = openBeautyTable();

    expect(within(table).getAllByRole('columnheader').map((header) => header.textContent)).toEqual([
      '检测时间', '综合得分', '等级', '肤质类型', '肤质标签', '检测设备序列号', '操作',
    ]);
    expect(within(table).getAllByRole('row')).toHaveLength(3);
    expect(within(table).getAllByRole('button', { name: '查看' })).toHaveLength(2);
    expect(within(table).getByText('2026-08-20 12:02')).toBeTruthy();
    expect(within(table).getAllByText('--').length).toBeGreaterThan(0);
    fireEvent.click(within(table).getAllByRole('button', { name: '查看' })[0]!);
    const detailDrawer = screen.getAllByRole('dialog')[1]!;
    const detailItems = within(detailDrawer).getByRole('region', { name: '单项报告' });
    for (const name of ['毛孔', '浅层色素', '混合斑', '痤疮', '屏障', '深层色素', '敏感红素图', '皱纹', '粗糙度', '胶原']) {
      expect(within(detailItems).getByText(name)).toBeTruthy();
      expect(within(detailItems).queryByRole('button', { name: new RegExp(name) })).toBeNull();
    }
    expect(within(detailItems).getAllByRole('button')).toHaveLength(6);
    expect(within(detailItems).queryByText('暂无详细内容')).toBeNull();
  });

  it('点击不同记录打开对应三级 Drawer，关闭后保留客户与美容记录 Tab', () => {
    const table = openBeautyTable();
    const viewButtons = within(table).getAllByRole('button', { name: '查看' });

    fireEvent.click(viewButtons[0]!);
    expect(screen.getAllByRole('dialog')).toHaveLength(2);
    let detailDrawer = screen.getAllByRole('dialog')[1]!;
    expect(within(detailDrawer).getByText('美容检测报告详情')).toBeTruthy();
    expect(within(detailDrawer).getByText('2026-08-20 12:02')).toBeTruthy();
    expect(within(detailDrawer).getAllByText('--').length).toBeGreaterThan(0);
    fireEvent.click(within(detailDrawer).getByRole('button', { name: 'Close' }));

    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    const customerDrawer = screen.getByRole('dialog');
    expect(within(customerDrawer).getByRole('tab', { name: '体测美容记录' })).toHaveAttribute('aria-selected', 'true');
    expect(within(customerDrawer).getByRole('tab', { name: '美容记录' })).toHaveAttribute('aria-selected', 'true');

    fireEvent.click(within(table).getAllByRole('button', { name: '查看' })[1]!);
    detailDrawer = screen.getAllByRole('dialog')[1]!;
    expect(within(detailDrawer).getByText('2026-08-01 09:00')).toBeTruthy();
    expect(within(detailDrawer).getAllByText('--').length).toBeGreaterThan(0);
    expect(within(detailDrawer).queryByText('2026-08-20 12:02')).toBeNull();
  });

  it('动态展示单项报告并支持独立展开和收起', () => {
    const table = openBeautyTable();
    fireEvent.click(within(table).getAllByRole('button', { name: '查看' })[0]!);
    const detailDrawer = screen.getAllByRole('dialog')[1]!;
    const firstItem = getCustomerBeautyAssessments('customer-53395')[0]!.report.items[0]!;
    const itemButton = within(detailDrawer).getByRole('button', { name: new RegExp(firstItem.name) });

    expect(itemButton).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(itemButton);
    expect(itemButton).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(itemButton);
    expect(itemButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('当前客户无美容记录时显示统一空态且不泄漏其他客户数据', () => {
    renderBeautyCustomer('customer-53393');

    expect(screen.getByText('暂无美容记录')).toBeTruthy();
  });

  it('检测设备序列号缺失时在列表显示--', () => {
    const table = openBeautyTable('customer-53394');
    const row = within(table).getAllByRole('row')[1]!;

    expect(within(row).getAllByRole('cell').at(-2)?.textContent).toBe('--');
  });
});
