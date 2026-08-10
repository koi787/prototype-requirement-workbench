# SCRM 后台基础结构（Admin Foundations）

Phase 1 抽取的后台页面通用基础组件，供 SCRM 的 B 端页面模块化复用。

## 包含组件（Phase 1）

- `AdminShell`：后台页面框架与插槽（Sidebar / TopHeader / 顶部页签 / Content）。
- `FilterBar`：筛选区布局容器与插槽。
- `FilterField`：单个筛选项的 label 与控件插槽。
- `FilterActions`：筛选操作按钮区左右插槽。
- `AdminDataTable`：对 Ant Design `Table` 的最薄封装，固定 `pagination={false}`。
- `AdminPagination`：受控分页，页面管理当前页、每页条数和变更回调。

## 边界与约束

- 本阶段仅做既有结构抽取，不追求 UI 重设计或架构重写。
- 组件目前沿用 `store-customer-*` 类名，保证已验收页面零视觉回归；
  后续 Phase 复用到其它页面时，应在独立任务中重命名与换肤。
- 不内置 SCRM 菜单、顶部页签、系统名称等业务文字。
- 不接管筛选状态、列定义、requirement 包装、列级锚点注册或业务逻辑。
- 不包含 Phase 2 组件（`AdminActionMenu`、`AdminDrawer`、`AdminStatusTag`、
  `AdminEmptyState`、Modal、Axure Export / Axhub Runtime）。
