# 0014｜员工 / 组织架构

## 0. 需求确认卡

- **任务模式**：M2｜标准业务页面模式。
- **业务目标**：在 0013 已发布的 SCRM 多业务域骨架上，交付第二个真实一级业务域“员工”及其“组织架构”页面，完成组织树、员工列表与员工新增/编辑的前端 Runtime Mock 闭环。
- **修改范围**：新增 `employee-management/organization` 业务模块；启用“员工 → 组织架构”菜单；注册 `employee-organization` 页面；完成页面专用 Story、测试和 CSS；按现状补齐产品壳进入第二业务域所需的最小导航动作。
- **明确不做**：不做角色列表或角色权限树，不做组织增删改/拖拽，不接后端、数据库、LocalStorage、真实上传、真实注销或消息服务，不修改潜客管理业务，不启动 0010 Phase 2。
- **业务规则**：组织节点过滤员工；员工列表固定 10 列；编辑与新增共用 `EmployeeDrawer`；编辑员工编号只读；岗位遵守已确认互斥规则；保存只更新当前前端运行时状态。
- **UI 等级**：C｜产品经理提供的真实后台截图是唯一主要视觉基线，不得自由重设计。
- **验收标准**：可由 SCRM 左侧菜单进入“员工 → 组织架构”；页面只有一套产品壳；组织树、筛选、10 列表格和 Runtime 交互正确；组织架构不经过 `ProspectManagementRoot`；0011—0013 与 52 / 32 / 19 列无回归；完整门禁通过。

## 1. 状态、基线与任务边界

正式实施基线：

```text
main
821d59d09272380c683cd5ef8e45f6fd25becc6b
```

0014 未来的 feature 分支必须从上述当前最新 `main` 创建。该基线已包含 0013 正式发布内容以及随后正式提交的“无效客资审核展示文案统一” M1 小修；`555377e4b1e36f4e5f41483c1318eef640599a15` 不再作为 0014 开发基线。

0013 已正式发布并冻结。它已提供：

- `ScrmWorkspace` 产品级组合根；
- `SCRM_MENU` 产品菜单唯一真值；
- `SCRM_PAGE_REGISTRY` 产品页面注册表；
- `employee-management` / `employee-organization` 类型预留；
- 产品级唯一 page outlet；
- 员工页面绕过潜客业务根的测试 fixture；
- 位于页面出口上方的稳定产品 Provider。

0014 是第一次用该骨架接入真实第二业务域。本任务属于当前产品页面新增，不是基础设施重写，也不是 0010 Phase 2。

任务单阶段只创建本文档；不得开发业务代码、修改 Story/navigation、执行 Git 写操作或恢复旧 stash。

## 2. 真实业务路径与角色列表边界

正式产品路径：

```text
SCRM
└─ 员工
   └─ 组织架构
```

“组织架构”归属“员工”，不得放到“系统管理”。真实后台“员工”域后续还包含“角色列表”，但严格拆分为：

```text
0014｜员工 / 组织架构
0015｜员工 / 角色列表
```

0014 不开发：

- 角色列表；
- 新增、编辑、删除角色；
- 多端菜单权限树；
- 角色 Runtime store；
- 任何角色 CRUD。

本任务“绑定角色”仅从稳定 Mock 角色枚举中选择，并只保存 `EmployeeRecord.roleIds`。

## 3. 0013 架构接入关系与当前调查结论

### 3.1 目标调用链

```text
ScrmWorkspace
→ activePage = employee-organization
→ normalizePageKey
→ SCRM_PAGE_REGISTRY
→ OrganizationPage
→ AdminShell.content
```

组织架构页面不得经过：

- `StoreCustomerListInner` / `ProspectManagementRoot`；
- 潜客审批；
- FollowUpDetail；
- ArrivalRecordDrawer；
- VisitRecordDrawer；
- ArrivalChangeRecordDrawer。

`StoreCustomerList` 可继续作为既有 Story 的兼容产品入口并负责加载当前壳样式，但 registry 选择 `employee-organization` 后必须直接输出 `OrganizationPage`，不得把它包进潜客业务根。

