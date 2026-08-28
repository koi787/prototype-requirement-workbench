# 0017｜拜访记录重点字段前置与下次拜访时间筛选

## 任务确认卡

- **任务模式**：M1｜快速改动模式。
- **业务目标**：将拜访记录中最常用于跟进判断的 7 个字段前置，并让独立拜访记录页可按未来“下次拜访时间”范围查询。
- **修改范围**：共享拜访记录列顺序、独立拜访记录筛选状态与日期范围控件、现有真实 Story 说明/必要状态、相关真实行为测试和任务文档。
- **明确不做**：新增或编辑流程、数据模型、业务状态机、权限、分页、排序、其他记录类型及公共基础组件重构。
- **业务规则**：两个拜访列表入口共享同一 19 列定义；日期范围为闭区间；快捷项只同步待搜索条件，点击“搜索”后应用。
- **UI 等级**：A 级业务结构一致；日期选择器沿用当前后台视觉，不升级为 C 级重设计。
- **验收标准**：两个真实入口前 7 列一致；独立页支持手动与四种未来快捷范围，并真实完成组合筛选、边界命中及重置。

## 1. 背景与现状审计

当前拜访记录仍为 19 列，客户重点信息、下次拜访时间和意向需求分散。独立拜访记录页已有 8 个筛选字段及 `pendingFilters → 搜索 → appliedFilters` 机制，但没有“下次拜访时间”日期范围条件。

仓库现状已经满足最小改动基础：

- `visitRecordColumns.tsx` 是唯一共享列定义。
- `VisitRecordTable` 同时被独立拜访记录页和门店客户跟进详情“拜访记录”Tab 使用。
- `VisitRecordPage` 是独立页，现有 `RangePicker`、搜索、重置和组合筛选可继续复用。
- 跟进详情 Tab 不渲染查询区，本期不为其增加日期筛选。

因此不得复制第二套 columns，也不得为了本次排序重新抽象表格模块。

## 2. 涉及的两个真实入口

### 2.1 门店客户跟进详情

```text
SCRM → 潜客管理 → 门店客户 → 跟进详情 → 拜访记录
```

现有 Story：`SCRM/潜客管理/门店客户/跟进详情` 下的“拜访记录”。

### 2.2 独立拜访记录

产品入口口径：

```text
记录 → 拜访记录 → 拜访记录列表
```

当前仓库真实菜单与 Storybook 归档为：

```text
SCRM → 潜客管理 → 拜访记录 → 列表
```

0017 只更新现有页面能力，不改菜单归属、page key、registry 或 Storybook 一级信息架构。

## 3. 共享 19 列最终顺序

总列数保持 19。前 7 列严格为：

1. 用户姓名
2. 手机号
3. 下次拜访时间
4. 意向度
5. 改善需求
6. 意向课程
7. 拜访备注

从第 8 列开始，移除上述已前置字段后，其余字段保持当前相对顺序：

8. ID
9. 用户ID
10. 微信号
11. 客资来源
12. 预约门店
13. 拜访方式
14. 拜访时间
15. 创建人
16. 创建时间
17. 更新人
18. 更新时间
19. 操作

只调整 columns 数组位置，不修改任何字段名称、key、`dataIndex`、宽度、render、空值规则、数据来源或固定操作列。两个入口继续使用同一个 `VISIT_RECORD_COLUMNS`。

## 4. 独立页新增“下次拜访时间”筛选

仅在独立 `VisitRecordPage` 查询区新增：

- 标签：`下次拜访时间`。
- 控件：日期范围选择器。
- 支持手动选择开始日期和结束日期。
- 支持快捷范围：`今天`、`未来7天`、`未来30天`、`未来半年`。

不得将该查询条件加入跟进详情 Tab。优先复用当前 Ant Design `RangePicker` 的 presets/快捷范围能力及既有筛选布局；不新增日期库、不修改 shared/admin API、不新做日期组件。

日期控件必须受 `pendingFilters.nextVisitTimeRange` 控制，以便快捷选择、手动选择和“重置”后界面值与筛选状态一致。

