# 0013｜SCRM 多业务域导航与页面注册骨架

## 0. 需求确认卡

- **任务模式**：M3-S｜轻量通用修复。
- **业务目标**：在不扰动 0011 / 0012 稳定业务的前提下，为 SCRM 增加可承载多个一级业务域的产品级导航配置与页面注册边界，使 0014 可以按“员工 → 组织架构”自然接入。
- **修改范围**：产品级 SCRM 工作区边界、集中菜单配置、集中页面注册、现有三个潜客管理页面的兼容接线、必要测试与说明。
- **明确不做**：不开发组织架构或其他新业务页面；不创建批量占位页面；不引入 Router、状态库、新依赖或 0010 Phase 2 公共组件。
- **业务规则**：现有页面、Story 路径、旧 pageKey、运行时数据共享、52 / 32 / 19 列及所有 0011 / 0012 行为保持不变。
- **UI 等级**：A｜业务结构一致；现有 0011 / 0012 已验收区域按零明显视觉回归保护，不进行 UI 重设计。
- **验收标准**：菜单定义与页面注册不再散落在门店客户页；产品壳可表达多个一级业务域；0014 新增组织架构时不需要进入潜客管理业务组件修改；全部既有回归与构建通过。

## 1. 背景

稳定实施基线为：

```text
main
fad4e209d4b378cf32f9c51e3011baf6feeb0b0c
```

0012 已正式发布，当前可用业务结构为：

```text
SCRM
└─ 潜客管理
   ├─ 门店客户
   ├─ 到店记录
   └─ 拜访记录
```

下一张业务任务预计为 0014“员工 / 组织架构”。真实产品中“组织架构”归属“员工”，不是“系统管理”。0013 只为跨业务域导航与页面注册建立最小骨架，不继续开发 0012，也不提前实现 0014 页面。

## 2. 当前问题

当前代码能在“潜客管理”内部切换三个页面，但还不是产品级多业务域结构：

1. SCRM 左侧一级菜单、顶部系统栏、顶部页签均定义在 `StoreCustomerList.tsx`。
2. `StoreCustomerList.tsx` 同时承担门店客户业务、产品壳、菜单状态、页面切换、运行时 Provider 与多类 Drawer 编排，职责越过单页边界。
3. 当前只有 `prospectManagementPages.ts`，它集中管理潜客管理子菜单和三个可切换 key；没有跨业务域 `menuConfig`。
4. 内容区使用 `activePage === ...` 条件链选择页面；不存在集中 `pageRegistry`。
5. 0012 的 `RecordRuntimeStoreProvider` 挂在 `StoreCustomerList` 外层。若未来用新的产品壳切换一级业务域并卸载该组件，运行时新增/编辑状态会随 Provider 重建而丢失。
6. 所有 SCRM 业务 Story 都直接渲染 `StoreCustomerList`。它事实上是当前产品工作区入口，但名称和目录仍表达“门店客户单页”。

因此需要一个小型产品级边界；不需要大规模目录迁移或重新设计通用 UI。

## 3. 当前真实架构调查结果

### 3.1 壳与页面职责

