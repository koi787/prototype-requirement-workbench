# 0010｜后台原型模块化 Phase 1 基础结构抽取

## 1. 任务元数据

- 任务编号：`0010`
- 任务模式：M3｜基础设施模式
- 功能分支：`feature/admin-prototype-modularization`
- 所属产品：SCRM
- 所属模块：潜客管理与产品内后台通用结构
- 涉及页面：门店客户列表
- Storybook 入口：`SCRM / 潜客管理 / 门店客户`
- 当前阶段：任务单已确认，等待 Claude + DeepSeek V4 开发
- 基线提交：`bbfc66f`

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

- 为上述组件新增产品内或仓库既有边界认可的共享文件；
- 修改 `StoreCustomerList`，把现有结构原样接回新组件；
- 原样迁移抽取所必需的 CSS，尽量保留现有选择器、DOM 层级和 `className`；
- 新增或调整与结构抽取直接相关的测试；
- 必要的 barrel export 或模块说明更新。
- 按第 4 节的最新产品字段基线，将当前页面、当前需求说明、当前 Story 和当前测试同步到 52 列；该字段基线更新必须与结构抽取分成可检查的小闭环，不得夹带其他业务调整。

本任务属于当前页面结构更新，不新增需求批次，不创建平行版本，不删除或覆盖历史需求。

### 2.3 明确不做

- 不做 UI 重设计，不新增当前页面不存在的 UI。
- 不新增 Breadcrumb 或可见 PageHeader。
- 不改变 Sidebar、TopHeader、顶部页签现有视觉。
- 不提前抽取 `AdminActionMenu`、`AdminDrawer`、`AdminStatusTag`、`AdminEmptyState`。
- 不创建 Modal、Axure Export Story，不接入 Axhub Runtime。
- 不处理 Drawer、ActionMenu 或其他 Phase 2 范围。
- 不引入新增付费插件、付费元件库或付费托管服务。
- 不新增状态管理库，不升级依赖，不切换 Node.js。
- 不重构需求查看基础设施、Storybook Channel 或正式需求 Schema。

### 2.4 UI 等级

- UI 验收等级：B 级。
- 目标是保持现有已验收页面的关键布局、密度、尺寸、颜色和控件风格，无明显视觉回归。
- 现有页面是本任务唯一视觉基线；不自行现代化、不使用抽取作为调整视觉的机会。
- CSS 优先原样迁移，不边迁移边重写。

### 2.5 验收标准摘要

- 4 组基础组件均已独立抽取，门店客户列表通过这些组件恢复原有页面。
- 页面结构、筛选、排序、分页及既有业务行为保持不变，并以第 4 节规定的 52 列最新产品基线完成字段、锚点与需求映射同步。
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
- 当前页面、0010 模块化验收、当前 `requirements.json`、当前 Story 和当前测试应以 52 列为最新基线。
- 模块化前后，无论拆分 `columns`、hooks、mock、table components 或 requirement mapping，都必须保持本节完整顺序。

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
- 实施前必须再次搜索 `CustomerRecord`、mock、hooks 及其他当前数据模型是否已有 `isInvalidCustomer`、`invalidCustomer`、`invalidFlag`、`isInvalid` 或其他等价字段；如存在，直接复用，不得制造第二套相同业务语义。
- 本任务单更新时的代码审计未发现独立等价字段。当前 `CustomerRecord`、`mockData` 与 `useApprovalState` 只有 `invalidApprovalStatus` 流程字段。
- 在当前纯前端原型阶段，如实施时仍不存在独立字段，优先根据审批状态派生展示：`approved → 是`；`null` / `pending` / `rejected → 否`。
- 不得把 `invalidApprovalStatus` 直接作为新列的 `dataIndex` 或数据字段；派生逻辑必须保留“结果字段”和“流程字段”的独立语义，并确保审批状态变化后展示同步更新。

### 4.4 Requirement 与稳定 ID 规则

本任务单更新时已检查当前页面 `requirements.json`、`requirementPoints.ts`、列锚点及 0008 正式需求批次：

- 未发现与“标记无效客资（最终业务结果）”等价的当前需求对象。
- 已有 `scrm-store-customer-invalid-application` 表示申请操作，不是结果字段，不得复用。
- 已有 `scrm-store-customer-invalid-approval-status` / `invalid-approval-status-column` 表示流程状态，不是结果字段，不得复用。
- 未发现 `scrm-store-customer-invalid-customer-flag` 或 `invalid-customer-flag-column` 冲突或等价定义。

若实施前复查仍无等价定义，新字段使用：

- requirement key：`scrm-store-customer-invalid-customer-flag`
- `targetId` / `data-req-id`：`invalid-customer-flag-column`
- `requirementName`：`标记无效客资`
- `definition`：表示当前客户是否已经被正式标记为无效客资。
- `dataSource`：当前纯前端原型阶段说明由无效审批结果派生；不得把审批流程字段描述成最终结果字段。
- `rule`：`approved` 展示“是”；`null`、`pending`、`rejected` 展示“否”；与“无效审批状态”相邻但独立。

