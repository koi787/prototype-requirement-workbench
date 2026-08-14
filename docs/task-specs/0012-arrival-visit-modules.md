# 0012｜到店记录 / 拜访记录独立模块化

## 1. 任务元数据

- 任务编号：0012
- 任务模式：M3-S｜轻量跨页面/模块改造
- UI 验收等级：C
- 功能分支：feature/0012-arrival-visit-modules
- 正式代码基线：5af7dcd2a063a057c3e6899d70dde13a5d9ad5e1
- 0011 feature commit：8c28a82b737bc7324bc3656b199d33d5d909cb76
- 所属产品：SCRM
- 所属模块：潜客管理
- 前置任务：0010 Phase 1、0011 Cycle 1
- 开发闭环：Cycle A 与 Cycle B；Cycle A 完成开发自检和产品经理真实页面验收后，才可进入 Cycle B

当前分支已统一为 feature/0012-arrival-visit-modules，不再使用 feature/0012-arrival-visit-secondary-drawers。

## 2. 需求确认卡

### 2.1 正式目标

将“到店记录”和“拜访记录”建设为潜客管理下的独立二级业务模块，同时保留 0011 跟进详情中的到店记录 Tab 和拜访记录 Tab。

核心原则：

一个业务模块，多个消费者。

每类记录只允许存在一套：

- types
- columns
- 数据格式与状态展示
- Mock 数据及数据适配器
- 表格业务能力
- create/edit 业务 Drawer

独立模块与跟进详情 Tab 不得形成两套业务定义。

### 2.2 菜单结构

潜客管理下的目标结构为：

    潜客管理
    ├─ 门店客户
    ├─ 到店记录
    ├─ 拜访记录
    └─ 其他既有菜单

正式页面 key：

- store-customer
- arrival-record
- visit-record

不得继续用 visit-record 表示“到店记录”，不得保留 visit-record-2 之类临时 key。

### 2.3 当前仓库事实

1. Storybook 是唯一主要工作台，Vite 首页不承担正式业务路由。
2. 当前仓库未引入 React Router；0012 不得为两个原型页新增路由依赖。
3. 当前潜客管理菜单已有“到店记录”“拜访记录”文字，但尚未形成可切换的独立页面。
4. 0011 已在 StoreCustomerList/follow-up-detail 中建立到店 32 列、拜访 18 列、相关类型、Mock 和视觉定义。
5. 0012 将拜访记录正式升级为 19 列，并要求跟进详情 Tab 与独立模块同时消费同一份新定义。

### 2.4 UI 规则

0012 以真实系统截图为 C 级视觉参考。功能正确但独立页面明显不像真实系统，不视为通过。

必须重点对照：

- 后台页面密度
- 筛选区结构
- 表格横向滚动
- 操作列与操作菜单
- Drawer 层级与遮罩
- 字段顺序
- 按钮位置
- 分页形态

截图看不清或业务行为无法确认的内容，在实现与验收中标记“待确认”，不得自行设计新业务。

## 3. 两个 Cycle 的边界

### 3.1 Cycle A｜独立模块 + 业务定义复用

Cycle A 只完成：

1. 潜客管理新增“到店记录”“拜访记录”独立二级模块和受控页面切换。
2. 新增到店记录、拜访记录独立页面。
3. 将 0011 的到店/拜访 types、columns、格式化、状态视觉和 Mock 访问能力迁移到业务模块。
4. 建立可被独立页面与跟进详情 Tab 共同消费的 ArrivalRecordTable、VisitRecordTable。
5. 跟进详情两个 Tab 改为消费共享模块，不改变 0011 视觉和行为。
6. 独立页按已确认清单建立筛选区。
7. 独立页提供导出入口视觉；不实现真实文件导出。
8. 保持纯前端 Mock。
9. 补充独立页面 Story 和真实 DOM 测试。

Cycle A 不要求完成 create/edit Drawer、变更记录 Drawer 或运行时写入。

### 3.2 Cycle B｜业务 Drawer + 编辑能力

Cycle A 验收后，Cycle B 只完成：

1. 单一 ArrivalRecordDrawer，支持 create/edit。
2. 单一 VisitRecordDrawer，支持 create/edit。
3. 到店记录独立页“编辑”。
4. 拜访记录独立页“编辑”。
5. 单一 ArrivalChangeRecordDrawer，只读展示到店变更记录。
6. 门店客户与跟进详情中的新增入口复用同一业务 Drawer。
7. create/edit 后通过单一运行时 Mock 数据源回写，使独立页与跟进详情 Tab 同步。
8. 补充对应 Story 和测试。

### 3.3 两个 Cycle 均禁止

- LocalStorage
- 后端 API、数据库、新服务
- 新增依赖或付费能力
- 删除记录、审批、附件上传
- 通话播放、外呼联动、提醒、今日待办、消息推送、超期升级
- AdminDrawer、AdminActionMenu、AdminStatusTag、AdminEmptyState
- 0010 Phase 2
- 重构 Requirement 体系

## 4. 推荐业务模块目录结构

推荐在 prospect-management 下形成：

    src/products/scrm/modules/prospect-management/
    ├─ record-shared/
    │  ├─ RecordCellVisuals.tsx
    │  ├─ RecordStatusTags.tsx
    │  ├─ recordFormatters.ts
    │  ├─ recordFormOptions.ts
    │  └─ index.ts
    ├─ arrival-record/
    │  ├─ arrivalRecordTypes.ts
    │  ├─ arrivalRecordColumns.tsx
    │  ├─ arrivalRecordFilters.ts
    │  ├─ arrivalRecordMockData.ts
    │  ├─ arrivalRecordData.tsx
    │  ├─ ArrivalRecordTable.tsx
    │  ├─ ArrivalRecordPage.tsx
    │  ├─ ArrivalRecordDrawer.tsx
    │  ├─ ArrivalChangeRecordDrawer.tsx
    │  ├─ index.ts
    │  └─ __tests__/
    ├─ visit-record/
    │  ├─ visitRecordTypes.ts
    │  ├─ visitRecordColumns.tsx
    │  ├─ visitRecordFilters.ts
    │  ├─ visitRecordMockData.ts
    │  ├─ visitRecordData.tsx
    │  ├─ VisitRecordTable.tsx
    │  ├─ VisitRecordPage.tsx
    │  ├─ VisitRecordDrawer.tsx
    │  ├─ index.ts
    │  └─ __tests__/
    └─ navigation/
       ├─ prospectManagementPages.ts
       └─ ProspectManagementWorkspace.tsx