| 能力 | 当前负责文件 | 调查结论 |
|---|---|---|
| 通用后台 DOM 框架 | `src/products/scrm/shared/admin/AdminShell.tsx` | 仅渲染 Sidebar / TopBar / Tabs / Content 插槽，不含业务菜单；仍沿用 `store-customer-*` 类名。 |
| SCRM 产品壳内容 | `StoreCustomerList.tsx` | 定义系统品牌、左侧导航、顶部栏、顶部页签，并向 `AdminShell` 传槽位。 |
| 一级菜单 | `StoreCustomerList.tsx` 的 `navItems` | 首页、预约、品项、收银、门店人员、订单、记录、门店、客户、潜客管理均写在页面文件内。 |
| 潜客管理子菜单 | `navigation/prospectManagementPages.ts` | 9 项集中定义，其中门店客户、到店记录、拜访记录可切换，其余为不可切换占位入口。 |
| 页面切换状态 | `StoreCustomerListInner` | 本地 `activePage` state，默认 `store-customer`。 |
| 页面选择 | `StoreCustomerListInner` 的 `AdminShell.content` | 三段条件渲染：门店客户内联内容 / `ArrivalRecordPage` / `VisitRecordPage`。 |
| 需求查看 Provider | `StoreCustomerList` | 包裹当前整个工作区，但控件和抽屉仅在门店客户激活时展示。 |
| 0012 Runtime Provider | `StoreCustomerList` | 包裹 `StoreCustomerListInner`，三个消费者共享一个实例。 |
| Drawer 行为编排 | `StoreCustomerListInner` | 审批、跟进详情、到店/拜访新增编辑、到店变更记录均在同一组件编排。 |
| Storybook 全局入口 | `.storybook/preview.tsx` | 只提供 Ant Design Locale 与真实产品菜单排序，不提供产品级 SCRM decorator。 |
| SCRM Story 入口 | `src/stories/*.stories.tsx` | 当前 SCRM Story 均直接渲染 `StoreCustomerList`，通过 `initialPage` / Drawer 初始参数稳定复现状态。 |

### 3.2 当前目录边界

```text
src/products/scrm/
├─ modules/
│  └─ prospect-management/
│     ├─ navigation/prospectManagementPages.ts
│     ├─ pages/StoreCustomerList/
│     ├─ arrival-record/
│     ├─ visit-record/
│     └─ record-shared/
├─ pages/README.md
├─ shared/admin/
└─ product.ts
```

`modules/prospect-management/` 已形成稳定业务域：到店、拜访、门店客户和运行时记录能力均在域内共享。后续适合并列增加 `modules/employee-management/organization/`，不应为了目录外观迁移现有 0011 / 0012 文件。

### 3.3 与真实后台菜单基线的差异

当前代码并未完整表达已确认的真实后台结构：缺少“员工、联营、财务、加盟、加盟商、设置、日志监控、营销”等一级域；“订单”没有合同中心/订单中心子级；“员工 → 组织架构”也尚不存在。此外，当前潜客管理子项顺序是“门店客户、到店记录、拜访记录、员工座席……”；真实后台确认顺序是“门店客户、员工座席、客户公海、无效公海、我负责的、到店记录、通话记录、标签分组、拜访记录”。

0013 的职责是让这些结构有单一、可扩展的配置位置，不借基础设施任务一次性开发所有菜单页面。对现有潜客管理可见顺序是否同步真实后台，实施前必须作为产品级菜单验收项明确；不得在机械抽取时无意重排。无论最终是否在 0013 同步顺序，三个已实现页面的 key、可进入性和业务内容均不得改变。

## 4. 当前组件与页面切换调用链

```text
Story（所有 SCRM 业务 Story）
└─ StoreCustomerList
   └─ RequirementViewProvider
      └─ RecordRuntimeStoreProvider（单实例）
         └─ StoreCustomerListInner
            └─ RecordEditActionsContext.Provider
               ├─ Requirement 控件/Drawer（仅门店客户激活时）
               ├─ 0011 / 0012 / 审批业务 Drawers
               └─ AdminShell
                  ├─ sidebar：StoreCustomerList.renderNav()
                  │  └─ navItems + PROSPECT_NAV_ITEMS
                  ├─ topBar：StoreCustomerList.renderTopBar()
                  ├─ tabs：StoreCustomerList.renderTabs()
                  └─ content：activePage 条件链
                     ├─ store-customer → 门店客户筛选/52列表格/分页
                     ├─ arrival-record → ArrivalRecordPage（32列）
                     └─ visit-record → VisitRecordPage（19列）
```

当前点击菜单不发生路由跳转；可切换子项通过 `setActivePage` 更新本地 state。`SWITCHABLE_PROSPECT_PAGES` 决定哪些菜单项有点击行为。

## 5. 当前 Provider 挂载关系与生命周期边界

当前 `RecordRuntimeStoreProvider` 位于 `StoreCustomerList` 内、三个潜客页面之外，因此在现有三个页面之间切换不会重建，0012 的 create / update 数据可共享并保留。

