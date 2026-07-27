import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StoreCustomerList } from '../StoreCustomerList';
import {
  ALL_COLUMNS,
  COLUMN_COUNT,
  COLUMN_ORDER,
  COLUMN_REQUIREMENT_ANCHORS,
} from '../columns';
import { getRequirement } from '../../../../../../../requirements/products/scrm/pages/store-customer';
import { requirementViewEntrySchema } from '../../../../../../../requirements/schemas/requirement-view';
import {
  RequirementDrawer,
  RequirementViewProvider,
  useRequirementView,
} from '../../../../../../../prototype-core/requirement-view';
import rawCustomers from '../mockData';

afterEach(() => cleanup());

/**
 * 门店客户列表组件测试。
 *
 * 只验证用户可观察结果和正式 data-req-id，不依赖 Ant Design 私有类名或
 * 不存在时自动跳过的条件分支。
 */

const COLUMN_ANCHOR_IDS = [
  'customer-name-column',
  'appointment-arrival-time-column',
  'operation-column',
] as const;

function getByReqId(id: string): HTMLElement {
  const elements = document.querySelectorAll(`[data-req-id="${id}"]`);
  if (elements.length !== 1) {
    throw new Error(`预期 data-req-id="${id}" 严格唯一，实际为 ${elements.length} 个`);
  }
  return elements[0] as HTMLElement;
}

function getPagination(): HTMLElement {
  return getByReqId('pagination-area');
}

function getSearchButton(): HTMLElement {
  return getByReqId('search-button');
}

function getResetButton(): HTMLElement {
  return getByReqId('reset-button');
}

function getNamePhoneInput(): HTMLInputElement {
  return screen.getByPlaceholderText('请输入姓名或手机号') as HTMLInputElement;
}

function getSourceCombobox(): HTMLElement {
  return within(getByReqId('filter-source')).getByRole('combobox');
}

function getOperationButtons(): HTMLElement[] {
  return Array.from(
    document.querySelectorAll('[data-req-id^="operation-menu-trigger-"]'),
  ) as HTMLElement[];
}

function getCurrentDataRows(): HTMLTableRowElement[] {
  return getOperationButtons().map((button) => {
    const row = button.closest('tr');
    if (!row) throw new Error('操作按钮必须位于对应客户数据行内');
    return row;
  });
}

function getCurrentNames(): string[] {
  return getCurrentDataRows().map((row) => {
    const cells = within(row).getAllByRole('cell');
    return cells[0]?.textContent?.trim() ?? '';
  });
}

function expectColumnAnchorsUnique(): void {
  COLUMN_ANCHOR_IDS.forEach((id) => {
    expect(document.querySelectorAll(`[data-req-id="${id}"]`)).toHaveLength(1);
  });
}

async function selectCustomerSource(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  const combobox = getSourceCombobox();
  await user.click(combobox);
  const option = await screen.findByTitle('地推活动');
  await user.click(option);
}

function EmptyRequirementDrawerHarness() {
  const { selectRequirement } = useRequirementView();
  const entry = requirementViewEntrySchema.parse({
    requirementNo: 'WB-EMPTY',
    requirementName: '工作台空字段能力演示',
    status: '   ',
    definition: '   ',
    dataSource: '',
    rule: null,
  });

  return (
    <>
      <button
        onClick={() => selectRequirement('workbench-empty-demo', 'empty-demo-target')}
      >
        打开空字段需求
      </button>
      <RequirementDrawer
        getRequirementData={(key) =>
          key === 'workbench-empty-demo' ? entry : undefined
        }
      />
    </>
  );
}