目录名可结合当前导入层级微调，但职责不可改变：

- 业务类型、列、筛选、数据适配器、表格与 Drawer 归各自业务模块。
- 真正被两类记录共同使用的单元格视觉、格式化和表单枚举可放 record-shared。
- record-shared 仍是潜客管理业务层，不得上移到 src/products/scrm/shared/admin。
- 跟进详情只负责组装 Tab 和传入 customerKey，不继续拥有到店/拜访业务定义。
- 菜单与页面注册放产品层，不塞入 shared/admin。

## 5. 独立页面路径和页面切换

源码页面路径：

- src/products/scrm/modules/prospect-management/arrival-record/ArrivalRecordPage.tsx
- src/products/scrm/modules/prospect-management/visit-record/VisitRecordPage.tsx

Storybook 工作台标题：

- SCRM / 潜客管理 / 到店记录
- SCRM / 潜客管理 / 拜访记录

当前“页面路径”指产品层受控页面注册与菜单切换，不是 URL 路由。不得为了 0012 引入 React Router。若后续要求深链、浏览器前进后退或可复制 URL，应另开基础设施任务。

## 6. 到店记录业务模块

### 6.1 独立页定位

到店记录独立页用于全量归集、查询、查看、编辑和查看变更记录。

页面具有：

- 筛选
- 导出视觉入口
- 32 列列表
- 操作 → 编辑
- 操作 → 变更记录

页面不得出现“添加到店”按钮。

### 6.2 筛选项

筛选区严格规划为：

1. 用户ID
2. 姓名/手机号
3. 客资来源
4. 预约门店
5. 是否到店
6. 是否成交
7. 体验课状态
8. 是否签到
9. 体验课上课教练
10. 到店时间
11. 体验课卡获取时间
12. 合同号
13. 搜索
14. 重置
15. 导出

细节枚举值未确认的部分可在实现前补充确认，不得擅自新增筛选条件。

### 6.3 到店记录 32 列最终定义

严格顺序：

1. ID
2. 用户姓名
3. 用户ID
4. 微信号
5. 手机号
6. 客资来源
7. 预约门店
8. 到店时间
9. 是否到店
10. 是否成交
11. 成交金额
12. 课程类型
13. 是否有体验课
14. 体验课状态
15. 是否签到
16. 体验课上课教练
17. 体验课下课时间
18. 合同号
19. 体验课卡合同状态
20. 体验课卡
21. 实付金额
22. 体验课卡获取时间
23. 意向度
24. 改善需求
25. 意向课程
26. 预约备注
27. 结果分析
28. 创建人
29. 创建时间
30. 更新人
31. 更新时间
32. 操作

跟进详情到店记录 Tab 与独立到店记录页必须导入同一份 ArrivalRecord 类型和 arrivalRecordColumns，不得复制。

### 6.4 结果分析字段

结果分析是 ArrivalRecord 的普通业务字段：

- 不是独立实体。
- 不是独立子模块。
- 没有独立保存流程。
- create 时默认可为空，可填写。
- edit 时回填已有值，可更新。
- 保存后直接反映在到店记录列表“结果分析”列。

若 Drawer 视觉上将其放在独立区域，只代表表单布局分区，数据层仍属于同一 ArrivalRecord。

### 6.5 ArrivalRecordDrawer

只创建一个 ArrivalRecordDrawer，以 mode=create 或 mode=edit 区分模式。

create：

- 客户由入口上下文确定。
- 不在独立归集页要求二次选择客户。

edit：

- 从当前 ArrivalRecord 回填。
- 可展示只读客户上下文，但不得借机修改客户主数据。

表单字段：

1. *预约门店
2. 体验课
3. *到店时间
4. *意向度
5. *改善需求
6. *意向课程
7. 预约备注
8. 结果分析

意向度为 1–5，默认 1。

改善需求：

- 体态调整
- 放松减压
- 含胸驼背
- 改善睡眠
- 产后修复
- 体式精进
- 平衡身心灵
- 拉伸筋骨
- 增强体质免疫力
- 减脂塑形

意向课程：

- 精选团课
- 精选私教
- 大班课
- 双人私教
- 体态管理
- 被动瑜伽
- 被动理疗

edit 模式允许只读展示：用户信息、客资来源、注册时间、到店/成交状态、体验课/课卡/合同关联信息。不得为此建立第二套编辑数据模型。

### 6.6 到店变更记录 Drawer

单独建立 ArrivalChangeRecordDrawer：

- 入口：到店独立页操作 → 变更记录。
- 只读右侧 Drawer。
- 展示“变更前 / 变更后”结构。
- 支持 Mock 数据、空态和前端 Mock 分页。
- 可能展示预约门店、合同名称、课程类型、购买金额、购买时间、合同号、变更时间、操作人。

变更记录的真实产生机制尚未确认。0012 不得假设“编辑到店记录 = 自动生成变更记录”，也不实现课卡合同同步、跨模块事件、审计系统或后端历史查询。

## 7. 拜访记录业务模块

### 7.1 独立页定位

拜访记录独立页用于全量归集、查询、查看和编辑。

页面具有：

- 筛选
- 导出视觉入口
- 19 列列表
- 操作 → 编辑

页面不得出现“添加拜访记录”按钮。

### 7.2 筛选项

筛选区严格规划为：

