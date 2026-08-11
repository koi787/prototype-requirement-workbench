/**
 * 0011 门店客户跟进详情 Cycle 1 - 组件测试。
 *
 * 只验证用户可观察结果与正式 data-req-id，不依赖 Ant Design 私有类名作为
 * 核心断言，不通过 `cells[数字]` 拼接取数，不写条件分支假断言。
 * 记录 Tab 测试通过 initialFollowUpDetail 夹具直接进入目标 Tab，无需多步操作。
 */
import { describe, it, expect, afterEach } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StoreCustomerList } from '../../StoreCustomerList';
import { COLUMN_COUNT, COLUMN_ORDER } from '../../columns';
import { FOLLOW_UP_TABS, formatRecordAmount } from '../followUpTypes';
import type { FollowUpTabKey } from '../followUpTypes';
import { ARRIVAL_RECORD_COLUMNS, ARRIVAL_RECORD_HEADERS } from '../arrivalRecordColumns';
import { VISIT_RECORD_COLUMNS, VISIT_RECORD_HEADERS } from '../visitRecordColumns';
import { CALL_RECORD_COLUMNS, CALL_RECORD_HEADERS } from '../callRecordColumns';
import {
  ASSIGNMENT_RECORD_COLUMNS,
  ASSIGNMENT_RECORD_HEADERS,
} from '../assignmentRecordColumns';

afterEach(() => cleanup());

function getByReqId(id: string): HTMLElement {
  const elements = document.querySelectorAll(`[data-req-id="${id}"]`);
  if (elements.length !== 1) {
    throw new Error(`预期 data-req-id="${id}" 严格唯一，实际为 ${elements.length} 个`);
  }
  return elements[0] as HTMLElement;
}

/** 渲染并等待跟进详情抽屉打开，返回抽屉根元素 */
async function renderFollowUpDrawer(
  customerKey: string,
  tab?: FollowUpTabKey,
  extraProps: {
    initialState?: 'normal' | 'loading' | 'empty' | 'error' | 'noResults';
    initialRequirementMode?: 'prototype' | 'requirement';
  } = {},
): Promise<HTMLElement> {
  render(
    <StoreCustomerList
      initialState={extraProps.initialState ?? 'normal'}
      initialRequirementMode={extraProps.initialRequirementMode ?? 'prototype'}
      initialFollowUpDetail={{ customerKey, ...(tab ? { tab } : {}) }}
    />,
  );
  await waitFor(() => {
    expect(document.querySelector('[data-req-id="follow-up-detail-drawer"]')).toBeTruthy();
  });
  return getByReqId('follow-up-detail-drawer');
}

/** 读取表格内实际渲染表头（固定列可能重复渲染，按首次出现去重） */
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

function tabsIn(drawer: HTMLElement): string[] {
  return within(drawer)
    .getAllByRole('tab')
    .map((tab) => tab.textContent?.trim() ?? '');
}

// 0011 §6/§7/§8/§9 完整期望表头（硬编码，防止列定义被意外调整）
const EXPECTED_ARRIVAL_HEADERS = [
  'ID',
  '用户姓名',
  '用户ID',
  '微信号',
  '手机号',
  '客资来源',
  '预约门店',
  '到店时间',
  '是否到店',
  '是否成交',
  '成交金额',
  '课程类型',
  '是否有体验课',
  '体验课状态',
  '是否签到',
  '体验课上课教练',
  '体验课下课时间',
  '合同号',
  '体验课卡合同状态',
  '体验课卡',
  '实付金额',
  '体验课卡获取时间',
  '意向度',
  '改善需求',
  '意向课程',
  '预约备注',
  '结果分析',
  '创建人',
  '创建时间',
  '更新人',
  '更新时间',
  '操作',
];

const EXPECTED_VISIT_HEADERS = [
  'ID',
  '用户姓名',
  '用户ID',
  '微信号',
  '手机号',
  '客资来源',
  '预约门店',
  '拜访方式',
  '意向度',
  '改善需求',
  '意向课程',
  '拜访备注',
  '拜访时间',
  '创建人',
  '创建时间',
  '更新人',
  '更新时间',
  '操作',
];

const EXPECTED_CALL_HEADERS = [
  'ID',
  '用户姓名',
  '用户ID',
  '手机号',
  '通话结果',
  '通话状态',
  '通话时长',
  '通话标签',
  '通话备注',
  '呼出类型',
  '拨打员工',
  '拨打时间',
  '操作',
];

const EXPECTED_ASSIGNMENT_HEADERS = ['分配人', '分配时间'];

