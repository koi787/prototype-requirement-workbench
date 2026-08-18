/**
 * 0014 Cycle A - 员工 / 组织架构主页面测试。
 *
 * 覆盖任务单 §20 组织架构相关项：
 * - 组织树：展开/收起、选择节点、直接归属过滤（父节点不递归聚合子部门）。
 * - 筛选：搜索（姓名/原始手机号/员工编号）、岗位、角色筛选、在职状态默认"在职"、
 *   搜索/重置按钮、无结果空态。
 * - 员工 10 列表格：列定义顺序 + 真实 DOM 表头顺序、手机号脱敏、启用 Switch
 *   Runtime 读写、操作菜单三项（编辑/注销登录/消息测试）及颜色。
 * - 新增员工入口。
 *
 * 只验证用户可观察结果与正式 data-req-id；不依赖 Ant Design 私有类名拼装假断言。
 * 页面由产品壳出口直接渲染，本文件直接渲染 OrganizationPage（不经过潜客业务根）。
 */
import { describe, it, expect, afterEach } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { OrganizationPage } from '../OrganizationPage';
import { EMPLOYEE_COLUMN_KEYS } from '../employeeColumns';
import { maskMobile } from '../organizationMockData';

afterEach(() => cleanup());

function renderPage(ui: ReactElement) {
  return render(ui);
}

function getByReqId(id: string): HTMLElement {
  const elements = document.querySelectorAll(`[data-req-id="${id}"]`);
  if (elements.length !== 1) {
    throw new Error(`预期 data-req-id="${id}" 严格唯一，实际为 ${elements.length} 个`);
  }
  return elements[0] as HTMLElement;
}

/** 读取表格内实际渲染表头（固定列可能重复渲染，按首次出现去重）。 */
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

/** 读取表格数据行（按 data-row-key 首次出现去重，跳过固定列副本）。 */
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
  const cell = row.querySelectorAll('td')[index];
  if (!cell) throw new Error(`记录行缺少第 ${index} 列`);
  return cell as HTMLElement;
}

/** 按姓名定位数据行（默认 9 行内找到）。 */
function rowByName(name: string): HTMLElement {
  const row = dataRows(getByReqId('employee-table')).find((candidate) =>
    candidate.textContent?.includes(name),
  );
  if (!row) throw new Error(`未找到包含"${name}"的员工行`);
  return row;
}

/** 组织树节点行（antd Tree blockNode 的 treenode）。 */
function treeRow(titleText: string): HTMLElement {
  const title = screen.getByText(titleText);
  const row = title.closest('.ant-tree-treenode') as HTMLElement | null;
  if (!row) throw new Error(`未找到组织树节点"${titleText}"所在行`);
  return row;
}

/** 点击组织树节点行内的展开/收起切换器。 */
async function toggleTreeSwitcher(titleText: string, user: ReturnType<typeof userEvent.setup>) {
  const switcher = treeRow(titleText).querySelector('.ant-tree-switcher') as HTMLElement | null;
  if (!switcher) throw new Error(`组织树节点"${titleText}"缺少展开切换器`);
  await user.click(switcher);
}

/** 点击组织树节点标题进行选择。 */
async function selectTreeNode(titleText: string, user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByText(titleText));
}