1. 用户ID
2. 姓名/手机号
3. 客资来源
4. 预约门店
5. 拜访方式
6. 拜访时间
7. 创建人
8. 创建时间
9. 搜索
10. 重置
11. 导出

细节枚举值未确认的部分可在实现前补充确认，不得擅自新增筛选条件。

### 7.3 拜访记录 19 列最终定义

0011 的 18 列基线在 0012 正式升级为 19 列，严格顺序：

1. ID
2. 用户姓名
3. 用户ID
4. 微信号
5. 手机号
6. 客资来源
7. 下次拜访时间
8. 预约门店
9. 拜访方式
10. 意向度
11. 改善需求
12. 意向课程
13. 拜访备注
14. 拜访时间
15. 创建人
16. 创建时间
17. 更新人
18. 更新时间
19. 操作

下次拜访时间必须位于“客资来源”之后、“预约门店”之前，不得移到“拜访时间”之后。

跟进详情拜访记录 Tab 与独立拜访记录页必须同时升级为 19 列，并导入同一份 VisitRecord 类型和 visitRecordColumns。

### 7.4 下次拜访时间规则

- 字段名：下次拜访时间
- 建议字段：nextVisitTime
- 类型：DateTime，可空
- 是否必填：否
- 显示格式：YYYY-MM-DD HH:mm:ss
- 空值：--
- 含义：下一次计划拜访 / 跟进时间

0012 只实现录入、回填、修改、列表展示和运行时 Mock 保存。自动提醒、今日待办、消息推送和超期升级全部延期。

### 7.5 VisitRecordDrawer

只创建一个 VisitRecordDrawer，以 mode=create 或 mode=edit 区分模式。

create：

- 客户由门店客户或跟进详情入口上下文确定。

edit：

- 从当前 VisitRecord 回填。
- 用户信息只作上下文展示，不修改客户主数据。

表单字段：

1. *拜访方式
2. *拜访时间
3. *意向度
4. *改善需求
5. *意向课程
6. 下次拜访时间
7. 拜访备注

意向度为 1–5，默认 1；改善需求和意向课程使用第 6.5 节的正式枚举。

拜访方式历史枚举：

- 系统外呼
- 自主拨打
- 企微
- 微信

系统外呼当前已基本停用，0012 仅保留历史枚举值，不实现通话记录选择器、外呼联动或外呼详情。

## 8. 为什么独立页不提供新增按钮

到店记录与拜访记录独立页的主要职责是归集、查询、筛选、查看和编辑。新增记录必须绑定明确客户，因此保留在已有客户上下文：

到店新增入口：

- 门店客户 → 操作 → 添加到店
- 门店客户 → 跟进详情 → 添加到店

两个入口复用 ArrivalRecordDrawer(create)。

拜访新增入口：

- 门店客户 → 操作 → 添加拜访记录
- 门店客户 → 跟进详情 → 添加拜访记录

两个入口复用 VisitRecordDrawer(create)。

独立到店页没有“添加到店”按钮；独立拜访页没有“添加拜访记录”按钮。该原则在 0012 冻结，不得在实现时自行增加。

## 9. 单一 Mock 数据源

### 9.1 Cycle A

迁移并整理当前 Mock，使每类记录只有一个初始数据源和一个按 customerKey 选择的适配器：

- 独立页读取全部记录。
- 跟进详情 Tab 按稳定 customerKey 读取当前客户记录。
- 不得复制两套数组。

### 9.2 Cycle B

为两类业务分别提供单一运行时 Provider/store：

- createArrivalRecord / updateArrivalRecord
- createVisitRecord / updateVisitRecord
- getArrivalRecords / getVisitRecords
- getArrivalRecordsByCustomerKey / getVisitRecordsByCustomerKey

Provider/store 必须挂载在能够同时覆盖以下三个消费者的产品层共同祖先上：

- 独立到店记录页面
- 独立拜访记录页面
- 门店客户跟进详情

禁止：

- ArrivalRecordPage 自己创建一套 Provider。
- VisitRecordPage 自己创建一套 Provider。
- FollowUpDetailDrawer 再创建一套 Provider。
- 由多个 Provider 实例分别维护相同业务状态。

同一运行时内，独立页面与跟进详情必须读取和修改同一状态实例。

同一运行时内：

- 独立页和跟进详情 Tab 读取同一状态。
- create/edit 保存后两处同步更新。
- 清空可选的下次拜访时间后，两处同步显示 --。
- 刷新页面允许恢复初始 Mock。

禁止 LocalStorage、后端 API、数据库、新服务、新依赖，也不得复制 CustomerRecord 身份主数据。记录通过稳定 customerKey 关联客户。

到店变更记录使用独立只读 Mock；除非产品后续确认真实产生机制，create/update 到店记录不得自动写入变更历史。

## 10. 从 0011 迁移与保留

### 10.1 计划迁移

- follow-up-detail/arrivalRecordColumns.tsx
  - 迁移到 arrival-record/arrivalRecordColumns.tsx。
- follow-up-detail/visitRecordColumns.tsx
  - 迁移到 visit-record/visitRecordColumns.tsx，并按正式 19 列升级。
- follow-up-detail/followUpTypes.ts
  - 仅迁出 ArrivalRecord、VisitRecord 及其专属子类型；跟进流程、通话、分配类型留在原模块。
- follow-up-detail/followUpMockData.ts
  - 仅迁出到店/拜访初始数据及选择器；跟进旅程、通话、分配、客户概览数据留在原模块。
- follow-up-detail/followUpShared.tsx
  - 仅迁出被两类记录共同使用的记录单元格视觉、状态展示和格式化；不得机械搬走跟进流程专属能力。

迁移完成后，旧到店/拜访 columns 文件不得作为第二套定义保留。可短期保留只转导出的兼容文件，但同一 Cycle 内应清理，避免形成双入口。

### 10.2 保持不动