### 3.2 产品层接线

`scrmMenuConfig.ts`：

- 新增并启用一级菜单 `员工`；
- `moduleKey = employee-management`；
- `defaultPageKey = employee-organization`；
- 二级菜单 `组织架构`；
- 二级菜单 `pageKey = employee-organization` 且可点击；
- 角色列表不得提前作为可见/可点击入口；若未来需要预留，只能保持不可见或禁用，不生成空页。

`scrmPageRegistry.tsx`：

- 注册 `employee-organization → OrganizationPage`；
- `moduleKey = employee-management`；
- 优先保持 `pageKey → render/page content` 的轻量注册职责；
- 如果 `scrmPageRegistry.tsx` 直接 import `OrganizationPage` 不会产生运行时循环依赖，允许直接注册并渲染该自包含业务页；
- 如果直接 import 会形成 `navigation` / `shell` / `employee-management` 之间的运行时循环，不得强行直接 import，必须使用产品层 `renderContext` / slot 等 0013 现有架构兼容方式接入 `employee-organization`；
- 无论采用直接注册还是兼容接入，真实调用链都必须满足 `ScrmWorkspace → employee-organization → OrganizationPage`，不增加潜客 slot，且绝对不得经过 `StoreCustomerList`、`ProspectManagementRoot` 或 `prospect-management` 业务根；
- 不得为解决循环依赖修改 `prospect-management`；
- registry 继续只做映射，不创建 Provider、Drawer、权限、Router、Mock 或生命周期。

`scrmNavigationTypes.ts` 已包含 `employee-management` 和 `employee-organization`，正常情况下无需修改。

### 3.3 当前壳的真实缺口与限定调整

调查发现当前 `ScrmWorkspace`：

1. 只有当前活动业务域的二级菜单会展开；
2. 一级菜单行本身没有导航动作；
3. 因而从“潜客管理”状态无法通过点击尚未激活的“员工”一级菜单进入其默认页面。

0014 允许对 `ScrmWorkspace.tsx` 做一次最小机械接线：当一级节点 `enabled` 且存在 `defaultPageKey` 时，点击一级节点调用现有 `navigate(defaultPageKey)`，从而激活员工域并展开“组织架构”。不得借此重写菜单、AdminShell、Provider 或 CSS。

必须新增真实测试证明：

```text
潜客管理
→ 点击员工
→ activePage = employee-organization
→ 员工二级菜单展开且组织架构选中
→ OrganizationPage 出现
→ 潜客业务 DOM / Drawer 不挂载
```

如果实现组织架构仍要求修改 `src/products/scrm/modules/prospect-management/`，立即停止并报告，视为 0013 边界回归。

## 4. 页面整体结构

组织架构是产品内容区内的双栏业务页面，不是第二套产品壳：

```text
ScrmWorkspace
└─ OrganizationPage
   ├─ OrganizationTree（左栏）
   └─ EmployeeListArea（右栏）
      ├─ 筛选区
      ├─ 新增员工
      └─ EmployeeTable
```

参考布局：

```text
┌─────────────────┬────────────────────────────────────┐
│ 组织架构树       │ 搜索 / 岗位 / 角色 / 在职状态       │
│ 奥本集团         │                         新增员工     │
│ ├─ 总裁办        │                                    │
│ ├─ 财务中心      │ 员工列表                            │
│ ├─ 人力行政中心  │                                    │
│ │  ├─ 人力资源部 │                                    │
│ │  └─ 行政管理部 │                                    │
│ └─ ...           │                                    │
└─────────────────┴────────────────────────────────────┘
```

禁止：

- 创建第二套 SCRM Sidebar、TopBar、Tabs 或 AdminShell；
- 把组织树改成顶部 Select；
- 把页面改成卡片 Dashboard；
- 把 EmployeeDrawer 改为 Modal；
- 修改 `src/products/scrm/shared/admin/` 来适配本页。

## 5. 组织树

稳定 Mock 组织结构至少表达：