## 5. 快捷范围与日期边界

以用户当前本地自然日为起点：

| 快捷项 | 起点 | 终点 |
|---|---|---|
| 今天 | 今天 `00:00:00` | 今天 `23:59:59` |
| 未来7天 | 今天 `00:00:00` | 今天 + 6 天 `23:59:59` |
| 未来30天 | 今天 `00:00:00` | 今天 + 29 天 `23:59:59` |
| 未来半年 | 今天 `00:00:00` | 6 个月后对应日期 `23:59:59` |

- “未来半年”沿用项目现有日期能力的月份加法和月末收敛语义，不自行实现另一套公历算法。
- 手动选择日期后，同样规范化为开始日 `00:00:00` 至结束日 `23:59:59` 的闭区间。
- 不得直接以 `YYYY-MM-DD` 终点字符串和带时间的记录值做错误字典序比较，造成结束当天记录漏匹配。
- 快捷项点击只更新 pending 条件并同步显示 RangePicker 起止日期；仍由“搜索”将其写入 applied 条件。
- 不使用“最近一天/最近7天/最近30天”等过去时间文案。

## 6. 筛选行为

- 新增 `nextVisitTimeRange` 进入现有 `VisitRecordFilterValues`、默认值和 `applyVisitRecordFilter`。
- 搜索后只保留 `nextVisitTime` 落在闭区间内的记录，开始和结束边界均命中。
- `nextVisitTime` 为 `null`、空值或占位值的记录，在启用该条件时不得命中。
- 未设置该条件时不影响现有记录。
- 与用户 ID、姓名/手机号、客资来源、预约门店、拜访方式、拜访时间、创建人、创建时间继续使用 AND 组合查询。
- 搜索后继续回到第 1 页；重置同时清空 pending/applied 的下次拜访时间并恢复初始列表和第 1 页。
- 不改变现有分页、导出、排序和 `nextVisitTime` 显示格式。

## 7. 视觉与交互约束

- 查询区延续现有紧凑后台布局、`FilterBar`、`FilterField` 和日期范围样式。
- 优先级：当前系统已有日期范围形式 > Ant Design RangePicker presets > 最小页面专用样式。
- 目标交互形态为左侧快捷项、右侧双月日期范围面板；如当前 Ant Design 版本的 RangePicker presets 已提供该结构，直接复用。
- 不重新设计日期控件，不修改公共 CSS 或冻结基础组件 API。

## 8. Storybook 归档计划

继续使用现有真实产品路径：

- `SCRM/潜客管理/门店客户/跟进详情`：拜访记录。
- `SCRM/潜客管理/拜访记录/列表`：正常列表及现有必要状态。

如果需要补充日期筛选状态，只能归入 `SCRM/潜客管理/拜访记录/列表` 下的真实业务状态；不得创建 0017、Cycle、Dev、Mock、Test、功能验证或快捷筛选测试等开发目录。

Story 必须渲染现有真实 `StoreCustomerList/ScrmWorkspace → registry → VisitRecordPage` 链路，不得用 children 或裸组件绕过生产入口。

## 9. 测试规划

测试不能只断言 `VISIT_RECORD_HEADERS`、columns 或 presets 常量，必须覆盖真实 DOM 与查询结果。

### 9.1 跟进详情拜访记录

1. 实际打开门店客户跟进详情并切换至拜访记录 Tab。
2. 前 7 个真实表头严格为：用户姓名、手机号、下次拜访时间、意向度、改善需求、意向课程、拜访备注。
3. 总列数仍为 19，其他 12 列全部存在。
4. 第 8—19 列相对顺序符合本任务单，操作列仍固定右侧。

### 9.2 独立拜访记录