实施时应同步当前页面需求 JSON、需求 key 校验、列级稳定锚点、需求点映射和真实结果测试；不得修改 0008 历史批次以伪装为当时已有该字段。

### 4.5 displayNumber 处理结论

- 当前 `displayNumber` 属于页面需求点编号，不等于字段序号，也不与列顺序绑定。证据包括：仅部分列配置需求点、抽屉字段复用编号 9/10、编号 12 由 `RequirementModeControl` 固定。
- 因此，52 列重排不要求任何已有需求的 `displayNumber` 随字段位置调整。首次分配时间、最新分配时间、预约到店时间、是否到店、是否成交、新办成交金额和无效审批状态等已有需求点均保留现有编号。
- 新字段应新增独立 requirement key 和需求点，而不是改写或占用“无效审批状态”的编号。
- 当前真实编号体系没有足够依据决定新字段的 `displayNumber`；不得把字段序号 9 当作需求编号，也不得凭空选择 13 或整体顺延 7～12。
- 开发进入新需求点实现前，产品经理必须单独确认新字段的 `displayNumber`。确认前可以完成无需求编号依赖的字段数据与表格结构准备，但不得提交一个猜测编号。
- `requirementNo` 同样不得根据列序猜测；应按当前需求编号治理单独确认。它与页面 `displayNumber` 是不同概念。

## 5. 绝对保护项

开发过程中严禁修改下列内容及语义：

- 第 4 节规定的 52 列定义、字段顺序和现有列宽规则；
- 筛选数据模型及 `applyFilter`、`pending` / `applied` filters 逻辑；
- 排序规则；
- 已有 requirement key、`displayNumber`、`targetId`；新字段只按第 4.4～4.5 节新增，禁止覆盖旧映射或猜测编号；
- `ColumnRequirementAnchorRegistry`；
- 行级锚点规则；
- 既有无效审批流程；新增结果列只按第 4.3 节派生，不改变申请、审核、退回和重提规则；
- Drawer、ActionMenu 及 Phase 2 业务。

如任一组件抽取必须明显改变现有 DOM、CSS 或业务接口，应停止该项抽取并报告，不得为组件化强行重构。

## 6. 建议文件边界

执行前先核对现有共享目录，优先把后台通用组件放在符合 `PROJECT_STRUCTURE.md` 的共享边界中。建议范围如下，最终路径可根据现有目录约定微调，但不得放入 `prototype-core` 或需求数据目录：

- 新增后台共享组件目录及 4 组组件文件；
- 修改 `src/products/scrm/modules/prospect-management/pages/StoreCustomerList/StoreCustomerList.tsx`；
- 修改或拆分 `src/products/scrm/modules/prospect-management/pages/StoreCustomerList/StoreCustomerList.css`，仅限原样迁移必要样式；
- 修改 `src/products/scrm/modules/prospect-management/pages/StoreCustomerList/columns.tsx`、`mockData.ts`、当前需求映射及相关文件，仅用于落实第 4 节 52 列基线；
- 修改 `src/products/scrm/modules/prospect-management/pages/StoreCustomerList/__tests__/StoreCustomerList.test.tsx`，补充结构抽取回归断言并把当前字段基线更新为 52 列；
- 修改当前门店客户 `requirements.json`、需求 key 校验及当前 Story，仅用于同步新字段需求说明与 52 列当前基线；
- 如新增共享组件测试，测试应验证插槽、受控参数透传和用户可观察结果，不依赖 Ant Design 私有 DOM。

不得修改 0008 历史正式需求批次、需求 Schema、无效审批 Drawer、ActionMenu 逻辑及其他 Phase 2 文件。当前页面字段基线同步与通用组件抽取应分别形成可审查 diff，禁止借新增字段重构既有业务。

## 7. 实施顺序与门禁

采用小步修改，每个闭环先检查 diff，再执行与改动直接相关的最小验证：

1. 抽取 `AdminShell`。
2. 让 `StoreCustomerList` 接回 `AdminShell`。
3. 检查 diff，并执行 typecheck 与相关测试。
4. 抽取 `FilterBar`、`FilterField`、`FilterActions`，接回页面。
5. 检查筛选 DOM、样式及筛选行为。
6. 先按第 4 节完成并验证当前页面 52 列字段基线；字段基线 diff 与通用组件抽取 diff 分开检查。
7. 抽取 `AdminDataTable`，接回页面。
8. 检查 52 列、完整顺序、固定列、横向滚动、排序及 requirement 映射。
9. 抽取 `AdminPagination`，接回页面。
10. 检查分页受控行为、加载、空数据和 `0 / 0` 语义。
11. 执行完整回归并停止，不进入 Phase 2。

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