```text
奥本集团
├─ 总裁办
├─ 财务中心
├─ 人力行政中心
│  ├─ 人力资源部
│  └─ 行政管理部
├─ 采购中心
├─ 研发中心
├─ 品牌营销中心
├─ 咖啡运营中心
├─ 运营中心
├─ 招商加盟中心
├─ 奥本学院
└─ 集团客服号
```

本任务只实现：

- 展开/收起；
- 选择节点；
- 当前节点选中态；
- 按 `organizationId` 过滤员工列表。

不实现新增、编辑、删除、拖拽、层级调整、右键菜单、组织权限和后端组织接口。

“父节点是否包含全部下级员工”待确认。未确认时 Cycle A 使用最小规则：选择节点只显示该节点直接归属员工，不做递归聚合。

## 6. 员工列表筛选区

右侧主区域顶部固定以下筛选项：

1. **搜索**：输入框，占位文案“姓名 / 手机号 / 员工编号”；匹配 `name`、原始 `mobile`、`employeeNo`。
2. **岗位**：Select。
3. **角色筛选**：Select。
4. **在职状态**：Select，默认“在职”。
5. **操作**：搜索、重置。

规则：

- 筛选状态由 OrganizationPage 管理，不交给 FilterBar；
- “搜索”应用当前待筛选条件；
- “重置”恢复搜索为空、岗位/角色为空、在职状态为“在职”；
- 组织节点筛选与筛选区条件同时生效；
- 至少支持“在职”和“离职/非在职”，不擅自扩展枚举；
- 无结果显示真实后台风格空态，不创建 `AdminEmptyState`。

可复用 `FilterBar` / `FilterField` / `FilterActions` 的薄布局能力；如果其现有 `store-customer-*` 样式与 C 级截图不匹配，优先在组织架构模块内做业务专用筛选布局，不修改公共组件。

## 7. 新增员工入口

- 主按钮文案：`新增员工`；
- 蓝色主按钮；
- 位于员工列表主区域右上方；
- 点击打开 `EmployeeDrawer` 的 create 模式；
- create 和 edit 必须复用同一个真实业务 Drawer，不得复制两套表单。

接口建议：

```ts
type EmployeeDrawerProps = {
  mode: 'create' | 'edit';
  open: boolean;
  employee?: EmployeeRecord | null;
  onCancel: () => void;
  onSubmit: (draft: EmployeeDraft) => void;
};
```

create 模式字段范围以 edit 已确认字段为上限；缺乏截图依据时不得添加额外字段。

## 8. EmployeeTable 固定 10 列

严格顺序：

1. ID
2. 姓名
3. 启用状态
4. 员工编号
5. 手机号
6. 业绩门店
7. 岗位
8. 更新时间
9. 操作人
10. 操作

字段规则：

- `ID`、`employeeNo` 使用稳定 Mock 值；
- 手机号以 `139****1234` 形式脱敏，筛选仍匹配原始手机号；
- 岗位允许多个，按真实截图密度展示，不改变字段语义；
- 启用状态使用截图尺寸的绿色 Switch；
- Switch 切换更新当前 Employee Runtime Mock；
- 空值统一 `--`；
- 操作列固定右侧仅在截图或横向宽度确需时使用，不凭空增加横向滚动；
- 表格可复用 `AdminDataTable`，列定义和业务 render 保留在 employee-management；
- 分页只按真实截图实现；如截图存在分页，可复用 `AdminPagination`，不得让公共组件接管员工数据切片。

必须同时测试共享列定义顺序和真实渲染 DOM 表头顺序，不能只断言数组。

## 9. 操作菜单

点击“操作”后只能出现：

1. 编辑（蓝色）
2. 注销登录（红色）
3. 消息测试（蓝色）

不得新增其他操作。

- **编辑**：打开 `EmployeeDrawer(mode="edit")`。
- **注销登录**：只做原型反馈，不实现 Token、Session、认证或 API。建议使用 Ant Design 既有确认能力表达破坏性动作，但是否需要二次确认必须由产品经理在 Cycle B 前确认；未确认不得把建议当成正式业务规则。
- **消息测试**：只做原型反馈，不接企微、短信、Push 或后端消息服务。

