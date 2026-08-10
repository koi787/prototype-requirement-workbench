# 0010｜后台原型模块化 Phase 1 基础结构抽取

## 1. 任务元数据

- 任务编号：`0010`
- 任务模式：M3｜基础设施模式
- 功能分支：`feature/admin-prototype-modularization`
- 所属产品：SCRM
- 所属模块：潜客管理与产品内后台通用结构
- 涉及页面：门店客户列表
- Storybook 入口：`SCRM / 潜客管理 / 门店客户`
- 当前阶段：重新实施基线已确认，等待 Claude + DeepSeek V4 基于最新 `main` 开发
- 正式代码基线：`3507db4c490388e8a099ceb9290229abe6c399f5`
- 旧成果参考 stash：`backup: 0010 phase1 before 52-column baseline`（只读参考，禁止 `stash pop` / `stash apply`）

## 2. 需求确认卡

### 2.1 业务目标

把已经验收的门店客户列表转成可复用的后台基础结构，同时保持当前页面业务行为不变、无明显视觉回归。本阶段只做既有结构抽取，不追求架构重写或 UI 重新设计。

### 2.2 修改范围

本阶段严格只允许抽取并接回以下组件：

1. `AdminShell`
2. `FilterBar`、`FilterField`、`FilterActions`
3. `AdminDataTable`
4. `AdminPagination`

允许的配套修改仅包括：

- 在 `src/products/scrm/shared/admin/` 新增六个公共组件、`index.ts`、`README.md` 和基础测试；
- 最小机械修改 `StoreCustomerList.tsx`，把当前已发布结构原样接回上述组件；
- 必要更新 `src/products/scrm/shared/README.md` 的目录说明；
- 必要时只追加与组件接回直接相关的当前页面测试，不删除、不弱化既有测试。

当前 52 列字段、需求数据、需求映射、Story 和业务测试基线已经完成并上线，不再属于 0010 Phase 1 的开发内容。

本任务属于当前页面结构更新，不新增需求批次，不创建平行版本，不删除或覆盖历史需求。

### 2.3 明确不做

- 不做 UI 重设计，不新增当前页面不存在的 UI。
- 不新增 Breadcrumb 或可见 PageHeader。
- 不改变 Sidebar、TopHeader、顶部页签现有视觉。
- 不提前抽取 `AdminActionMenu`、`AdminDrawer`、`AdminStatusTag`、`AdminEmptyState`。
- 不创建 Modal，不新增 Async 能力，不创建 Axure Export Story，不接入 Axure 或 Axhub Runtime。
- 不处理 Drawer、ActionMenu 或其他 Phase 2 范围。
- 不搬迁 CSS，不重命名 `store-customer-*` 类名，不做换肤，不改变当前 DOM 视觉结构。
- 不引入新增付费插件、付费元件库或付费托管服务。
- 不新增状态管理库，不升级依赖，不切换 Node.js。
- 不重构需求查看基础设施、Storybook Channel 或正式需求 Schema。

### 2.4 UI 等级

- UI 验收等级：B 级。
- 目标是保持现有已验收页面的关键布局、密度、尺寸、颜色和控件风格，无明显视觉回归。
- 现有页面是本任务唯一视觉基线；不自行现代化、不使用抽取作为调整视觉的机会。
- 当前 Phase 1 不搬 CSS；继续使用现有 `StoreCustomerList.css` 和 `store-customer-*` 类名保护线上视觉基线。

### 2.5 验收标准摘要

- 4 组基础组件均已独立抽取，门店客户列表通过这些组件恢复原有页面。
- 页面结构、筛选、排序、分页及既有业务行为保持不变，并完整保留第 4 节已经上线的 52 列、锚点与需求映射。
- 前 3 列严格为“姓名 → 手机号 → 客资来源”；第 4～10 列为固定业务重点字段区；“首次分配时间”为第 50 列、“创建时间”为第 51 列；第 52 列为“操作”。
- “标记无效客资”和“无效审批状态”相邻展示但业务语义、数据字段与需求对象相互独立。
- Sidebar、TopHeader、顶部页签、内容布局、筛选网格、表格和分页无明显视觉回归。
- 加载、空数据、固定列、横向滚动和 `0 / 0` 分页语义保持原样。
- 完整验证全部通过，`git diff --check` 通过。
- 完成后停止，不进入 Phase 2，不提交、不 push。

## 3. 组件职责与接口边界

### 3.1 AdminShell

