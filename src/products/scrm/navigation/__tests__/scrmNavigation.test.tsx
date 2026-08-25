/**
 * 0013/0014 - SCRM 产品级导航 / 页面注册表 / 产品壳测试。
 *
 * 覆盖任务单 §15 的产品级骨架项：
 * 1. 菜单配置可表达多一级业务域（prospect-management / employee-management /
 *    customer-management）；0014/0016 正式启用员工域与客户域，未注册节点不可点击且不生成空页。
 * 2. 页面注册表对六个 canonical pageKey 返回正确页面；未知 key 不静默映射。
 * 3. 旧 initialPage key 兼容：旧 key → canonical 归一化；未知 initialPage 不落错误页。
 * 5. 页面出口不产生第二套 Sidebar / 顶部栏（产品壳单一实例）。
 * 6. Provider 仅挂载一次：跨内容出口组件类型变化后 create / update 运行时记录保留。
 * 7. 页面注册项自身不创建 Provider；缺少产品 Provider 的严格 Hook 守卫继续有效。
 * 8. Requirement 控件只在门店客户页面显示；切到到店/拜访独立页不显示需求控件。
 * 9. 产品级页面出口在 ScrmWorkspace：activePage 经 pageRegistry 选择页面内容
 *    （Blocking 修复：页面选择链位于产品壳，不经过潜客业务根）。
 * 10. employee-management 生产注册页（0014 组织架构）由产品壳直接出口渲染，
 *    绕过潜客业务根（不挂载潜客 DOM / Drawer 副作用）；一级"员工"菜单点击
 *    调用现有 navigate(defaultPageKey) 激活员工域并展开组织架构。
 *
 * 真实业务页面（52 / 32 / 19 列、切换、跟进详情、审批、新增/编辑/变更记录）
 * 的回归继续由既有 StoreCustomerList / ArrivalRecordPage / VisitRecordPage 测试
 * 承担（§15.9 / §15.10），本文件只测产品级骨架与注册边界。
 */
import { Component } from 'react';
import type { ReactNode } from 'react';
import { afterEach, describe, it, expect } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScrmWorkspace } from '../../shell/ScrmWorkspace';
import { SCRM_MENU, normalizePageKey } from '../scrmMenuConfig';
import { SCRM_PAGE_REGISTRY, getPageRegistration } from '../scrmPageRegistry';
import type { ScrmModuleKey, ScrmPageKey } from '../scrmNavigationTypes';
import {
  PROSPECT_NAV_ITEMS,
  SWITCHABLE_PROSPECT_PAGES,
} from '../../modules/prospect-management/navigation/prospectManagementPages';
import { useRecordRuntimeStore } from '../../modules/prospect-management/record-shared';
import { ArrivalRecordPage } from '../../modules/prospect-management/arrival-record';
import { VisitRecordPage } from '../../modules/prospect-management/visit-record';
import { StoreCustomerList } from '../../modules/prospect-management/pages/StoreCustomerList/StoreCustomerList';

afterEach(() => cleanup());

/** 捕获渲染错误的守卫（用于验证注册项自渲染缺少产品 Provider 时的严格 Hook 报错）。 */
class GuardErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return <div data-testid="guard-error">{this.state.error.message}</div>;
    }
    return this.props.children;
  }
}