- FollowUpProcess.tsx 的用户信息、概览、旅程与分页业务。
- callRecordColumns.tsx。
- assignmentRecordColumns.tsx。
- 门店客户 columns.tsx 的 52 列业务定义。
- 既有 Requirement 数据、Schema 和 0008 历史批次。
- src/products/scrm/shared/admin/ 现有实现和 API。

FollowUpDetailDrawer.tsx 只允许做导入替换、Tab 消费共享表格和 Cycle B 新增入口接线所必需的最小修改；不得重写已验收结构。

## 11. 0011 绝对回归保护

模块迁移后必须保持：

- 跟进详情一级 Drawer 宽度 70vw。
- 五个 Tab 及默认 Tab。
- 用户信息结构与间距。
- 跟进概览四卡、Tooltip、hover。
- 跟进旅程、单一 Select、旅程卡、客资有效性和分页。
- 到店记录 32 列及顺序。
- 拜访记录按本任务正式升级为 19 列，除该产品变更外视觉和行为不回退。
- 通话记录 13 列。
- 分配记录 2 列。

顶部操作条严格保持：

1. 手动变更
2. 更多操作
3. 添加到店
4. 添加拜访记录

不得重新出现“已到店、未到店、已成交、未成交”状态标签。

## 12. 其他正式基线保护

### 12.1 门店客户 52 列

0012 不得修改门店客户列表业务 columns。

继续保护：

- 总列数 52。
- 前 13 列保持当前正式顺序：
  1. 姓名
  2. 手机号
  3. 客资来源
  4. 最新分配时间
  5. 预约到店时间
  6. 是否到店
  7. 是否成交
  8. 新办成交金额
  9. 标记无效客资
  10. 拜访次数
  11. 近 7 天到店次数
  12. 无效审批状态
  13. ID
- 第 10 列拜访次数。
- 第 11 列近 7 天到店次数。
- 第 12 列无效审批状态。
- 第 50 列首次分配时间。
- 第 51 列创建时间。
- 第 52 列操作。

### 12.2 Requirement 与既有业务

不得修改：

- requirements.json
- requirementPoints
- requirement-view Schema
- SC-08-10
- displayNumber 13
- invalid-customer-flag-column
- invalidCustomerFlag
- 无效审批状态机
- 新办成交金额规则
- 0008 历史正式需求批次

Requirement 模式下点击既有需求点不得误触发新增、编辑或页面切换业务。

### 12.3 0010 Phase 1 / Phase 2

允许原样复用：

- AdminShell
- FilterBar
- FilterField
- FilterActions
- AdminDataTable
- AdminPagination

禁止修改 src/products/scrm/shared/admin/ 现有实现和 API。

延期到 0010 Phase 2：

- AdminDrawer
- AdminActionMenu
- AdminStatusTag
- AdminEmptyState
- 其他平台级 Drawer、操作菜单、状态、空态抽象

原则：先形成真实业务复用样本，再做平台抽象。

## 13. 文件变更计划

### 13.1 Cycle A 预计新增

- prospect-management/record-shared/ 下必要的业务共享文件。
- prospect-management/arrival-record/ 下 types、columns、filters、Mock/data、Table、Page、index 和测试。
- prospect-management/visit-record/ 下 types、columns、filters、Mock/data、Table、Page、index 和测试。
- prospect-management/navigation/ 下产品层菜单/页面注册文件（如当前实现可用更小范围完成，可不机械新建目录）。
- 两个独立页面 Story。

### 13.2 Cycle A 预计修改

- StoreCustomerList.tsx：仅产品层菜单/页面接线所需修改。
- FollowUpDetailDrawer.tsx：两个 Tab 改为消费共享表格。
- followUpTypes.ts、followUpMockData.ts、followUpShared.tsx：迁出到店/拜访专属定义。
- arrivalRecordColumns.tsx、visitRecordColumns.tsx：完成迁移后删除或转导出，并最终消除重复源。
- StoreCustomerList.css 或页面专用 CSS：仅在 C 级页面复刻确有必要时修改；不得污染全局。
- StoreCustomerList.stories.tsx 或新增独立 Story 文件。
- 相关测试与 CHANGELOG.md。

### 13.3 Cycle B 预计新增

- arrival-record/ArrivalRecordDrawer.tsx。
- arrival-record/ArrivalChangeRecordDrawer.tsx。
- visit-record/VisitRecordDrawer.tsx。
- 必要的 Drawer 专用 CSS、Mock 变更记录和测试。

### 13.4 Cycle B 预计修改

- 两类业务数据 Provider/store。
- 两个独立页的编辑/变更记录接线。
- 门店客户现有操作入口与 FollowUpDetailDrawer 的新增入口接线。
- 对应 Story、测试和 CHANGELOG.md。

### 13.5 禁止修改

- 门店客户 columns.tsx 业务规则。
- requirementPoints.ts、requirements.json、requirement-view Schema。
- invalidCustomerFlag 和无效审批状态机。
- 0008 历史批次。
- shared/admin 实现/API。
- package.json、pnpm-lock.yaml（0012 不新增依赖）。

如实现必须突破禁止清单，应停止当前 Cycle 并由产品经理重新确认范围。

## 14. Storybook 计划

Cycle A 至少覆盖：

1. 潜客管理菜单 → 到店记录独立页。
2. 到店记录带 Mock 数据。
3. 到店记录空态。
4. 潜客管理菜单 → 拜访记录独立页。
5. 拜访记录带下次拜访时间。
6. 拜访记录下次拜访时间为空。
7. 跟进详情到店 Tab 继续消费共享模块。
8. 跟进详情拜访 Tab 显示 19 列。
9. Requirement 模式回归。

Cycle B 至少覆盖：

1. ArrivalRecordDrawer create。
2. ArrivalRecordDrawer edit 与结果分析回填。
3. VisitRecordDrawer create，含下次拜访时间。
4. VisitRecordDrawer edit 与清空下次拜访时间。
5. ArrivalChangeRecordDrawer 有数据。
6. ArrivalChangeRecordDrawer 空态。
7. 同一运行时内独立页与跟进详情 Tab 数据同步。