- 只负责渲染后台页面框架和插槽。
- 不内置 SCRM 菜单、顶部页签、系统名称或其他业务文字。
- SCRM 菜单、顶部页签及其配置继续留在产品层。
- 不改变 Sidebar、TopHeader、顶部页签和 Content Layout 的既有 DOM 关系与视觉。
- 不新增 Breadcrumb、PageHeader 或额外包裹层；如果抽取必须明显改变 DOM 或 CSS，应暂停该项并保留当前实现。

### 3.2 FilterBar / FilterField / FilterActions

- 只抽取筛选区域的布局容器与插槽。
- 不接管筛选状态、控件值、字段配置或业务逻辑。
- 不改变筛选数据模型、`pending` / `applied` filters、`applyFilter` 或重置逻辑。
- 保持现有筛选区尺寸、六列网格、间距、标签宽度和响应表现。

### 3.3 AdminDataTable

- 只抽取表格通用外壳和对 Ant Design `Table` 的最薄封装。
- `columns`、数据、业务排序、滚动参数及状态继续由页面传入和管理。
- 不接管 requirement 包装，不移动或改写 `ColumnRequirementAnchorRegistry`。
- 不自行决定或改写业务列；页面传入的列必须符合第 4 节 52 列最新产品基线，并保持既有列宽、固定列和横向滚动规则。
- 接口应保持受控、透明，避免复制 Ant Design 大量 API 或引入隐式默认行为。

### 3.4 AdminPagination

- 使用受控参数，由页面继续管理当前页、每页条数和变更回调。
- 不改变当前分页行为、总数文案和 `0 / 0` 语义。
- 不引入内部分页状态，不改变表格当前页数据计算。

## 4. 门店客户列表字段基线

### 4.1 基线变更结论

- 原 51 列基线自本任务单本次更新起废止，不再作为当前页面或 0010 模块化验收依据。
- 0008 正式需求批次及历史任务中记载的“当时交付 51 列”属于历史事实，本任务不得机械追溯改写。
- 当前页面、`requirements.json`、Story、测试及 Requirement 13 已按 52 列正式发布；0010 重新实施只消费该基线，不再负责创建或调整它。
- 模块化前后，无论接回 Shell、Filter、Table 或 Pagination，都必须保持本节完整顺序，禁止修改字段定义、mock、需求数据和需求映射。

### 4.2 最终 52 列顺序

1. 姓名
2. 手机号
3. 客资来源
4. 最新分配时间
5. 预约到店时间
6. 是否到店
7. 是否成交
8. 新办成交金额
9. 标记无效客资
10. 无效审批状态
11. ID
12. 用户ID
13. 微信号
14. 留资门店
15. 留资商家备注
16. 性别
17. 用户年龄
18. 客资类型
19. 是否已分配
20. 最新跟进人
21. 共享人
22. 到店次数
23. 近7天到店次数
24. 近30天到店次数
25. 拜访次数
26. 近7天拜访次数
27. 近30天拜访次数
28. 转化时长（天）
29. 成交周期（天）
30. 最新编辑人
31. 备注
32. 邀请员工编号
33. 邀请员工姓名
34. 地推问卷
35. 答案
36. 地推问卷提交时间
37. 预约门店
38. 是否赠送体验课
39. 体验课获取时间
40. 合同编号
41. 是否已预约
42. 体验课状态
43. 体验课下课时间
44. 用户标签
45. 体验课支付金额
46. 体验课顾问
47. 是否已注册
48. 重复留资次数
49. 最新留资时间
50. 首次分配时间
51. 创建时间
52. 操作

硬性位置规则：

- 前 3 列固定为“姓名 → 手机号 → 客资来源”。
- 第 4～10 列为业务重点字段区，顺序不得变更。
- “标记无效客资”与“无效审批状态”必须相邻且为两个独立字段。
- “首次分配时间”位于尾部倒数区域，明确为第 50 列（紧邻“创建时间”之前）；“创建时间”为第 51 列；“操作”固定为第 52 列。
- “姓名”继续左固定，“操作”继续右固定；现有列宽规则与横向滚动能力不得因重排或抽取而失效。

### 4.3 “标记无效客资”字段语义与数据规则