5. 通过真实 SCRM 菜单/registry 进入独立拜访记录，前 7 列与跟进详情一致。
6. 查询区真实存在“下次拜访时间”受控 RangePicker。
7. 可手动选择开始、结束日期，输入后不立即过滤，点击搜索后生效。
8. 面板真实存在今天、未来7天、未来30天、未来半年四个快捷项。
9. 使用受控当前日期/时钟分别验证四个快捷范围的起止日期，避免测试依赖运行当天。
10. 快捷选择同步更新日期控件，但不绕过搜索机制。
11. 搜索真实过滤列表；开始日 `00:00:00`、结束日 `23:59:59` 及结束当天中间时间均可命中。
12. 无下次拜访时间记录在启用范围时不命中。
13. 重置清空控件、pending/applied 条件并恢复初始列表。
14. 至少与“姓名/手机号”或另一现有条件完成一次真实 AND 组合查询。
15. 原有筛选、分页、导出和空态测试继续通过。

禁止 `if (element)`、`skip/todo/only`、仅检查数组或依赖 Ant 私有 CSS 类表达核心业务结果。

## 10. 预计文件范围

允许按实际需要修改：

- `src/products/scrm/modules/prospect-management/visit-record/visitRecordColumns.tsx`
- `src/products/scrm/modules/prospect-management/visit-record/visitRecordFilters.ts`
- `src/products/scrm/modules/prospect-management/visit-record/VisitRecordPage.tsx`
- `src/products/scrm/modules/prospect-management/visit-record/__tests__/VisitRecordPage.test.tsx`
- `src/products/scrm/modules/prospect-management/pages/StoreCustomerList/follow-up-detail/__tests__/StoreCustomerListFollowUp.test.tsx`
- 必要时更新现有 `VisitRecordPage.stories.tsx`、`FollowUpDetail.stories.tsx` 的准确说明/真实状态。
- `CHANGELOG.md` 与本任务单的交付状态说明。

若现有测试组织要求在 `StoreCustomerList.test.tsx` 补真实菜单/registry 回归，可最小追加；不得借机重写现有测试体系。

## 11. 明确不做与冻结范围

不得修改或实施：

- 新增/编辑拜访记录流程及 `VisitRecordDrawer`。
- 下次拜访时间既有字段、数据模型、录入必填性或校验规则。
- 拜访状态、权限、数据接口、Provider/store 或 Mock 业务结构。
- 分页、排序、导出语义和其他记录类型。
- 门店客户其他 Tab、到店记录、通话记录、分配记录及跟进流程。
- `src/products/scrm/shared/admin/` 及其 API。
- 0010 Phase 2、0012—0016 已发布业务。
- 新依赖、状态管理、日期库或整个记录模块重构。

## 12. 实施与验证

只做一个 M1 小闭环，优先顺序：

1. 调整唯一共享 columns 并分别验证两个入口。
2. 在独立页现有 pending/applied 筛选状态中加入日期范围和四个 presets。
3. 补真实 DOM、日期计算、组合查询和回归测试。
4. 执行相关最小测试。
5. 最终执行：

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm build-storybook
git diff --check
```

任何门禁失败均停止 Git 收口。不得将既有无关 warning 或技术债扩展进本任务。

## 13. 验收标准

- 两个入口继续共享一份 19 列配置，前 7 列严格一致，其余字段完整且相对顺序不变。
- 独立页存在受控“下次拜访时间”日期范围，并支持手动选择及四个未来快捷项。
- 日期范围按自然日闭区间过滤，结束当天不漏数据；空时间记录不命中。
- 搜索、重置、组合筛选、分页复位符合现有 pending/applied 机制。
- Storybook 仍按真实产品菜单归档，既有拜访新增/编辑及其他业务无回归。
- 未新增依赖、状态管理、公共组件 API 或无关重构。

## 14. Git 与任务完成通知

本轮只创建本任务单，不执行 `git add`、commit、push、merge、rebase 或任何 stash 操作。后续 Git 收口须另获产品经理授权。

任务完成后按根目录 `AGENTS.md` 的“任务完成通知”规则执行：Codex 使用用户级 notify Hook，不手动通知；其他代理使用各自规定的单一通知机制，不得重复发送。