/** 在筛选下拉中选择带指定文案的选项并点击"搜索"。 */
async function pickOptionAndSearch(
  reqId: string,
  optionTitle: string,
  user: ReturnType<typeof userEvent.setup>,
) {
  const combobox = within(getByReqId(reqId)).getByRole('combobox');
  await user.click(combobox);
  const listbox = await screen.findByRole('listbox');
  const dropdown = listbox.closest('.ant-select-dropdown') as HTMLElement;
  await waitFor(() => {
    expect(dropdown.querySelector('.ant-select-item-option')).toBeTruthy();
  });
  // 虚拟列表（rc-virtual-list）可能未把目标选项渲染进可视窗口（如 44 个角色的最后一个
  // "管理员"）。先尝试直接找到；找不到则滚动虚拟列表持有层到底部再查找。
  let option = dropdown.querySelector<HTMLElement>(
    `.ant-select-item-option[title="${optionTitle}"]`,
  );
  if (!option) {
    const holder = dropdown.querySelector<HTMLElement>('.rc-virtual-list-holder');
    if (holder) {
      // 虚拟列表可能未渲染末尾选项（如 44 个角色的最后一个"管理员"）。rc-virtual-list
      // 通过 onScroll 读取 holder 真实 scrollTop 决定渲染窗口并内部 clamp；jsdom 的
      // scrollHeight 恒为 0 且 fireEvent 的 target 选项不会改写元素属性，因此先显式
      // 赋值一个足够大的 scrollTop 再派发 scroll 事件。
      const originalScrollTop = holder.scrollTop;
      try {
        holder.scrollTop = 10000;
        fireEvent.scroll(holder);
        await waitFor(() => {
          option = dropdown.querySelector<HTMLElement>(
            `.ant-select-item-option[title="${optionTitle}"]`,
          );
          expect(option).toBeTruthy();
        });
      } finally {
        holder.scrollTop = originalScrollTop;
      }
    }
  }
  if (!option) throw new Error(`筛选下拉中未找到选项"${optionTitle}"`);
  await user.click(option);
  await user.click(getByReqId('employee-filter-search-btn'));
}