不得为此创建 `AdminActionMenu` 或公共反馈系统。

## 10. EmployeeDrawer

### 10.1 基本行为

- 右侧 Drawer；
- edit 标题固定为 `修改资料`；
- create 标题建议为 `新增员工`，由产品经理在 Cycle B 页面验收确认；
- 宽度、表单密度、Label 布局、滚动区和 Footer 以真实截图 C 级还原；
- Footer：确定、取消；
- 取消关闭且不保存；
- edit 保存更新原员工；
- create 保存向当前员工 Runtime 数据新增一条稳定记录；
- 保存后关闭 Drawer，列表立即同步；
- 不使用 LocalStorage，刷新恢复初始 Mock。

### 10.2 字段

1. **姓名**：必填。
2. **员工编号**：必填；edit 灰色禁用且只读；create 是否可人工填写待确认。
3. **手机号**：必填。
4. **人脸照片**：前端选择/Mock 与预览视觉，不上传到服务，不新增付费能力。
5. **岗位**：必填，多选并遵守互斥规则。
6. **薪酬类型**：必填 Select，稳定 Mock 枚举，示例“业绩提成+基础课时费”；不做薪酬计算。
7. **用户完整手机号**：Switch。
8. **加盟商对账**：Switch。
9. **联营店对账**：Switch。
10. **可登录门店**：必填，左右 Transfer 交互。
11. **业绩门店**：必填，单选 Select。
12. **绑定角色**：必填，多列 Checkbox。

新增员工不得超出上述 edit 字段集合；是否完全复用全部字段列入待确认项。

## 11. 岗位规则

稳定岗位枚举至少包含：

- 瑜伽教练
- 美容师
- 美容顾问
- 店长
- 其他

硬规则：

- 瑜伽教练和美容师只能选择一个；
- 瑜伽教练或美容师可以与其他岗位多选；
- 选择冲突岗位时必须阻止形成非法值，并给出与截图风格一致的最小反馈；
- 不开发岗位管理模块。

测试必须覆盖两个选择顺序：先选瑜伽教练再选美容师、先选美容师再选瑜伽教练。

## 12. 可登录门店 Transfer

使用 Ant Design 现有能力或业务模块内组合实现，不引入第三方 Transfer 插件。

结构：

```text
可添加门店                         已添加门店
数量                               数量
搜索门店                           搜索门店
Checkbox 列表       ← / →          Checkbox 列表
```

必须支持：

- 左右搜索；
- 勾选；
- 加入；
- 移除；
- 已选择状态；
- edit 正确回填；
- 取消不保存；
- 保存写回 `loginStoreIds`。

只使用稳定 Mock 门店，不接门店 API。业绩门店候选来自员工可关联门店 Mock 集合；是否必须属于“可登录门店”待确认，未确认时不增加联动校验。

## 13. 绑定角色

角色以稳定 `roleId + roleName` Mock 提供，选取足以还原多列密度和 Drawer 滚动状态的一组，例如：

```text
美容权限、美容店长、联营使用、地推人员、财务、保洁、PHP程序员、
平台运营经理、培训专家、稽核、美容师、薪酬专员、UI、预售经理、
营销总监、人事经理、销售顾问、采购、瑜伽共享、前台、管家、
财务经理、行政专员、人事招聘主管、区域经理、瑜伽教练、管理员
```

规则：

- Checkbox 多选；
- edit 正确回填；
- 只保存 `EmployeeRecord.roleIds`；
- 不复制角色名称到第二个可变状态源；
- 不开发角色业务页面、权限树或角色 CRUD。

## 14. Runtime Mock 与状态真值

建议模型：

```ts
type OrganizationNode = {
  id: string;
  parentId: string | null;
  name: string;
  children?: OrganizationNode[];
};

type EmployeeRecord = {
  id: string;
  name: string;
  enabled: boolean;
  employeeNo: string;
  mobile: string;
  organizationId: string;
  performanceStoreId: string;
  positionIds: string[];
  roleIds: string[];
  employmentStatus: 'active' | 'inactive';
  updatedAt: string;
  operatorName: string;
  salaryTypeId: string;
  fullMobileVisible: boolean;
  franchiseReconciliation: boolean;
  jointStoreReconciliation: boolean;
  loginStoreIds: string[];
  facePhoto?: string;
};
```