不得为同一业务入口复制第二套 Story 专用实现；Story 必须渲染真实业务组件。

## 15. 测试计划

禁止只验证 columns 数组而不验证真实 DOM。

### 15.1 菜单与页面

- 潜客管理出现到店记录和拜访记录。
- 三个正式 key 唯一，菜单顺序正确。
- 菜单切换显示正确页面，不发生路由跳转。
- 独立页面无新增记录按钮。

### 15.2 到店记录

- 独立页真实 DOM 严格 32 列。
- 跟进详情到店 Tab 真实 DOM 严格 32 列。
- 两处共享同一 columns 与数据定义。
- 15 项筛选/操作结构完整。
- 横向滚动和右侧固定操作列保持。
- edit 打开、回填、保存后 Mock 更新。
- 结果分析 create/edit/save/list 显示一致。
- 变更记录入口打开只读 Drawer。
- 变更记录空态、Mock 数据和分页。
- 编辑到店记录不会错误自动生成变更历史。

### 15.3 拜访记录

- 独立页真实 DOM 严格 19 列。
- 跟进详情拜访 Tab 真实 DOM 严格 19 列。
- 两处共享同一 columns 与数据定义。
- 下次拜访时间严格位于客资来源后、预约门店前。
- 时间格式为 YYYY-MM-DD HH:mm:ss，空值为 --。
- 11 项筛选/操作结构完整。
- 横向滚动和右侧固定操作列保持。
- create 可填写下次拜访时间。
- edit 可回填、修改和清空。
- 保存后独立页与跟进详情 Tab 同步。
- 独立归集页没有新增按钮。
- 门店客户与跟进详情新增入口正常且调用同一 Drawer。
- 系统外呼不会出现通话记录选择器或外呼详情。

### 15.4 0011 与全局回归

- 跟进详情 Drawer 70vw、开关与客户上下文。
- 五 Tab 与跟进流程。
- 用户信息操作条只保留四个正式动作。
- 概览、Tooltip、旅程筛选和分页。
- 通话记录 13 列。
- 分配记录 2 列。
- 门店客户真实 DOM 仍为 52 列及正式顺序。
- Requirement 模式不误触发业务。
- shared/admin 既有基础测试不回退。
- 不存在 if(element)、skip/todo/only、仅靠 Ant 私有类或 cells[数字] 表达业务字段的假测试。

每个 Cycle 完成后执行：

- pnpm lint
- pnpm typecheck
- pnpm test
- pnpm build
- pnpm build-storybook
- git diff --check

## 16. Cycle A 验收标准

Cycle A 只有同时满足以下条件才可交付真实页面验收：

1. 潜客管理可以切换门店客户、到店记录、拜访记录，其他菜单未被删除。
2. 到店独立页具有确认的筛选、导出视觉、32 列列表和分页。
3. 拜访独立页具有确认的筛选、导出视觉、19 列列表和分页。
4. 两个独立页均无新增记录按钮。
5. 跟进详情两个 Tab 使用同一业务模块，32/19 列真实 DOM 正确。
6. 到店/拜访 types、columns、数据源不存在第二套定义。
7. 拜访下次拜访时间规则完整落地。
8. 0011 除正式 19 列升级外无视觉和行为回退。
9. 门店客户 52 列、Requirement、审批、成交金额和 shared/admin 均未回退。
10. C 级真实系统页面验收通过，完整门禁通过。

产品经理确认 Cycle A 后，才能开始 Cycle B。

## 17. Cycle B 验收标准

1. ArrivalRecordDrawer 与 VisitRecordDrawer 各只有一个组件，create/edit 复用。
2. 新增入口只来自客户上下文；两个独立页都无新增按钮。
3. 独立到店/拜访页面可编辑对应记录。
4. 下次拜访时间可创建、回填、修改、清空，并在两处同步。
5. 结果分析属于 ArrivalRecord，create/edit/save/list 语义一致。
6. 到店变更记录 Drawer 只读，支持前后结构、空态、Mock 和分页。
7. 编辑到店记录不会自动产生未经确认的变更历史。
8. create/edit 使用单一运行时数据源，刷新后允许恢复 Mock。
9. 没有 LocalStorage、API、数据库、外呼联动或提醒能力。
10. 没有创建平台级 Admin Phase 2 组件。
11. C 级真实页面验收与完整门禁全部通过。

## 18. 主要回归风险与控制

1. columns 双源
   - 风险：独立页与跟进详情分别维护 32/19 列。
   - 控制：业务模块导出唯一 columns；测试同时验证两个真实 DOM。
2. 0011 DOM/CSS 回退
   - 风险：迁移 Table 改变 Drawer Tab 的 DOM、滚动或固定列。
   - 控制：小步迁移，保留 className 与容器层级，迁移前后截图对照。
3. 菜单 Shell 过度重构
   - 风险：为页面切换重写 Sidebar/TopHeader/页签。
   - 控制：产品层最小受控切换，不新增 Router，不改 shared/admin。
4. Mock 双写
   - 风险：独立页更新但跟进详情未同步。
   - 控制：单一 Provider/store 与稳定 customerKey。
5. 下次拜访时间只改一个消费者
   - 控制：同一类型/columns，并将两个 19 列 DOM 测试作为门禁。
6. 独立页误加新增按钮
   - 控制：任务单冻结，并有负向测试。
7. 变更历史机制被臆测
   - 控制：只读独立 Mock，不从 edit 自动写入。
8. 业务组件过早上升平台层
   - 控制：Drawer、状态、空态留在业务模块，0010 Phase 2 延期。
9. C 级视觉偏差
   - 控制：以真实截图逐区验收，无法确认的内容标记待确认。

## 19. 回滚方案

### 19.1 Cycle A