- 定义：表示当前客户是否已经被正式标记为无效客资。
- 展示值仅为“是”或“否”。
- “标记无效客资”表示最终业务结果；“无效审批状态”表示审批流程状态，二者必须严格区分。
- 当前 main 已通过 `invalidCustomerFlag.ts` 从审批状态实时派生展示：`approved → 是`；`null` / `pending` / `rejected → 否`。
- 当前实现没有第二套 Mock 审批状态，也没有把 `invalidApprovalStatus` 直接作为新列的 `dataIndex`。
- 以上规则已经上线并冻结；Phase 1 重新实施不得修改 `invalidCustomerFlag.ts`、`mockData.ts`、`useApprovalState` 或该列业务语义。

### 4.4 Requirement 与稳定 ID 规则

当前 main 已正式发布独立的“标记无效客资”需求对象和稳定锚点：

- requirement key：`scrm-store-customer-invalid-customer-flag`
- requirementNo：`SC-08-10`
- displayNumber：`13`
- targetId / `data-req-id`：`invalid-customer-flag-column`
- `requirementName`：`标记无效客资`
- `definition`：表示当前客户是否已经被正式标记为无效客资。
- `dataSource`：当前纯前端原型阶段说明由无效审批结果派生；不得把审批流程字段描述成最终结果字段。
- `rule`：`approved` 展示“是”；`null`、`pending`、`rejected` 展示“否”；与“无效审批状态”相邻但独立。

以上需求数据、需求 key 校验、列级稳定锚点和需求点映射均已进入 main；Phase 1 重新实施只能透传和保护，不得再次创建、重排或修改，也不得改写 0008 历史批次。

### 4.5 Requirement 编号正式结论

- `displayNumber` 属于页面需求点编号，不等于字段序号，也不与列顺序绑定。
- “标记无效客资”已正式确认为 `displayNumber: 13`、`requirementNo: SC-08-10`，不再属于待确认项。
- `scrm-store-customer-invalid-customer-flag`、`SC-08-10`、编号 13 和 `invalid-customer-flag-column` 必须整体保持不变。
- 既有编号 1～12、抽屉字段共享编号 9/10 以及 `RequirementModeControl` 固定编号 12 均保持不变。

## 5. 绝对保护项

开发过程中严禁修改下列内容及语义：

- 第 4 节规定的 52 列定义、字段顺序和现有列宽规则；其中第 50 列必须为首次分配时间、第 51 列为创建时间、第 52 列为操作；
- 筛选数据模型及 `applyFilter`、`pending` / `applied` filters 逻辑；
- 排序规则；
- 所有已有 requirement key、`requirementNo`、`displayNumber`、`targetId`；Requirement 13 与 `SC-08-10` 尤其不得改变；
- `ColumnRequirementAnchorRegistry`；
- 行级锚点规则；
- 既有无效审批状态机及申请、审核、退回和重提规则；
- 新办成交金额的字段名、格式、空值、`0.00` 与不可排序规则；
- Drawer、ActionMenu 及 Phase 2 业务。

如任一组件抽取必须明显改变现有 DOM、CSS 或业务接口，应停止该项抽取并报告，不得为组件化强行重构。

## 6. 建议文件边界

Phase 1 重新实施只允许新增：

- `src/products/scrm/shared/admin/AdminShell.tsx`
- `src/products/scrm/shared/admin/FilterBar.tsx`
- `src/products/scrm/shared/admin/FilterField.tsx`
- `src/products/scrm/shared/admin/FilterActions.tsx`
- `src/products/scrm/shared/admin/AdminDataTable.tsx`
- `src/products/scrm/shared/admin/AdminPagination.tsx`
- `src/products/scrm/shared/admin/index.ts`
- `src/products/scrm/shared/admin/README.md`
- `src/products/scrm/shared/admin/__tests__/admin-foundations.test.tsx`

只允许修改：

- `src/products/scrm/modules/prospect-management/pages/StoreCustomerList/StoreCustomerList.tsx`：最小机械接回；
- `src/products/scrm/shared/README.md`：必要目录说明；
- `src/products/scrm/modules/prospect-management/pages/StoreCustomerList/__tests__/StoreCustomerList.test.tsx`：仅在确有需要时追加接回断言，不得改写业务基线。

冻结且禁止修改：

- `columns.tsx`
- `mockData.ts`
- `requirementPoints.ts`
- `invalidCustomerFlag.ts`
- 当前页面 `requirements.json`
- `requirement-view` Schema 及其 key 校验
- 当前 `StoreCustomerList.stories.tsx`
- `StoreCustomerList.css`
- 0008 历史正式需求批次
- `useApprovalState`、审批 Drawer、ActionMenu、StatusTags 及无效审批状态机
- 新办成交金额相关实现和测试