单一真值规则：

- `OrganizationPage` 管理一份员工 Runtime 集合；
- 表格、筛选、Switch 和 Drawer 读写同一集合；
- Drawer draft 只在打开期间存在，取消直接丢弃；
- 组织、岗位、角色、门店、薪酬类型是只读稳定 Mock 枚举；
- 不复制第二份员工身份数据；
- 不使用 LocalStorage、数据库、后端 API、新服务或新依赖；
- 页面刷新允许恢复初始 Mock。

0014 只有一个员工业务页面和一组消费者，不为了未来角色列表提前建设产品级 employee runtime 基础设施。若后续 0015 出现跨页面共享需求，再独立评估状态提升。

## 15. Storybook 归档计划

严格按真实产品菜单归档：

```text
SCRM
└─ 员工
   └─ 组织架构
      ├─ 列表
      │  ├─ 正常列表
      │  ├─ 选择组织节点
      │  ├─ 筛选有结果
      │  └─ 空数据
      ├─ 新增
      │  ├─ 默认状态
      │  └─ 填写后
      └─ 编辑
         ├─ 默认回填
         ├─ 门店选择
         ├─ 多角色
         └─ 多岗位
```

不得出现 `0014`、Cycle、Employee Test、架构测试、Mock 测试、开发状态等开发视角目录。

建议拆分 Story 文件以保持单一 `meta.title`：

- `OrganizationPage.stories.tsx` → `SCRM/员工/组织架构/列表`
- `EmployeeCreate.stories.tsx` → `SCRM/员工/组织架构/新增`
- `EmployeeEdit.stories.tsx` → `SCRM/员工/组织架构/编辑`

所有 Story 复用真实 `OrganizationPage` / `EmployeeDrawer` 和同一 Mock 定义，不复制业务组件或数据模型。完整页面 Story 应通过现有 SCRM 产品工作区进入 `employee-organization`，验证单一 Sidebar/TopBar；Drawer 专项 Story 可以使用业务模块提供的稳定初始参数，但不得另造业务实现。

`.storybook/preview.tsx` 如需调整，只在 `SCRM` 下新增真实排序：

```text
员工 → 组织架构 → 列表 / 新增 / 编辑
```

不得重排“潜客管理”既有 Story。

## 16. shared/admin 复用边界

允许复用已发布且适合本页的：

- `AdminShell`：只能由 `ScrmWorkspace` 继续使用，OrganizationPage 不再创建一套；
- `AdminDataTable`：员工表格薄外壳；
- `AdminPagination`：仅截图存在分页且业务侧保持受控时使用；
- `FilterBar` / `FilterField` / `FilterActions`：仅样式和 DOM 与截图相容时使用。

0014 不得修改 `src/products/scrm/shared/admin/` 的实现、类型或 API，不得新增：

- AdminDrawer；
- AdminActionMenu；
- AdminStatusTag；
- AdminEmptyState；
- 其他 0010 Phase 2 能力。

组织树 + 员工主列表的双栏结构和 EmployeeDrawer 属于 employee-management 业务组件。

## 17. 两个开发闭环

### Cycle A｜组织架构主页面

只完成：

1. `employee-management/organization` 模块骨架、类型和 Mock；
2. 产品菜单正式启用“员工 → 组织架构”；
3. registry 注册 `employee-organization`；
4. 产品壳一级业务域默认页的最小进入动作；
5. OrganizationPage 双栏布局；
6. 组织树展开/收起、选择、选中态和员工过滤；
7. 搜索、岗位、角色、在职状态、搜索/重置；
8. 员工 10 列表格；
9. 启用状态 Runtime Switch；
10. 操作菜单三个项目的视觉与“编辑”入口；
11. 列表相关 Story 和测试。

Cycle A 完成开发侧自检后，先由产品经理按真实截图进行 C 级页面验收。未通过前不得开始 Formal Review。