describe('StoreCustomerList', () => {
  describe('页面与52列基线', () => {
    it('渲染主要区域和25条演示数据', () => {
      render(<StoreCustomerList initialState="normal" />);

      expect(getByReqId('store-customer-page-root')).toBeTruthy();
      expect(getByReqId('left-navigation')).toBeTruthy();
      expect(getByReqId('top-system-bar')).toBeTruthy();
      expect(getByReqId('filter-area')).toBeTruthy();
      expect(getByReqId('customer-table')).toBeTruthy();
      expect(getPagination().textContent).toContain('共 25 条记录');
      expect(getOperationButtons()).toHaveLength(10);
    });

    it('保持52列数量、顺序和固定列配置', () => {
      expect(COLUMN_COUNT).toBe(52);
      expect(new Set(COLUMN_ORDER).size).toBe(52);
      expect(COLUMN_ORDER[0]).toBe('name');
      expect(COLUMN_ORDER[5]).toBe('appointmentTime');
      expect(COLUMN_ORDER.at(-1)).toBe('operation');
      expect(ALL_COLUMNS[0]?.fixed).toBe('left');
      expect(ALL_COLUMNS.at(-1)?.fixed).toBe('right');
      expect(COLUMN_ORDER.filter((key) => key === 'appointmentTime')).toHaveLength(1);
    });

    it('列级锚点注册信息明确关联原有和新增列字段', () => {
      expect(COLUMN_REQUIREMENT_ANCHORS).toEqual([
        { id: 'customer-name-column', columnKey: 'name', description: '姓名列' },
        {
          id: 'appointment-arrival-time-column',
          columnKey: 'appointmentTime',
          description: '预约到店时间列',
        },
        { id: 'operation-column', columnKey: 'operation', description: '操作列' },
        { id: 'first-allocation-time-column', columnKey: 'firstAssignTime', description: '首次分配时间列' },
        { id: 'latest-allocation-time-column', columnKey: 'lastAssignTime', description: '最新分配时间列' },
        { id: 'is-arrived-column', columnKey: 'isVisited', description: '是否到店列' },
        { id: 'is-deal-column', columnKey: 'isDeal', description: '是否成交列' },
        { id: 'actual-arrival-status-column', columnKey: 'actualVisitStatus', description: '实际到店状态列' },
        { id: 'actual-deal-status-column', columnKey: 'actualDealStatus', description: '实际成交状态列' },
        { id: 'invalid-lead-status-column', columnKey: 'invalidCustomerStatus', description: '无效客资状态列' },
      ]);
    });
  });

  describe('搜索触发的筛选状态', () => {
    it('文本输入未搜索时保持25条，搜索张三后只显示对应客户', async () => {
      const user = userEvent.setup();
      render(<StoreCustomerList initialState="normal" />);

      expect(getPagination().textContent).toContain('共 25 条记录');
      await user.type(getNamePhoneInput(), '张三');
      expect(getPagination().textContent).toContain('共 25 条记录');
      expect(getCurrentNames()).toContain('李四');

      await user.click(getSearchButton());

      expect(getPagination().textContent).toContain('共 1 条记录');
      expect(getCurrentNames()).toEqual(['张三']);
    });

    it('真实选择客资来源后需点击搜索才应用，并且结果全部符合来源', async () => {
      const user = userEvent.setup();
      render(<StoreCustomerList initialState="normal" />);

      await selectCustomerSource(user);
      expect(getPagination().textContent).toContain('共 25 条记录');
      expect(getCurrentNames()).toContain('李四');

      await user.click(getSearchButton());

      expect(getPagination().textContent).toContain('共 5 条记录');
      const rows = getCurrentDataRows();
      expect(rows).toHaveLength(5);
      rows.forEach((row) => expect(row.textContent).toContain('地推活动'));
    });

    it('重置应清空输入、待应用条件和已应用条件并恢复完整列表', async () => {
      const user = userEvent.setup();
      render(<StoreCustomerList initialState="normal" />);

      await user.type(getNamePhoneInput(), '张三');
      await selectCustomerSource(user);
      await user.click(getSearchButton());
      expect(getPagination().textContent).toContain('共 1 条记录');
      expect(getCurrentNames()).toEqual(['张三']);

      await user.click(getResetButton());

      expect(getNamePhoneInput().value).toBe('');
      expect(getByReqId('filter-source').textContent).not.toContain('地推活动');
      expect(getPagination().textContent).toContain('共 25 条记录');
      expect(getCurrentNames()).toContain('李四');

      await user.click(getSearchButton());
      expect(getPagination().textContent).toContain('共 25 条记录');
      expect(getCurrentNames()).toHaveLength(10);
    });
  });

  describe('预约到店时间排序', () => {
    it('连续点击表头应展示真实升序和降序记录顺序', async () => {
      const user = userEvent.setup();
      render(<StoreCustomerList initialState="normal" />);
      const sortHeader = screen.getByRole('columnheader', { name: /预约到店时间/ });

      await user.click(sortHeader);
      expect(getCurrentNames()).toEqual([
        '王五',
        '周杰',
        '张三',
        '郑浩',
        '李四',
        '陈晨',
        '赵敏',
        '孙丽',
        '刘洋',
        '吴芳',
      ]);

      await user.click(sortHeader);
      expect(getCurrentNames()).toEqual([
        '刘洋',
        '吴芳',
        '孙丽',
        '赵敏',
        '陈晨',
        '李四',
        '郑浩',
        '张三',
        '周杰',
        '王五',
      ]);
    });
  });

  describe('分页与零数据语义', () => {
    function expectZeroPagination(): void {
      const pagination = getPagination();
      expect(pagination.textContent).toContain('共 0 条记录');
      expect(pagination.textContent).toContain('0 / 0');
      expect(pagination.textContent).not.toContain('0 / 1');
      expect(
        (within(pagination).getByRole('button', { name: '上一页' }) as HTMLButtonElement)
          .disabled,
      ).toBe(true);
      expect(
        (within(pagination).getByRole('button', { name: '下一页' }) as HTMLButtonElement)
          .disabled,
      ).toBe(true);
    }

    it('筛选无结果显示0/0并保留专用提示', async () => {
      const user = userEvent.setup();
      render(<StoreCustomerList initialState="normal" />);

      await user.type(getNamePhoneInput(), '不存在的客户');
      await user.click(getSearchButton());

      expect(screen.getByText('筛选无结果，请调整筛选条件')).toBeTruthy();
      expect(screen.queryByText('当前暂无数据')).toBeNull();
      expectZeroPagination();
    });

    it('空数据显示0/0并与筛选无结果文案区分', () => {
      render(<StoreCustomerList initialState="empty" />);

      expect(screen.getByText('当前暂无数据')).toBeTruthy();
      expect(screen.queryByText('筛选无结果，请调整筛选条件')).toBeNull();
      expectZeroPagination();
    });

    it('正常列表可以切换到下一页并显示不同记录', async () => {
      const user = userEvent.setup();
      render(<StoreCustomerList initialState="normal" />);
      const firstPageNames = getCurrentNames();

      await user.click(within(getPagination()).getByRole('button', { name: '下一页' }));

      expect(getPagination().textContent).toContain('2 / 3');
      expect(getCurrentNames()).not.toEqual(firstPageNames);
    });
  });

  describe('操作菜单切换', () => {
    it('一次点击从A行切换到B行且始终只有一个菜单', async () => {
      const user = userEvent.setup();
      render(<StoreCustomerList initialState="normal" />);
      const first = getByReqId('operation-menu-trigger-1');

      await user.click(first);
      expect(
        getByReqId('operation-menu-trigger-1').getAttribute('aria-expanded'),
      ).toBe('true');
      expect(
        getByReqId('operation-menu-trigger-2').getAttribute('aria-expanded'),
      ).toBe('false');
      expect(screen.getAllByRole('menu')).toHaveLength(1);
      expect(screen.getByRole('menuitem', { name: '标注无效客资' })).toBeTruthy();

      await user.click(getByReqId('operation-menu-trigger-2'));
      await waitFor(() => {
        expect(
          getByReqId('operation-menu-trigger-1').getAttribute('aria-expanded'),
        ).toBe('false');
        expect(
          getByReqId('operation-menu-trigger-2').getAttribute('aria-expanded'),
        ).toBe('true');
        expect(screen.getAllByRole('menu')).toHaveLength(1);
      });
    });
  });

  describe('列级和行级稳定锚点', () => {
    it('三个列级锚点在初始、排序、分页、展开收起和resize后始终各1个', async () => {
      const user = userEvent.setup();
      render(<StoreCustomerList initialState="normal" />);

      expectColumnAnchorsUnique();

      await user.click(screen.getByRole('columnheader', { name: /预约到店时间/ }));
      expectColumnAnchorsUnique();

      await user.click(within(getPagination()).getByRole('button', { name: '下一页' }));
      expectColumnAnchorsUnique();

      await user.click(getByReqId('filter-expand-toggle'));
      expect(screen.getByText('次数筛选字段')).toBeTruthy();
      expectColumnAnchorsUnique();

      await user.click(getByReqId('filter-expand-toggle'));
      expect(screen.queryByText('次数筛选字段')).toBeNull();
      expectColumnAnchorsUnique();

      act(() => window.dispatchEvent(new Event('resize')));
      expectColumnAnchorsUnique();
    });

    it('当前页行级操作锚点全部来自稳定record.key且不重复', async () => {
      const user = userEvent.setup();
      render(<StoreCustomerList initialState="normal" />);

      const firstPageIds = getOperationButtons().map((button) =>
        button.getAttribute('data-req-id'),
      );
      expect(firstPageIds).toHaveLength(10);
      expect(new Set(firstPageIds).size).toBe(10);
      expect(firstPageIds).toContain('operation-menu-trigger-1');

      await user.click(within(getPagination()).getByRole('button', { name: '下一页' }));
      const secondPageIds = getOperationButtons().map((button) =>
        button.getAttribute('data-req-id'),
      );
      expect(secondPageIds).toHaveLength(10);
      expect(new Set(secondPageIds).size).toBe(10);
      expect(secondPageIds).toContain('operation-menu-trigger-11');
      expect(secondPageIds).not.toEqual(firstPageIds);
    });
  });

  describe('导出反馈定时器', () => {
    afterEach(() => {
      vi.clearAllTimers();
      vi.useRealTimers();
    });

    it('单次点击只产生一个反馈和一个清理定时器', () => {
      vi.useFakeTimers();
      render(<StoreCustomerList initialState="normal" />);

      fireEvent.click(getByReqId('export-button'));

      expect(document.querySelectorAll('.store-customer-export-toast')).toHaveLength(1);
      expect(screen.getByText('导出任务已创建')).toBeTruthy();
    });

    it('连续点击重新计时，旧定时器不会提前清除新反馈', () => {
      vi.useFakeTimers();
      render(<StoreCustomerList initialState="normal" />);
      const exportButton = getByReqId('export-button');

      fireEvent.click(exportButton);
      act(() => vi.advanceTimersByTime(1000));
      fireEvent.click(exportButton);

      act(() => vi.advanceTimersByTime(1999));
      expect(document.querySelectorAll('.store-customer-export-toast')).toHaveLength(1);
      act(() => vi.advanceTimersByTime(1));
      expect(document.querySelectorAll('.store-customer-export-toast')).toHaveLength(1);

      act(() => vi.advanceTimersByTime(1000));
      expect(document.querySelectorAll('.store-customer-export-toast')).toHaveLength(0);
    });

    it('卸载后没有待执行导出定时器', () => {
      vi.useFakeTimers();
      const { unmount } = render(<StoreCustomerList initialState="normal" />);

      fireEvent.click(getByReqId('export-button'));
      act(() => vi.advanceTimersByTime(100));
      expect(document.querySelectorAll('.store-customer-export-toast')).toHaveLength(1);
      expect(vi.getTimerCount()).toBe(1);
      unmount();

      expect(vi.getTimerCount()).toBe(0);
    });
  });

  describe('日期范围布局约束', () => {
    it('展开后两个日期范围均使用跨列布局且次数筛选保持成组', async () => {
      const user = userEvent.setup();
      render(<StoreCustomerList initialState="normal" />);

      await user.click(getByReqId('filter-expand-toggle'));

      const createRange = getByReqId('filter-create-time-range');
      const appointmentRange = getByReqId('filter-appointment-date-range');
      expect(createRange.closest('.store-customer-filter-item--date-range')).toBeTruthy();
      expect(appointmentRange.closest('.store-customer-filter-item--date-range')).toBeTruthy();
      const countGroup = screen.getByText('次数筛选字段').closest(
        '.store-customer-filter-count-group',
      );
      expect(countGroup).toBeTruthy();
      expect(within(countGroup as HTMLElement).getByText('最小值')).toBeTruthy();
      expect(within(countGroup as HTMLElement).getByText('最大值')).toBeTruthy();
    });
  });

  describe('日期范围分隔符', () => {
    it('默认收起状态下创建时间范围控件不存在（位于展开区）', () => {
      render(<StoreCustomerList initialState="normal" />);

      // 创建时间 RangePicker 位于展开区，默认收起时不应渲染。
      // 若此处不抛出（即控件被移入默认区），则代表布局约束发生变化，测试必须感知。
      expect(() => getByReqId('filter-create-time-range')).toThrow();
    });

    it('展开筛选区后创建时间范围显示"至"分隔符', async () => {
      const user = userEvent.setup();
      render(<StoreCustomerList initialState="normal" />);

      await user.click(getByReqId('filter-expand-toggle'));

      const createRange = getByReqId('filter-create-time-range');
      expect(createRange.textContent).toContain('至');
    });

    it('展开筛选区后预约到店日期范围显示"至"分隔符', async () => {
      const user = userEvent.setup();
      render(<StoreCustomerList initialState="normal" />);

      await user.click(getByReqId('filter-expand-toggle'));

      const appointmentRange = getByReqId('filter-appointment-date-range');
      expect(appointmentRange.textContent).toContain('至');
    });
  });

  describe('模拟数据安全边界', () => {
    it('使用25条通用模拟客户且手机号已脱敏', () => {
      expect(rawCustomers).toHaveLength(25);
      rawCustomers.forEach((customer) => {
        expect(customer.phone).toMatch(/^\d{3}\*{4}\d{4}$/);
      });
    });
  });

  // ==========================================================================
  // 0004 需求查看模式
  // ==========================================================================

  describe('0004 需求查看模式', () => {
    describe('默认原型体验模式', () => {
      it('默认只显示"查看需求"悬浮入口', () => {
        render(<StoreCustomerList initialState="normal" />);

        const viewBtn = screen.getByRole('button', { name: '查看需求' });
        expect(viewBtn).toBeTruthy();

        // 控制条未展开，不显示模式切换按钮
        expect(
          screen.queryByRole('button', { name: '原型体验模式' }),
        ).toBeNull();
        expect(
          screen.queryByRole('button', { name: '需求查看模式' }),
        ).toBeNull();
      });

      it('默认不显示任何需求编号点', () => {
        render(<StoreCustomerList initialState="normal" />);

        const markers = document.querySelectorAll(
          '[data-requirement-number]',
        );
        expect(markers).toHaveLength(0);
      });

      it('默认不显示需求抽屉', () => {
        render(<StoreCustomerList initialState="normal" />);

        expect(
          document.querySelector('[data-req-id="requirement-drawer"]'),
        ).toBeNull();
      });
    });

    describe('双模式切换', () => {
      it('点击"查看需求"进入需求查看模式，控制条显示"原型体验｜需求查看"', async () => {
        const user = userEvent.setup();
        render(<StoreCustomerList initialState="normal" />);

        await user.click(screen.getByRole('button', { name: '查看需求' }));

        // 控制条展开，显示双选项
        expect(
          screen.getByRole('button', { name: '原型体验模式' }),
        ).toBeTruthy();
        expect(
          screen.getByRole('button', { name: '需求查看模式' }),
        ).toBeTruthy();

        // 需求编号点出现
        const markers = document.querySelectorAll(
          '[data-requirement-number]',
        );
        expect(markers.length).toBeGreaterThan(0);
      });

      it('点击"原型体验"退出需求查看模式', async () => {
        const user = userEvent.setup();
        render(<StoreCustomerList initialState="normal" />);

        // 进入需求模式
        await user.click(screen.getByRole('button', { name: '查看需求' }));

        // 点击"原型体验"退出
        await user.click(
          screen.getByRole('button', { name: '原型体验模式' }),
        );

        // 编号点消失
        const markers = document.querySelectorAll(
          '[data-requirement-number]',
        );
        expect(markers).toHaveLength(0);

        // 抽屉关闭
        expect(
          document.querySelector('[data-req-id="requirement-drawer"]'),
        ).toBeNull();

        // 恢复为收起状态（只显示"查看需求"按钮）
        expect(
          screen.getByRole('button', { name: '查看需求' }),
        ).toBeTruthy();
      });

      it('需求查看 Story 默认进入需求查看模式', () => {
        render(
          <StoreCustomerList
            initialState="normal"
            initialRequirementMode="requirement"
          />,
        );

        // 控制条应展开，显示模式切换按钮
        expect(
          screen.getByRole('button', { name: '原型体验模式' }),
        ).toBeTruthy();
        expect(
          screen.getByRole('button', { name: '需求查看模式' }),
        ).toBeTruthy();

        // 需求编号点应出现
        const markers = document.querySelectorAll(
          '[data-requirement-number]',
        );
        expect(markers.length).toBeGreaterThan(0);
      });
    });

    describe('编号点与需求抽屉', () => {
      async function enterRequirementMode() {
        const user = userEvent.setup();
        render(<StoreCustomerList initialState="normal" />);
        await user.click(screen.getByRole('button', { name: '查看需求' }));
        return user;
      }

      it('表头1—8需求点可通过稳定data属性定位', async () => {
        await enterRequirementMode();

        // 验证编号 1-8 的 marker 各至少存在1个
        for (let num = 1; num <= 8; num++) {
          const markers = document.querySelectorAll(
            `[data-requirement-number="${num}"]`,
          );
          expect(markers.length).toBeGreaterThanOrEqual(1);
        }
      });

      it('筛选项显示编号9', async () => {
        await enterRequirementMode();

        const filterArea = document.querySelector(
          '[data-req-id="filter-area"]',
        );
        expect(filterArea).toBeTruthy();
        const marker9 = filterArea!.querySelector(
          '[data-requirement-number="9"]',
        );
        expect(marker9).toBeTruthy();
        // 编号9对应无效客资筛选
        expect(marker9!.getAttribute('data-requirement-key')).toBe(
          'scrm-store-customer-invalid-lead-filter',
        );
        expect(marker9!.getAttribute('data-req-id')).toBe(
          'invalid-lead-filter',
        );
      });

      it('行内编号10使用不同record.key形成稳定data-req-id', async () => {
        await enterRequirementMode();

        const markers10 = document.querySelectorAll(
          '[data-requirement-number="10"]',
        );
        expect(markers10.length).toBeGreaterThanOrEqual(2);
        expect(markers10[0]!.getAttribute('data-requirement-key')).toBe(
          'scrm-store-customer-invalid-lead-detail',
        );
        expect(markers10[0]!.getAttribute('data-req-id')).toBe(
          `invalid-lead-detail-${rawCustomers[0]!.key}`,
        );
        expect(markers10[1]!.getAttribute('data-req-id')).toBe(
          `invalid-lead-detail-${rawCustomers[1]!.key}`,
        );
        expect(markers10[0]!.getAttribute('data-req-id')).not.toBe(
          markers10[1]!.getAttribute('data-req-id'),
        );
      });

      it('展开操作菜单后显示编号11', async () => {
        const user = await enterRequirementMode();

        // 点击第一个操作按钮展开菜单
        const trigger = document.querySelector(
          '[data-req-id="operation-menu-trigger-1"]',
        ) as HTMLElement;
        await user.click(trigger);

        // 菜单中应出现编号11
        const marker11 = document.querySelector(
          '[data-requirement-number="11"]',
        );
        expect(marker11).toBeTruthy();
        expect(marker11!.getAttribute('data-requirement-key')).toBe(
          'scrm-store-customer-invalid-lead-approval',
        );
        expect(marker11!.getAttribute('data-req-id')).toBe(
          `invalid-lead-approval-${rawCustomers[0]!.key}`,
        );
      });

      it('编号12实际渲染并可打开WB-01需求说明', async () => {
        const user = await enterRequirementMode();

        // 唯一性：data-req-id="requirement-view-mode-control" 恰好只有1个
        const controls = document.querySelectorAll(
          '[data-req-id="requirement-view-mode-control"]',
        );
        expect(controls).toHaveLength(1);

        const marker12 = controls[0]!;
        expect(marker12.textContent).toBe('12');
        expect(marker12.getAttribute('data-requirement-number')).toBe('12');
        expect(marker12.getAttribute('data-requirement-key')).toBe(
          'scrm-store-customer-requirement-view-mode',
        );
        // 该唯一元素必须为点击型需求点
        expect(marker12.getAttribute('role')).toBe('button');
        expect(marker12.getAttribute('aria-label')).toContain('需求编号 12');

        await user.click(marker12);

        const drawer = getByReqId('requirement-drawer');
        expect(drawer.textContent).toContain('WB-01');
        expect(drawer.textContent).toContain('需求查看模式与需求说明联动');
        expect(drawer.textContent).toContain('已确认');
        expect(
          screen.getByRole('button', { name: '需求查看模式' }).getAttribute(
            'aria-pressed',
          ),
        ).toBe('true');
      });

      it('点击需求点打开抽屉并展示对应requirementNo和requirementName', async () => {
        const user = await enterRequirementMode();

        // 点击编号1（首次分配时间）的 marker
        const marker1 = document.querySelector(
          '[data-requirement-number="1"]',
        ) as HTMLElement;
        await user.click(marker1);

        // 抽屉应打开
        const drawer = document.querySelector(
          '[data-req-id="requirement-drawer"]',
        );
        expect(drawer).toBeTruthy();

        // 验证抽屉显示正确内容
        const reqData = getRequirement(
          'scrm-store-customer-first-allocation-time',
        );
        expect(reqData).toBeTruthy();
        expect(drawer!.textContent).toContain(reqData!.requirementNo);
        expect(drawer!.textContent).toContain(reqData!.requirementName);
      });

      it('点击另一个需求点后抽屉内容切换', async () => {
        const user = await enterRequirementMode();

        // 先点击编号1
        const marker1 = document.querySelector(
          '[data-requirement-number="1"]',
        ) as HTMLElement;
        await user.click(marker1);

        const drawer = document.querySelector(
          '[data-req-id="requirement-drawer"]',
        );
        const firstContent = drawer!.textContent;

        // 再点击编号2
        const marker2 = document.querySelector(
          '[data-requirement-number="2"]',
        ) as HTMLElement;
        await user.click(marker2);

        // 内容应切换
        const secondContent = drawer!.textContent;
        expect(secondContent).not.toBe(firstContent);

        // 验证是SC-01-02的内容
        const reqData2 = getRequirement(
          'scrm-store-customer-latest-allocation-time',
        );
        expect(drawer!.textContent).toContain(reqData2!.requirementNo);
        expect(drawer!.textContent).toContain(reqData2!.requirementName);
      });

      it('切换需求点后旧targetId取消选中，新targetId高亮', async () => {
        const user = await enterRequirementMode();

        // 点击编号1
        const marker1 = document.querySelector(
          '[data-requirement-number="1"]',
        ) as HTMLElement;
        await user.click(marker1);

        // marker1 应有选中状态
        expect(
          marker1.classList.contains('requirement-marker--selected'),
        ).toBe(true);

        // 点击编号2
        const marker2 = document.querySelector(
          '[data-requirement-number="2"]',
        ) as HTMLElement;
        await user.click(marker2);

        // marker1 应取消选中
        expect(
          marker1.classList.contains('requirement-marker--selected'),
        ).toBe(false);
        // marker2 应选中
        expect(
          marker2.classList.contains('requirement-marker--selected'),
        ).toBe(true);
      });

      it('关闭抽屉仍保留需求查看模式和编号点', async () => {
        const user = await enterRequirementMode();

        // 打开抽屉
        const marker1 = document.querySelector(
          '[data-requirement-number="1"]',
        ) as HTMLElement;
        await user.click(marker1);

        // 关闭抽屉
        await user.click(
          screen.getByRole('button', { name: '关闭需求抽屉' }),
        );

        // 抽屉已关闭
        expect(
          document.querySelector('[data-req-id="requirement-drawer"]'),
        ).toBeNull();

        // 编号点仍在
        const markers = document.querySelectorAll(
          '[data-requirement-number]',
        );
        expect(markers.length).toBeGreaterThan(0);

        // 模式切换按钮仍在
        expect(
          screen.getByRole('button', { name: '需求查看模式' }),
        ).toBeTruthy();
      });

      it('「返回原型体验」关闭抽屉并退出需求模式', async () => {
        const user = await enterRequirementMode();

        // 打开抽屉
        const marker1 = document.querySelector(
          '[data-requirement-number="1"]',
        ) as HTMLElement;
        await user.click(marker1);

        // 点击"返回原型体验"
        await user.click(
          screen.getByRole('button', { name: '返回原型体验模式' }),
        );

        // 抽屉关闭
        expect(
          document.querySelector('[data-req-id="requirement-drawer"]'),
        ).toBeNull();

        // 编号点消失
        const markers = document.querySelectorAll(
          '[data-requirement-number]',
        );
        expect(markers).toHaveLength(0);
      });
    });

    describe('空字段处理', () => {
      async function enterRequirementModeAndClickMarker(
        markerNumber: number,
      ) {
        const user = userEvent.setup();
        render(<StoreCustomerList initialState="normal" />);
        await user.click(screen.getByRole('button', { name: '查看需求' }));
        const marker = document.querySelector(
          `[data-requirement-number="${markerNumber}"]`,
        ) as HTMLElement;
        await user.click(marker);
        return user;
      }

      it('requirementNo和requirementName始终显示', async () => {
        // 使用 SC-01-01（首次分配时间），它同时有 definition 和 remark
        await enterRequirementModeAndClickMarker(1);

        const drawer = document.querySelector(
          '[data-req-id="requirement-drawer"]',
        );
        const reqData = getRequirement(
          'scrm-store-customer-first-allocation-time',
        );
        expect(drawer!.textContent).toContain(reqData!.requirementNo);
        expect(drawer!.textContent).toContain(reqData!.requirementName);
      });

      it('Schema解析后的空status实际回退为"待确认"且空字段不渲染', async () => {
        const user = userEvent.setup();
        render(
          <RequirementViewProvider initialMode="requirement">
            <EmptyRequirementDrawerHarness />
          </RequirementViewProvider>,
        );
        await user.click(
          screen.getByRole('button', { name: '打开空字段需求' }),
        );

        const drawer = getByReqId('requirement-drawer');
        expect(drawer.textContent).toContain('WB-EMPTY');
        expect(drawer.textContent).toContain('工作台空字段能力演示');
        expect(drawer.textContent).toContain('待确认');
        expect(drawer.textContent).not.toContain('基础定义');
        expect(drawer.textContent).not.toContain('数据来源');
        expect(drawer.textContent).not.toContain('取值或计算规则');
        expect(drawer.textContent).not.toContain('备注');
      });

      it('缺失/null/空字符串/纯空格字段不渲染空模块', async () => {
        // SC-01-01 的 dataSource 和 rule 为 null，不应出现对应标题
        await enterRequirementModeAndClickMarker(1);

        const drawer = document.querySelector(
          '[data-req-id="requirement-drawer"]',
        );
        // dataSource 为 null 时不应渲染"数据来源"标题
        expect(drawer!.textContent).not.toContain('数据来源');
        // rule 为 null 时不应渲染"取值或计算规则"标题
        expect(drawer!.textContent).not.toContain('取值或计算规则');
      });
    });

    describe('预约到店时间排序隔离', () => {
      async function getAppointmentSortHeader() {
        return screen.getByRole('columnheader', {
          name: /预约到店时间/,
        });
      }

      it('原型模式第一次点击真实升序', async () => {
        const user = userEvent.setup();
        render(<StoreCustomerList initialState="normal" />);

        await user.click(await getAppointmentSortHeader());

        expect(getCurrentNames()).toEqual([
          '王五',
          '周杰',
          '张三',
          '郑浩',
          '李四',
          '陈晨',
          '赵敏',
          '孙丽',
          '刘洋',
          '吴芳',
        ]);
      });

      it('第二次点击真实降序', async () => {
        const user = userEvent.setup();
        render(<StoreCustomerList initialState="normal" />);

        const header = await getAppointmentSortHeader();
        await user.click(header);
        await user.click(header);

        expect(getCurrentNames()).toEqual([
          '刘洋',
          '吴芳',
          '孙丽',
          '赵敏',
          '陈晨',
          '李四',
          '郑浩',
          '张三',
          '周杰',
          '王五',
        ]);
      });

      it('需求模式点击预约到店时间打开SC-01-05，不改变记录顺序', async () => {
        const user = userEvent.setup();
        render(<StoreCustomerList initialState="normal" />);

        // 先记下原始顺序
        const originalNames = getCurrentNames();

        // 进入需求模式
        await user.click(screen.getByRole('button', { name: '查看需求' }));

        // 需求模式下点击预约到店时间列的编号5
        const marker5 = document.querySelector(
          '[data-requirement-number="5"]',
        ) as HTMLElement;
        await user.click(marker5);

        // 应打开SC-01-05的抽屉
        const drawer = document.querySelector(
          '[data-req-id="requirement-drawer"]',
        );
        expect(drawer).toBeTruthy();
        const reqData = getRequirement(
          'scrm-store-customer-appointment-arrival-time',
        );
        expect(drawer!.textContent).toContain(reqData!.requirementNo);

        // 记录顺序不应改变
        expect(getCurrentNames()).toEqual(originalNames);
      });

      it('排序方向跨模式切换完整保留', async () => {
        const user = userEvent.setup();
        render(<StoreCustomerList initialState="normal" />);

        // 1. 原型模式升序排序
        await user.click(await getAppointmentSortHeader());
        const ascendingNames = getCurrentNames();
        expect(ascendingNames[0]).toBe('王五');

        // 2. 进入需求模式（这时控制条还是收起状态）
        //    然后切换到需求查看模式
        await user.click(screen.getByRole('button', { name: '查看需求' }));

        // 3. 点击"原型体验"回到原型模式
        await user.click(
          screen.getByRole('button', { name: '原型体验模式' }),
        );

        // 4. 验证排序方向保留（升序仍然生效）
        const namesAfterReturn = getCurrentNames();
        expect(namesAfterReturn).toEqual(ascendingNames);
      });
    });

    describe('操作和筛选隔离', () => {
      it('原型菜单切换模式后可关闭，并能在需求模式重新展开编号11', async () => {
        const user = userEvent.setup();
        render(<StoreCustomerList initialState="normal" />);

        const triggerId = `operation-menu-trigger-${rawCustomers[0]!.key}`;
        const trigger = getByReqId(triggerId);
        await user.click(trigger);
        expect(getByReqId(triggerId).getAttribute('aria-expanded')).toBe('true');
        expect(
          screen.getByRole('menuitem', { name: '标注无效客资' }),
        ).toBeTruthy();

        await user.click(screen.getByRole('button', { name: '查看需求' }));
        expect(getByReqId(triggerId).getAttribute('aria-expanded')).toBe('false');

        await user.click(getByReqId(triggerId));
        expect(getByReqId(triggerId).getAttribute('aria-expanded')).toBe('true');

        const marker11 = document.querySelector(
          '[data-requirement-number="11"]',
        ) as HTMLElement;
        expect(marker11).toBeTruthy();
        expect(marker11.getAttribute('data-req-id')).toBe(
          `invalid-lead-approval-${rawCustomers[0]!.key}`,
        );

        await user.click(marker11);
        const drawer = getByReqId('requirement-drawer');
        expect(drawer.textContent).toContain('SC-02');
        expect(drawer.textContent).toContain('审批无效客资');
      });

      it('点击编号11打开SC-02需求抽屉', async () => {
        const user = userEvent.setup();
        render(<StoreCustomerList initialState="normal" />);
        await user.click(screen.getByRole('button', { name: '查看需求' }));

        // 展开操作菜单
        const trigger = document.querySelector(
          '[data-req-id="operation-menu-trigger-1"]',
        ) as HTMLElement;
        await user.click(trigger);

        // 点击编号11
        const marker11 = document.querySelector(
          '[data-requirement-number="11"]',
        ) as HTMLElement;
        await user.click(marker11);

        // 抽屉应打开并显示SC-02
        const drawer = document.querySelector(
          '[data-req-id="requirement-drawer"]',
        );
        expect(drawer).toBeTruthy();
        const reqData = getRequirement(
          'scrm-store-customer-invalid-lead-approval',
        );
        expect(drawer!.textContent).toContain(reqData!.requirementNo);
        expect(drawer!.textContent).toContain('SC-02');
      });

      it('点击筛选编号9不改变pending筛选控件值', async () => {
        const user = userEvent.setup();
        render(<StoreCustomerList initialState="normal" />);

        // 先设置pending筛选值
        const nameInput = screen.getByPlaceholderText(
          '请输入姓名或手机号',
        ) as HTMLInputElement;
        await user.type(nameInput, '张三');

        // 进入需求模式
        await user.click(screen.getByRole('button', { name: '查看需求' }));

        // 点击筛选编号9
        const filterMarker9 = document.querySelector(
          '[data-req-id="filter-area"] [data-requirement-number="9"]',
        ) as HTMLElement;
        await user.click(filterMarker9);

        // pending筛选值不应改变
        expect(nameInput.value).toBe('张三');
      });

      it('原型模式原有菜单行为继续通过', async () => {
        const user = userEvent.setup();
        render(<StoreCustomerList initialState="normal" />);

        // 展开菜单
        const first = document.querySelector(
          '[data-req-id="operation-menu-trigger-1"]',
        ) as HTMLElement;
        await user.click(first);

        // 菜单应显示"标注无效客资"
        expect(
          screen.getByRole('menuitem', { name: '标注无效客资' }),
        ).toBeTruthy();

        // 切换到另一行
        await user.click(
          document.querySelector(
            '[data-req-id="operation-menu-trigger-2"]',
          ) as HTMLElement,
        );

        await waitFor(() => {
          expect(
            document.querySelector(
              '[data-req-id="operation-menu-trigger-1"]',
            )!.getAttribute('aria-expanded'),
          ).toBe('false');
          expect(
            document.querySelector(
              '[data-req-id="operation-menu-trigger-2"]',
            )!.getAttribute('aria-expanded'),
          ).toBe('true');
        });
      });
    });

    describe('页面状态保持', () => {
      it('pending筛选输入跨模式切换保留', async () => {
        const user = userEvent.setup();
        render(<StoreCustomerList initialState="normal" />);

        // 输入pending筛选
        const nameInput = screen.getByPlaceholderText(
          '请输入姓名或手机号',
        ) as HTMLInputElement;
        await user.type(nameInput, '张三');
        expect(nameInput.value).toBe('张三');

        // 进入需求模式
        await user.click(screen.getByRole('button', { name: '查看需求' }));
        // 回到原型模式
        await user.click(
          screen.getByRole('button', { name: '原型体验模式' }),
        );

        // pending筛选应保留
        const nameInputAfter = screen.getByPlaceholderText(
          '请输入姓名或手机号',
        ) as HTMLInputElement;
        expect(nameInputAfter.value).toBe('张三');
      });

      it('applied筛选条件和结果跨模式切换保留', async () => {
        const user = userEvent.setup();
        render(<StoreCustomerList initialState="normal" />);

        // 搜索"张三"
        await user.type(
          screen.getByPlaceholderText('请输入姓名或手机号'),
          '张三',
        );
        await user.click(
          document.querySelector('[data-req-id="search-button"]') as HTMLElement,
        );
        expect(document.querySelector('[data-req-id="pagination-area"]')!.textContent).toContain(
          '共 1 条记录',
        );

        // 进入需求模式再返回
        await user.click(screen.getByRole('button', { name: '查看需求' }));
        await user.click(
          screen.getByRole('button', { name: '原型体验模式' }),
        );

        // 筛选结果应保留
        expect(document.querySelector('[data-req-id="pagination-area"]')!.textContent).toContain(
          '共 1 条记录',
        );
        expect(getCurrentNames()).toEqual(['张三']);
      });

      it('筛选区展开状态跨模式切换保留', async () => {
        const user = userEvent.setup();
        render(<StoreCustomerList initialState="normal" />);

        // 展开筛选区
        await user.click(
          document.querySelector(
            '[data-req-id="filter-expand-toggle"]',
          ) as HTMLElement,
        );
        expect(screen.getByText('次数筛选字段')).toBeTruthy();

        // 进入需求模式再返回
        await user.click(screen.getByRole('button', { name: '查看需求' }));
        await user.click(
          screen.getByRole('button', { name: '原型体验模式' }),
        );

        // 筛选区应保持展开
        expect(screen.getByText('次数筛选字段')).toBeTruthy();
      });

      it('当前分页跨模式切换保留', async () => {
        const user = userEvent.setup();
        render(<StoreCustomerList initialState="normal" />);

        // 切换到第2页
        const pagination = document.querySelector(
          '[data-req-id="pagination-area"]',
        ) as HTMLElement;
        await user.click(
          within(pagination).getByRole('button', { name: '下一页' }),
        );
        expect(pagination.textContent).toContain('2 / 3');

        // 进入需求模式再返回
        await user.click(screen.getByRole('button', { name: '查看需求' }));
        await user.click(
          screen.getByRole('button', { name: '原型体验模式' }),
        );

        // 分页应保留在第2页
        const paginationAfter = document.querySelector(
          '[data-req-id="pagination-area"]',
        ) as HTMLElement;
        expect(paginationAfter.textContent).toContain('2 / 3');
      });

      it('每页条数跨模式切换保留', async () => {
        const user = userEvent.setup();
        render(<StoreCustomerList initialState="normal" />);

        // 切换每页条数为20
        const pagination = document.querySelector(
          '[data-req-id="pagination-area"]',
        ) as HTMLElement;
        const pageSizeSelect = within(pagination).getByRole('combobox');
        await user.click(pageSizeSelect);
        const option20 = await screen.findByText('20条/页');
        await user.click(option20);

        // 验证切换成功
        expect(getOperationButtons().length).toBeGreaterThanOrEqual(11);

        // 进入需求模式再返回
        await user.click(screen.getByRole('button', { name: '查看需求' }));
        await user.click(
          screen.getByRole('button', { name: '原型体验模式' }),
        );

        // 每页条数应保留为20
        const paginationAfter = document.querySelector(
          '[data-req-id="pagination-area"]',
        ) as HTMLElement;
        expect(paginationAfter.textContent).toContain('20条/页');
      });

      it('模式切换前后表格为同一DOM节点', async () => {
        const user = userEvent.setup();
        render(<StoreCustomerList initialState="normal" />);

        const tableBefore = document.querySelector(
          '[data-req-id="customer-table"]',
        );

        // 进入需求模式
        await user.click(screen.getByRole('button', { name: '查看需求' }));

        const tableInReq = document.querySelector(
          '[data-req-id="customer-table"]',
        );

        // 回到原型模式
        await user.click(
          screen.getByRole('button', { name: '原型体验模式' }),
        );

        const tableAfter = document.querySelector(
          '[data-req-id="customer-table"]',
        );

        // 三个引用应为同一个DOM节点
        expect(tableBefore).toBe(tableInReq);
        expect(tableInReq).toBe(tableAfter);
      });
    });
  });

  // ==========================================================================
  // 0007 样式隔离与品牌名称统一
  // ==========================================================================

  describe('0007 文字样式隔离', () => {
    it('原型模式表头 children 包裹在 prototype-target 中，不含 marker 视觉类', () => {
      render(<StoreCustomerList initialState="normal" />);

      // 原型模式下表头文字存在
      const headerTexts = screen.getAllByText('首次分配时间');
      expect(headerTexts.length).toBeGreaterThan(0);

      // 至少有一个被 prototype-target 包裹
      const wrappedTexts = headerTexts.filter(
        (el) => el.closest('.requirement-marker-prototype-target') !== null,
      );
      expect(wrappedTexts.length).toBeGreaterThan(0);

      // 所有 prototype-target 不含 marker 视觉类
      const protoWrappers = document.querySelectorAll(
        '.requirement-marker-prototype-target',
      );
      expect(protoWrappers.length).toBeGreaterThan(0);
      protoWrappers.forEach((wrapper) => {
        expect(wrapper.classList.contains('requirement-marker--header')).toBe(false);
        expect(wrapper.classList.contains('requirement-marker--inline')).toBe(false);
      });
    });

    it('需求模式表头 children 在 marker-target 中而非 marker 内部', () => {
      render(
        <StoreCustomerList
          initialState="normal"
          initialRequirementMode="requirement"
        />,
      );

      // 编号点存在
      const markers = document.querySelectorAll('[data-requirement-number]');
      expect(markers.length).toBeGreaterThan(0);

      // 每个 marker 的 parentElement 是 requirement-marker-target
      markers.forEach((marker) => {
        const parent = marker.parentElement;
        // 强制断言父元素存在：parentElement 为 null 时测试必须失败
        expect(parent).not.toBeNull();
        const parentEl = parent as HTMLElement;
        expect(
          parentEl.classList.contains('requirement-marker-target') ||
            parentEl.classList.contains('requirement-mode-control--expanded'),
        ).toBe(true);
      });
    });

    it('两种模式下同一列名文字的包裹层不含 marker 视觉类', () => {
      // 原型模式
      const { unmount: unmountProto } = render(
        <StoreCustomerList initialState="normal" />,
      );
      const protoWrappers = document.querySelectorAll(
        '.requirement-marker-prototype-target',
      );
      expect(protoWrappers.length).toBeGreaterThan(0);
      protoWrappers.forEach((wrapper) => {
        expect(wrapper.classList.contains('requirement-marker--header')).toBe(false);
      });
      unmountProto();

      // 需求模式
      render(
        <StoreCustomerList
          initialState="normal"
          initialRequirementMode="requirement"
        />,
      );
      // marker-target 不包含 header 视觉类
      const targets = document.querySelectorAll('.requirement-marker-target');
      expect(targets.length).toBeGreaterThan(0);
      targets.forEach((target) => {
        expect(target.classList.contains('requirement-marker--header')).toBe(false);
      });

      // 列名文字出现在 target 的 children 中（而非 marker 内）
      const headerTexts = screen.getAllByText('首次分配时间');
      const inTarget = headerTexts.filter(
        (el) => el.closest('.requirement-marker-target') !== null,
      );
      expect(inTarget.length).toBeGreaterThan(0);
    });
  });

  describe('0007 SCRM 品牌名称统一', () => {
    it('左侧导航品牌区显示"SCRM系统"', () => {
      render(<StoreCustomerList initialState="normal" />);
      expect(screen.getByText('SCRM系统')).toBeTruthy();
    });

    it('主体顶部系统标题显示"SCRM管理系统"', () => {
      render(<StoreCustomerList initialState="normal" />);
      expect(screen.getByText('SCRM管理系统')).toBeTruthy();
    });

    it('页面壳不再显示"示例 SCRM"品牌名', () => {
      render(<StoreCustomerList initialState="normal" />);
      expect(screen.queryByText('示例 SCRM')).toBeNull();
    });

    it('页面壳不再显示"示例 SCRM 管理系统"标题', () => {
      render(<StoreCustomerList initialState="normal" />);
      expect(screen.queryByText('示例 SCRM 管理系统')).toBeNull();
    });

    it('需求查看模式下品牌名称同样正确', () => {
      render(
        <StoreCustomerList
          initialState="normal"
          initialRequirementMode="requirement"
        />,
      );
      expect(screen.getByText('SCRM系统')).toBeTruthy();
      expect(screen.getByText('SCRM管理系统')).toBeTruthy();
    });
  });
});
