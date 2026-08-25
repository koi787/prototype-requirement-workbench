import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScrmWorkspace } from '../../../shell/ScrmWorkspace';
import { CustomerListPage } from '../CustomerListPage';
import { EMPTY_CUSTOMER_FILTER } from '../customerTypes';

afterEach(() => cleanup());

const CUSTOMER_HEADERS = [
  'ID', '头像', '姓名', '注册门店', '归属门店', '性别', '生日', '手机号', '用户来源', '会员等级',
  '成长值', '瑜伽未到店时间', '瑜伽最近到店时间', '瑜伽消费次数', '瑜伽剩余次数', '瑜伽剩余金额',
  '瑜伽剩余合同数', '美容未到店时间', '美容最近到店时间', '美容消费次数', '美容剩余次数', '美容剩余金额',
  '美容剩余合同数', '奥币余额', '首单业务类型', '首单成交时间', '业务类型', '跨业务用户', '结转金', '问卷状态',
  '注册日期', '操作',
];

function getCustomerTable(): HTMLElement {
  return screen.getByRole('table');
}

describe('0016 Cycle C SCRM 客户列表与基本信息', () => {
  it('真实 registry 链路渲染客户页面且客户列表严格为32列', () => {
    render(<ScrmWorkspace initialPage="customer-list" />);
    expect(document.querySelector('[data-req-id="customer-list-page"]')).toBeTruthy();
    expect(within(getCustomerTable()).getAllByRole('columnheader').map((header) => header.textContent)).toEqual(
      CUSTOMER_HEADERS,
    );
    expect(document.querySelector('[data-req-id="page-title-area"]')).toBeNull();
  });

  it('筛选区包含八项字段、搜索/重置和两个右侧业务按钮', () => {
    render(<CustomerListPage />);
    const filterArea = within(document.querySelector('[data-req-id="customer-filter-area"]')!);
    expect(filterArea.getByRole('textbox', { name: '姓名/手机号' })).toBeTruthy();
    expect(filterArea.getByRole('combobox', { name: '用户来源' })).toBeTruthy();
    expect(filterArea.getByRole('textbox', { name: '授权手机号' })).toBeTruthy();
    expect(filterArea.getByRole('textbox', { name: '瑜伽未到店时间-开始日期' })).toBeTruthy();
    expect(filterArea.getByRole('textbox', { name: '美容未到店时间-开始日期' })).toBeTruthy();
    expect(filterArea.getByRole('combobox', { name: '跨业务用户' })).toBeTruthy();
    expect(filterArea.getByRole('textbox', { name: '成为客户时间-开始日期' })).toBeTruthy();
    expect(filterArea.getByRole('textbox', { name: '生日-开始日期' })).toBeTruthy();
    expect(filterArea.getByRole('button', { name: /搜\s*索/ })).toBeTruthy();
    expect(filterArea.getByRole('button', { name: /重\s*置/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: '线下体验核销' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '创建用户' })).toBeTruthy();

  });

  it('搜索按姓名过滤，重置恢复初始总数', () => {
    render(<CustomerListPage />);
    fireEvent.change(screen.getByRole('textbox', { name: '姓名/手机号' }), { target: { value: '陈晨' } });
    fireEvent.click(screen.getByRole('button', { name: /搜\s*索/ }));
    expect(screen.getByText('共 1 条记录')).toBeTruthy();
    expect(screen.getAllByText('陈晨').length).toBeGreaterThan(0);
    expect(screen.queryByText('游客邦YTHVg')).toBeNull();
  });

  it('重置恢复初始筛选条件与总数', () => {
    render(<CustomerListPage initialAppliedFilter={{ ...EMPTY_CUSTOMER_FILTER, nameOrPhone: '陈晨' }} />);
    expect(screen.getByText('共 1 条记录')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /重\s*置/ }));
    expect(screen.getByText('共 30773 条记录')).toBeTruthy();
  });

  it('固定列和横向滚动结构真实存在，行操作严格为三项', () => {
    render(<CustomerListPage />);
    const headers = within(getCustomerTable()).getAllByRole('columnheader');
    expect(headers.slice(0, 3).every((header) => header.className.includes('ant-table-cell-fix'))).toBe(true);
    expect(headers.at(-1)?.className).toContain('ant-table-cell-fix');
    expect(headers.at(-1)?.className).toContain('ant-table-cell-fix-end');
    expect(document.querySelector('.customer-table-wrapper .ant-table-content')).toBeTruthy();

    const firstRow = within(getCustomerTable()).getAllByRole('row')[1];
    expect(firstRow).toBeDefined();
    expect(within(firstRow!).getByRole('button', { name: '查看详情' })).toBeTruthy();
    expect(within(firstRow!).getByRole('button', { name: '同步' })).toBeTruthy();
    expect(within(firstRow!).getByRole('button', { name: '删除用户' })).toBeTruthy();
  });

  it('模拟30773条、10条/页，支持具体页码', () => {
    render(<CustomerListPage />);
    const pagination = within(document.querySelector('[data-req-id="customer-pagination"]')!);
    expect(pagination.getByText('共 30773 条记录')).toBeTruthy();
    expect(pagination.getByText('10条/页')).toBeTruthy();
    expect(pagination.getByRole('button', { name: '上一页' })).toBeDisabled();
    expect(pagination.getByRole('button', { name: '下一页' })).toBeEnabled();
    expect(pagination.getByRole('button', { name: '第1页' })).toHaveAttribute('aria-current', 'page');

    fireEvent.click(pagination.getByRole('button', { name: '第2页' }));
    expect(pagination.getByRole('button', { name: '第2页' })).toHaveAttribute('aria-current', 'page');
  });

  it('上一页和下一页正确处理相邻页', () => {
    render(<CustomerListPage />);
    const pagination = within(document.querySelector('[data-req-id="customer-pagination"]')!);
    fireEvent.click(pagination.getByRole('button', { name: '下一页' }));
    expect(pagination.getByRole('button', { name: '第2页' })).toHaveAttribute('aria-current', 'page');
    fireEvent.click(pagination.getByRole('button', { name: '上一页' }));
    expect(pagination.getByRole('button', { name: '第1页' })).toHaveAttribute('aria-current', 'page');
  });

  it('跳页可到达末页并呈现末页禁用态', () => {
    render(<CustomerListPage />);
    const pagination = within(document.querySelector('[data-req-id="customer-pagination"]')!);
    const jumpInput = pagination.getByRole('textbox', { name: '前往页码' });
    fireEvent.change(jumpInput, { target: { value: '3078' } });
    fireEvent.keyDown(jumpInput, { key: 'Enter', code: 'Enter', charCode: 13 });
    expect(pagination.getByRole('button', { name: '第3078页' })).toHaveAttribute('aria-current', 'page');
    expect(pagination.getByRole('button', { name: '下一页' })).toBeDisabled();
  });

  it('查看详情默认打开基本信息 Drawer，关闭后列表保留且保留体测美容记录入口', async () => {
    const user = userEvent.setup();
    render(<CustomerListPage />);
    await user.click(screen.getAllByRole('button', { name: '查看详情' })[0]!);
    const drawer = screen.getByRole('dialog');
    expect(within(drawer).getByText('用户详情')).toBeTruthy();
    expect(within(drawer).getByRole('tab', { name: '基本信息' })).toHaveAttribute('aria-selected', 'true');
    for (const field of ['ID', '姓名', '生日', '性别', '手机号', '是否新会员', '消费等级', '成长值', '结转金', '储值余额', '积分', '归属门店', '用户来源', '注册日期', '已取消/可取消约课次数', '备注', '美团抖音核销', '五维问卷', '地推问卷']) {
      expect(within(drawer).getByText(`${field}：`)).toBeTruthy();
    }
    expect(within(drawer).queryByText('676106169')).toBeNull();
    expect(within(drawer).getByRole('tab', { name: '体测美容记录' })).toBeTruthy();
    const drawerHeader = drawer.querySelector('.ant-drawer-header');
    expect(drawerHeader?.querySelector('.ant-drawer-extra .customer-detail-close')).toBeTruthy();
    await user.click(within(drawerHeader as HTMLElement).getByRole('button', { name: '关闭用户详情' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByText('共 30773 条记录')).toBeTruthy();
  });
});