describe('0013 SCRM 产品级导航与页面注册', () => {
  it('菜单配置可表达多一级业务域；0014/0016 启用员工与客户域，未注册节点不生成空页', () => {
    // 类型层：ScrmModuleKey 支持 employee-management/customer-management（编译期可表达）
    const employeeModuleKey: ScrmModuleKey = 'employee-management';
    const customerModuleKey: ScrmModuleKey = 'customer-management';
    expect(employeeModuleKey).toBe('employee-management');
    expect(customerModuleKey).toBe('customer-management');

    // 生产菜单启用三个业务域：潜客管理 + 客户 + 员工
    const enabledModules = new Set(
      SCRM_MENU.filter((node) => node.enabled).map((node) => node.moduleKey),
    );
    expect(enabledModules).toEqual(
      new Set(['prospect-management', 'customer-management', 'employee-management']),
    );

    // 潜客管理/客户/员工一级节点可点击；其余为占位入口（enabled: false，无 pageKey，不生成空页）
    const clickable = SCRM_MENU.filter((node) => node.enabled);
    expect(clickable.map((node) => node.key)).toEqual(['customer', 'prospect', 'employee']);
    for (const node of SCRM_MENU) {
      if (!node.enabled) {
        expect(node.pageKey).toBeUndefined();
      }
    }

    // 员工域：一级节点默认落点为角色列表（0015 Cycle A）
    const employee = SCRM_MENU.find((node) => node.key === 'employee');
    expect(employee?.enabled).toBe(true);
    expect(employee?.defaultPageKey).toBe('employee-role-list');
    expect(employee?.children?.map((child) => child.pageKey)).toEqual([
      'employee-role-list',
      'employee-organization',
    ]);

    const customer = SCRM_MENU.find((node) => node.key === 'customer');
    expect(customer?.enabled).toBe(true);
    expect(customer?.defaultPageKey).toBe('customer-list');
    expect(customer?.children?.map((child) => child.pageKey)).toEqual(['customer-list']);

    // 二级占位子菜单同样不可点击且不注册 pageKey（不生成空页）
    const prospect = SCRM_MENU.find((node) => node.key === 'prospect');
    expect(prospect?.children).toBeDefined();
    const disabledChildren = prospect?.children?.filter((child) => !child.enabled) ?? [];
    expect(disabledChildren.length).toBe(6);
    for (const child of disabledChildren) {
      expect(child.pageKey).toBeUndefined();
    }
  });

  it('页面注册表对六个 canonical pageKey 返回正确页面；未知 key 不静默映射', () => {
    expect(SCRM_PAGE_REGISTRY.map((registration) => registration.pageKey)).toEqual([
      'prospect-store-customer',
      'prospect-arrival-record',
      'prospect-visit-record',
      'employee-role-list',
      'employee-organization',
      'customer-list',
    ]);
    expect(getPageRegistration('prospect-store-customer')).toBeDefined();

    // 注册表按 canonical pageKey 路由到对应 slot（slot 由潜客模块入口接线，
    // 注册表自身不依赖潜客业务组件，不静默交叉路由）
    const arrivalRegistration = getPageRegistration('prospect-arrival-record');
    expect(arrivalRegistration).toBeDefined();
    expect(
      arrivalRegistration!.render({ prospectArrivalRecord: <ArrivalRecordPage /> }),
    ).not.toBeNull();
    // 只提供门店客户 slot 时，到店注册项不静默路由到门店客户内容
    expect(
      arrivalRegistration!.render({ prospectStoreCustomer: <div data-testid="store-only" /> }),
    ).toBeNull();

    const visitRegistration = getPageRegistration('prospect-visit-record');
    expect(visitRegistration).toBeDefined();
    expect(
      visitRegistration!.render({ prospectVisitRecord: <VisitRecordPage /> }),
    ).not.toBeNull();

    // employee-organization 为 0014 生产注册项（员工域自包含页，由产品壳出口渲染）
    expect(getPageRegistration('employee-organization')).toBeDefined();
    expect(getPageRegistration('employee-role-list')).toBeDefined();
    expect(getPageRegistration('customer-list')).toBeDefined();
    // 未知 key 不静默映射到错误页面
    expect(getPageRegistration('unknown-page' as ScrmPageKey)).toBeUndefined();
  });

  it('产品级页面出口：ScrmWorkspace 按 activePage 经 pageRegistry 选择页面内容（选择链在壳内）', () => {
    render(
      <ScrmWorkspace
        initialPage="arrival-record"
        renderContext={{
          prospectStoreCustomer: <div data-testid="store-slot" />,
          prospectArrivalRecord: <div data-testid="arrival-slot" />,
        }}
      />,
    );
    // 旧 key 经导航层归一化后，出口渲染注册表对到店页的输出（而非门店客户 slot）
    expect(screen.getByTestId('arrival-slot')).toBeTruthy();
    expect(screen.queryByTestId('store-slot')).toBeNull();
  });

  it('employee-management 组织架构生产注册页由产品壳直接出口渲染，绕过潜客业务根（不挂载潜客 DOM/Drawer）', () => {
    // 0014 生产注册项：调用链 ScrmWorkspace → employee-organization → OrganizationPage
    render(<ScrmWorkspace initialPage="employee-organization" />);
    // 产品壳经 pageRegistry 出口渲染真实组织架构页（页面选择发生在产品壳，不经过潜客根）
    expect(document.querySelector('[data-req-id="organization-page"]')).toBeTruthy();
    expect(document.querySelector('[data-req-id="employee-table"]')).toBeTruthy();
    // 不进入潜客业务根：不渲染潜客页面标题区 / 门店客户内容 DOM
    expect(document.querySelector('[data-req-id="page-title-area"]')).toBeNull();
    // 不挂载任何 Drawer（潜客业务根未挂载，无 Drawer 编排副作用）
    expect(document.querySelector('.ant-drawer')).toBeNull();
    // 不渲染"查看需求"需求控件（仅在门店客户页显示）
    expect(screen.queryByRole('button', { name: '查看需求' })).toBeNull();
    // 产品壳单一实例：不产生第二套导航/顶部栏
    expect(document.querySelectorAll('[data-req-id="left-navigation"]')).toHaveLength(1);
    expect(document.querySelectorAll('[data-req-id="top-system-bar"]')).toHaveLength(1);
  });

  it('employee-role-list 生产注册页由产品壳直接出口渲染，不经过潜客根或组织架构页', () => {
    render(<ScrmWorkspace initialPage="employee-role-list" />);
    expect(document.querySelector('[data-req-id="role-list-page"]')).toBeTruthy();
    expect(document.querySelector('[data-req-id="organization-page"]')).toBeNull();
    expect(document.querySelector('[data-req-id="page-title-area"]')).toBeNull();
    expect(document.querySelectorAll('[data-req-id="left-navigation"]')).toHaveLength(1);
    expect(screen.queryByRole('button', { name: '查看需求' })).toBeNull();
  });

  it('customer-list 生产注册页由产品壳直接出口渲染，不经过潜客/员工业务根', () => {
    render(<ScrmWorkspace initialPage="customer-list" />);
    expect(document.querySelector('[data-req-id="customer-list-page"]')).toBeTruthy();
    expect(document.querySelector('[data-req-id="page-title-area"]')).toBeNull();
    expect(document.querySelector('[data-req-id="organization-page"]')).toBeNull();
    expect(document.querySelectorAll('[data-req-id="left-navigation"]')).toHaveLength(1);
    expect(screen.queryByRole('button', { name: '查看需求' })).toBeNull();
    expect(screen.getAllByText('客户列表').length).toBeGreaterThan(0);
    expect(document.querySelector('.store-customer-tab-item.active')).toHaveTextContent('客户列表');
    expect(document.querySelector('.store-customer-tab-item.active')).not.toHaveTextContent('门店客户');
  });

  it('潜客管理门店客户页面继续高亮门店客户顶部 Tab', () => {
    render(<ScrmWorkspace initialPage="store-customer" />);
    expect(document.querySelector('.store-customer-tab-item.active')).toHaveTextContent('门店客户');
    expect(document.querySelector('.store-customer-tab-item.active')).not.toHaveTextContent('客户列表');
  });

  it('旧 initialPage key 兼容：旧 key → canonical 归一化，未知 initialPage 不落错误页', () => {
    expect(normalizePageKey('store-customer')).toBe('prospect-store-customer');
    expect(normalizePageKey('arrival-record')).toBe('prospect-arrival-record');
    expect(normalizePageKey('visit-record')).toBe('prospect-visit-record');
    // canonical key 透传；缺省回退默认门店客户
    expect(normalizePageKey('prospect-arrival-record')).toBe('prospect-arrival-record');
    expect(normalizePageKey()).toBe('prospect-store-customer');

    // 旧 initialPage 经产品壳进入对应 canonical 页面
    render(
      <ScrmWorkspace initialPage="arrival-record">
        {({ activePage }) => <div data-testid="active-page">{activePage}</div>}
      </ScrmWorkspace>,
    );
    expect(screen.getByTestId('active-page').textContent).toBe('prospect-arrival-record');

    // 未知 initialPage 不静默落到错误页面，回退默认门店客户
    render(
      <ScrmWorkspace initialPage={'not-a-page' as ScrmPageKey}>
        {({ activePage }) => <div data-testid="active-page-fallback">{activePage}</div>}
      </ScrmWorkspace>,
    );
    expect(screen.getByTestId('active-page-fallback').textContent).toBe(
      'prospect-store-customer',
    );
  });

  it('点击一级菜单"员工"调用现有 navigate(defaultPageKey)：激活员工域并展开角色列表', async () => {
    const user = userEvent.setup();
    render(
      <ScrmWorkspace initialPage="prospect-store-customer">
        {({ activePage }) => <div data-testid="active-page">{activePage}</div>}
      </ScrmWorkspace>,
    );
    // 初始为潜客管理域（门店客户）
    expect(screen.getByTestId('active-page').textContent).toBe('prospect-store-customer');

    // 点击一级"员工"：enabled 且携带 defaultPageKey，调用现有 navigate(defaultPageKey)
    await user.click(screen.getByTitle('员工'));
    // 员工域激活：角色列表子菜单展开且选中（active 类与 activePage 同步）
    expect(screen.getByTestId('active-page').textContent).toBe('employee-role-list');
    const subitem = document.querySelector(
      '.store-customer-nav-subitem[data-prospect-page-key="role-list"]',
    );
    expect(subitem).toBeTruthy();
    expect(subitem!.className).toContain('active');
    // 潜客管理子菜单收拢（当前活动业务域已切换为员工域，不渲染潜客子项）
    expect(
      document.querySelector(
        '.store-customer-nav-subitem[data-prospect-page-key="store-customer"]',
      ),
    ).toBeNull();
  });

  it('潜客管理既有导航兼容导出派生自产品菜单（三个真实页面 key 顺序不变）', () => {
    expect(PROSPECT_NAV_ITEMS.map((item) => item.key)).toEqual([
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
    expect(SWITCHABLE_PROSPECT_PAGES).toEqual([
      'store-customer',
      'arrival-record',
      'visit-record',
    ]);
  });

  it('navigate 只切换到已注册 key：未知 key 保持当前有效页面', async () => {
    const user = userEvent.setup();
    render(
      <ScrmWorkspace initialPage="prospect-store-customer">
        {({ activePage, navigate }) => (
          <div>
            <div data-testid="active-page">{activePage}</div>
            <button
              data-testid="goto-unknown"
              onClick={() => navigate('unknown-page' as ScrmPageKey)}
            >
              unknown
            </button>
            <button
              data-testid="goto-arrival"
              onClick={() => navigate('prospect-arrival-record')}
            >
              arrival
            </button>
          </div>
        )}
      </ScrmWorkspace>,
    );
    expect(screen.getByTestId('active-page').textContent).toBe('prospect-store-customer');
    // 未注册 key 不切页
    await user.click(screen.getByTestId('goto-unknown'));
    expect(screen.getByTestId('active-page').textContent).toBe('prospect-store-customer');
    // 已注册 key 正常切页
    await user.click(screen.getByTestId('goto-arrival'));
    expect(screen.getByTestId('active-page').textContent).toBe('prospect-arrival-record');
  });

  it('产品壳单一实例：页面出口不产生第二套 Sidebar/顶部栏/后台壳', () => {
    render(<StoreCustomerList initialState="normal" />);
    expect(document.querySelectorAll('[data-req-id="store-customer-page-root"]')).toHaveLength(1);
    expect(document.querySelectorAll('[data-req-id="left-navigation"]')).toHaveLength(1);
    expect(document.querySelectorAll('[data-req-id="top-system-bar"]')).toHaveLength(1);
    expect(document.querySelectorAll('.store-customer-nav-header')).toHaveLength(1);
    expect(document.querySelectorAll('.store-customer-content')).toHaveLength(1);
  });
});

describe('0013 Provider 生命周期与注册边界', () => {
  let createSeq = 0;

  /** 模拟 0014 起的不同一级业务域模块根（content 出口组件类型会变化）。 */
  function StoreModuleRoot() {
    const store = useRecordRuntimeStore();
    const createArrival = () => {
      const template = store.getArrivalRecords()[0];
      if (!template) throw new Error('缺少到店记录模板');
      createSeq += 1;
      store.createArrivalRecord({ ...template, key: `probe-arrival-${createSeq}` });
    };
    const createVisit = () => {
      const template = store.getVisitRecords()[0];
      if (!template) throw new Error('缺少拜访记录模板');
      createSeq += 1;
      store.createVisitRecord({ ...template, key: `probe-visit-${createSeq}` });
    };
    // 原位更新首条记录：到店改门店、拜访改下次拜访时间（证明 update 真实写回）
    const updateArrival = () => {
      const record = store.getArrivalRecords()[0];
      if (!record) throw new Error('缺少到店记录模板');
      store.updateArrivalRecord(record.key, { appointmentStore: '示例南山店' });
    };
    const updateVisit = () => {
      const record = store.getVisitRecords()[0];
      if (!record) throw new Error('缺少拜访记录模板');
      store.updateVisitRecord(record.key, { nextVisitTime: '2026-08-17 10:00:00' });
    };
    return (
      <div>
        <div data-testid="module-content" data-module="store" />
        <div data-testid="arrival-count">{store.getArrivalRecords().length}</div>
        <div data-testid="visit-count">{store.getVisitRecords().length}</div>
        <div data-testid="arrival-first-store">
          {store.getArrivalRecords()[0]?.appointmentStore ?? '--'}
        </div>
        <div data-testid="visit-first-next">
          {store.getVisitRecords()[0]?.nextVisitTime ?? '--'}
        </div>
        <button data-testid="create-arrival" onClick={createArrival}>
          create arrival
        </button>
        <button data-testid="create-visit" onClick={createVisit}>
          create visit
        </button>
        <button data-testid="update-arrival" onClick={updateArrival}>
          update arrival
        </button>
        <button data-testid="update-visit" onClick={updateVisit}>
          update visit
        </button>
      </div>
    );
  }

  function ArrivalModuleRoot() {
    const store = useRecordRuntimeStore();
    return (
      <div>
        <div data-testid="module-content" data-module="arrival" />
        <div data-testid="arrival-count">{store.getArrivalRecords().length}</div>
      </div>
    );
  }

  it('Provider 仅挂载一次：跨内容出口组件类型变化后 create/update 运行时记录保留', async () => {
    const user = userEvent.setup();
    render(
      <ScrmWorkspace initialPage="prospect-store-customer">
        {({ activePage, navigate }) => (
          <div>
            <div data-testid="active-page">{activePage}</div>
            <button
              data-testid="goto-arrival"
              onClick={() => navigate('prospect-arrival-record')}
            >
              arrival
            </button>
            <button
              data-testid="goto-store"
              onClick={() => navigate('prospect-store-customer')}
            >
              store
            </button>
            {activePage === 'prospect-store-customer' ? (
              <StoreModuleRoot />
            ) : (
              <ArrivalModuleRoot />
            )}
          </div>
        )}
      </ScrmWorkspace>,
    );

    const baseArrival = Number(screen.getByTestId('arrival-count').textContent);
    const baseVisit = Number(screen.getByTestId('visit-count').textContent);
    // 更新目标值必须与 mock 首条现值不同，保证 update 断言验证真实写回
    const baseArrivalStore = screen.getByTestId('arrival-first-store').textContent;
    const baseVisitNext = screen.getByTestId('visit-first-next').textContent;
    expect(baseArrivalStore).not.toBe('示例南山店');
    expect(baseVisitNext).not.toBe('2026-08-17 10:00:00');

    // 在"门店客户"模块根 create 两条运行时记录
    await user.click(screen.getByTestId('create-arrival'));
    await user.click(screen.getByTestId('create-visit'));
    expect(Number(screen.getByTestId('arrival-count').textContent)).toBe(baseArrival + 1);
    expect(Number(screen.getByTestId('visit-count').textContent)).toBe(baseVisit + 1);

    // 原位 update 两条运行时记录（create 前置后，[0] 为 probe 记录，更新真实写回）
    await user.click(screen.getByTestId('update-arrival'));
    await user.click(screen.getByTestId('update-visit'));
    expect(screen.getByTestId('arrival-first-store').textContent).toBe('示例南山店');
    expect(screen.getByTestId('visit-first-next').textContent).toBe('2026-08-17 10:00:00');

    // 切换内容出口（模拟跨一级业务域：content 组件类型变化），Provider 不重建
    await user.click(screen.getByTestId('goto-arrival'));
    await waitFor(() =>
      expect(screen.getByTestId('module-content').getAttribute('data-module')).toBe('arrival'),
    );
    expect(Number(screen.getByTestId('arrival-count').textContent)).toBe(baseArrival + 1);

    // 切回潜客管理，create + update 的运行时记录仍保留（Provider 未重建）
    await user.click(screen.getByTestId('goto-store'));
    await waitFor(() =>
      expect(screen.getByTestId('module-content').getAttribute('data-module')).toBe('store'),
    );
    expect(Number(screen.getByTestId('arrival-count').textContent)).toBe(baseArrival + 1);
    expect(Number(screen.getByTestId('visit-count').textContent)).toBe(baseVisit + 1);
    expect(screen.getByTestId('arrival-first-store').textContent).toBe('示例南山店');
    expect(screen.getByTestId('visit-first-next').textContent).toBe('2026-08-17 10:00:00');
  });

  it('页面注册项自身不创建 Provider：缺少产品 Provider 时严格 Hook 守卫继续有效', () => {
    // 注册表输出经 slot 接线（到店页内容由潜客模块入口装配 ArrivalRecordPage）；
    // 直接渲染该输出而不包产品 Provider：到店记录页首行调用 useRecordRuntimeStore，
    // 应触发严格守卫而非静默创建自己的状态
    const registration = getPageRegistration('prospect-arrival-record');
    expect(registration).toBeDefined();
    render(
      <GuardErrorBoundary>
        {registration!.render({ prospectArrivalRecord: <ArrivalRecordPage /> })}
      </GuardErrorBoundary>,
    );
    const guard = screen.getByTestId('guard-error');
    expect(guard.textContent).toContain('useRecordRuntimeStore');
    expect(guard.textContent).toContain('RecordRuntimeStoreProvider');
  });

  it('Requirement 控件只在门店客户页面显示：切到到店记录独立页不显示需求控件', async () => {
    const user = userEvent.setup();
    render(<StoreCustomerList initialState="normal" />);
    // 门店客户页显示"查看需求"悬浮入口
    expect(screen.getByRole('button', { name: '查看需求' })).toBeTruthy();

    // 切到到店记录独立页：需求控件隐藏（不泄漏到其他页面）
    await user.click(screen.getByText('到店记录'));
    await waitFor(() => expect(screen.queryByRole('button', { name: '查看需求' })).toBeNull());
    expect(document.querySelector('[data-req-id="requirement-drawer"]')).toBeNull();
  });
});