0013 必须把“同一 SCRM 工作区会话中的 Provider 单实例”写成硬约束：

- Provider 挂载点必须位于产品级活动页面出口之上。
- 切换 `潜客管理 → 员工 → 潜客管理` 时，不得因页面出口变化重新创建 Provider。
- 独立到店页、独立拜访页、门店客户跟进详情必须继续消费同一实例。
- 页面注册项不得自行包裹 `RecordRuntimeStoreProvider`。
- Story 不得分别创建互不共享的产品运行时 Provider。
- 刷新 Story 后恢复初始 Mock 仍是既有规则；0013 不引入持久化。

产品内一级业务域切换后再返回潜客管理时，当前会话中的 0012 运行时新增/编辑结果应继续存在。这是产品级工作区状态，而不是某个页面的临时局部状态。

## 6. 目标业务模块结构

采用增量结构，不搬迁稳定目录：

```text
src/products/scrm/
├─ navigation/
│  ├─ scrmMenuConfig.ts
│  ├─ scrmPageRegistry.tsx
│  └─ scrmNavigationTypes.ts       # 仅类型复杂度确有需要时创建
├─ shell/
│  └─ ScrmWorkspace.tsx            # 产品级组合根；保持既有 DOM/CSS
├─ modules/
│  ├─ prospect-management/         # 保持原位
│  │  ├─ navigation/prospectManagementPages.ts
│  │  ├─ pages/StoreCustomerList/
│  │  ├─ arrival-record/
│  │  ├─ visit-record/
│  │  └─ record-shared/
│  └─ employee-management/         # 0014 按需新增
│     └─ organization/             # 0014 按需新增
└─ shared/admin/                    # 保持 API 与实现不变
```

`shell/` 有实际必要：当前缺少产品级共同祖先，而 0012 Provider 生命周期和后续跨一级域页面出口都需要稳定组合根。该目录只放产品工作区编排，不复制 `AdminShell`，不成为第二套 UI 框架。

## 7. `menuConfig` 设计

在产品层建立单一菜单配置，最小字段为：

```ts
type ScrmMenuNode = {
  key: string;              // 菜单节点稳定 key
  label: string;
  moduleKey: ScrmModuleKey;
  pageKey?: ScrmPageKey;    // 有真实页面时填写
  enabled: boolean;         // 是否可点击；不以是否有 onClick 推断
  defaultPageKey?: ScrmPageKey;
  children?: ScrmMenuNode[];
};
```

规则：

1. 菜单配置位于 `src/products/scrm/navigation/`，业务页面不得各自维护产品菜单副本。
2. 0013 迁入当前实际展示结构，并至少登记第二个一级业务域 `employee-management`，从代码结构上验证不再以潜客管理作为唯一入口；不为了截图完整度创建几十个页面。
3. 当前三个真实页面可点击；未注册页面保持禁用，不渲染 `ComingSoonPage`。
4. 0013 可登记禁用态的“员工 → 组织架构”菜单元数据，用于验证层级和 0014 接入位置，但不得注册页面、创建占位内容或让它表现为已交付入口；0014 实现真实页面后再启用并注册 `employee-organization`。
5. icon 继续复用当前图标能力；0013 不设计图标注册系统。
6. 当前已实现菜单文案保持不变。潜客管理子项顺序必须按 3.3 的产品验收决定显式处理，禁止因数组迁移而偶然改变；其他真实一级菜单按后续业务任务逐步补齐。

## 8. `pageRegistry` 设计

产品层建立单一页面注册表，负责 `pageKey → PageComponent/render`，页面切换不再写成业务页面中的条件链。

推荐接口：

```ts
type ScrmPageRegistration = {
  pageKey: ScrmPageKey;
  moduleKey: ScrmModuleKey;
  render: (context: ScrmPageRenderContext) => ReactNode;
};
```

注册表只负责选择业务内容，不负责：