### Cycle B｜EmployeeDrawer 与运行时闭环

产品经理确认影响交互的待确认项后完成：

1. 同一 EmployeeDrawer 的 create/edit 模式；
2. 姓名、员工编号、手机号、人脸照片视觉；
3. 岗位及互斥规则；
4. 薪酬类型；
5. 三个 Switch；
6. 可登录门店 Transfer；
7. 业绩门店；
8. 绑定多角色；
9. 保存/取消；
10. create 新增与 edit 更新列表；
11. 注销登录和消息测试的已确认原型反馈；
12. 新增/编辑 Story 与完整测试。

Cycle B 完成后再次由产品经理做 Drawer C 级与完整业务验收。产品经理明确同意后，Codex 才执行一次 Formal Review。

## 18. 明确不做

0014 不做：

- 角色列表、新增/编辑/删除角色、多端菜单权限树；
- 组织新增、编辑、删除、拖拽、层级调整、右键菜单、组织权限；
- 后端组织/员工/门店接口、数据库、LocalStorage；
- 真实人脸图片上传服务；
- 登录系统、Token、Session、真实注销；
- 企微、短信、Push、真实消息发送；
- 薪酬计算；
- React Router、Redux、Zustand、新第三方依赖；
- 付费插件、付费元件库或付费托管；
- AdminDrawer、AdminActionMenu、AdminStatusTag、AdminEmptyState；
- 0010 Phase 2；
- Requirement 数据、Schema 或需求批次接入（若后续需要，另行确认）；
- 0015 业务预实现。

## 19. 0011—0013 与其他正式基线保护

不得修改或回退：

- `src/products/scrm/modules/prospect-management/` 全部业务实现；
- 门店客户 52 列及正式顺序；
- 到店记录 32 列；
- 拜访记录 19 列；
- 跟进详情 70vw Drawer、五 Tab、概览、旅程和分页；
- 到店/拜访新增编辑与到店变更记录；
- 无效客资审批状态机；
- `SC-08-10`、`displayNumber 13`、`invalid-customer-flag-column`；
- 新办成交金额规则；
- `RecordRuntimeStoreProvider` 生命周期和运行时状态；
- `RequirementViewProvider` 隔离；
- `src/products/scrm/shared/admin/` 现有 API 与行为；
- 所有既有 Story title、路径和排序；
- 0008 等历史需求批次。

允许的产品层接线不得改变 registry 的纯映射职责，也不得把 employee 页面包进 prospect slot。

## 20. 文件变更计划

### 建议新增

```text
src/products/scrm/modules/employee-management/
└─ organization/
   ├─ OrganizationPage.tsx
   ├─ OrganizationTree.tsx
   ├─ EmployeeTable.tsx
   ├─ EmployeeDrawer.tsx
   ├─ organizationTypes.ts
   ├─ organizationMockData.ts
   ├─ organization.css
   ├─ index.ts
   └─ __tests__/
      └─ organization.test.tsx

src/stories/OrganizationPage.stories.tsx
src/stories/EmployeeCreate.stories.tsx
src/stories/EmployeeEdit.stories.tsx
```

允许按现有代码风格把 columns、纯 formatter 或 Drawer 子区拆成少量业务文件；不得为了目录整齐进行过度组件化。

### 建议修改

- `src/products/scrm/navigation/scrmMenuConfig.ts`：新增并启用员工/组织架构真实菜单。
- `src/products/scrm/navigation/scrmPageRegistry.tsx`：注册 OrganizationPage。
- `src/products/scrm/shell/ScrmWorkspace.tsx`：仅补齐启用一级业务域的 `defaultPageKey` 点击进入动作。
- `src/products/scrm/navigation/__tests__/scrmNavigation.test.tsx`：把员工 fixture 预留测试升级为生产注册与真实绕过潜客根测试，并保留既有守卫。
- `.storybook/preview.tsx`：只增加员工/组织架构真实排序。
- `src/products/scrm/modules/README.md`：登记 employee-management 边界（必要时）。
- `CHANGELOG.md`：实现并验收完成时记录 0014。

