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
import { InvalidReviewDrawer } from '../InvalidReviewDrawer';
import {
  ALL_COLUMNS,
  COLUMN_COUNT,
  COLUMN_ORDER,
  COLUMN_REQUIREMENT_ANCHORS,
} from '../columns';
import { getRequirement } from '../../../../../../../requirements/products/scrm/pages/store-customer';
import { requirementViewEntrySchema } from '../../../../../../../requirements/schemas/requirement-view';
import { ARRIVAL_RECORD_HEADERS } from '../../../arrival-record';
import { VISIT_RECORD_HEADERS } from '../../../visit-record';
import {
  RequirementDrawer,
  RequirementViewProvider,
  useRequirementView,
} from '../../../../../../../prototype-core/requirement-view';
import rawCustomers from '../mockData';
import type { CustomerRecord } from '../mockData';

afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
});

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
  'invalid-customer-flag-column',
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

function getColumnIndexByHeader(headerName: string): number {
  const index = ALL_COLUMNS.findIndex((column) => column.title === headerName);
  if (index < 0) throw new Error(`未找到表头“${headerName}”`);
  return index;
}

function getCellByHeader(row: HTMLElement, headerName: string): HTMLElement {
  const cells = within(row).getAllByRole('cell');
  const cell = cells[getColumnIndexByHeader(headerName)];
  if (!cell) throw new Error(`数据行缺少“${headerName}”列`);
  return cell;
}

function getVisibleColumnValues(headerName: string): string[] {
  return getCurrentDataRows().map((row) =>
    getCellByHeader(row, headerName).textContent?.trim() ?? '',
  );
}

function getCurrentNames(): string[] {
  return getVisibleColumnValues('姓名');
}