- 创建 Provider；
- 管理 Drawer 状态；
- 注入权限；
- 创建路由；
- 自动生成菜单；
- 生成空页面。

0013 首批注册：

```text
prospect-store-customer → 现有门店客户页面内容
prospect-arrival-record → ArrivalRecordPage
prospect-visit-record   → VisitRecordPage
```

`ScrmWorkspace` 在 Provider 内读取当前 pageKey，从注册表取得内容并交给既有 `AdminShell.content`。未知或禁用 key 不切页，保持当前有效页面，不猜测 fallback 业务页面。

若为注册门店客户内容而必须拆出页面内容组件，只允许在原目录内做机械拆分；筛选、表格、审批、Requirement 与 Drawer 逻辑不得重写。

## 9. pageKey 兼容策略

现有稳定 key：

```text
store-customer
arrival-record
visit-record
```

它们已被 Story args、测试、`data-prospect-page-key` 和开发入口使用，0013 不得直接删除或改义。

产品级 canonical key 推荐增加业务域前缀：

```text
prospect-store-customer
prospect-arrival-record
prospect-visit-record
employee-organization  # 0014
```

兼容规则：

1. `initialPage` 继续接受三个旧 key，并在产品入口一次性归一化为 canonical key。
2. 现有 `data-prospect-page-key` 值保持，避免破坏 0012 DOM 契约；如需要产品级锚点，可并行增加 `data-scrm-page-key`，不得覆盖旧属性。
3. 旧 key 与 canonical key 的映射只放在导航层，不散落到各业务页面。
4. Story `meta.title` 与 export 名保持不变，从而保持现有 Story URL/导航归档稳定。
5. 0014 直接使用 canonical `employee-organization`，不再引入无域前缀的新 key。

## 10. Storybook 归档策略

继续遵守：`产品 → 真实业务菜单 → 能力类型 → 具体状态`。

0013 不创建“架构测试”“页面注册”“Cycle”类 Story，也不创建大量空业务 Story。现有路径保持：

```text
SCRM/潜客管理/门店客户/...
SCRM/潜客管理/到店记录/...
SCRM/潜客管理/拜访记录/...
```

0014 实现真实页面后新增：

```text
SCRM/员工/组织架构/列表/...
```

现有 Story 可继续通过兼容入口渲染完整 SCRM 工作区；若实现时把产品入口正式命名为 `ScrmWorkspace`，允许只更换 Story import/component 配置，但不得改变 `meta.title`、业务组件或既有状态语义。0013 基础设施本身以测试验收，不需要独立 Story。

## 11. 与 0012 的兼容方案

0012 是冻结基线，0013 仅移动“谁负责选择页面”，不得改动业务能力：

- 潜客管理三个页面入口、顺序和选中态保持。
- 门店客户 52 列、到店记录 32 列、拜访记录 19 列保持。
- 跟进详情五 Tab、旅程、分页及所有已验收视觉保持。
- 到店/拜访新增、编辑、到店变更记录 Drawer 保持。
- `RecordEditActionsContext` 的能力与调用点保持。
- `RecordRuntimeStoreProvider` 仍为单实例，且生命周期提升到产品工作区而非页面注册项。
- `ArrivalRecordDrawer`、`VisitRecordDrawer`、`ArrivalChangeRecordDrawer` 不迁移、不重构。
- Requirement 模式仍只在门店客户页面展示；切到其他模块不得误显示或触发需求交互。
- `src/products/scrm/shared/admin/` API 与实现不变。

## 12. 为 0014“员工 / 组织架构”预留方式

0013 完成后，0014 应只需要：

1. 新增 `src/products/scrm/modules/employee-management/organization/` 及真实页面文件。
2. 在产品菜单配置增加/启用“员工 → 组织架构”。
3. 在页面注册表注册 `employee-organization`。
4. 按真实产品归档新增 Story 与业务测试。

0014 不应修改 `prospect-management` 内部业务组件，也不应复制 SCRM 壳。0013 不提前创建空目录或空 `OrganizationPage`，由 0014 在真实业务实现时创建。

## 13. 明确不做