### 原则上不修改

- `src/products/scrm/navigation/scrmNavigationTypes.ts`（类型预留已存在）；
- `src/products/scrm/modules/prospect-management/`；
- `src/products/scrm/shared/admin/`；
- 既有 Story 文件；
- requirements、Schema、正式/历史批次；
- `package.json`、`pnpm-lock.yaml`、Vercel 配置。

如果实际 diff 超出以上范围，实施者必须先报告，不得自行扩张。

## 21. 测试计划

### 21.1 产品接入

1. SCRM 菜单存在并启用“员工 → 组织架构”。
2. 点击未激活的“员工”一级菜单进入其 `defaultPageKey`。
3. `employee-organization` production registry 返回 OrganizationPage。
4. OrganizationPage 由 `ScrmWorkspace` 产品 outlet 直接渲染。
5. employee 页面不挂载 `ProspectManagementRoot`、潜客专属 DOM 或潜客 Drawers。
6. “潜客管理 → 员工 → 潜客管理”双向切换可用，active 菜单正确。
7. 页面始终只有一个 Sidebar、TopBar、Tabs 和 AdminShell 根。
8. Requirement 控件/交互不泄漏到组织架构页。

### 21.2 组织树

9. 展开与收起。
10. 组织节点选择。
11. 当前节点选中态。
12. 选择节点后员工列表按 organizationId 真实过滤。
13. 未确认前父节点不递归包含子部门员工。

### 21.3 筛选

14. 姓名、手机号、员工编号搜索。
15. 岗位筛选。
16. 角色筛选。
17. 在职状态默认“在职”及切换。
18. 搜索应用条件。
19. 重置恢复默认。
20. 组织节点与筛选条件组合。
21. 无结果空态。

### 21.4 表格与操作

22. 共享列定义严格 10 列且顺序正确。
23. 真实 DOM 表头严格 10 列且顺序正确。
24. 手机号脱敏但搜索使用原值。
25. 启用 Switch 更新同一 Runtime 员工记录。
26. 多岗位正确展示。
27. 操作菜单仅有编辑、注销登录、消息测试且颜色语义正确。

### 21.5 Drawer

28. edit 正确回填。
29. edit 员工编号禁用且无法修改。
30. create 员工编号遵守产品确认规则。
31. 姓名、手机号及必填校验。
32. 瑜伽教练/美容师双向互斥，其他岗位可共存。
33. 人脸照片 Mock 选择和预览。
34. 三个 Switch 正确回填与保存。
35. Transfer 左右搜索、勾选、加入、移除与回填。
36. 业绩门店选择。
37. 多角色选择与回填。
38. 取消不保存。
39. edit 保存后列表字段即时更新。
40. create 保存后列表新增员工。
41. 注销登录与消息测试只产生已确认的前端反馈。

### 21.6 回归与测试真实性

42. 52 / 32 / 19 列及真实 DOM 顺序保持。
43. FollowUp、审批、到店/拜访/变更记录 Drawers 保持。
44. 0013 Provider create/update 跨业务域保持测试继续通过。
45. 既有 Story title/URL 不变，新增 Story 归档正确。
46. `shared/admin` 无 diff。
47. 不使用 `if (element)`、skip/todo/only、Ant 私有类作为核心业务断言或 `cells[数字]` 表达字段语义。

## 22. C 级验收标准

### Cycle A

- 页面位于唯一 SCRM 壳内，产品菜单可真实进入；
- 左组织树宽度、主内容比例、分隔线与选中态接近截图；
- 筛选区位置、控件宽度、按钮与间距接近截图；
- 新增员工按钮位置正确；
- 表格密度、表头背景、Switch、操作按钮和下拉菜单接近截图；
- 10 列字段、顺序、脱敏、筛选和组织过滤正确；
- 无第二套 Sidebar/TopBar，无潜客业务挂载。

### Cycle B