describe('StoreCustomerList 跟进详情（0011 Cycle 1）', () => {
  describe('唯一入口与抽屉行为', () => {
    it('行操作菜单仅一个"跟进详情"入口，点击后打开抽屉', async () => {
      const user = userEvent.setup();
      render(<StoreCustomerList initialState="normal" />);

      const trigger = getByReqId('operation-menu-trigger-1');
      await user.click(trigger);
      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: '跟进详情' })).toBeTruthy();
      });
      // 唯一入口：打开的菜单中"跟进详情"只有一项
      expect(screen.getAllByRole('menuitem', { name: '跟进详情' })).toHaveLength(1);

      await user.click(screen.getByRole('menuitem', { name: '跟进详情' }));
      await waitFor(() => {
        expect(document.querySelector('[data-req-id="follow-up-detail-drawer"]')).toBeTruthy();
      });
      const drawer = getByReqId('follow-up-detail-drawer');
      expect(drawer.textContent).toContain('跟进详情');
      expect(drawer.textContent).toContain('张三');
    });

    it('抽屉宽70vw，关闭后底层列表与分页保留', async () => {
      const user = userEvent.setup();
      render(<StoreCustomerList initialState="normal" />);
      expect(getByReqId('pagination-area').textContent).toContain('共 25 条记录');

      const trigger = getByReqId('operation-menu-trigger-1');
      await user.click(trigger);
      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: '跟进详情' })).toBeTruthy();
      });
      await user.click(screen.getByRole('menuitem', { name: '跟进详情' }));
      await waitFor(() => {
        expect(document.querySelector('[data-req-id="follow-up-detail-drawer"]')).toBeTruthy();
      });

      // 抽屉打开期间底层列表与分页保持不变
      expect(getByReqId('customer-table')).toBeTruthy();
      expect(getByReqId('pagination-area').textContent).toContain('共 25 条记录');

      // 宽度 70vw（可观察内联样式）
      const widthEls = document.querySelectorAll('[style*="70vw"]');
      expect(widthEls).toHaveLength(1);
      const drawerRoot = getByReqId('follow-up-detail-drawer');
      const widthEl = widthEls[0] as HTMLElement;
      expect(drawerRoot.contains(widthEl)).toBe(true);

      // 右上角关闭后抽屉消失，列表保留
      await user.click(document.querySelector('[aria-label="Close"]') as HTMLElement);
      await waitFor(() => {
        expect(document.querySelector('[data-req-id="follow-up-detail-drawer"]')).toBeNull();
      });
      expect(getByReqId('customer-table')).toBeTruthy();
      expect(getByReqId('pagination-area').textContent).toContain('共 25 条记录');
      expect(getByReqId('customer-table').textContent).toContain('张三');
    });
  });

  describe('五个固定Tab与跟进流程', () => {
    it('固定五个Tab，名称顺序固定，默认跟进流程', async () => {
      const drawer = await renderFollowUpDrawer('1');

      expect(FOLLOW_UP_TABS).toEqual([
        { key: 'process', label: '跟进流程' },
        { key: 'arrival', label: '到店记录' },
        { key: 'visit', label: '拜访记录' },
        { key: 'call', label: '通话记录' },
        { key: 'assignment', label: '分配记录' },
      ]);
      expect(tabsIn(drawer)).toEqual(['跟进流程', '到店记录', '拜访记录', '通话记录', '分配记录']);
      expect(
        within(drawer).getByRole('tab', { name: '跟进流程' }).getAttribute('aria-selected'),
      ).toBe('true');
    });

    it('Tab切换保持抽屉打开且客户不变', async () => {
      const user = userEvent.setup();
      const drawer = await renderFollowUpDrawer('1');

      await user.click(within(drawer).getByRole('tab', { name: '到店记录' }));
      await waitFor(() => {
        expect(
          within(drawer).getByRole('tab', { name: '到店记录' }).getAttribute('aria-selected'),
        ).toBe('true');
      });
      expect(document.querySelector('[data-req-id="follow-up-detail-drawer"]')).toBeTruthy();
      expect(getByReqId('follow-up-detail-drawer').textContent).toContain('张三');
      expect(getByReqId('arrival-record-table')).toBeTruthy();
    });

    it('跟进流程三段：用户信息/跟进概览/跟进旅程', async () => {
      const drawer = await renderFollowUpDrawer('1');
      const text = drawer.textContent ?? '';
      expect(text).toContain('用户信息');
      expect(text).toContain('跟进概览');
      expect(text).toContain('跟进旅程');

      // 模块标题 = 细蓝色竖线 + 标题
      const moduleTitles = drawer.querySelectorAll('.store-customer-followup-module-title');
      expect(moduleTitles).toHaveLength(3);
      moduleTitles.forEach((title) => {
        expect(title.querySelector('.store-customer-followup-module-title-bar')).toBeTruthy();
      });
    });

    it('用户信息字段直接来自当前客户记录（张三）', async () => {
      const drawer = await renderFollowUpDrawer('1');
      expect(drawer.querySelector('.store-customer-followup-user-name')?.textContent).toBe('张三');
      expect(drawer.querySelector('.store-customer-followup-avatar')?.textContent).toBe('张');

      // row1：头像 + 姓名 + 编辑 + 客资来源变更记录（同一身份区，编辑与变更记录紧跟姓名）
      const identityRow1 = drawer.querySelector('.store-customer-followup-user-identity-row1');
      expect(identityRow1).toBeTruthy();
      expect(identityRow1?.querySelector('.store-customer-followup-user-name')?.textContent).toBe(
        '张三',
      );
      expect(getByReqId('followup-edit').textContent).toBe('编辑');
      expect(getByReqId('followup-source-change-record').textContent).toBe('客资来源变更记录');
      const row1Order = identityRow1
        ? Array.from(identityRow1.querySelectorAll('span')).map((el) => el.textContent?.trim())
        : [];
      expect(row1Order).toEqual(['张', '张三', '编辑', '客资来源变更记录']);

      // 身份区 row2：客资来源 | 微信号 | 手机号
      const identityText = drawer.querySelector('.store-customer-followup-user-identity-row2')
        ?.textContent ?? '';
      expect(identityText).toContain('客资来源：地推活动');
      expect(identityText).toContain('微信号：wx_zhangsan_01');
      expect(identityText).toContain('手机号：139****4822');

      // 左右两栏字段（值 + 操作文字同格展示）
      const fields = drawer.querySelectorAll('.store-customer-followup-user-column-field');
      const map = new Map<string, string>();
      fields.forEach((field) => {
        const label =
          field.querySelector('.store-customer-followup-user-column-field-label')
            ?.textContent?.trim() ?? '';
        const value =
          field.querySelector('.store-customer-followup-user-column-field-value')
            ?.textContent?.trim() ?? '';
        map.set(label, value);
      });
      expect(map.get('预约门店')).toBe('示例旗舰店');
      expect(map.get('跟进人')).toBe('王经理');
      expect(map.get('进入公海时间')).toBe('--');
      expect(map.get('共享人')).toBe('--添加');
      expect(map.get('标签')).toBe('意向客户编辑变更记录');
      expect(map.get('注册时间')).toBe('2026-07-15 08:00:00');
    });

    it('用户信息详情三行由真实容器 .store-customer-followup-user-column 控制纵向间距（grid row-gap 不再承担）', async () => {
      const drawer = await renderFollowUpDrawer('1');

      // 1) 网格容器只有左右两栏，是两列的真实父级
      const columnsWrap = drawer.querySelector('.store-customer-followup-user-columns');
      expect(columnsWrap).toBeTruthy();
      const columns = columnsWrap!.querySelectorAll('.store-customer-followup-user-column');
      expect(columns).toHaveLength(2);

      // 2) 每栏是 3 个字段的直接父级，且栏内三行标签顺序正确
      const [left, right] = [columns[0] as Element, columns[1] as Element];
      const leftLabels = Array.from(left.querySelectorAll('.store-customer-followup-user-column-field-label')).map(
        (el) => el.textContent?.trim(),
      );
      const rightLabels = Array.from(right.querySelectorAll('.store-customer-followup-user-column-field-label')).map(
        (el) => el.textContent?.trim(),
      );
      expect(leftLabels).toEqual(['预约门店', '跟进人', '进入公海时间']);
      expect(rightLabels).toEqual(['共享人', '标签', '注册时间']);
      expect(left.querySelectorAll('.store-customer-followup-user-column-field')).toHaveLength(3);
      expect(right.querySelectorAll('.store-customer-followup-user-column-field')).toHaveLength(3);

      // 3) 纵向间距真正作用在栏容器上：flex 纵向 + row-gap 24px（不再依赖 grid row-gap）
      const leftStyle = getComputedStyle(left);
      expect(leftStyle.display).toBe('flex');
      expect(leftStyle.flexDirection).toBe('column');
      expect(leftStyle.rowGap).toBe('24px');
      const gridStyle = getComputedStyle(columnsWrap!);
      expect(gridStyle.columnGap).toBe('40px');
      // 纵向间距已移到栏容器，grid 上不再残留 34px row-gap 假控制
      expect(gridStyle.rowGap).not.toBe('34px');

      // 4) 字段自身无纵向 margin，避免父 gap + 子 margin 双倍叠加
      const fieldStyle = getComputedStyle(
        left.querySelector('.store-customer-followup-user-column-field') as Element,
      );
      expect(parseFloat(fieldStyle.marginTop) || 0).toBe(0);
      expect(parseFloat(fieldStyle.marginBottom) || 0).toBe(0);
    });

    it('用户信息已移除客户状态/分配信息/分配记录入口（姓名旁编辑已恢复）', async () => {
      const drawer = await renderFollowUpDrawer('1');
      const text = drawer.textContent ?? '';
      expect(text).not.toContain('客户状态');
      expect(text).not.toContain('分配信息');
      expect(text).not.toContain('分配记录入口');
      expect(text).not.toContain('查看分配记录');
      expect(drawer.querySelector('.store-customer-followup-user-status')).toBeNull();
      expect(document.querySelector('[data-req-id="followup-assignment-entry"]')).toBeNull();
      // 第二轮 C 级修正：姓名旁"编辑"已恢复
      expect(getByReqId('followup-edit').textContent).toBe('编辑');
    });

    it('用户信息顶部独立浅灰操作条：仅四个操作入口，不显示到店/成交状态标签', async () => {
      const drawer = await renderFollowUpDrawer('1');
      const operationBar = drawer.querySelector('.store-customer-followup-user-operation-bar');
      expect(operationBar).toBeTruthy();
      // 操作条独立于姓名/头像行，不含姓名与头像
      expect(operationBar?.querySelector('.store-customer-followup-user-name')).toBeNull();
      expect(operationBar?.querySelector('.store-customer-followup-avatar')).toBeNull();
      // 操作条是操作区：不展示 已到店/未到店/已成交/未成交 状态标签
      const operationBarText = operationBar?.textContent ?? '';
      expect(operationBarText).not.toContain('已到店');
      expect(operationBarText).not.toContain('未到店');
      expect(operationBarText).not.toContain('已成交');
      expect(operationBarText).not.toContain('未成交');
      expect(operationBar?.querySelector('.store-customer-followup-op-status-tags')).toBeNull();
      // 四个操作入口严格保留，顺序固定
      const opTexts = Array.from(
        operationBar?.querySelectorAll('.store-customer-followup-op-text, .store-customer-followup-op-btn-outline') ??
          [],
      ).map((el) => el.textContent?.trim());
      expect(opTexts).toEqual(['手动变更', '更多操作', '添加到店', '添加拜访记录']);
      expect(getByReqId('followup-manual-change').textContent).toBe('手动变更');
      expect(getByReqId('followup-more-actions').textContent).toBe('更多操作');
      expect(getByReqId('followup-add-arrival').textContent).toBe('添加到店');
      expect(getByReqId('followup-add-visit').textContent).toBe('添加拜访记录');
    });

    it('跟进概览四张等宽卡片：主值 + 分组详细统计 + 信息图标', async () => {
      const drawer = await renderFollowUpDrawer('1');
      const cards = drawer.querySelectorAll('.store-customer-followup-overview-card');
      expect(cards).toHaveLength(4);

      const trialCard = getByReqId('overview-card-trial');
      expect(
        trialCard.querySelector('.store-customer-followup-overview-card-title')?.textContent,
      ).toBe('剩余体验课次数');
      expect(trialCard.querySelector('.store-customer-followup-overview-main')?.textContent).toBe(
        '2',
      );
      expect(trialCard.querySelector('.store-customer-followup-overview-info')).toBeTruthy();
      const trialText = trialCard.textContent ?? '';
      expect(trialText).toContain('总体验课次数');
      expect(trialText).toContain('总体验课卡数');

      const arrivalCard = getByReqId('overview-card-arrival');
      expect(arrivalCard.querySelector('.store-customer-followup-overview-main')?.textContent).toBe(
        '3',
      );
      const arrivalText = arrivalCard.textContent ?? '';
      expect(arrivalText).toContain('有体验课到店次数');
      expect(arrivalText).toContain('未到店次数');
      expect(arrivalText).toContain('上次到店时间');
      expect(arrivalText).toContain('2026-07-22 17:00:00');
      expect(arrivalText).toContain('首次到店时间');
      expect(arrivalText).toContain('2026-07-20 14:30:00');

      const visitCard = getByReqId('overview-card-visit');
      expect(visitCard.querySelector('.store-customer-followup-overview-main')?.textContent).toBe(
        '2',
      );
      const visitText = visitCard.textContent ?? '';
      expect(visitText).toContain('未拜访时长');
      expect(visitText).toContain('3天');
      expect(visitText).toContain('上次拜访时间');
      expect(visitText).toContain('2026-07-21 09:00:00');
      expect(visitText).toContain('首次拜访时间');
      expect(visitText).toContain('2026-07-19 10:00:00');

      const dealCard = getByReqId('overview-card-deal');
      expect(dealCard.querySelector('.store-customer-followup-overview-main')?.textContent).toBe(
        '299.90',
      );
      const dealText = dealCard.textContent ?? '';
      expect(dealText).toContain('剩余价值');
      expect(dealText).toContain('1290.00');
      expect(dealText).toContain('总退款金额');
      expect(dealText).toContain('0.00');
      expect(dealText).toContain('总成交课卡数');
      expect(dealText).toContain('成交课程类型');
      expect(dealText).toContain('少儿体适能');
    });

    it('跟进概览微调：总拜访次数卡"未拜访时长"为上下层级（label上、value下）', async () => {
      await renderFollowUpDrawer('1');
      const visitCard = getByReqId('overview-card-visit');
      const stacked = visitCard.querySelector(
        '.store-customer-followup-overview-detail--stacked',
      );
      expect(stacked).toBeTruthy();
      // 上下层级：flex-direction 为 column
      expect(getComputedStyle(stacked as HTMLElement).flexDirection).toBe('column');
      expect(
        stacked?.querySelector('.store-customer-followup-overview-detail-label')?.textContent,
      ).toBe('未拜访时长');
      expect(
        stacked?.querySelector('.store-customer-followup-overview-detail-value')?.textContent,
      ).toBe('3天');
    });
  });

  describe('跟进旅程', () => {
    it('跟进旅程单一 Select：默认全部，六项固定选项，无六按钮', async () => {
      const user = userEvent.setup();
      await renderFollowUpDrawer('1');
      // 仅一个 Select 筛选，无六项按钮筛选
      expect(document.querySelectorAll('[data-req-id="journey-select"]')).toHaveLength(1);
      expect(document.querySelectorAll('[data-req-id^="journey-filter-"]')).toHaveLength(0);

      const wrapper = getByReqId('journey-select');
      // 默认"全部"
      expect(wrapper.textContent).toContain('全部');

      const combobox = within(wrapper).getByRole('combobox');
      await user.click(combobox);
      const options = await screen.findAllByRole('option');
      // Select 关闭虚拟滚动后六项 option 全部渲染，文本即标签
      expect(options).toHaveLength(6);
      expect(options.map((option) => option.textContent?.trim())).toEqual([
        '全部',
        '到店记录',
        '拜访记录',
        '通话记录',
        '已丢单',
        '客资有效性',
      ]);
    });

    it('旅程事件按时间倒序展示，卡片含标签与字段（含客资有效性事件）', async () => {
      const drawer = await renderFollowUpDrawer('1');
      const cards = Array.from(drawer.querySelectorAll('[data-req-id^="journey-card-"]'));
      // 全部（默认）混合展示 6 条，严格按时间倒序：j1→j6
      expect(cards.map((c) => c.getAttribute('data-req-id'))).toEqual([
        'journey-card-j1',
        'journey-card-j2',
        'journey-card-j3',
        'journey-card-j4',
        'journey-card-j5',
        'journey-card-j6',
      ]);

      // 到店卡：标签（是否到店/是否成交/意向度）+ 字段 + 详情视觉
      const arrivalCard = getByReqId('journey-card-j1');
      const arrivalText = arrivalCard.textContent ?? '';
      expect(arrivalText).toContain('已到店');
      expect(arrivalText).toContain('已成交');
      expect(arrivalText).toContain('意向度5');
      expect(arrivalText).toContain('到店时间');
      expect(arrivalText).toContain('2026-07-22 17:00:00');
      expect(arrivalText).toContain('示例旗舰店');
      expect(arrivalText).toContain('少儿体适能');
      expect(arrivalText).toContain('改善基础体能');
      expect(arrivalText).toContain('少儿体适能课');
      expect(arrivalText).toContain('详情');

      // 通话卡：标签 + 拨打时间/通话时长/拨打员工
      const callCard = getByReqId('journey-card-j2');
      const callText = callCard.textContent ?? '';
      expect(callText).toContain('已接通');
      expect(callText).toContain('拨打时间');
      expect(callText).toContain('2026-07-21 16:00:00');
      expect(callText).toContain('通话时长');
      expect(callText).toContain('拨打员工');

      // 客资有效性卡（全部筛选下与到店/拜访/通话混合展示）
      const invalidCard = getByReqId('journey-card-j5');
      expect(invalidCard.textContent).toContain('标注无效客资');
      expect(invalidCard.textContent).toContain('提交时间');
      expect(invalidCard.textContent).toContain('提交员工');
      const restoredCard = getByReqId('journey-card-j6');
      expect(restoredCard.textContent).toContain('恢复有效客资');
    });

    it('旅程卡结构：header+分隔线+单列body，字段顺序正确', async () => {
      await renderFollowUpDrawer('1');

      // 到店卡：body 单列纵向（非双栏网格），字段顺序固定
      const arrivalCard = getByReqId('journey-card-j1');
      const arrivalHead = arrivalCard.querySelector('.store-customer-followup-journey-card-head');
      expect(arrivalHead).toBeTruthy();
      expect(arrivalHead?.textContent).toContain('已到店');
      expect(
        arrivalHead?.querySelector('.store-customer-followup-journey-card-detail')?.textContent,
      ).toBe('详情');
      const arrivalBody = arrivalCard.querySelector('.store-customer-followup-journey-card-body');
      expect(arrivalBody).toBeTruthy();
      expect(getComputedStyle(arrivalBody as HTMLElement).flexDirection).toBe('column');
      const arrivalLabels = Array.from(
        (arrivalBody as HTMLElement).querySelectorAll(
          '.store-customer-followup-journey-field-label',
        ),
      ).map((el) => el.textContent?.trim());
      expect(arrivalLabels).toEqual(['到店时间', '预约门店', '体验课', '改善需求', '意向课程']);

      // 拜访卡：单列 body，字段顺序固定
      const visitCard = getByReqId('journey-card-j3');
      const visitBody = visitCard.querySelector('.store-customer-followup-journey-card-body');
      expect(visitBody).toBeTruthy();
      expect(getComputedStyle(visitBody as HTMLElement).flexDirection).toBe('column');
      const visitLabels = Array.from(
        (visitBody as HTMLElement).querySelectorAll(
          '.store-customer-followup-journey-field-label',
        ),
      ).map((el) => el.textContent?.trim());
      expect(visitLabels).toEqual(['拜访时间', '改善需求', '意向课程']);
    });

    it('Select 筛选后按类型过滤，空结果展示暂无数据', async () => {
      const user = userEvent.setup();
      const drawer = await renderFollowUpDrawer('1');

      // 选择"通话记录"：仅保留 j2 通话卡，分页总数同步为 1 条
      await user.click(within(getByReqId('journey-select')).getByRole('combobox'));
      const callOption = await screen.findByRole('option', { name: '通话记录' });
      await user.click(callOption);
      await waitFor(() => {
        const cards = Array.from(drawer.querySelectorAll('[data-req-id^="journey-card-"]'));
        expect(cards.map((card) => card.getAttribute('data-req-id'))).toEqual(['journey-card-j2']);
      });
      expect(getByReqId('journey-pagination-area').textContent).toContain('共 1 条记录');

      // 选择"客资有效性"：仅保留 j5（标注无效客资）/ j6（恢复有效客资），按时间倒序
      await user.click(within(getByReqId('journey-select')).getByRole('combobox'));
      const validityOption = await screen.findByRole('option', { name: '客资有效性' });
      await user.click(validityOption);
      await waitFor(() => {
        const cards = Array.from(drawer.querySelectorAll('[data-req-id^="journey-card-"]'));
        expect(cards.map((card) => card.getAttribute('data-req-id'))).toEqual([
          'journey-card-j5',
          'journey-card-j6',
        ]);
      });
      expect(getByReqId('journey-pagination-area').textContent).toContain('共 2 条记录');

      // 选择"已丢单"：无事件，展示暂无数据且无分页
      await user.click(within(getByReqId('journey-select')).getByRole('combobox'));
      const lostOption = await screen.findByRole('option', { name: '已丢单' });
      await user.click(lostOption);
      await waitFor(() => {
        expect(drawer.querySelectorAll('[data-req-id^="journey-card-"]')).toHaveLength(0);
        expect(drawer.querySelector('.store-customer-followup-journey-empty')?.textContent).toBe(
          '暂无数据',
        );
      });
      expect(document.querySelector('[data-req-id="journey-pagination-area"]')).toBeNull();
    });

    it('客资有效性卡字段：提交时间/提交员工/备注/附件（静态占位）', async () => {
      const user = userEvent.setup();
      await renderFollowUpDrawer('1');

      await user.click(within(getByReqId('journey-select')).getByRole('combobox'));
      const validityOption = await screen.findByRole('option', { name: '客资有效性' });
      await user.click(validityOption);
      await waitFor(() => expect(getByReqId('journey-card-j5')).toBeTruthy());

      const card = getByReqId('journey-card-j5');
      const cardText = card.textContent ?? '';
      expect(cardText).toContain('标注无效客资');
      expect(cardText).toContain('2026-07-16 10:00:00');
      expect(cardText).toContain('王经理');
      expect(cardText).toContain('多次联系未接通，暂标记为无效客资');
      expect(cardText).toContain('无效客资说明.png');
      // 附件为静态占位视觉（含缩略图 Mock 类）
      expect(card.querySelector('.store-customer-followup-journey-attachment')).toBeTruthy();
      // header 标签 + 详情，单列 body
      expect(card.querySelector('.store-customer-followup-journey-card-detail')?.textContent).toBe(
        '详情',
      );
      const body = card.querySelector('.store-customer-followup-journey-card-body');
      expect(getComputedStyle(body as HTMLElement).flexDirection).toBe('column');
      const labels = Array.from(
        (body as HTMLElement).querySelectorAll('.store-customer-followup-journey-field-label'),
      ).map((el) => el.textContent?.trim());
      expect(labels).toEqual(['提交时间', '提交员工', '备注', '附件']);
    });

    it('旅程 Select 与标题同一左侧区域（不再推到最右）', async () => {
      const drawer = await renderFollowUpDrawer('1');
      const wrapper = getByReqId('journey-select');
      // 位于"跟进旅程"标题行内部，与标题同一行
      const titleRow = drawer.querySelector('.store-customer-followup-journey-title');
      expect(titleRow).toBeTruthy();
      expect(titleRow?.contains(wrapper)).toBe(true);
      expect(
        titleRow?.querySelector('.store-customer-followup-journey-title-text')?.textContent,
      ).toBe('跟进旅程');
      // Select 包裹层左侧为固定小间距，不再是 auto 推到最右
      const marginLeft = getComputedStyle(wrapper).marginLeft;
      expect(marginLeft).not.toBe('auto');
      expect(parseFloat(marginLeft)).toBeGreaterThan(0);
      expect(parseFloat(marginLeft)).toBeLessThan(40);
    });

    it('旅程分页：存在、默认10条/页、上一页/下一页禁用', async () => {
      await renderFollowUpDrawer('1');
      const pagination = getByReqId('journey-pagination-area');
      // 共 6 条（全部筛选），默认 10条/页
      expect(pagination.textContent).toContain('共 6 条记录');
      expect(pagination.textContent).toContain('10条/页');
      // 当前页指示
      expect(pagination.textContent).toContain('1 / 1');
      // 上一页 / 下一页 在当前页小于等于首页且总页数为 1 时禁用
      const prevButton = within(pagination).getByRole('button', { name: '上一页' });
      const nextButton = within(pagination).getByRole('button', { name: '下一页' });
      expect((prevButton as HTMLButtonElement).disabled).toBe(true);
      expect((nextButton as HTMLButtonElement).disabled).toBe(true);
      // 分页复用现有后台风格容器
      expect(pagination.classList.contains('store-customer-pagination')).toBe(true);
    });

    it('无旅程数据客户（王五）展示空态暂无数据', async () => {
      const drawer = await renderFollowUpDrawer('3');
      expect(drawer.querySelector('.store-customer-followup-user-name')?.textContent).toBe('王五');
      expect(drawer.querySelectorAll('[data-req-id^="journey-card-"]')).toHaveLength(0);
      expect(drawer.querySelector('.store-customer-followup-journey-empty')?.textContent).toBe(
        '暂无数据',
      );
    });
  });

  describe('跟进概览卡片交互（最后一轮 C 级微调）', () => {
    const INFO_CARD_IDS = [
      'overview-card-trial',
      'overview-card-arrival',
      'overview-card-visit',
      'overview-card-deal',
    ] as const;

    it('四张概览卡均存在 info 入口（右上角信息图标）', async () => {
      await renderFollowUpDrawer('1');
      for (const cardId of INFO_CARD_IDS) {
        expect(getByReqId(cardId).querySelector('.store-customer-followup-overview-info')).toBeTruthy();
      }
      expect(
        document.querySelectorAll('.store-customer-followup-overview-info'),
      ).toHaveLength(4);
    });

    it('第一张卡（剩余体验课次数）Tooltip 文案完全一致', async () => {
      const user = userEvent.setup();
      await renderFollowUpDrawer('1');
      const info = getByReqId('overview-card-trial').querySelector(
        '.store-customer-followup-overview-info',
      ) as HTMLElement;
      await user.hover(info);
      const tooltip = await screen.findByRole('tooltip');
      expect(tooltip.textContent?.trim()).toBe('显示用户剩余的体验课次数信息');
    });

    it('第二张卡（总到店记录数）Tooltip 文案完全一致', async () => {
      const user = userEvent.setup();
      await renderFollowUpDrawer('1');
      const info = getByReqId('overview-card-arrival').querySelector(
        '.store-customer-followup-overview-info',
      ) as HTMLElement;
      await user.hover(info);
      const tooltip = await screen.findByRole('tooltip');
      expect(tooltip.textContent?.trim()).toBe('显示用户的总到店记录数统计');
    });

    it('第三张卡（总拜访次数）Tooltip 文案完全一致', async () => {
      const user = userEvent.setup();
      await renderFollowUpDrawer('1');
      const info = getByReqId('overview-card-visit').querySelector(
        '.store-customer-followup-overview-info',
      ) as HTMLElement;
      await user.hover(info);
      const tooltip = await screen.findByRole('tooltip');
      expect(tooltip.textContent?.trim()).toBe('显示用户的总拜访次数统计');
    });

    it('第四张卡（总成交金额（元））Tooltip 文案完全一致', async () => {
      const user = userEvent.setup();
      await renderFollowUpDrawer('1');
      const info = getByReqId('overview-card-deal').querySelector(
        '.store-customer-followup-overview-info',
      ) as HTMLElement;
      await user.hover(info);
      const tooltip = await screen.findByRole('tooltip');
      expect(tooltip.textContent?.trim()).toBe('显示用户的总成交金额统计');
    });

    it('四张概览卡字段、顺序与主值保持不变', async () => {
      const drawer = await renderFollowUpDrawer('1');
      const titles = Array.from(
        drawer.querySelectorAll('.store-customer-followup-overview-card-title'),
      ).map((el) => el.textContent?.trim());
      expect(titles).toEqual(['剩余体验课次数', '总到店记录数', '总拜访次数', '总成交金额（元）']);
      expect(getByReqId('overview-card-trial').querySelector('.store-customer-followup-overview-main')
        ?.textContent).toBe('2');
      expect(getByReqId('overview-card-arrival').querySelector('.store-customer-followup-overview-main')
        ?.textContent).toBe('3');
      expect(getByReqId('overview-card-visit').querySelector('.store-customer-followup-overview-main')
        ?.textContent).toBe('2');
      expect(getByReqId('overview-card-deal').querySelector('.store-customer-followup-overview-main')
        ?.textContent).toBe('299.90');
    });

    it('点击概览卡不发生任何业务跳转/抽屉/新交互', async () => {
      const user = userEvent.setup();
      const drawer = await renderFollowUpDrawer('1');
      await user.click(getByReqId('overview-card-trial'));
      await user.click(getByReqId('overview-card-deal'));
      // 抽屉仍打开、仍停留在跟进流程 Tab、无新 Drawer/Modal/需求抽屉
      expect(document.querySelector('[data-req-id="follow-up-detail-drawer"]')).toBeTruthy();
      expect(
        within(drawer).getByRole('tab', { name: '跟进流程' }).getAttribute('aria-selected'),
      ).toBe('true');
      expect(document.querySelector('[data-req-id="requirement-drawer"]')).toBeNull();
      expect(document.querySelector('.ant-modal')).toBeNull();
    });
  });

  describe('列定义与任务单一致', () => {
    it('到店记录32列（0011 §6）', () => {
      expect(EXPECTED_ARRIVAL_HEADERS).toHaveLength(32);
      expect(ARRIVAL_RECORD_HEADERS).toEqual(EXPECTED_ARRIVAL_HEADERS);
      expect(ARRIVAL_RECORD_COLUMNS).toHaveLength(32);
    });

    it('拜访记录18列（0011 §7）', () => {
      expect(EXPECTED_VISIT_HEADERS).toHaveLength(18);
      expect(VISIT_RECORD_HEADERS).toEqual(EXPECTED_VISIT_HEADERS);
      expect(VISIT_RECORD_COLUMNS).toHaveLength(18);
    });

    it('通话记录13列（0011 §8）', () => {
      expect(EXPECTED_CALL_HEADERS).toHaveLength(13);
      expect(CALL_RECORD_HEADERS).toEqual(EXPECTED_CALL_HEADERS);
      expect(CALL_RECORD_COLUMNS).toHaveLength(13);
    });

    it('分配记录2列且无操作列（0011 §9）', () => {
      expect(EXPECTED_ASSIGNMENT_HEADERS).toHaveLength(2);
      expect(ASSIGNMENT_RECORD_HEADERS).toEqual(EXPECTED_ASSIGNMENT_HEADERS);
      expect(ASSIGNMENT_RECORD_COLUMNS).toHaveLength(2);
      expect(ASSIGNMENT_RECORD_COLUMNS.some((column) => column.title === '操作')).toBe(false);
    });

    it('到店/拜访/通话操作列固定右侧', () => {
      expect(ARRIVAL_RECORD_COLUMNS.at(-1)?.fixed).toBe('right');
      expect(VISIT_RECORD_COLUMNS.at(-1)?.fixed).toBe('right');
      expect(CALL_RECORD_COLUMNS.at(-1)?.fixed).toBe('right');
    });
  });

  describe('四类记录Tab实际渲染', () => {
    it('到店记录32列表头实际渲染顺序一致', async () => {
      const table = await renderRecordTable('arrival');
      expect(visibleHeaders(table)).toEqual(EXPECTED_ARRIVAL_HEADERS);
      expect(dataRows(table)).toHaveLength(3);
    });

    it('拜访记录18列表头实际渲染顺序一致', async () => {
      const table = await renderRecordTable('visit');
      expect(visibleHeaders(table)).toEqual(EXPECTED_VISIT_HEADERS);
      expect(dataRows(table)).toHaveLength(2);
    });

    it('通话记录13列表头实际渲染顺序一致', async () => {
      const table = await renderRecordTable('call');
      expect(visibleHeaders(table)).toEqual(EXPECTED_CALL_HEADERS);
      expect(dataRows(table)).toHaveLength(2);
    });

    it('分配记录2列表头实际渲染顺序一致', async () => {
      const table = await renderRecordTable('assignment');
      expect(visibleHeaders(table)).toEqual(EXPECTED_ASSIGNMENT_HEADERS);
      expect(dataRows(table)).toHaveLength(2);
    });

    it('到店/拜访/通话使用横向滚动容器，分配记录不使用', async () => {
      const user = userEvent.setup();
      const drawer = await renderFollowUpDrawer('1', 'arrival');

      // 依次激活各记录 Tab，验证包裹容器是否带横向滚动标记
      const expectScrollMarker = (tableId: string) => {
        const table = getByReqId(tableId);
        expect(table.closest('.store-customer-followup-table--h-scroll')).toBeTruthy();
      };
      expectScrollMarker('arrival-record-table');

      await user.click(within(drawer).getByRole('tab', { name: '拜访记录' }));
      await waitFor(() => expect(getByReqId('visit-record-table')).toBeTruthy());
      expectScrollMarker('visit-record-table');

      await user.click(within(drawer).getByRole('tab', { name: '通话记录' }));
      await waitFor(() => expect(getByReqId('call-record-table')).toBeTruthy());
      expectScrollMarker('call-record-table');

      await user.click(within(drawer).getByRole('tab', { name: '分配记录' }));
      await waitFor(() => expect(getByReqId('assignment-record-table')).toBeTruthy());
      const assignment = getByReqId('assignment-record-table');
      expect(assignment.closest('.store-customer-followup-table--h-scroll')).toBeNull();
    });

    it('到店记录金额按两位小数/0.00/-- 展示，姓名蓝色链接', async () => {
      await renderFollowUpDrawer('1', 'arrival');
      const table = getByReqId('arrival-record-table');
      const rows = dataRows(table);
      const amountIndex = EXPECTED_ARRIVAL_HEADERS.indexOf('成交金额');
      const nameIndex = EXPECTED_ARRIVAL_HEADERS.indexOf('用户姓名');
      expect(rows.map((row) => cellByIndex(row, amountIndex).textContent?.trim())).toEqual([
        '299.90',
        '0.00',
        '--',
      ]);
      const nameLink = cellByIndex(rows[0]!, nameIndex).querySelector(
        '.store-customer-followup-name-link',
      );
      expect(nameLink?.textContent).toBe('张三');
    });

    it('到店记录是否到店/是否成交状态标签', async () => {
      await renderFollowUpDrawer('1', 'arrival');
      const table = getByReqId('arrival-record-table');
      const rows = dataRows(table);
      const arrived = EXPECTED_ARRIVAL_HEADERS.indexOf('是否到店');
      const dealt = EXPECTED_ARRIVAL_HEADERS.indexOf('是否成交');
      expect(cellByIndex(rows[0]!, arrived).textContent?.trim()).toBe('已到店');
      expect(cellByIndex(rows[0]!, dealt).textContent?.trim()).toBe('已成交');
      expect(cellByIndex(rows[2]!, arrived).textContent?.trim()).toBe('未到店');
      expect(cellByIndex(rows[2]!, dealt).textContent?.trim()).toBe('未成交');
    });

    it('通话记录通话时长使用蓝色样式', async () => {
      await renderFollowUpDrawer('1', 'call');
      const table = getByReqId('call-record-table');
      const rows = dataRows(table);
      const durationIndex = EXPECTED_CALL_HEADERS.indexOf('通话时长');
      const durationCell = cellByIndex(rows[0]!, durationIndex);
      expect(durationCell.textContent?.trim()).toBe('03:26');
      expect(durationCell.querySelector('.store-customer-call-duration')).toBeTruthy();
      expect(cellByIndex(rows[1]!, durationIndex).textContent?.trim()).toBe('00:00');
    });

    it('分配记录仅两列且无操作列，展示分配人/分配时间', async () => {
      await renderFollowUpDrawer('1', 'assignment');
      const table = getByReqId('assignment-record-table');
      expect(visibleHeaders(table)).toEqual(EXPECTED_ASSIGNMENT_HEADERS);
      const rows = dataRows(table);
      expect(rows).toHaveLength(2);
      const firstRowText = rows[0]!.textContent ?? '';
      expect(firstRowText).toContain('王经理');
      expect(firstRowText).toContain('2026-07-22 09:15:00');
    });

    it('记录数据按客户key隔离：李四无记录，表格为空', async () => {
      const user = userEvent.setup();
      const drawer = await renderFollowUpDrawer('2');
      expect(drawer.querySelector('.store-customer-followup-user-name')?.textContent).toBe('李四');

      await user.click(within(drawer).getByRole('tab', { name: '到店记录' }));
      await waitFor(() => expect(getByReqId('arrival-record-table')).toBeTruthy());
      expect(dataRows(getByReqId('arrival-record-table'))).toHaveLength(0);
    });
  });

  describe('金额纯函数', () => {
    it('formatRecordAmount：两位小数/0.00/--', () => {
      expect(formatRecordAmount(299.9)).toBe('299.90');
      expect(formatRecordAmount(0)).toBe('0.00');
      expect(formatRecordAmount(null)).toBe('--');
      expect(formatRecordAmount(undefined)).toBe('--');
    });
  });

  describe('需求查看模式兼容', () => {
    it('跟进详情与需求点共存，需求点不触发跟进详情业务', async () => {
      const user = userEvent.setup();
      await renderFollowUpDrawer('1', undefined, { initialRequirementMode: 'requirement' });
      expect(document.querySelector('[data-req-id="follow-up-detail-drawer"]')).toBeTruthy();

      const marker12 = document.querySelector('[data-req-id="requirement-view-mode-control"]');
      expect(marker12).toBeTruthy();
      await user.click(marker12 as HTMLElement);
      await waitFor(() => {
        expect(document.querySelector('[data-req-id="requirement-drawer"]')).toBeTruthy();
      });

      // 点击需求点只打开需求说明，跟进详情抽屉保持打开且客户不变
      const drawerText = getByReqId('follow-up-detail-drawer').textContent ?? '';
      expect(drawerText).toContain('张三');
      expect(document.querySelector('[data-req-id="follow-up-detail-drawer"]')).toBeTruthy();
    });
  });

  describe('52列基线不回退', () => {
    it('列定义保持52列，前13列与尾部顺序不变', () => {
      expect(COLUMN_COUNT).toBe(52);
      expect(COLUMN_ORDER.slice(0, 13)).toEqual([
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
      ]);
      expect(COLUMN_ORDER.slice(-4)).toEqual([
        'latestRetainTime',
        'firstAssignTime',
        'createTime',
        'operation',
      ]);
    });

    it('跟进详情打开时主列表仍完整渲染', async () => {
      await renderFollowUpDrawer('1');
      expect(getByReqId('customer-table')).toBeTruthy();
      expect(getByReqId('pagination-area').textContent).toContain('共 25 条记录');
    });
  });
});

/** 渲染并直接进入指定记录 Tab，返回对应表格根元素 */
async function renderRecordTable(tab: FollowUpTabKey): Promise<HTMLElement> {
  await renderFollowUpDrawer('1', tab);
  const tableId = `${tab}-record-table`;
  return getByReqId(tableId);
}