按模块边界回滚：

1. 移除两个独立页面和产品层页面注册。
2. 将跟进详情到店/拜访 Tab 的导入恢复到 0011 已发布实现。
3. 删除新业务模块与 Story/测试。
4. 不触碰 0011 其他 Tab、门店客户 52 列、Requirement 或 shared/admin。

Cycle A 应作为独立可验证提交，避免与 Cycle B 混合，保证可单独回退。

### 19.2 Cycle B

按业务能力回滚：

1. 移除 create/edit Drawer 和入口接线。
2. 移除运行时写入 Provider/store，恢复 Cycle A 只读数据适配器。
3. 移除 ArrivalChangeRecordDrawer 和只读变更 Mock。
4. 保留 Cycle A 已验收的独立页面、共享 32/19 列和菜单。

不得通过 reset、覆盖历史或恢复旧 stash 进行发布回滚；按 Git 提交正常 revert，并重新执行完整门禁。

## 20. 开发与 Review 顺序

### Cycle A

1. 迁移类型与数据适配器。
2. 迁移到店 columns，建立 ArrivalRecordTable，并接回跟进详情。
3. 升级并迁移拜访 19 列，建立 VisitRecordTable，并接回跟进详情。
4. 建立独立页面筛选、导出视觉、列表和分页。
5. 建立产品层菜单/页面切换。
6. 补 Story、测试和 CHANGELOG。
7. 完整门禁。
8. 产品经理 C 级真实页面验收。
9. Codex Formal Review。

### Cycle B

1. 建立单一运行时数据源。
2. 实现 ArrivalRecordDrawer create/edit。
3. 实现 VisitRecordDrawer create/edit。
4. 接入客户上下文新增入口与独立页编辑入口。
5. 实现只读 ArrivalChangeRecordDrawer。
6. 补 Story、测试和 CHANGELOG。
7. 完整门禁。
8. 产品经理 C 级真实页面验收。
9. Codex Formal Review。

不得跳过 Cycle A 验收直接进入 Cycle B，不得在任一 Cycle 顺带实施 0010 Phase 2。

## 21. Cycle A 执行记录

执行日期：2026-08-12
分支：`feature/0012-arrival-visit-modules`
任务模式：M3-S（轻量通用修复/模块化范围，未扩展架构重写）

### 已交付

1. 建立业务模块：`record-shared/`（RecordCellVisuals、recordFormatters、index）、`arrival-record/`（types/columns/filters/mock/Table/Page/index）、`visit-record/`（types/columns/filters/mock/Table/Page/index）、`navigation/prospectManagementPages.ts`。
2. 单一 Mock 数据源：`ARRIVAL_RECORDS_BY_CUSTOMER` / `VISIT_RECORDS_BY_CUSTOMER` + `getAll*Records`（独立页）+ `get*ByCustomerKey`（跟进详情 Tab），独立页与跟进详情 Tab 共用同一套 types/columns/formatters。
3. 拜访记录升级为 19 列：第 7 列"下次拜访时间"（字段名 `nextVisitTime`，`string | null`，格式 `YYYY-MM-DD HH:mm:ss`，空值显示 `--`，位于 客资来源 之后、预约门店 之前），独立页与跟进详情 Tab 同步升级。
4. 产品层菜单切换：潜客管理子菜单前三项为 门店客户 / 到店记录 / 拜访记录，可点击切换内容槽位；沿用 `store-customer`、`arrival-record`、`visit-record` 三个正式 key，不再保留 `visit-record-2` 之类临时 key。
5. 独立页筛选：到店 12 筛选字段 + 搜索/重置/导出（§6.2 的 15 项）；拜访 8 筛选字段 + 搜索/重置/导出（§7.2 的 11 项）。两个独立页均不提供添加记录/新增/编辑按钮，仅归集/查询/筛选/查看。
6. Storybook：新增 `SCRM/潜客管理/到店记录`（正常列表、空数据）、`SCRM/潜客管理/拜访记录`（正常列表、下次拜访时间有值、下次拜访时间为空、空数据）；0011 跟进详情拜访记录 Story 描述同步为 19 列。
7. 测试：独立页真实 DOM 测试（到店 10 项、拜访 12 项）+ 菜单切换 6 项 + 既有跟进详情/列表/全局测试保留，全量 421 项测试全部通过；C 级验收修正后新增 14 项真实 DOM/交互断言，最终全量 439 项通过。
8. CHANGELOG 新增本记录并同步本节。

### 说明与限定

- `followUpShared.tsx` 迁移为 `record-shared/`；`followUpTypes.ts` 中的 ArrivalRecord/VisitRecord/formatRecordAmount 迁移至对应模块；`callRecordColumns.tsx` 仅将原 `followUpShared` 导入路径改为 `record-shared`（13 列定义未动，符合 §10.2）。
- 未保留第二套到店/拜访列定义；旧 `followUpShared.tsx`、旧 `arrivalRecordColumns.tsx`、旧 `visitRecordColumns.tsx` 已在同一 Cycle 删除。
- 测试使用正式 `data-req-id` 与真实 DOM 断言；antd Select 下拉交互通过 `role="listbox"` + `title` 定位可交互选项（隐藏的无障碍 `option` 不可点击）；固定列断言使用 antd v6 的 `ant-table-cell-fix-end` 标记并结合共享列定义 `fixed: 'right'`。
- Cycle A 未实施：ArrivalRecordDrawer / VisitRecordDrawer / ArrivalChangeRecordDrawer / create/edit / Mock writeback / Provider/store / LocalStorage / API / 数据库 / 新依赖 / AdminDrawer / AdminActionMenu / AdminStatusTag / AdminEmptyState / 0010 Phase 2。
- 保护清单（0011 用户信息、五个 Tab、操作条四入口、overview Tooltip/hover、旅程、客资有效性、通话 13 列、分配 2 列、门店客户 52 列、Requirement 体系、shared/admin API、StatusTags.tsx、requirements.json 等）均有回归测试保留覆盖。