- Drawer 标题、宽度、滚动、Label 与 Footer 接近截图；
- 字段范围、必填和 edit 员工编号只读正确；
- Transfer 双栏、数量、搜索、Checkbox 和移动按钮接近截图；
- 角色 Checkbox 密度和多岗位状态接近截图；
- 保存、取消、create/edit Runtime 闭环正确；
- 不存在截图之外的猜测字段或真实外部副作用。

功能正确但页面或 Drawer 明显不像真实截图，C 级验收不通过。Codex Review 不代替产品经理的真实页面验收。

## 23. 风险与回滚方案

| 风险 | 最小控制 |
|---|---|
| 员工一级菜单无法从潜客域进入 | 只补 `defaultPageKey` 一级节点导航，并以真实点击测试固定。 |
| OrganizationPage 被潜客根包裹 | production registry 直接输出页面；测试潜客 DOM/Drawer 不挂载。 |
| 组织树被误当第二套 Sidebar | 页面专用 class 与 DOM，禁止 AdminShell/产品导航复制。 |
| C 级截图还原与公共类冲突 | 页面 CSS 留在 organization；不修改 shared/admin，不搬稳定 CSS。 |
| 表单出现多个状态源 | Runtime 员工集合单一真值，Drawer 只有临时 draft。 |
| Transfer 或角色选择被复制 | 同一 EmployeeDrawer create/edit 复用。 |
| 未确认规则被静默实现 | Cycle B 开始前确认影响交互的待确认项。 |
| 0013/潜客管理回归 | 禁止 prospect diff；保留产品导航、Provider、52/32/19 和 Story 回归。 |
| 新文件逃过 whitespace 检查 | 提交前必须执行 `git diff --cached --check`。 |

回滚按两个 Cycle 的独立可验证提交执行：Cycle A 可整体回滚菜单/registry/组织列表闭环；Cycle B 可单独回滚 Drawer/Runtime 交互，不影响 Cycle A 页面。禁止通过 reset、覆盖历史或修改潜客业务完成回滚。

## 24. 待确认项

以下规则不得静默猜测：

1. 选择组织父节点是否包含所有下级部门员工；未确认时只显示当前节点直接员工。
2. create 员工时员工编号是否由用户人工填写。
3. 新增员工 Drawer 是否完整复用编辑字段，还是使用最小子集。
4. 业绩门店是否必须属于可登录门店。
5. 注销登录是否需要二次确认；建议确认，但不先写成正式规则。
6. 消息测试点击后的真实后台反馈形式。
7. 人脸照片在 create/edit 下的具体选择、替换、删除交互。
8. 在职状态的完整真实枚举；当前仅固定“在职 / 离职或非在职”。
9. 启用状态 Switch 是否需要二次确认。

这些事项不阻塞 Cycle A 列表页开发。进入 Cycle B 前必须确认其中会影响表单与操作反馈的项目。

## 25. Git、门禁与发布要求

每个 Cycle 完成相关最小测试；0014 完整交付前执行：

```text
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm build-storybook
git diff --check
```

正式提交前必须把全部合法新增文件精确暂存，再执行：

```text
git diff --cached --check
```

原因：普通 `git diff --check` 不完整覆盖未跟踪文件。任一门禁失败即停止，不提交、不发布。

Git 规则：

- 在独立 `feature/0014-...` 分支开发，不直接在 main 实施；
- task-spec 阶段不得 `git add`、commit、push、merge；
- push、merge main、Production 发布必须另获产品经理明确授权；
- 禁止 force push；
- 禁止 stash pop/apply/drop；
- 保留 `backup: 0010 phase1 before 52-column baseline`；
- 不修改 Vercel 项目、域名、alias 或环境配置。

## 26. 实施停止条件

遇到以下任一情况必须停止并报告：

1. 需要修改 `prospect-management` 才能渲染组织架构；
2. 需要复制第二套 SCRM 壳；
3. 需要修改 `shared/admin` 才能满足页面；
4. 需要新增依赖、后端、数据库、LocalStorage 或真实上传服务；
5. Cycle B 关键待确认项尚未明确且不同选择会改变业务行为；
6. 真实截图与本任务字段、顺序或交互存在冲突；
7. 实际 diff 出现 requirements、历史批次、潜客业务或 package 文件。