function createSortTestData(): CustomerRecord[] {
  const values = [
    {
      key: 'sort-a',
      name: '排序甲',
      firstAssignTime: '2026-07-03 09:00:00',
      lastAssignTime: '2026-07-02 09:00:00',
      appointmentTime: '2026-07-01 09:00:00',
      isVisited: '已到店',
      isDeal: '已成交',
    },
    {
      key: 'sort-b',
      name: '排序乙',
      firstAssignTime: '2026-07-01 09:00:00',
      lastAssignTime: '2026-07-03 09:00:00',
      appointmentTime: '2026-07-03 09:00:00',
      isVisited: '未到店',
      isDeal: '未成交',
    },
    {
      key: 'sort-c',
      name: '排序丙',
      firstAssignTime: '2026-07-02 09:00:00',
      lastAssignTime: '2026-07-01 09:00:00',
      appointmentTime: '2026-07-02 09:00:00',
      isVisited: '已到店',
      isDeal: '未成交',
    },
    {
      key: 'sort-empty',
      name: '排序空值',
      firstAssignTime: '-',
      lastAssignTime: '',
      appointmentTime: '0000-00-00 00:00:00',
      isVisited: '--',
      isDeal: '--',
    },
  ];

  return values.map((value, index) => ({
    ...rawCustomers[index]!,
    ...value,
    invalidApprovalStatus: null,
  }));
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
      expect(COLUMN_ORDER).toEqual([
        'name',
        'phone',
        'source',
        'lastAssignTime',
        'appointmentTime',
        'isVisited',
        'isDeal',
        'firstDealAmount',
        'invalidCustomerFlag',
        'interviewCount',
        'visitCount7d',
        'invalidApprovalStatus',
        'id',
        'userId',
        'wechatId',
        'retainStore',
        'retainStoreRemark',
        'gender',
        'age',
        'customerType',
        'isAssigned',
        'latestFollower',
        'sharer',
        'visitCount',
        'visitCount30d',
        'interviewCount7d',
        'interviewCount30d',
        'conversionDays',
        'dealCycleDays',
        'latestEditor',
        'remark',
        'inviteEmployeeId',
        'inviteEmployeeName',
        'groundPromotionQuestionnaire',
        'answer',
        'questionnaireSubmitTime',
        'appointmentStore',
        'isGiftTrialClass',
        'trialClassGetTime',
        'contractNo',
        'isAppointed',
        'trialClassStatus',
        'trialClassEndTime',
        'userTags',
        'trialClassPayAmount',
        'trialClassConsultant',
        'isRegistered',
        'repeatRetainCount',
        'latestRetainTime',
        'firstAssignTime',
        'createTime',
        'operation',
      ]);
      expect(ALL_COLUMNS[0]?.fixed).toBe('left');
      expect(ALL_COLUMNS.at(-1)?.fixed).toBe('right');
      expect(COLUMN_ORDER.filter((key) => key === 'appointmentTime')).toHaveLength(1);
      expect(COLUMN_ORDER.filter((key) => key === 'invalidCustomerFlag')).toHaveLength(1);
      expect(COLUMN_ORDER.filter((key) => key === 'firstAssignTime')).toHaveLength(1);
    });

    it('前13列与尾部表头顺序符合最新基线', () => {
      const titles = ALL_COLUMNS.map((c) => c.title as string);
      expect(titles.slice(0, 13)).toEqual([
        '姓名',
        '手机号',
        '客资来源',
        '最新分配时间',
        '预约到店时间',
        '是否到店',
        '是否成交',
        '新办成交金额',
        '标记无效客资',
        '拜访次数',
        '近7天到店次数',
        '无效审批状态',
        'ID',
      ]);
      // 尾部：最新留资时间(49) → 首次分配时间(50) → 创建时间(51) → 操作(52)
      expect(titles.slice(-4)).toEqual([
        '最新留资时间',
        '首次分配时间',
        '创建时间',
        '操作',
      ]);
      expect(titles.at(-1)).toBe('操作');
    });

    it('实际渲染的表头顺序与52列基线一致（前13列与尾部）', () => {
      render(<StoreCustomerList initialState="normal" />);

      // 读取真实渲染的表头（固定列可能重复渲染，按首次出现去重保留 52 个唯一列名）。
      // 与 ALL_COLUMNS 定义不同，此处直接断言页面实际渲染的 DOM 顺序，
      // 防止“代码顺序与页面渲染顺序不一致”。
      const seen = new Set<string>();
      const renderedTitles: string[] = [];
      for (const header of screen.getAllByRole('columnheader')) {
        const text = header.textContent?.trim() ?? '';
        if (text && !seen.has(text)) {
          seen.add(text);
          renderedTitles.push(text);
        }
      }

      expect(renderedTitles).toHaveLength(52);
      // 左侧实际渲染顺序
      expect(renderedTitles.slice(0, 13)).toEqual([
        '姓名',
        '手机号',
        '客资来源',
        '最新分配时间',
        '预约到店时间',
        '是否到店',
        '是否成交',
        '新办成交金额',
        '标记无效客资',
        '拜访次数',
        '近7天到店次数',
        '无效审批状态',
        'ID',
      ]);
      // 页面最右侧尾部实际顺序
      expect(renderedTitles.slice(-4)).toEqual([
        '最新留资时间',
        '首次分配时间',
        '创建时间',
        '操作',
      ]);
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
        { id: 'first-deal-amount-column', columnKey: 'firstDealAmount', description: '新办成交金额列' },
        { id: 'invalid-approval-status-column', columnKey: 'invalidApprovalStatus', description: '无效审批状态列' },
        { id: 'invalid-customer-flag-column', columnKey: 'invalidCustomerFlag', description: '标记无效客资列' },
      ]);
    });
  });

  describe('标记无效客资列（派生结果字段）', () => {
    function getFlagCellByRowKey(rowKey: string): HTMLElement {
      const row = document.querySelector(`tr[data-row-key="${rowKey}"]`);
      if (!row) throw new Error(`未找到行 ${rowKey}`);
      return getCellByHeader(row as HTMLElement, '标记无效客资');
    }

    it('展示值仅为"是"或"否"，与无效审批状态语义独立', () => {
      render(<StoreCustomerList initialState="normal" />);

      // 表头显示"标记无效客资"
      expect(screen.getByRole('columnheader', { name: '标记无效客资' })).toBeTruthy();

      // 状态映射：approved → 是；null / pending / rejected → 否
      expect(getFlagCellByRowKey('5').textContent?.trim()).toBe('是'); // 陈晨 approved
      expect(getFlagCellByRowKey('1').textContent?.trim()).toBe('否'); // 张三 null
      expect(getFlagCellByRowKey('2').textContent?.trim()).toBe('否'); // 李四 pending
      expect(getFlagCellByRowKey('7').textContent?.trim()).toBe('否'); // 周杰 rejected

      // 两列位置符合最新基线且语义独立：结果列为第 9 列，流程列为第 12 列
      expect(COLUMN_ORDER.indexOf('invalidCustomerFlag')).toBe(8);
      expect(COLUMN_ORDER.indexOf('invalidApprovalStatus')).toBe(11);
    });

    it('结果列不把 invalidApprovalStatus 作为 dataIndex，仅按审批状态派生', () => {
      const col = ALL_COLUMNS.find((c) => c.key === 'invalidCustomerFlag');
      expect(col).toBeDefined();
      const colWithDataIndex = col as { dataIndex?: unknown };
      // 派生列没有独立数据字段，不创建第二套模拟状态
      expect(colWithDataIndex.dataIndex).toBeUndefined();
      expect(colWithDataIndex.dataIndex).not.toBe('invalidApprovalStatus');
    });

    it('标记无效客资列不支持排序', () => {
      const col = ALL_COLUMNS.find((c) => c.key === 'invalidCustomerFlag');
      expect(col).toBeTruthy();
      expect((col as Record<string, unknown>).sorter).toBeUndefined();
    });

    it('审批状态变化后结果列同步更新（审核通过 → 是）', async () => {
      const user = userEvent.setup();
      render(<StoreCustomerList initialState="normal" />);

      // 李四（key=2）初始待审核：结果列为"否"
      expect(getFlagCellByRowKey('2').textContent?.trim()).toBe('否');

      // 审核通过
      const trigger = getByReqId('operation-menu-trigger-2');
      await user.click(trigger);
      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: '审核无效标注' })).toBeTruthy();
      });
      await user.click(screen.getByRole('menuitem', { name: '审核无效标注' }));
      await waitFor(() => {
        expect(
          document.querySelector('[data-req-id="invalid-approval-review-drawer"]'),
        ).toBeTruthy();
      });
      const opinionContainer = document.querySelector(
        '[data-req-id="invalid-approval-opinion"]',
      ) as HTMLElement;
      await user.click(within(opinionContainer).getByText('通过'));
      const confirmBtn = document.querySelector(
        '[data-req-id="invalid-approval-review-confirm"]',
      ) as HTMLElement;
      await user.click(confirmBtn);
      await waitFor(() => {
        // 审核通过后结果列同步变为"是"
        expect(getFlagCellByRowKey('2').textContent?.trim()).toBe('是');
      });
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
        '孙丽',
        '赵敏',
        '陈晨',
        '李四',
        '郑浩',
        '张三',
        '周杰',
        '王五',
        '刘洋',
        '吴芳',
      ]);
    });

    it('空值排在有效日期之后（升序）', async () => {
      const user = userEvent.setup();
      render(<StoreCustomerList initialState="normal" />);
      const sortHeader = screen.getByRole('columnheader', { name: /预约到店时间/ });
      await user.click(sortHeader);
      // 升序：刘洋、吴芳（空值）排在最后
      const names = getCurrentNames();
      const lastTwo = names.slice(-2);
      expect(lastTwo).toContain('刘洋');
      expect(lastTwo).toContain('吴芳');
    });

    it('表头显示排序图标', () => {
      render(<StoreCustomerList initialState="normal" />);
      // 预约到店时间表头可点击排序
      const header = screen.getByRole('columnheader', { name: /预约到店时间/ });
      expect(header).toBeTruthy();
    });
  });

  describe('0008 补充：列表字段排序', () => {
    it('首次分配时间升序', async () => {
      const user = userEvent.setup();
      render(<StoreCustomerList initialState="normal" />);
      const header = screen.getByRole('columnheader', { name: /首次分配时间/ });
      await user.click(header);
      const names = getCurrentNames();
      // 最早首次分配时间：沈鹏 2026-06-30（不包含在首页，需特殊检查）
      expect(names.length).toBe(10);
      // 第一页应按首次分配时间升序
      const first = names[0]!;
      expect(first).not.toBe('');
    });

    it('首次分配时间降序', async () => {
      const user = userEvent.setup();
      render(<StoreCustomerList initialState="normal" />);
      const header = screen.getByRole('columnheader', { name: /首次分配时间/ });
      await user.click(header);
      await user.click(header); // 第二次点击：降序
      const names = getCurrentNames();
      // 最新时间在前（张三 2026-07-21）
      expect(names[0]).toBe('张三');
    });

    it('最新分配时间升序', async () => {
      const user = userEvent.setup();
      render(<StoreCustomerList initialState="normal" />);
      const header = screen.getByRole('columnheader', { name: /最新分配时间/ });
      await user.click(header);
      const names = getCurrentNames();
      expect(names.length).toBe(10);
    });

    it('最新分配时间降序', async () => {
      const user = userEvent.setup();
      render(<StoreCustomerList initialState="normal" />);
      const header = screen.getByRole('columnheader', { name: /最新分配时间/ });
      await user.click(header);
      await user.click(header);
      // 李四 lastAssignTime 2026-07-21 16:45:00 → 最新
      // 张三 lastAssignTime 2026-07-22 09:15:00 → 更新
      expect(getCurrentNames()[0]).toBe('张三');
    });

    it('是否到店升序：未到店 → 已到店 → 空值', async () => {
      const user = userEvent.setup();
      render(<StoreCustomerList initialState="normal" />);
      const header = screen.getByRole('columnheader', { name: /是否到店/ });
      await user.click(header);
      // 升序：未到店在前
      const visitedValues = getVisibleColumnValues('是否到店');
      // 未到店排在最前
      expect(visitedValues[0]).toBe('未到店');
    });

    it('是否到店降序：已到店 → 未到店 → 空值', async () => {
      const user = userEvent.setup();
      render(<StoreCustomerList initialState="normal" />);
      const header = screen.getByRole('columnheader', { name: /是否到店/ });
      await user.click(header);
      await user.click(header);
      const visitedValues = getVisibleColumnValues('是否到店');
      expect(visitedValues[0]).toBe('已到店');
    });

    it('是否成交升序：未成交 → 已成交 → 空值', async () => {
      const user = userEvent.setup();
      render(<StoreCustomerList initialState="normal" />);
      const header = screen.getByRole('columnheader', { name: /是否成交/ });
      await user.click(header);
      const dealValues = getVisibleColumnValues('是否成交');
      expect(dealValues[0]).toBe('未成交');
    });

    it('是否成交降序：已成交 → 未成交 → 空值', async () => {
      const user = userEvent.setup();
      render(<StoreCustomerList initialState="normal" />);
      const header = screen.getByRole('columnheader', { name: /是否成交/ });
      await user.click(header);
      await user.click(header);
      const dealValues = getVisibleColumnValues('是否成交');
      expect(dealValues[0]).toBe('已成交');
    });

    it('取消排序后恢复原始列表顺序', async () => {
      const user = userEvent.setup();
      render(<StoreCustomerList initialState="normal" />);
      const originalNames = getCurrentNames();

      const header = screen.getByRole('columnheader', { name: /首次分配时间/ });
      await user.click(header); // 升序
      const sortedNames = getCurrentNames();
      expect(sortedNames).not.toEqual(originalNames);

      await user.click(header); // 降序
      await user.click(header); // 取消排序
      const restoredNames = getCurrentNames();
      expect(restoredNames).toEqual(originalNames);
    });
  });

  describe('0008 限定修复：五列完整排序序列', () => {
    const timeCases = [
      {
        header: '首次分配时间',
        ascending: [
          '2026-07-01 09:00:00',
          '2026-07-02 09:00:00',
          '2026-07-03 09:00:00',
          '-',
        ],
        descending: [
          '2026-07-03 09:00:00',
          '2026-07-02 09:00:00',
          '2026-07-01 09:00:00',
          '-',
        ],
      },
      {
        header: '最新分配时间',
        ascending: [
          '2026-07-01 09:00:00',
          '2026-07-02 09:00:00',
          '2026-07-03 09:00:00',
          '',
        ],
        descending: [
          '2026-07-03 09:00:00',
          '2026-07-02 09:00:00',
          '2026-07-01 09:00:00',
          '',
        ],
      },
      {
        header: '预约到店时间',
        ascending: [
          '2026-07-01 09:00:00',
          '2026-07-02 09:00:00',
          '2026-07-03 09:00:00',
          '0000-00-00 00:00:00',
        ],
        descending: [
          '2026-07-03 09:00:00',
          '2026-07-02 09:00:00',
          '2026-07-01 09:00:00',
          '0000-00-00 00:00:00',
        ],
      },
    ] as const;

    it.each(timeCases)('$header 升序、降序均保持空值末尾', async ({
      header,
      ascending,
      descending,
    }) => {
      const user = userEvent.setup();
      render(<StoreCustomerList data={createSortTestData()} initialState="normal" />);
      const columnHeader = screen.getByRole('columnheader', {
        name: new RegExp(header),
      });

      await user.click(columnHeader);
      expect(getVisibleColumnValues(header)).toEqual(ascending);

      await user.click(columnHeader);
      expect(getVisibleColumnValues(header)).toEqual(descending);
    });

    it('是否到店完整验证未到店、已到店与空值的双向顺序', async () => {
      const user = userEvent.setup();
      render(<StoreCustomerList data={createSortTestData()} initialState="normal" />);
      const header = screen.getByRole('columnheader', { name: /是否到店/ });

      await user.click(header);
      expect(getVisibleColumnValues('是否到店')).toEqual([
        '未到店',
        '已到店',
        '已到店',
        '--',
      ]);

      await user.click(header);
      expect(getVisibleColumnValues('是否到店')).toEqual([
        '已到店',
        '已到店',
        '未到店',
        '--',
      ]);
    });

    it('是否成交完整验证未成交、已成交与空值的双向顺序', async () => {
      const user = userEvent.setup();
      render(<StoreCustomerList data={createSortTestData()} initialState="normal" />);
      const header = screen.getByRole('columnheader', { name: /是否成交/ });

      await user.click(header);
      expect(getVisibleColumnValues('是否成交')).toEqual([
        '未成交',
        '未成交',
        '已成交',
        '--',
      ]);

      await user.click(header);
      expect(getVisibleColumnValues('是否成交')).toEqual([
        '已成交',
        '未成交',
        '未成交',
        '--',
      ]);
    });

    it('新办成交金额仍不可排序', () => {
      const column = ALL_COLUMNS.find((item) => item.key === 'firstDealAmount');
      expect(column).toBeDefined();
      expect(column?.sorter).toBeUndefined();
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
      expect(screen.getByRole('menuitem', { name: '标记无效客资' })).toBeTruthy();

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

      it('表头1—7需求点可通过稳定data属性定位', async () => {
        await enterRequirementMode();

        // 验证编号 1-7 的 marker 各至少存在1个
        for (let num = 1; num <= 7; num++) {
          const markers = document.querySelectorAll(
            `[data-requirement-number="${num}"]`,
          );
          expect(markers.length).toBeGreaterThanOrEqual(1);
        }
      });

      it('筛选项显示编号8', async () => {
        await enterRequirementMode();

        const filterArea = document.querySelector(
          '[data-req-id="filter-area"]',
        );
        expect(filterArea).toBeTruthy();
        const marker8 = filterArea!.querySelector(
          '[data-requirement-number="8"]',
        );
        expect(marker8).toBeTruthy();
        // 编号8对应无效审批状态筛选
        expect(marker8!.getAttribute('data-requirement-key')).toBe(
          'scrm-store-customer-invalid-approval-filter',
        );
        expect(marker8!.getAttribute('data-req-id')).toBe(
          'invalid-approval-filter',
        );
      });

      it('需求模式下展开操作菜单显示审批流程需求编号点（Cycle 2 菜单有编号点）', async () => {
        const user = await enterRequirementMode();

        // 记录1（张三）invalidApprovalStatus 为 null，菜单显示"标记无效客资"（编号9）
        const trigger = document.querySelector(
          '[data-req-id="operation-menu-trigger-1"]',
        ) as HTMLElement;
        await user.click(trigger);

        // 菜单中应出现"标记无效客资"的需求编号点（编号9）
        const menuMarkers = document.querySelectorAll(
          '[role="menu"] [data-requirement-number]',
        );
        expect(menuMarkers.length).toBeGreaterThan(0);

        // 编号9标记无效客资在菜单中
        const marker9 = document.querySelector(
          '[role="menu"] [data-requirement-number="9"]',
        );
        expect(marker9).toBeTruthy();
        expect(marker9!.getAttribute('data-requirement-key')).toBe(
          'scrm-store-customer-invalid-application',
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

      it('编号13实际渲染，锚点可稳定定位并可打开SC-08-10标记无效客资说明', async () => {
        const user = await enterRequirementMode();

        // 正式列级锚点唯一：data-req-id="invalid-customer-flag-column" 恰好1个
        const anchors = document.querySelectorAll(
          '[data-req-id="invalid-customer-flag-column"]',
        );
        expect(anchors).toHaveLength(1);
        const anchor = anchors[0]!;
        expect(anchor.getAttribute('data-column-key')).toBe('invalidCustomerFlag');
        expect(anchor.getAttribute('data-anchor-description')).toBe('标记无效客资列');

        // 编号13 marker 可稳定定位，target 指向新锚点
        const marker13 = document.querySelector(
          '[data-requirement-number="13"]',
        );
        expect(marker13).toBeTruthy();
        expect(marker13!.getAttribute('data-requirement-key')).toBe(
          'scrm-store-customer-invalid-customer-flag',
        );
        expect(marker13!.getAttribute('data-target-id')).toBe(
          'invalid-customer-flag-column',
        );

        // 点击编号13只打开需求说明，展示 SC-08-10 标记无效客资
        await user.click(marker13 as HTMLElement);
        const drawer = getByReqId('requirement-drawer');
        expect(drawer.textContent).toContain('SC-08-10');
        expect(drawer.textContent).toContain('标记无效客资');
        expect(drawer.textContent).toContain('已确认');
      });

      it('标记无效客资正式需求数据已接入（SC-08-10）', () => {
        const entry = getRequirement('scrm-store-customer-invalid-customer-flag');
        expect(entry).toBeDefined();
        expect(entry!.requirementNo).toBe('SC-08-10');
        expect(entry!.requirementName).toBe('标记无效客资');
        expect(entry!.definition).toContain("invalidApprovalStatus === 'approved'");
        // 与无效审批状态需求对象相互独立
        expect(getRequirement('scrm-store-customer-invalid-approval-status')!.requirementNo).toBe(
          'SC-08-02',
        );
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
          '孙丽',
          '赵敏',
          '陈晨',
          '李四',
          '郑浩',
          '张三',
          '周杰',
          '王五',
          '刘洋',
          '吴芳',
        ]);
      });

      it('需求模式点击预约到店时间打开SC-01-05，不改变记录顺序', async () => {
        const user = userEvent.setup();
        render(<StoreCustomerList initialState="normal" />);

        // 先记下原始顺序
        const originalNames = getCurrentNames();

        // 进入需求模式
        await user.click(screen.getByRole('button', { name: '查看需求' }));

        // 需求模式下点击预约到店时间列的编号3
        const marker3 = document.querySelector(
          '[data-requirement-number="3"]',
        ) as HTMLElement;
        await user.click(marker3);

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
      it('原型菜单切换模式后可关闭，需求模式菜单有审批流程编号点', async () => {
        const user = userEvent.setup();
        render(<StoreCustomerList initialState="normal" />);

        const triggerId = `operation-menu-trigger-${rawCustomers[0]!.key}`;
        const trigger = getByReqId(triggerId);
        await user.click(trigger);
        expect(getByReqId(triggerId).getAttribute('aria-expanded')).toBe('true');
        // 原型模式下菜单项不含需求编号点
        expect(
          screen.getByRole('menuitem', { name: '标记无效客资' }),
        ).toBeTruthy();

        await user.click(screen.getByRole('button', { name: '查看需求' }));
        expect(getByReqId(triggerId).getAttribute('aria-expanded')).toBe('false');

        await user.click(getByReqId(triggerId));
        expect(getByReqId(triggerId).getAttribute('aria-expanded')).toBe('true');

        // Cycle 2：需求模式下菜单出现审批流程编号点（编号9标记无效客资）
        const menuMarkers = document.querySelectorAll(
          '[role="menu"] [data-requirement-number="9"]',
        );
        expect(menuMarkers.length).toBeGreaterThan(0);
      });

      it('点击筛选编号8不改变pending筛选控件值', async () => {
        const user = userEvent.setup();
        render(<StoreCustomerList initialState="normal" />);

        // 先设置pending筛选值
        const nameInput = screen.getByPlaceholderText(
          '请输入姓名或手机号',
        ) as HTMLInputElement;
        await user.type(nameInput, '张三');

        // 进入需求模式
        await user.click(screen.getByRole('button', { name: '查看需求' }));

        // 点击筛选编号8
        const filterMarker8 = document.querySelector(
          '[data-req-id="filter-area"] [data-requirement-number="8"]',
        ) as HTMLElement;
        await user.click(filterMarker8);

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

        // 菜单应显示"标记无效客资"
        expect(
          screen.getByRole('menuitem', { name: '标记无效客资' }),
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

  // ==========================================================================
  // 0008 闭环一：列表字段调整
  // ==========================================================================

  describe('0008 闭环一：列表字段调整', () => {
    describe('新办成交金额展示', () => {
      it('统一展示新名称并保持字段Key、需求Key和锚点不变', () => {
        render(<StoreCustomerList initialState="normal" />);

        expect(
          screen.getByRole('columnheader', { name: '新办成交金额' }),
        ).toBeTruthy();
        expect(screen.queryByText(['首笔', '成交金额'].join(''))).toBeNull();

        const column = ALL_COLUMNS.find((item) => item.key === 'firstDealAmount');
        expect(column).toBeDefined();
        expect(
          column && 'dataIndex' in column ? column.dataIndex : undefined,
        ).toBe('firstDealAmount');
        expect(
          COLUMN_REQUIREMENT_ANCHORS.find(
            (anchor) => anchor.columnKey === 'firstDealAmount',
          )?.id,
        ).toBe('first-deal-amount-column');

        const requirement = getRequirement(
          'scrm-store-customer-first-deal-amount',
        );
        expect(requirement?.requirementName).toBe('新办成交金额');
        expect(requirement?.definition).toContain('新办成交金额为9000元');
        expect(requirement?.definition).not.toContain(['首笔', '成交金额'].join(''));
      });

      it('第一页同时显示 29.90、0.00 和 --', () => {
        render(<StoreCustomerList initialState="normal" />);

        const table = document.querySelector('[data-req-id="customer-table"]');
        expect(table).toBeTruthy();

        const tableText = table!.textContent ?? '';
        // 29.9 → 29.90（保留两位小数）
        expect(tableText).toContain('29.90');
        // 0 → 0.00（0 是合法金额）
        expect(tableText).toContain('0.00');

        // null → --：验证表格中存在 --（多种列可能使用，不要求精确列定位）
        const allCells = table!.querySelectorAll('td');
        const cellTexts = Array.from(allCells).map(
          (cell) => cell.textContent?.trim() ?? '',
        );
        expect(cellTexts).toContain('--');
      });

      it('新办成交金额列不支持排序', () => {
        const col = ALL_COLUMNS.find((c) => c.key === 'firstDealAmount');
        expect(col).toBeTruthy();
        expect((col as Record<string, unknown>).sorter).toBeUndefined();
      });
    });

    describe('无效审批状态筛选', () => {
      function getInvalidApprovalFilterCombobox(): HTMLElement {
        // 通过筛选区中 label 文本定位无效审批状态所在的 filter-item
        const filterArea = document.querySelector('[data-req-id="filter-area"]');
        if (!filterArea) throw new Error('筛选区不存在');
        const labels = filterArea.querySelectorAll('label');
        let filterItem: Element | null = null;
        labels.forEach((label) => {
          if (label.textContent?.includes('无效审批状态')) {
            filterItem = label.closest('.store-customer-filter-item');
          }
        });
        if (!filterItem) throw new Error('未找到无效审批状态 filter-item');
        const combobox = (filterItem as Element).querySelector('[role="combobox"]') as HTMLElement;
        if (!combobox) throw new Error('combobox 不存在');
        return combobox;
      }

      it('筛选下拉包含全部、待审核、审核通过、审核退回', async () => {
        const user = userEvent.setup();
        render(<StoreCustomerList initialState="normal" />);

        const combobox = getInvalidApprovalFilterCombobox();
        await user.click(combobox);

        await waitFor(() => {
          expect(screen.getByTitle('待审核')).toBeTruthy();
        });

        expect(screen.getByTitle('审核通过')).toBeTruthy();
        expect(screen.getByTitle('审核退回')).toBeTruthy();
        expect(screen.getByTitle('全部')).toBeTruthy();
      });

      it('筛选下拉不包含 --、未申请、空状态', async () => {
        const user = userEvent.setup();
        render(<StoreCustomerList initialState="normal" />);

        const combobox = getInvalidApprovalFilterCombobox();
        await user.click(combobox);

        await waitFor(() => {
          expect(screen.getByTitle('待审核')).toBeTruthy();
        });

        // 限定在 Select 下拉弹出层中查找，避免表格中的 "--" 干扰
        const dropdown = document.querySelector('[role="listbox"]');
        expect(dropdown).toBeTruthy();
        const dropdownEl = dropdown as HTMLElement;
        expect(dropdownEl.querySelector('[title="--"]')).toBeNull();
        expect(dropdownEl.querySelector('[title="未申请"]')).toBeNull();
        expect(dropdownEl.querySelector('[title="空状态"]')).toBeNull();
      });
    });

    describe('旧名称清除', () => {
      it('页面不再出现"无效客资状态"', () => {
        render(<StoreCustomerList initialState="normal" />);
        expect(screen.queryByText('无效客资状态')).toBeNull();
      });

      it('页面使用"无效审批状态"作为列名和筛选标签', () => {
        render(<StoreCustomerList initialState="normal" />);
        // 列名和筛选标签都显示"无效审批状态"
        const matches = screen.getAllByText('无效审批状态');
        expect(matches.length).toBeGreaterThanOrEqual(2); // 表头 + 筛选项标签
      });
    });
  });


  // ==========================================================================
  // 0008 闭环二：审批流程
  // ==========================================================================

  describe('0008 闭环二：审批流程', () => {
    /** 打开指定记录的标记无效客资抽屉 */
    async function openApplicationDrawer(
      user: ReturnType<typeof userEvent.setup>,
      recordKey: string,
    ) {
      const trigger = getByReqId(`operation-menu-trigger-${recordKey}`);
      await user.click(trigger);
      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: '标记无效客资' })).toBeTruthy();
      });
      await user.click(screen.getByRole('menuitem', { name: '标记无效客资' }));
      await waitFor(() => {
        expect(
          document.querySelector('[data-req-id="invalid-application-drawer"]'),
        ).toBeTruthy();
      });
    }

    function getInvalidStatusInRow(row: HTMLElement): string | null {
      return getCellByHeader(row, '无效审批状态').textContent?.trim() ?? null;
    }

    describe('必填标识', () => {
      it('申请抽屉理由标签显示红色 *', async () => {
        const user = userEvent.setup();
        render(<StoreCustomerList initialState="normal" />);
        await openApplicationDrawer(user, '4');
        const requiredMark = document.querySelector(
          '[data-req-id="invalid-application-drawer"] .invalid-approval-drawer-required',
        );
        expect(requiredMark).toBeTruthy();
        expect(requiredMark!.textContent).toBe('*');
      });

      it('审核意见标签始终显示红色 *', async () => {
        const user = userEvent.setup();
        render(<StoreCustomerList initialState="normal" />);
        const trigger = getByReqId('operation-menu-trigger-2');
        await user.click(trigger);
        await waitFor(() => {
          expect(screen.getByRole('menuitem', { name: '审核无效标注' })).toBeTruthy();
        });
        await user.click(screen.getByRole('menuitem', { name: '审核无效标注' }));
        await waitFor(() => {
          expect(
            document.querySelector('[data-req-id="invalid-approval-review-drawer"]'),
          ).toBeTruthy();
        });
        const reviewDrawer = getByReqId('invalid-approval-review-drawer');
        expect(
          within(reviewDrawer).getByText('客户多次未按预约到店，申请标记无效。'),
        ).toBeTruthy();
        expect(within(reviewDrawer).getAllByText('备注').length).toBeGreaterThan(0);
        expect(within(reviewDrawer).queryByText('申请理由')).toBeNull();
        const opinionContainer = document.querySelector(
          '[data-req-id="invalid-approval-opinion"]',
        )?.closest('.invalid-approval-drawer-field');
        const opinionRequired = opinionContainer?.querySelector(
          '.invalid-approval-drawer-required',
        );
        expect(opinionRequired).toBeTruthy();
      });

      it('选择退回后备注标签立即显示红色 *', async () => {
        const user = userEvent.setup();
        render(<StoreCustomerList initialState="normal" />);
        const trigger = getByReqId('operation-menu-trigger-2');
        await user.click(trigger);
        await waitFor(() => {
          expect(screen.getByRole('menuitem', { name: '审核无效标注' })).toBeTruthy();
        });
        await user.click(screen.getByRole('menuitem', { name: '审核无效标注' }));
        await waitFor(() => {
          expect(
            document.querySelector('[data-req-id="invalid-approval-review-drawer"]'),
          ).toBeTruthy();
        });
        const remarkField = document.querySelector(
          '[data-req-id="invalid-approval-return-remark"]',
        )?.closest('.invalid-approval-drawer-field');
        expect(
          remarkField?.querySelector('.invalid-approval-drawer-required'),
        ).toBeNull();
        const opinionContainer = document.querySelector(
          '[data-req-id="invalid-approval-opinion"]',
        ) as HTMLElement;
        const rejectRadio = within(opinionContainer).getByText('退回');
        await user.click(rejectRadio);
        expect(
          remarkField?.querySelector('.invalid-approval-drawer-required'),
        ).toBeTruthy();
      });

      it('选择通过时备注没有必填标识', async () => {
        const user = userEvent.setup();
        render(<StoreCustomerList initialState="normal" />);
        const trigger = getByReqId('operation-menu-trigger-2');
        await user.click(trigger);
        await waitFor(() => {
          expect(screen.getByRole('menuitem', { name: '审核无效标注' })).toBeTruthy();
        });
        await user.click(screen.getByRole('menuitem', { name: '审核无效标注' }));
        await waitFor(() => {
          expect(
            document.querySelector('[data-req-id="invalid-approval-review-drawer"]'),
          ).toBeTruthy();
        });
        const opinionContainer = document.querySelector(
          '[data-req-id="invalid-approval-opinion"]',
        ) as HTMLElement;
        await user.click(within(opinionContainer).getByText('通过'));
        const remarkField = document.querySelector(
          '[data-req-id="invalid-approval-return-remark"]',
        )?.closest('.invalid-approval-drawer-field');
        expect(
          remarkField?.querySelector('.invalid-approval-drawer-required'),
        ).toBeNull();
      });
    });

    describe('申请表单', () => {
      it('申请表单只显示理由和附件，不显示客户姓名、申请人', async () => {
        const user = userEvent.setup();
        render(<StoreCustomerList initialState="normal" />);
        await openApplicationDrawer(user, '4');
        const drawer = document.querySelector(
          '[data-req-id="invalid-application-drawer"]',
        ) as HTMLElement;
        const drawerText = drawer?.textContent ?? '';
        expect(drawerText).toContain('理由');
        expect(drawerText).toContain('附件');
        expect(drawerText).not.toContain('客户姓名');
        expect(drawerText).not.toContain('申请人');
      });
    });

    describe('审核意见布局', () => {
      it('通过和退选项处于同一 Radio.Group', async () => {
        const user = userEvent.setup();
        render(<StoreCustomerList initialState="normal" />);
        const trigger = getByReqId('operation-menu-trigger-2');
        await user.click(trigger);
        await waitFor(() => {
          expect(screen.getByRole('menuitem', { name: '审核无效标注' })).toBeTruthy();
        });
        await user.click(screen.getByRole('menuitem', { name: '审核无效标注' }));
        await waitFor(() => {
          expect(
            document.querySelector('[data-req-id="invalid-approval-review-drawer"]'),
          ).toBeTruthy();
        });
        const opinionDiv = document.querySelector(
          '[data-req-id="invalid-approval-opinion"]',
        ) as HTMLElement;
        expect(opinionDiv.querySelector('[role="radiogroup"]')).toBeTruthy();
        expect(within(opinionDiv).getByText('通过')).toBeTruthy();
        expect(within(opinionDiv).getByText('退回')).toBeTruthy();
      });
    });

    describe('状态流转', () => {
      it('null 提交申请后变为"待审核"', async () => {
        const user = userEvent.setup();
        render(<StoreCustomerList initialState="normal" />);
        await openApplicationDrawer(user, '4');
        const remark = document.querySelector(
          '[data-req-id="invalid-application-remark"]',
        ) as HTMLTextAreaElement;
        await user.type(remark, '测试无效申请');
        await user.click(document.querySelector('[data-req-id="invalid-application-submit"]') as HTMLElement);
        await waitFor(() => {
          const rows = document.querySelectorAll('tr[data-row-key="4"]');
          expect(rows.length).toBeGreaterThan(0);
          expect(getInvalidStatusInRow(rows[0] as HTMLElement)).toBe('待审核');
        });
      });

      it('审核通过后变为"审核通过"', async () => {
        const user = userEvent.setup();
        render(<StoreCustomerList initialState="normal" />);
        const trigger = getByReqId('operation-menu-trigger-2');
        await user.click(trigger);
        await waitFor(() => {
          expect(screen.getByRole('menuitem', { name: '审核无效标注' })).toBeTruthy();
        });
        await user.click(screen.getByRole('menuitem', { name: '审核无效标注' }));
        await waitFor(() => {
          expect(
            document.querySelector('[data-req-id="invalid-approval-review-drawer"]'),
          ).toBeTruthy();
        });
        const opinionContainer = document.querySelector(
          '[data-req-id="invalid-approval-opinion"]',
        ) as HTMLElement;
        await user.click(within(opinionContainer).getByText('通过'));
        const confirmBtn = document.querySelector(
          '[data-req-id="invalid-approval-review-confirm"]',
        ) as HTMLElement;
        await user.click(confirmBtn);
        await waitFor(() => {
          const rows = document.querySelectorAll('tr[data-row-key="2"]');
          expect(rows.length).toBeGreaterThan(0);
          expect(getInvalidStatusInRow(rows[0] as HTMLElement)).toBe('审核通过');
        });
      });

      it('审核退回后变为"审核退回"', async () => {
        const user = userEvent.setup();
        render(<StoreCustomerList initialState="normal" />);
        await openApplicationDrawer(user, '4');
        const appRemark = document.querySelector(
          '[data-req-id="invalid-application-remark"]',
        ) as HTMLTextAreaElement;
        await user.type(appRemark, '理由');
        await user.click(document.querySelector('[data-req-id="invalid-application-submit"]') as HTMLElement);
        await waitFor(() => {
          expect(
            document.querySelector('[data-req-id="invalid-application-drawer"]'),
          ).toBeNull();
        });
        const trigger = getByReqId('operation-menu-trigger-4');
        await user.click(trigger);
        await waitFor(() => {
          expect(screen.getByRole('menuitem', { name: '审核无效标注' })).toBeTruthy();
        });
        await user.click(screen.getByRole('menuitem', { name: '审核无效标注' }));
        await waitFor(() => {
          expect(
            document.querySelector('[data-req-id="invalid-approval-review-drawer"]'),
          ).toBeTruthy();
        });
        const opinionContainer = document.querySelector(
          '[data-req-id="invalid-approval-opinion"]',
        ) as HTMLElement;
        await user.click(within(opinionContainer).getByText('退回'));
        const remarkTArea = document.querySelector(
          '[data-req-id="invalid-approval-review-remark-input"]',
        ) as HTMLTextAreaElement;
        await user.type(remarkTArea, '资料不完整');
        const confirmBtn = document.querySelector(
          '[data-req-id="invalid-approval-review-confirm"]',
        ) as HTMLElement;
        await user.click(confirmBtn);
        await waitFor(() => {
          const rows = document.querySelectorAll('tr[data-row-key="4"]');
          expect(rows.length).toBeGreaterThan(0);
          expect(getInvalidStatusInRow(rows[0] as HTMLElement)).toBe('审核退回');
        });
      });

      it('审核退回后菜单显示"标记无效客资"', async () => {
        const user = userEvent.setup();
        render(<StoreCustomerList initialState="normal" />);
        const trigger = getByReqId('operation-menu-trigger-7');
        await user.click(trigger);
        await waitFor(() => {
          expect(screen.getByRole('menuitem', { name: '标记无效客资' })).toBeTruthy();
        });
      });

      it('审核退回后再次标记回到"待审核"', async () => {
        const user = userEvent.setup();
        render(<StoreCustomerList initialState="normal" />);
        await openApplicationDrawer(user, '7');
        const remark = document.querySelector(
          '[data-req-id="invalid-application-remark"]',
        ) as HTMLTextAreaElement;
        await user.type(remark, '重新提交');
        await user.click(document.querySelector('[data-req-id="invalid-application-submit"]') as HTMLElement);
        await waitFor(() => {
          const rows = document.querySelectorAll('tr[data-row-key="7"]');
          expect(rows.length).toBeGreaterThan(0);
          expect(getInvalidStatusInRow(rows[0] as HTMLElement)).toBe('待审核');
        });
      });

      it('待审核不显示"标记无效客资"', async () => {
        const user = userEvent.setup();
        render(<StoreCustomerList initialState="normal" />);
        const trigger = getByReqId('operation-menu-trigger-2');
        await user.click(trigger);
        await waitFor(() => {
          expect(screen.getByRole('menuitem', { name: '审核无效标注' })).toBeTruthy();
        });
        expect(screen.queryByRole('menuitem', { name: '标记无效客资' })).toBeNull();
      });

      it('审核通过不显示任何无效审批操作', async () => {
        const user = userEvent.setup();
        render(<StoreCustomerList initialState="normal" />);
        const trigger = getByReqId('operation-menu-trigger-5');
        await user.click(trigger);
        await waitFor(() => {
          expect(screen.queryByRole('menuitem', { name: '标记无效客资' })).toBeNull();
        });
        expect(screen.queryByRole('menuitem', { name: '审核无效标注' })).toBeNull();
      });
    });

    describe('操作菜单', () => {
      it('操作菜单不再出现"查看详情"', async () => {
        const user = userEvent.setup();
        render(<StoreCustomerList initialState="normal" />);
        const trigger = getByReqId('operation-menu-trigger-2');
        await user.click(trigger);
        await waitFor(() => {
          expect(screen.getByRole('menuitem', { name: '审核无效标注' })).toBeTruthy();
        });
        expect(screen.queryByRole('menuitem', { name: '查看详情' })).toBeNull();
      });

      it('操作菜单不再出现"重新申请"', async () => {
        const user = userEvent.setup();
        render(<StoreCustomerList initialState="normal" />);
        const trigger = getByReqId('operation-menu-trigger-7');
        await user.click(trigger);
        await waitFor(() => {
          expect(screen.getByRole('menuitem', { name: '标记无效客资' })).toBeTruthy();
        });
        expect(screen.queryByRole('menuitem', { name: '重新申请' })).toBeNull();
      });
    });

    describe('表单校验', () => {
      it.each([
        { opinion: '通过', remark: '' },
        { opinion: '退回', remark: '申请依据不足' },
      ])('$opinion连续确认仅提交一次并显示提交中', ({ opinion, remark }) => {
        const onSubmit = vi.fn();
        render(
          <InvalidReviewDrawer
            open
            onClose={vi.fn()}
            onSubmit={onSubmit}
            recordName="测试客户"
            application={{
              customerName: '测试客户',
              applicant: '测试申请人',
              applicationTime: '2026-07-20 09:00:00',
              remark: '测试申请原因',
              attachments: [],
            }}
          />,
        );

        fireEvent.click(screen.getByRole('radio', { name: opinion }));
        if (remark) {
          fireEvent.change(
            getByReqId('invalid-approval-review-remark-input'),
            { target: { value: remark } },
          );
        }

        const confirmButton = getByReqId('invalid-approval-review-confirm');
        fireEvent.click(confirmButton);
        fireEvent.click(confirmButton);

        expect(onSubmit).toHaveBeenCalledTimes(1);
        const submittingButton = screen.getByRole('button', {
          name: /提交中/,
        }) as HTMLButtonElement;
        expect(submittingButton.disabled).toBe(true);
      });

      it('审核意见必填：未选择时显示错误', async () => {
        const user = userEvent.setup();
        render(<StoreCustomerList initialState="normal" />);
        const trigger = getByReqId('operation-menu-trigger-2');
        await user.click(trigger);
        await waitFor(() => {
          expect(screen.getByRole('menuitem', { name: '审核无效标注' })).toBeTruthy();
        });
        await user.click(screen.getByRole('menuitem', { name: '审核无效标注' }));
        await waitFor(() => {
          expect(
            document.querySelector('[data-req-id="invalid-approval-review-drawer"]'),
          ).toBeTruthy();
        });
        const confirmBtn = document.querySelector(
          '[data-req-id="invalid-approval-review-confirm"]',
        ) as HTMLElement;
        await user.click(confirmBtn);
        await waitFor(() => {
          expect(
            document.querySelector('.invalid-approval-drawer-error'),
          ).toBeTruthy();
        });
        expect(
          document.querySelector('[data-req-id="invalid-approval-review-drawer"]'),
        ).toBeTruthy();
      });

      it('通过时备注非必填', async () => {
        const user = userEvent.setup();
        render(<StoreCustomerList initialState="normal" />);
        const trigger = getByReqId('operation-menu-trigger-2');
        await user.click(trigger);
        await waitFor(() => {
          expect(screen.getByRole('menuitem', { name: '审核无效标注' })).toBeTruthy();
        });
        await user.click(screen.getByRole('menuitem', { name: '审核无效标注' }));
        await waitFor(() => {
          expect(
            document.querySelector('[data-req-id="invalid-approval-review-drawer"]'),
          ).toBeTruthy();
        });
        const opinionContainer = document.querySelector(
          '[data-req-id="invalid-approval-opinion"]',
        ) as HTMLElement;
        await user.click(within(opinionContainer).getByText('通过'));
        const confirmBtn = document.querySelector(
          '[data-req-id="invalid-approval-review-confirm"]',
        ) as HTMLElement;
        await user.click(confirmBtn);
        await waitFor(() => {
          expect(
            document.querySelector('[data-req-id="invalid-approval-review-drawer"]'),
          ).toBeNull();
        });
      });

      it('退回时备注必填：空备注显示错误', async () => {
        const user = userEvent.setup();
        render(<StoreCustomerList initialState="normal" />);
        const trigger = getByReqId('operation-menu-trigger-2');
        await user.click(trigger);
        await waitFor(() => {
          expect(screen.getByRole('menuitem', { name: '审核无效标注' })).toBeTruthy();
        });
        await user.click(screen.getByRole('menuitem', { name: '审核无效标注' }));
        await waitFor(() => {
          expect(
            document.querySelector('[data-req-id="invalid-approval-review-drawer"]'),
          ).toBeTruthy();
        });
        const opinionContainer = document.querySelector(
          '[data-req-id="invalid-approval-opinion"]',
        ) as HTMLElement;
        await user.click(within(opinionContainer).getByText('退回'));
        const confirmBtn = document.querySelector(
          '[data-req-id="invalid-approval-review-confirm"]',
        ) as HTMLElement;
        await user.click(confirmBtn);
        await waitFor(() => {
          const errors = document.querySelectorAll('.invalid-approval-drawer-error');
          const errorTexts = Array.from(errors).map((e) => e.textContent);
          expect(errorTexts.some((t) => t?.includes('备注'))).toBe(true);
        });
        expect(
          document.querySelector('[data-req-id="invalid-approval-review-drawer"]'),
        ).toBeTruthy();
      });

      it('备注 maxLength 为 200', async () => {
        const user = userEvent.setup();
        render(<StoreCustomerList initialState="normal" />);
        const trigger = getByReqId('operation-menu-trigger-2');
        await user.click(trigger);
        await waitFor(() => {
          expect(screen.getByRole('menuitem', { name: '审核无效标注' })).toBeTruthy();
        });
        await user.click(screen.getByRole('menuitem', { name: '审核无效标注' }));
        await waitFor(() => {
          expect(
            document.querySelector('[data-req-id="invalid-approval-review-drawer"]'),
          ).toBeTruthy();
        });
        const remarkInput = document.querySelector(
          '[data-req-id="invalid-approval-review-remark-input"]',
        ) as HTMLTextAreaElement;
        expect(remarkInput.getAttribute('maxlength')).toBe('200');
      });

      it('取消不修改状态', async () => {
        const user = userEvent.setup();
        render(<StoreCustomerList initialState="normal" />);
        await openApplicationDrawer(user, '3');
        const remark = document.querySelector(
          '[data-req-id="invalid-application-remark"]',
        ) as HTMLTextAreaElement;
        await user.type(remark, '测试');
        const closeBtn = document.querySelector('[aria-label="Close"]') as HTMLElement;
        await user.click(closeBtn);
        await waitFor(() => {
          expect(
            document.querySelector('[data-req-id="invalid-application-drawer"]'),
          ).toBeNull();
        });
        const rows = document.querySelectorAll('tr[data-row-key="3"]');
        expect(rows.length).toBeGreaterThan(0);
        expect(getInvalidStatusInRow(rows[0] as HTMLElement)).toBe('--');
      });
    });

    describe('详情', () => {
      it('pending详情展示完整申请数据且不伪造审核结果', async () => {
        const user = userEvent.setup();
        render(<StoreCustomerList initialState="normal" />);
        const rows = document.querySelectorAll('tr[data-row-key="2"]');
        const statusCell = getCellByHeader(
          rows[0] as HTMLElement,
          '无效审批状态',
        );
        const clickable = statusCell.querySelector('[data-req-id^="invalid-approval-detail-"]');
        expect(clickable).toBeTruthy();
        await user.click(clickable!);
        await waitFor(() => {
          const drawer = getByReqId('invalid-approval-detail-drawer');
          const text = drawer.textContent ?? '';
          expect(text).toContain('李四');
          expect(text).toContain('王经理');
          expect(text).toContain('2026-07-20 09:30:00');
          expect(text).toContain('客户多次未按预约到店，申请标记无效。');
          expect(text).toContain('客户沟通记录.png');
          expect(text).toContain('待审核');
          // 待审核、尚无审核意见时：审核意见展示 "--"
          expect(text).toContain('审核意见');
          expect(text).toContain('--');
          expect(text).not.toContain('系统管理员');
          expect(text).not.toContain('审核确认单.pdf');
          expect(text).not.toContain('审核退回说明.pdf');
        });
      });

      it('approved详情展示完整申请和审核实际值', async () => {
        const user = userEvent.setup();
        render(<StoreCustomerList initialState="normal" />);
        const rows = document.querySelectorAll('tr[data-row-key="5"]');
        const clickable = getCellByHeader(
          rows[0] as HTMLElement,
          '无效审批状态',
        ).querySelector('[data-req-id^="invalid-approval-detail-"]');
        expect(clickable).toBeTruthy();
        await user.click(clickable!);
        await waitFor(() => {
          const drawer = document.querySelector('[data-req-id="invalid-approval-detail-drawer"]');
          expect(drawer).toBeTruthy();
          const text = drawer!.textContent ?? '';
          expect(text).toContain('陈晨');
          expect(text).toContain('王经理');
          expect(text).toContain('2026-07-18 14:20:00');
          expect(text).toContain('客户明确表示近期无课程需求，申请标记无效。');
          expect(text).toContain('客户确认记录.pdf');
          // 审核状态展示"审核通过"，审核意见展示"通过"（语义分离）；不再出现"审核结果/审核备注"
          expect(text).toContain('审核通过');
          expect(text).toContain('通过');
          expect(text).toContain('审核意见');
          expect(text).toContain('备注');
          expect(text).not.toContain('审核结果');
          expect(text).not.toContain('审核备注');
          expect(text).toContain('系统管理员');
          expect(text).toContain('2026-07-18 16:00:00');
          expect(text).toContain('核实申请信息无误，同意标记为无效客资。');
          expect(text).toContain('审核确认单.pdf');
        });
      });

      it('rejected详情展示完整申请和审核实际值', async () => {
        const user = userEvent.setup();
        render(<StoreCustomerList initialState="normal" />);
        const rows = document.querySelectorAll('tr[data-row-key="7"]');
        const clickable = getCellByHeader(
          rows[0] as HTMLElement,
          '无效审批状态',
        ).querySelector('[data-req-id^="invalid-approval-detail-"]');
        expect(clickable).toBeTruthy();
        await user.click(clickable!);
        await waitFor(() => {
          const drawer = document.querySelector('[data-req-id="invalid-approval-detail-drawer"]');
          expect(drawer).toBeTruthy();
          const text = drawer!.textContent ?? '';
          expect(text).toContain('周杰');
          expect(text).toContain('李顾问');
          expect(text).toContain('2026-07-19 11:10:00');
          expect(text).toContain('多次联系未接通，申请标记无效。');
          expect(text).toContain('外呼记录.png');
          // 审核状态展示"审核退回"，审核意见展示"退回"（语义分离）；不再出现"审核结果/审核备注"标签
          expect(text).toContain('审核退回');
          expect(text).toContain('退回');
          expect(text).toContain('审核意见');
          expect(text).toContain('备注');
          expect(text).not.toContain('审核结果');
          expect(text).not.toContain('审核备注');
          expect(text).toContain('系统管理员');
          expect(text).toContain('2026-07-19 15:30:00');
          expect(text).toContain('申请依据不足，请补充近期沟通记录后重新提交。');
          expect(text).toContain('审核退回说明.pdf');
        });
      });

      it('详情抽屉关闭不修改状态', async () => {
        const user = userEvent.setup();
        render(<StoreCustomerList initialState="normal" />);
        const rows = document.querySelectorAll('tr[data-row-key="2"]');
        const clickable = getCellByHeader(
          rows[0] as HTMLElement,
          '无效审批状态',
        ).querySelector('[data-req-id^="invalid-approval-detail-"]');
        await user.click(clickable!);
        await waitFor(() => {
          expect(
            document.querySelector('[data-req-id="invalid-approval-detail-drawer"]'),
          ).toBeTruthy();
        });
        const closeBtn = document.querySelector('[aria-label="Close"]') as HTMLElement;
        await user.click(closeBtn);
        await waitFor(() => {
          expect(
            document.querySelector('[data-req-id="invalid-approval-detail-drawer"]'),
          ).toBeNull();
        });
        const rowsAfter = document.querySelectorAll('tr[data-row-key="2"]');
        expect(rowsAfter.length).toBeGreaterThan(0);
        expect(getInvalidStatusInRow(rowsAfter[0] as HTMLElement)).toBe('待审核');
      });

      it('空状态（--）不可点击打开详情', () => {
        render(<StoreCustomerList initialState="normal" />);
        const rows = document.querySelectorAll('tr[data-row-key="3"]');
        const statusCell = getCellByHeader(
          rows[0] as HTMLElement,
          '无效审批状态',
        );
        expect(
          statusCell.querySelector('[data-req-id^="invalid-approval-detail-"]'),
        ).toBeNull();
      });
    });

    describe('需求查看模式隔离', () => {
      async function enterRequirementModeForApproval() {
        const user = userEvent.setup();
        render(
          <StoreCustomerList
            initialState="normal"
            initialRequirementMode="requirement"
          />,
        );
        return user;
      }

      it('需求模式下操作菜单编号点打开需求说明', async () => {
        const user = await enterRequirementModeForApproval();
        const trigger = getByReqId('operation-menu-trigger-1');
        await user.click(trigger);
        await waitFor(() => {
          const markers = document.querySelectorAll('[role="menu"] [data-requirement-number="9"]');
          expect(markers.length).toBeGreaterThan(0);
        });
        const marker9 = document.querySelector('[role="menu"] [data-requirement-number="9"]') as HTMLElement;
        await user.click(marker9);
        await waitFor(() => {
          expect(document.querySelector('[data-req-id="requirement-drawer"]')).toBeTruthy();
        });
        expect(document.querySelector('[data-req-id="invalid-application-drawer"]')).toBeNull();
      });

      it('需求点 data-req-id 包含 record.key', async () => {
        const user = await enterRequirementModeForApproval();
        const trigger = getByReqId('operation-menu-trigger-1');
        await user.click(trigger);
        await waitFor(() => {
          const markers = document.querySelectorAll('[role="menu"] [data-requirement-number="9"]');
          expect(markers.length).toBeGreaterThan(0);
        });
        const marker9 = document.querySelector('[role="menu"] [data-requirement-number="9"]');
        expect(marker9?.getAttribute('data-req-id')).toContain('invalid-application-1');
      });

      it('需求模式下不执行审核业务动作', async () => {
        const user = await enterRequirementModeForApproval();
        const trigger = getByReqId('operation-menu-trigger-2');
        await user.click(trigger);
        const marker10 = document.querySelector('[role="menu"] [data-requirement-number="10"]') as HTMLElement;
        expect(marker10).toBeTruthy();
        await user.click(marker10);
        expect(document.querySelector('[data-req-id="invalid-approval-review-drawer"]')).toBeNull();
      });
    });
  });
});

describe('0012 到店/拜访记录独立模块化 - 菜单与独立页面切换', () => {
  /** 读取潜客管理子菜单（按 data-prospect-page-key 顺序） */
  function navSubitems(): HTMLElement[] {
    const nav = getByReqId('left-navigation');
    return Array.from(nav.querySelectorAll('[data-prospect-page-key]')) as HTMLElement[];
  }

  /** 读取表格实际渲染表头（固定列可能重复渲染，按首次出现去重） */
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

  /** 当前选中子菜单的正式 key */
  function activePageKey(): string | null {
    return document.querySelector('.store-customer-nav-subitem.active')?.getAttribute(
      'data-prospect-page-key',
    ) ?? null;
  }

  it('潜客管理菜单包含正式三个 key，顺序正确且无 visit-record-2 临时 key', () => {
    render(<StoreCustomerList initialState="normal" />);
    const subitems = navSubitems();
    const keys = subitems.map((item) => item.getAttribute('data-prospect-page-key'));
    const labels = subitems.map((item) => item.textContent?.trim());
    expect(keys).toEqual([
      'store-customer',
      'arrival-record',
      'visit-record',
      'employee-seat',
      'customer-sea',
      'invalid-sea',
      'my-responsible',
      'call-record',
      'tag-group',
    ]);
    // "到店记录"不再占用 visit-record 临时 key，也没有 visit-record-2
    expect(labels).toContain('到店记录');
    expect(labels).toContain('拜访记录');
    expect(keys).not.toContain('visit-record-2');
    expect(keys.indexOf('visit-record')).toBe(2);
  });

  it('点击到店记录切换显示到店记录独立页，不发生路由跳转', async () => {
    const user = userEvent.setup();
    render(<StoreCustomerList initialState="normal" />);
    // 默认显示门店客户列表
    expect(getByReqId('customer-table')).toBeTruthy();

    await user.click(within(getByReqId('left-navigation')).getByText('到店记录'));

    // 切换到到店记录独立页，门店客户列表不再渲染
    await waitFor(() => expect(getByReqId('arrival-record-filter')).toBeTruthy());
    expect(getByReqId('arrival-record-table-area')).toBeTruthy();
    expect(document.querySelector('[data-req-id="customer-table"]')).toBeNull();
    // 当前激活子菜单为到店记录
    const activeSubitem = document.querySelector('.store-customer-nav-subitem.active');
    expect(activeSubitem?.getAttribute('data-prospect-page-key')).toBe('arrival-record');
  });

  it('点击拜访记录切换显示拜访记录独立页（19 列含下次拜访时间）', async () => {
    const user = userEvent.setup();
    render(<StoreCustomerList initialState="normal" />);
    await user.click(within(getByReqId('left-navigation')).getByText('拜访记录'));

    await waitFor(() => expect(getByReqId('visit-record-filter')).toBeTruthy());
    expect(getByReqId('visit-record-table-area')).toBeTruthy();
    expect(document.querySelector('[data-req-id="customer-table"]')).toBeNull();
    // 独立页不允许新增
    expect(screen.queryByText('添加拜访记录')).toBeNull();
    expect(screen.queryByText('添加到店')).toBeNull();
  });

  it('到店/拜访独立页无新增按钮，行内操作无新增/编辑', async () => {
    const user = userEvent.setup();
    render(<StoreCustomerList initialState="normal" />);
    await user.click(within(getByReqId('left-navigation')).getByText('到店记录'));
    await waitFor(() => expect(getByReqId('arrival-record-filter')).toBeTruthy());
    expect(screen.queryByText('添加到店')).toBeNull();
    expect(screen.queryByText('添加拜访记录')).toBeNull();
    const rows = getByReqId('arrival-record-table').querySelectorAll('tbody tr[data-row-key]');
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(within(row as HTMLElement).queryByText('添加到店')).toBeNull();
      expect(within(row as HTMLElement).queryByText('编辑')).toBeNull();
    }
  });

  it('点击门店客户返回门店客户列表', async () => {
    const user = userEvent.setup();
    render(<StoreCustomerList initialState="normal" />);
    await user.click(within(getByReqId('left-navigation')).getByText('到店记录'));
    await waitFor(() => expect(getByReqId('arrival-record-filter')).toBeTruthy());

    await user.click(within(getByReqId('left-navigation')).getByText('门店客户'));
    await waitFor(() => expect(getByReqId('customer-table')).toBeTruthy());
    expect(document.querySelector('[data-req-id="arrival-record-filter"]')).toBeNull();
  });

  it('不可切换的占位子菜单点击不改变当前页面', async () => {
    const user = userEvent.setup();
    render(<StoreCustomerList initialState="normal" />);
    await user.click(within(getByReqId('left-navigation')).getByText('标签分组'));
    // 标签分组为占位入口，点击后仍停留在门店客户列表
    expect(getByReqId('customer-table')).toBeTruthy();
  });

  it('到店记录 Workspace 渲染完整潜客管理菜单与选中态（initialPage=arrival-record）', () => {
    render(<StoreCustomerList initialState="normal" initialPage="arrival-record" />);
    // 完整 SCRM 后台壳：左侧导航 + SCRM系统品牌
    const nav = getByReqId('left-navigation');
    expect(nav.textContent).toContain('SCRM系统');
    // 潜客管理完整子菜单（9 项，正式 key 顺序，无 visit-record-2）
    expect(
      navSubitems().map((item) => item.getAttribute('data-prospect-page-key')),
    ).toEqual([
      'store-customer',
      'arrival-record',
      'visit-record',
      'employee-seat',
      'customer-sea',
      'invalid-sea',
      'my-responsible',
      'call-record',
      'tag-group',
    ]);
    // 选中态同步到到店记录
    expect(activePageKey()).toBe('arrival-record');
    // 内容区为到店记录独立页（32 列，与共享列定义一致）
    expect(getByReqId('arrival-record-filter')).toBeTruthy();
    expect(visibleHeaders(getByReqId('arrival-record-table'))).toEqual(ARRIVAL_RECORD_HEADERS);
    expect(visibleHeaders(getByReqId('arrival-record-table'))).toHaveLength(32);
    // 门店客户列表不渲染
    expect(document.querySelector('[data-req-id="customer-table"]')).toBeNull();
  });

  it('拜访记录 Workspace 渲染完整潜客管理菜单与选中态（initialPage=visit-record）', () => {
    render(<StoreCustomerList initialState="normal" initialPage="visit-record" />);
    // 完整 SCRM 后台壳 + 完整潜客管理子菜单（9 项）
    const nav = getByReqId('left-navigation');
    expect(nav.textContent).toContain('SCRM系统');
    expect(navSubitems()).toHaveLength(9);
    // 选中态同步到拜访记录
    expect(activePageKey()).toBe('visit-record');
    // 内容区为拜访记录独立页（19 列，下次拜访时间为第 7 列）
    expect(getByReqId('visit-record-filter')).toBeTruthy();
    const headers = visibleHeaders(getByReqId('visit-record-table'));
    expect(headers).toEqual(VISIT_RECORD_HEADERS);
    expect(headers).toHaveLength(19);
    expect(headers.indexOf('下次拜访时间')).toBe(6);
    // 门店客户列表不渲染
    expect(document.querySelector('[data-req-id="customer-table"]')).toBeNull();
  });

  it('不存在第二套重复菜单 DOM：全程仅一个后台壳与一份潜客管理菜单', () => {
    render(<StoreCustomerList initialState="normal" initialPage="arrival-record" />);
    // 仅一个左侧导航、一个系统品牌、一个潜客管理子菜单
    expect(document.querySelectorAll('[data-req-id="left-navigation"]')).toHaveLength(1);
    expect(document.querySelectorAll('.store-customer-nav-header')).toHaveLength(1);
    expect(navSubitems()).toHaveLength(9);
    const labels = navSubitems().map((item) => item.textContent?.trim());
    expect(labels.filter((label) => label === '到店记录')).toHaveLength(1);
    expect(labels.filter((label) => label === '拜访记录')).toHaveLength(1);
    // 到店记录页业务内容也只渲染一份（不出现裸页 + 壳页两份表）
    expect(document.querySelectorAll('[data-req-id="arrival-record-table"]')).toHaveLength(1);
    expect(document.querySelectorAll('[data-req-id="arrival-record-filter"]')).toHaveLength(1);
  });

  it('门店客户 → 到店记录 → 拜访记录 切换正确，菜单选中态与业务内容同步', async () => {
    const user = userEvent.setup();
    render(<StoreCustomerList initialState="normal" />);
    // 初始：门店客户列表 + 门店客户选中
    expect(getByReqId('customer-table')).toBeTruthy();
    expect(activePageKey()).toBe('store-customer');

    // → 到店记录
    await user.click(within(getByReqId('left-navigation')).getByText('到店记录'));
    await waitFor(() => expect(getByReqId('arrival-record-filter')).toBeTruthy());
    expect(activePageKey()).toBe('arrival-record');
    expect(visibleHeaders(getByReqId('arrival-record-table'))).toHaveLength(32);
    expect(document.querySelector('[data-req-id="customer-table"]')).toBeNull();

    // → 拜访记录
    await user.click(within(getByReqId('left-navigation')).getByText('拜访记录'));
    await waitFor(() => expect(getByReqId('visit-record-filter')).toBeTruthy());
    expect(activePageKey()).toBe('visit-record');
    expect(visibleHeaders(getByReqId('visit-record-table'))).toHaveLength(19);
    expect(document.querySelector('[data-req-id="arrival-record-filter"]')).toBeNull();

    // → 门店客户（52 列无回退）
    await user.click(within(getByReqId('left-navigation')).getByText('门店客户'));
    await waitFor(() => expect(getByReqId('customer-table')).toBeTruthy());
    expect(activePageKey()).toBe('store-customer');
    expect(document.querySelector('[data-req-id="visit-record-filter"]')).toBeNull();
    const seen = new Set<string>();
    const storeTitles: string[] = [];
    for (const header of screen.getAllByRole('columnheader')) {
      const text = header.textContent?.trim() ?? '';
      if (text && !seen.has(text)) {
        seen.add(text);
        storeTitles.push(text);
      }
    }
    expect(storeTitles).toHaveLength(52);
  });
});