### C 级验收修正（2026-08-12）

产品经理 C 级页面验收提出的 3 项视觉问题已修复（本轮未进入 Cycle B）：

1. 是否成交 状态：新增 `record-shared/DealStatusTag`，已成交 绿色 Tag（`#52c41a`/`#f6ffed`/`1px solid #b7eb8f`）、未成交 橙色 Tag，与既有状态 Tag 统一 borderRadius 4 / margin 0；到店列由 `DealTag` 换用 `DealStatusTag`。未修改 `StatusTags.tsx`（0011 冻结），未改字段值与业务判断。
2. 意向度 显示：到店/拜访列表列改为纯数字文本（`render: (v: number) => String(v)`，无前缀、无 Tag、无彩色）；跟进旅程卡 `意向度N` 蓝色 Tag（`IntentLevelTag`）保持不变，按列/旅程卡职责拆分，未全局删除组件。
3. 操作列：到店/拜访操作列改为 操作 按钮 + Dropdown（视觉复用 `.store-customer-operation-btn`：白色/极浅背景、浅灰边框、小尺寸后台按钮 + CaretDownIcon）。到店菜单 编辑/变更记录（`ARRIVAL_OPERATION_ITEMS`），拜访菜单仅 编辑（`VISIT_OPERATION_ITEMS`），顺序固定；点击菜单项为 Cycle B 占位 no-op，仅关闭菜单，不打开 Drawer、不 Mock 写回、不弹 toast。新增 `record-shared/RecordOperationButton`。
4. 共享关系：通话记录操作列维持 0011 的"详情"链接（`RecordOperationVisual` 保留、仅通话记录消费）；到店/拜访独立页与跟进详情 Tab 因共享 columns 自然同步，未形成双源，未创建 `AdminActionMenu`，未修改 `shared/admin`。

### 待办

- 产品经理 C 级修复后复验（门店客户 52 列 / 到店 32 列 / 拜访 19 列 / 菜单切换 / 独立页筛选导出）。
- 复验确认后进入 Cycle B（单一运行时数据源、create/edit Drawer、客资来源变更记录只读抽屉、新增入口）。

## 22. Cycle B 第一阶段执行记录

执行日期：2026-08-12
分支：`feature/0012-arrival-visit-modules`
任务模式：M3-S（轻量通用修复/模块化范围）；UI 验收：C 级（真实系统像素参考），默认 A 级结构。

### 已交付

1. 编辑 Drawer（edit）：
   - `VisitRecordDrawer`：右侧 Drawer、宽度 50vw、标题「编辑拜访记录」、`data-req-id="visit-record-edit-drawer"`；「用户信息」只读（姓名/客资来源/注册时间）；「拜访信息」按 §7.5 严格顺序 7 字段：*拜访方式（系统外呼/自主拨打/企微/微信，历史枚举）*拜访时间（DateTimeField）*意向度（InputNumber 1–5 数字步进）*改善需求（10 项多选）*意向课程（7 项单选）下次拜访时间（可空 DateTime，回填/修改/清空，空值显示 `--`，格式 `YYYY-MM-DD HH:mm:ss`）拜访备注（多行）；页脚 取消/确定，确定校验必填后 `updateVisitRecord` 原位写回并关闭。
   - `ArrivalRecordDrawer`：右侧 Drawer、宽度 50vw、标题「编辑到店记录」、`data-req-id="arrival-record-edit-drawer"`；「用户信息」只读；「到店信息」按 §6.5 严格顺序 8 字段：*预约门店 体验课（只读关联：状态/体验课编号/课程名称/合同课卡编号，仅用现有 Mock，无真实合同业务）*到店时间 *意向度 *改善需求 *意向课程 预约备注，当前状态只读展示 已到店/未到店 + 已成交/未成交 Tag；底部独立「结果分析」分区（普通业务字段，与其他到店字段一起保存，非独立实体/流程/子模块）；确定校验必填后 `updateArrivalRecord` 原位写回并关闭。
2. 单一运行时状态（§9.2）：`record-shared/recordRuntimeStore.tsx` 的 `RecordRuntimeStoreProvider` 挂在产品层共同祖先 `StoreCustomerList`（`RequirementViewProvider` 内包裹），覆盖 独立到店页 / 独立拜访页 / 门店客户跟进详情两个记录 Tab，三消费者读同一份 state 实例；API 含 `getArrivalRecords/getVisitRecords/getArrivalRecordsByCustomerKey/getVisitRecordsByCustomerKey/updateArrivalRecord/updateVisitRecord`；`useRecordRuntimeStore` 无 Provider 时严格抛错。刷新恢复初始 Mock，不持久化（无 LocalStorage/API/数据库/新依赖）；create 保留无入口（§8 冻结）。
3. 编辑入口接线：`record-shared/RecordEditActionsContext` + `RecordOperationCell` 把列表「操作」菜单的「编辑」项接到产品层 `openArrivalEdit/openVisitEdit`；拜访/到店独立页与跟进详情 Tab 操作列均打开同一对编辑 Drawer；「变更记录」菜单项保留但本期不实现，无「开发中」提示。
4. 用户信息关联：记录新增稳定 `customerKey` 字段（与客户主数据仅通过稳定 key 关联，数据仍分离）；产品层按 `allData.find(c => c.key === record.customerKey)` 取 姓名/客资来源/注册时间（`createTime`）传入只读区。
5. 无 dayjs 方案：`record-shared/DateTimeField` = 可编辑 Input（字符串 `YYYY-MM-DD HH:mm:ss`，可清空）+ 后缀日历 Popover 内非受控 DatePicker（onChange 第二参 `dateString` 写回），全程不 import dayjs、不构造 Dayjs 实例。
6. Storybook：拜访 3 个编辑 Drawer 故事（编辑拜访记录默认回填 v1 / 下次拜访时间有值 v3 / 下次拜访时间为空 v2）+ 到店 4 个（编辑到店记录默认回填 a1 / 已到店未成交 a2 / 结果分析有值 a4 / 结果分析为空 a7），均渲染真实组件（`StoreCustomerList` + `initialRecordEdit` 打开真实 Drawer）。
7. 测试：新增 拜访编辑交互 11 项（操作→编辑打开、标题/50vw、用户信息只读、7 字段回填、下次拜访时间回填/修改/清空、保存后独立页列表同步、改善需求/意向课程切换同步、取消不保存、跟进详情 Tab 同步、独立页+跟进详情同时挂载两端同步）、到店编辑交互 9 项（同口径，含 状态 Tag、体验课关联、结果分析回填/修改/为空、结果分析列同步、预约门店/到店时间/意向度同步）、store 5 项（初始化/按客户归集/原位更新即时反映/刷新恢复初始/无 Provider 抛错）；更新独立页与跟进详情既有测试接入 store Provider。全量 464 项测试通过。
8. 验证六项全部通过：`pnpm lint`（0 error 0 warning）、`pnpm typecheck`、`pnpm test`（464 项）、`pnpm build`、`pnpm build-storybook`、`git diff --check`。