本轮不开发：

- 组织架构、角色列表、员工消息记录、存量分、对账单、确认对账单；
- 订单、财务、设置、联营、加盟、加盟商、日志监控、营销等业务页面；
- 批量 `ComingSoonPage`；
- 后端菜单、权限、动态路由、URL 路由、深链恢复；
- React Router、Redux、Zustand、新依赖、付费插件或托管服务；
- `AdminDrawer`、`AdminActionMenu`、`AdminStatusTag`、`AdminEmptyState`；
- 0010 Phase 2；
- 32 / 19 / 52 列、三个记录 Drawer、跟进详情或审批流程重构；
- CSS 搬迁、类名重命名、换肤或 DOM 视觉结构调整。

### 为什么 0013 不启动 0010 Phase 2

0013 的重复点是产品导航与页面选择职责，不是 Drawer、状态标签、空态或操作菜单 UI。现有 `shared/admin` 已足够承载壳与表格；在没有新的真实重复证据前扩展公共组件会扩大回归面，并把产品级架构任务变成 UI 平台重构。因此公共组件保持冻结。

## 14. 文件修改计划

### 建议新增

- `src/products/scrm/navigation/scrmMenuConfig.ts`
- `src/products/scrm/navigation/scrmPageRegistry.tsx`
- `src/products/scrm/shell/ScrmWorkspace.tsx`
- `src/products/scrm/navigation/__tests__/scrmNavigation.test.tsx`（或同等产品入口测试）

仅当类型不能清晰内聚时新增：

- `src/products/scrm/navigation/scrmNavigationTypes.ts`

### 建议修改

- `src/products/scrm/modules/prospect-management/pages/StoreCustomerList/StoreCustomerList.tsx`：移除产品级菜单散落定义和页面条件链，保留兼容 façade 与最小机械接线。
- `src/products/scrm/modules/prospect-management/navigation/prospectManagementPages.ts`：改为从产品菜单配置派生或保留兼容导出，避免第二份真值。
- 相关导航/Provider 回归测试：只调整入口并增加跨模块骨架守卫，不弱化既有断言。
- `src/products/scrm/pages/README.md` 或 `src/products/scrm/modules/README.md`：说明产品入口与业务域注册边界；仅在实现确需时更新。
- `CHANGELOG.md`：实现完成并验收时记录，任务单阶段不修改。

### 原则上不修改

- 所有既有 Story 文件及 `.storybook/preview.tsx`；若仅为入口改名而必须调整 import，可纳入实现 diff，但 `meta.title` 和状态不变。
- `StoreCustomerList.css` 与 `shared/admin/`。
- 0011 / 0012 的 columns、Mock、Drawer、Provider 内部数据逻辑。
- requirements、Schema、历史需求批次、`package.json`、`pnpm-lock.yaml`。

## 15. 测试计划

新增或补强以下真实行为测试：

1. 菜单配置可表达至少 `prospect-management` 与 `employee-management` 两个模块边界，但未注册节点不可点击且不生成空页。
2. 页面注册表对三个现有 canonical pageKey 返回正确页面；未知 key 不静默映射到错误页面。
3. 三个旧 `initialPage` key 继续可用，现有 `data-prospect-page-key` 不变。
4. 门店客户 → 到店记录 → 拜访记录切换、选中态与真实 DOM 内容继续同步。
5. 页面出口不产生第二套 Sidebar、顶部栏或业务表格 DOM。
6. Provider 仅挂载一次；在模拟跨一级业务域切换后返回潜客管理，create / update 的运行时记录仍存在。
7. 页面注册项自身不创建 Provider；缺少产品 Provider 的严格 Hook 守卫继续有效。
8. Requirement 模式下点击已有需求点不误触业务导航；非门店客户页面不显示需求控件。
9. 现有 52 / 32 / 19 列定义与真实 DOM 顺序测试保持，不以只测 registry 替代页面测试。
10. 到店/拜访新增、编辑、变更记录，跟进详情及审批回归保持。
11. Story 索引/构建仍包含原有真实产品路径；不新增开发视角分组。