### 6.1 CSS 与 DOM 策略

- 当前 Phase 1 不搬 CSS，不新增另一套样式文件。
- 不重命名 `store-customer-*` 类名，不做换肤或视觉现代化。
- 公共组件在本阶段继续使用现有类名，以确保接回前后 CSS 命中与视觉结构一致。
- 不改变已验收 DOM 视觉层级；如果抽取必须增加影响布局的包裹层，应暂停该项而不是强行组件化。

### 6.2 旧 stash 使用策略

- `backup: 0010 phase1 before 52-column baseline` 只允许作为只读参考代码来源。
- 允许参考其中的六个公共组件、基础组件测试、README 和旧接回 diff。
- 禁止执行 `stash pop`、`stash apply`，禁止直接恢复整个 stash。
- 禁止直接恢复旧 `StoreCustomerList.tsx`；必须基于正式代码基线 `3507db4c490388e8a099ceb9290229abe6c399f5` 重新实施最小接回。
- stash 中任何内容进入新分支前，都必须重新对照当前 52 列、Requirement 13、审批流程和现有测试审查。

## 7. 实施顺序与门禁

采用小步修改，每个闭环先检查 diff，再执行与改动直接相关的最小验证：

1. 从最新 `main` 的正式基线 `3507db4c490388e8a099ceb9290229abe6c399f5` 创建独立功能分支；不得通过恢复 stash 建立工作区。
2. 参考旧 stash 重新实施 `AdminShell`。
3. 让 `StoreCustomerList` 最小机械接回 `AdminShell`，检查 DOM 与视觉后执行 typecheck 和相关测试。
4. 参考旧 stash 重新实施 `FilterBar`、`FilterField`、`FilterActions` 并逐项接回，检查 label、Requirement Marker、日期范围、筛选网格和行为。
5. 参考旧 stash 重新实施 `AdminDataTable` 并接回四种表格状态，确认 columns、排序、Requirement 包装和列级锚点仍由当前页面管理。
6. 检查 52 列完整顺序、固定列、横向滚动、加载/空数据和 Requirement 13。
7. 参考旧 stash 重新实施 `AdminPagination`，检查受控回调、页容量切换和 `0 / 0` 语义。
8. 执行完整回归并停止，不进入 Phase 2。

## 8. 自动验证

开发小闭环执行相关最小测试。Phase 1 完成后必须执行：

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm build-storybook
git diff --check
```

不得以任务为结构抽取为由跳过完整验证。测试必须验证真实用户可观察结果，不得通过弱化断言或删除原测试制造通过。

## 9. 人工验收清单

在 Storybook 真实页面中逐项检查：

- Sidebar；
- TopHeader；
- 顶部页签；
- Content Layout；
- 筛选区尺寸和网格；
- 52 列及第 4.2 节完整顺序；
- “标记无效客资”与“无效审批状态”的相邻位置、独立展示及状态联动；
- 行高；
- 固定列；
- 横向滚动；
- 排序；
- 分页；
- 加载与空数据表现；
- requirement 映射。

人工验收应至少覆盖现有 PC 视口和移动视口。发现明显视觉或行为变化时，优先恢复原结构，不为抽象完整性扩大修改。

## 10. 交付报告

完成后停止，不提交、不 push、不进入 Phase 2，并报告：

1. 实际抽取组件；
2. 新增文件；
3. 修改文件；
4. 是否与原审计方案存在偏差；
5. 每项自动与人工验证结果；
6. `git diff --stat` 与关键 diff 概要；
7. `git status --short`；
8. 是否存在视觉回归风险；
9. 是否存在过度组件化风险；
10. Phase 2 前建议。

## 11. 长期硬约束

任何原型生产能力不得依赖新增付费插件、付费元件库或付费托管服务。免费、开源工具可以使用；发现某项能力需要付费时，优先使用现有 React、Storybook、Axure 或自建能力替代。

## 12. 任务完成通知

本任务完成后，必须按照项目根目录 `AGENTS.md` 的“任务完成通知”规则执行：

- Codex 使用用户级 `notify` Hook 自动通知，不手动执行通知命令；
- Claude Code 使用手动通知，并将通知作为最后一个工具操作；
- 其他代理优先使用自身运行时 Hook，没有 Hook 时才手动通知；
- 不得同时使用两种机制，不得重复通知；
- 通知失败不得影响任务结论。