### 说明与限定

- 修复了编辑回填时序缺陷：原 `wasOpen` ref 在 Drawer 挂载即打开（`initialRecordEdit` / 工作台点击后立即 open）时不会触发回填；改为「按记录 key + 关闭复位」的 refill 逻辑（`refilledKey`），挂载即打开、重开、切换记录均重新回填，同一记录编辑中数据变化不覆盖用户草稿。
- `VISIT_WAY_EDIT_OPTIONS` 移入 `record-shared/recordFormOptions.ts` 与改善需求/意向课程枚举同源；`recordRuntimeStore.tsx` 采用仓库既有 `eslint-disable react-refresh/only-export-components` 约定（与 requirement-view 同类模块一致）。
- 保护清单零改动：到店 32 列顺序、拜访 19 列顺序、下次拜访时间第 7 列、筛选区、导出、分页、菜单布局、Cycle A 页面骨架、跟进流程、跟进概览、跟进旅程、通话 13 列、分配 2 列、门店客户 52 列、Requirement、无效审批、新办成交金额、shared/admin 均未修改；`callRecordColumns.tsx`、`StoreCustomerList.css`、`FollowUpProcess.tsx`、`followUpMockData.ts` 的既有差异均为 Cycle A 导入/样式迁移，本轮未再改动。
- 未实施（§8/§10 冻结确认）：`ArrivalChangeRecordDrawer`（变更记录仅保留菜单项）、新增到店/新增拜访 create 入口、提醒、今日待办、系统外呼联动、0010 Phase 2、`shared/admin` 修改、新依赖。

### 待办

- 产品经理对 Cycle B 第一阶段（两个编辑 Drawer）进行真实页面验收；确认后按 §3.2 进入 Cycle B 后续阶段（到店变更记录只读 Drawer、create 入口等，另行排期）。

### C 级截图级视觉复刻修正（2026-08-12）

产品经理真实页面验收结论：编辑 Drawer 视觉还原度不足，C 级不通过。本轮仅做视觉复刻修正，不新增业务，两个 Drawer 统一真实系统视觉语言（共享 `record-shared/recordDrawer.css` 单一来源）：

1. Drawer：宽度维持 50vw，白底、标题普通字重（15px/500）右上角关闭、标题下方留白；正文 `padding: 8px 24px 40px`，表单只占左/中部一小块，右侧保留大片空白。
2. Section 标题：左侧 2px × 15px 短蓝竖线 + 8px 间距，14px/500 文字，非大块标题条；分区上下间距 28px。
3. 用户信息：由三列平铺改为两行文本（第一行 姓名 | 客资来源，第二行 注册时间），简单文本、行间留白，无 Card/Description/灰色信息框。
4. 表单：横向 `label|control`，label 固定 96px 右对齐，每行独立、字段间距 20px；控件不铺满（单下拉 160px、多选 200px、日期时间 200px、备注 210px，约 360px 表单区）。
5. 意向度：由普通 InputNumber 改为三段式步进器 `[－] 值 [＋]`（`record-shared/IntentLevelStepper`，浅灰边框、中间白底、左右浅灰按钮，范围 1–5，中间保留 `role=spinbutton` 可编辑输入保证无障碍与既有测试）。
6. 确定/取消：移除 sticky footer，改为表单主体下方正文按钮（`record-drawer-actions`，对齐控件列、间距 36px），小按钮 确定 蓝 / 取消 白。
7. 到店特殊：状态 Tag（已到店 蓝浅底 / 未成交 橙浅底）移至「到店信息」标题行右侧（`record-drawer-section-head`）；体验课改为一行只读关联信息（状态 | 体验课编号 | 课程名称 | 合同课卡编号蓝色链接），非 Card/大输入框；「结果分析」独立分区位于确定/取消按钮下方，保持较大间距。
8. 测试：新增 `record-shared/__tests__/RecordDrawerLayout.test.tsx` 3 项结构断言（50vw、两行用户信息、横向 label|control、窄控件包装、步进器与边界 1~5、无 sticky footer、窄 textarea、状态 Tag、结果分析同抽屉），避免像素级硬断言；既有功能测试 20 项（拜访 11 + 到店 9）全部继续通过，最终全量 467 项测试通过。
9. 验证六项全部通过：`pnpm lint`、`pnpm typecheck`、`pnpm test`（467 项）、`pnpm build`、`pnpm build-storybook`、`git diff --check`。
10. 未新增业务：updateVisitRecord/updateArrivalRecord/Provider/store/下次拜访时间业务逻辑/结果分析业务逻辑/19 列/32 列/Mock 结构/操作菜单/菜单布局/筛选/分页均未改动；未新增 create 入口、未做变更记录 Drawer、未修改 `shared/admin`。