完整门禁：

```text
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm build-storybook
git diff --check
```

## 16. 风险与回滚方案

| 风险 | 约束与验证 |
|---|---|
| 菜单抽取改变 StoreCustomerList DOM/CSS | 原样迁移渲染结构、className、顺序与点击语义；不搬 CSS。 |
| pageKey 改名破坏 Story/测试/入口 | 旧 key 保留为兼容输入和 DOM 属性；统一归一化，不散落映射。 |
| Provider 随一级菜单切换重挂载 | Provider 固定在 `ScrmWorkspace` 活动页面出口上方；测试运行时数据跨模块切换保持。 |
| registry 造成 Drawer/Context 断链 | Drawer 与 `RecordEditActionsContext` 仍由同一个产品组合根编排；页面注册只选择内容。 |
| Story URL 变化 | 不改 `meta.title` 和 export；必要的 component import 调整不改变 Story ID。 |
| Requirement 模式泄漏 | 门店客户激活判断保留，并验证切页后控件/抽屉行为。 |
| 多份菜单真值 | 产品 `menuConfig` 为唯一真值；原 prospect 文件仅兼容导出或删除，不复制数组。 |
| 产品壳过度抽象 | `ScrmWorkspace` 只编排现有 UI、Provider 和页面出口，不设计权限、路由或插件系统。 |
| Vercel 已发布页面回归 | build-storybook 后逐项打开原 Story 路径；对比关键菜单、页面、Drawer。 |

回滚必须可逆：0013 形成一个独立小闭环提交；若出现阻塞，可整体回滚该提交，恢复 `StoreCustomerList` 原条件分支，不触碰 0011 / 0012 数据文件。禁止用大规模文件移动使回滚依赖手工业务冲突处理。

## 17. 验收标准

1. SCRM 产品结构可表达多个一级业务模块。
2. 当前潜客管理三个页面继续可进入，菜单顺序与选中态正确。
3. 产品菜单定义不再散落于 `StoreCustomerList.tsx`。
4. 页面选择由集中 registry 完成，不再由门店客户页维护三段条件链。
5. 新增 `employee-management` 业务页面不要求修改潜客管理内部业务组件。
6. 0014 增加组织架构只需新增模块、登记菜单、注册页面与新增相应 Story/测试。
7. 不引入 Router、状态库或新依赖。
8. 0012 runtime Provider 在产品会话中保持单实例，跨一级菜单往返不丢失 create / update 数据。
9. 门店客户 52 列、到店 32 列、拜访 19 列及真实 DOM 顺序不变。
10. 跟进详情、审批、Requirement、新增/编辑/变更记录全部回归通过。
11. Storybook 现有业务路径与 URL 兼容；无开发视角 Story 分组。
12. `shared/admin` 不变，不启动 0010 Phase 2。
13. 页面结构与视觉无明显回归，完整六项门禁通过。

## 18. 推荐任务模式

推荐 **M3-S｜轻量通用修复**。

理由：改动属于跨页面产品级导航和注册边界，具有通用影响，不能按单页 M2 处理；但目标、文件范围、兼容规则和消费者均已明确，不涉及 Schema、路由系统、公共 UI 重构或大规模业务迁移。采用 M3 会诱发不必要的基础设施扩张，不符合“最小改造、向前兼容、不扰动 0012”。

## 19. 推荐实施 Cycle

只做 **一个小型基础设施闭环**：

1. 先建立产品级 menuConfig、pageRegistry 与兼容 key 归一化，并用纯配置测试固定契约。
2. 再建立 `ScrmWorkspace`，原样迁移现有壳渲染和 Provider 挂载；保留 `StoreCustomerList` 兼容入口。
3. 接入三个既有页面，逐项验证菜单切换、Provider 生命周期、Requirement 隔离与 52 / 32 / 19 列。
4. 执行完整门禁与现有 Story 路径人工回归后停止。

不拆成“先造完整平台、再迁业务”的多个 Cycle；0014 在本闭环验收发布后另开业务任务。