describe('员工 / 组织架构主页面', () => {
  it('员工列表列定义顺序固定为 10 列（0014 §8）', () => {
    expect(EMPLOYEE_COLUMN_KEYS).toEqual([
      'id',
      'name',
      'enabled',
      'employeeNo',
      'mobile',
      'performanceStoreId',
      'positionIds',
      'updatedAt',
      'operatorName',
      'action',
    ]);
  });

  it('真实渲染表头顺序与列定义一致（10 列）', () => {
    renderPage(<OrganizationPage />);
    expect(visibleHeaders(getByReqId('employee-table'))).toEqual([
      'ID',
      '姓名',
      '启用状态',
      '员工编号',
      '手机号',
      '业绩门店',
      '岗位',
      '更新时间',
      '操作人',
      '操作',
    ]);
  });

  it('组织树展示根节点奥本集团及 11 个子部门', () => {
    renderPage(<OrganizationPage />);
    expect(screen.getByText('奥本集团')).toBeTruthy();
    for (const name of [
      '总裁办',
      '财务中心',
      '人力行政中心',
      '采购中心',
      '研发中心',
      '品牌营销中心',
      '咖啡运营中心',
      '运营中心',
      '招商加盟中心',
      '奥本学院',
      '集团客服号',
    ]) {
      expect(screen.getByText(name)).toBeTruthy();
    }
  });

  it('左侧组织区域顶部展示公司/组织 Mock 框（纯视觉，无切换业务）', () => {
    renderPage(<OrganizationPage />);
    const companyBox = getByReqId('organization-company-box');
    expect(companyBox.textContent).toContain('奥本运动科技（苏州）');
    // 公司框之下仍展示组织架构树根节点
    expect(screen.getByText('奥本集团')).toBeTruthy();
  });

  it('筛选区按真实后台分两行：第一行 搜索/岗位/角色筛选，第二行 在职状态/搜索/重置', () => {
    renderPage(<OrganizationPage />);
    const rows = getByReqId('employee-filter-area').querySelectorAll('.organization-filter-row');
    expect(rows).toHaveLength(2);
    // 第一行：搜索 / 岗位 / 角色筛选
    const row0 = rows[0] as HTMLElement;
    expect(row0.querySelector('[data-req-id="employee-filter-search"]')).toBeTruthy();
    expect(row0.querySelector('[data-req-id="employee-filter-position"]')).toBeTruthy();
    expect(row0.querySelector('[data-req-id="employee-filter-role"]')).toBeTruthy();
    // 第二行：在职状态 / 搜索 / 重置
    const row1 = rows[1] as HTMLElement;
    expect(row1.querySelector('[data-req-id="employee-filter-status"]')).toBeTruthy();
    expect(row1.querySelector('[data-req-id="employee-filter-search-btn"]')).toBeTruthy();
    expect(row1.querySelector('[data-req-id="employee-filter-reset-btn"]')).toBeTruthy();
  });

  it('默认选中根节点且在职状态默认"在职"：仅显示直接归属集团的 9 名在职员工', () => {
    renderPage(<OrganizationPage />);
    const rows = dataRows(getByReqId('employee-table'));
    expect(rows).toHaveLength(9);
    expect(getByReqId('employee-pagination').textContent).toContain('共 9 条记录');
    // 离职员工（高静）默认不出现
    expect(screen.queryByText('高静')).toBeNull();
  });

  it('组织树支持展开/收起：人力行政中心默认收起，展开后出现子部门', async () => {
    const user = userEvent.setup();
    renderPage(<OrganizationPage />);
    expect(screen.queryByText('人力资源部')).toBeNull();
    await toggleTreeSwitcher('人力行政中心', user);
    expect(screen.getByText('人力资源部')).toBeTruthy();
    expect(screen.getByText('行政管理部')).toBeTruthy();
    await toggleTreeSwitcher('人力行政中心', user);
    expect(screen.queryByText('人力资源部')).toBeNull();
  });

  it('选择组织节点只显示直接归属员工（父节点不递归聚合子部门）', async () => {
    const user = userEvent.setup();
    renderPage(<OrganizationPage />);
    // 选择人力行政中心：直接归属为张敏；子部门人力资源部 刘洋/陈静 不应出现
    await selectTreeNode('人力行政中心', user);
    await waitFor(() => {
      expect(dataRows(getByReqId('employee-table'))).toHaveLength(1);
    });
    expect(screen.getByText('张敏')).toBeTruthy();
    expect(screen.queryByText('刘洋')).toBeNull();
    expect(screen.queryByText('陈静')).toBeNull();
  });

  it('选择子部门人力资源部显示该部门直接归属员工', async () => {
    const user = userEvent.setup();
    renderPage(<OrganizationPage />);
    await toggleTreeSwitcher('人力行政中心', user);
    await selectTreeNode('人力资源部', user);
    await waitFor(() => {
      expect(dataRows(getByReqId('employee-table'))).toHaveLength(2);
    });
    expect(screen.getByText('刘洋')).toBeTruthy();
    expect(screen.getByText('陈静')).toBeTruthy();
  });

  it('搜索按 姓名/原始手机号/员工编号 匹配（列表脱敏展示但搜索用原值）', async () => {
    const user = userEvent.setup();
    renderPage(<OrganizationPage />);
    const input = within(getByReqId('employee-filter-area')).getByRole('textbox');

    // 姓名
    await user.type(input, '何平');
    await user.click(getByReqId('employee-filter-search-btn'));
    await waitFor(() => expect(dataRows(getByReqId('employee-table'))).toHaveLength(1));
    expect(screen.getByText('何平')).toBeTruthy();

    // 原始手机号片段：列表展示为 139****1234，搜索匹配原值 13912341234
    await user.clear(input);
    await user.type(input, '1234');
    await user.click(getByReqId('employee-filter-search-btn'));
    await waitFor(() => expect(dataRows(getByReqId('employee-table'))).toHaveLength(1));
    expect(screen.getByText('何平')).toBeTruthy();

    // 员工编号
    await user.clear(input);
    await user.type(input, '10005');
    await user.click(getByReqId('employee-filter-search-btn'));
    await waitFor(() => expect(dataRows(getByReqId('employee-table'))).toHaveLength(1));
    expect(screen.getByText('于华')).toBeTruthy();
  });

  it('岗位筛选：选择"店长"后仅显示该岗位在职员工', async () => {
    const user = userEvent.setup();
    renderPage(<OrganizationPage />);
    await pickOptionAndSearch('employee-filter-position', '店长', user);
    await waitFor(() => expect(dataRows(getByReqId('employee-table'))).toHaveLength(2));
    expect(screen.getByText('曹磊')).toBeTruthy();
    expect(screen.getByText('唐娜')).toBeTruthy();
  });

  it('角色筛选：选择"管理员"后仅显示绑定该角色的在职员工', async () => {
    const user = userEvent.setup();
    renderPage(<OrganizationPage />);
    await pickOptionAndSearch('employee-filter-role', '管理员', user);
    await waitFor(() => expect(dataRows(getByReqId('employee-table'))).toHaveLength(1));
    expect(screen.getByText('何平')).toBeTruthy();
  });

  it('在职状态默认"在职"；切换"离职"显示离职员工', async () => {
    const user = userEvent.setup();
    renderPage(<OrganizationPage />);
    expect(screen.queryByText('高静')).toBeNull();
    await pickOptionAndSearch('employee-filter-status', '离职', user);
    await waitFor(() => expect(dataRows(getByReqId('employee-table'))).toHaveLength(1));
    expect(screen.getByText('高静')).toBeTruthy();
    expect(getByReqId('employee-pagination').textContent).toContain('共 1 条记录');
  });

  it('重置恢复默认：清空搜索并把在职状态恢复为"在职"', async () => {
    const user = userEvent.setup();
    renderPage(<OrganizationPage />);
    const input = within(getByReqId('employee-filter-area')).getByRole('textbox');
    await user.type(input, '何平');
    await user.click(getByReqId('employee-filter-search-btn'));
    await waitFor(() => expect(dataRows(getByReqId('employee-table'))).toHaveLength(1));
    await user.click(getByReqId('employee-filter-reset-btn'));
    await waitFor(() => expect(dataRows(getByReqId('employee-table'))).toHaveLength(9));
    expect(input).toHaveValue('');
    expect(getByReqId('employee-pagination').textContent).toContain('共 9 条记录');
  });

  it('搜索无结果时显示空表格与 0 条记录', async () => {
    const user = userEvent.setup();
    renderPage(<OrganizationPage />);
    const input = within(getByReqId('employee-filter-area')).getByRole('textbox');
    await user.type(input, '不存在');
    await user.click(getByReqId('employee-filter-search-btn'));
    await waitFor(() => expect(dataRows(getByReqId('employee-table'))).toHaveLength(0));
    expect(getByReqId('employee-pagination').textContent).toContain('共 0 条记录');
  });

  it('手机号列脱敏展示（139****1234），员工编号/操作人列展示原文', () => {
    renderPage(<OrganizationPage />);
    const row = rowByName('何平');
    expect(cellByIndex(row, 1).textContent).toBe('何平');
    expect(cellByIndex(row, 3).textContent).toBe('10001');
    expect(cellByIndex(row, 4).textContent).toBe('139****1234');
    expect(cellByIndex(row, 8).textContent).toBe('王经理');
    expect(maskMobile('13912341234')).toBe('139****1234');
    expect(maskMobile('1391234123')).toBe('1391234123'); // 非 11 位原样返回
  });

  it('启用状态 Switch 切换读写同一 Runtime 员工记录（页面级即时更新）', async () => {
    const user = userEvent.setup();
    renderPage(<OrganizationPage />);
    const sw = getByReqId('employee-enabled-E-10001');
    expect(sw.getAttribute('aria-checked')).toBe('true');
    await user.click(sw);
    expect(sw.getAttribute('aria-checked')).toBe('false');
  });

  it('操作菜单仅三项：编辑(蓝)/注销登录(红)/消息测试(蓝)', async () => {
    const user = userEvent.setup();
    renderPage(<OrganizationPage />);
    await user.click(getByReqId('employee-operation-menu-E-10001'));
    const editItem = await screen.findByRole('menuitem', { name: '编辑' });
    const logoutItem = screen.getByRole('menuitem', { name: '注销登录' });
    const messageItem = screen.getByRole('menuitem', { name: '消息测试' });
    expect(editItem).toBeTruthy();
    expect(logoutItem).toBeTruthy();
    expect(messageItem).toBeTruthy();
    // 颜色：#1677ff = rgb(22,119,255) 蓝色；#f5222d = rgb(245,34,45) 红色
    expect((editItem as HTMLElement).style.color).toBe('rgb(22, 119, 255)');
    expect((logoutItem as HTMLElement).style.color).toBe('rgb(245, 34, 45)');
    expect((messageItem as HTMLElement).style.color).toBe('rgb(22, 119, 255)');
  });

  it('新增员工入口：主列表右上方蓝色主按钮（Cycle A 保留入口）', () => {
    renderPage(<OrganizationPage />);
    const addBtn = getByReqId('employee-add-button');
    expect(addBtn.textContent).toBe('新增员工');
    expect(addBtn.classList.contains('ant-btn-primary')).toBe(true);
  });
});
