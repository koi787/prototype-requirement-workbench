# 需求数据结构

正式需求的运行时校验由 `src/requirements/schemas/` 中的 Zod Schema 提供，本文件解释字段语义。页面组件只接收需求 ID 或展示所需数据，不直接保存正式需求内容。

## 正式需求字段

| 字段 | 类型 | 约束 | 含义 |
| --- | --- | --- | --- |
| `id` | StableId | 必填，全局唯一 | 全局稳定需求 ID |
| `title` | string | 必填，trim 后非空 | 需求标题 |
| `product` | StableId | 必填 | 产品稳定 ID |
| `module` | StableId | 必填 | 主归属模块稳定 ID |
| `involvedModules` | StableId[] | 必填，≥1 项，去重，含 module | 涉及模块 ID 列表 |
| `requirementBatch` | StableId | 必填 | 所属需求批次 ID |
| `involvedPages` | StableId[] | 必填，≥1 项，去重 | 涉及页面 ID 列表 |
| `status` | RequirementStatus | 必填 | 当前处理状态 |
| `priority` | RequirementPriority | 必填 | 优先级 |
| `background` | string | 必填，trim 后非空 | 背景与问题来源 |
| `description` | string | 必填，trim 后非空 | 当前需求描述 |
| `trigger` | string | 必填，trim 后非空 | 触发条件 |
| `businessRules` | string[] | 必填，可为空，禁止空字符串占位 | 业务规则列表 |
| `exceptionRules` | string[] | 必填，可为空，禁止空字符串占位 | 异常与边界规则列表 |
| `permissionRules` | string[] | 必填，可为空，禁止空字符串占位 | 权限规则列表 |
| `interactionResult` | string | 必填，trim 后非空 | 操作后的界面和数据结果 |
| `acceptanceCriteria` | string[] | 必填，≥1 项，禁止空字符串占位 | 可验证的验收标准列表 |
| `pendingQuestions` | string[] | 必填，可为空，禁止空字符串占位 | 待确认问题列表 |
| `referenceImages` | ReferenceImage[] | 必填，可为空 | 引用图片元数据列表 |
| `relatedRequirementIds` | StableId[] | 必填，可为空，去重，禁止自关联 | 关联需求 ID 列表 |
| `anchors` | Anchor[] | 必填，可为空 | 稳定锚点定义列表 |
| `createdAt` | ISO 8601 | 必填，带时区 | 创建时间 |
| `updatedAt` | ISO 8601 | 必填，带时区，≥ createdAt | 更新时间 |
| `publishedVersion` | string \| null | 必填 | 已发布版本号（v{major}.{minor}.{patch}）或 null 表示未发布草稿 |

## StableId 格式

- 只允许小写英文（a-z）、数字（0-9）和短横线（-）
- 不允许短横线开头
- 不允许短横线结尾
- 不允许连续短横线
- 合法示例：`demo-submit-button`
- 非法示例：`-demo-button`、`demo-button-`、`demo--button`

## 枚举

### 需求状态（RequirementStatus）

- `draft` — 草稿
- `pending-confirmation` — 待确认
- `confirmed` — 已确认
- `developing` — 开发中
- `testing` — 测试中
- `completed` — 已完成
- `deprecated` — 已废弃

### 优先级（RequirementPriority）

- `P0` — 最高优先级
- `P1`
- `P2`
- `P3`
- `P4`
- `P5` — 最低优先级

### element 元素类型（ElementKind）

- `button` — 按钮
- `input` — 输入框
- `select` — 选择器
- `label` — 标签
- `table-field` — 表格字段
- `other` — 其他元素

### region 区域类型（RegionKind）

- `filter` — 筛选区
- `form` — 表单区
- `table` — 表格区
- `modal` — 弹窗区
- `other` — 其他区域

## 模块归属规则

- `module` 表示需求的主归属模块 ID，用于目录归属、负责人识别和默认筛选。
- `involvedModules` 表示需求实际涉及的全部模块 ID。
- `involvedModules` 是必填数组，至少包含一个稳定模块 ID，不得重复。
- `involvedModules` 必须包含 `module` 指定的主归属模块。
- 跨模块需求仍只有一个主归属模块，其余涉及模块通过 `involvedModules` 表达。

## 跨字段校验

正式需求 Schema 通过 Zod `superRefine` 实现以下跨字段校验。
重复项错误路径定位到后出现的重复项具体数组索引或对象字段，第一次出现的值保留为合法来源。

| 校验规则 | 错误路径 | 说明 |
| --- | --- | --- |
| involvedModules 含 module | `["involvedModules"]` | involvedModules 必须包含主归属模块 ID |
| involvedModules 去重 | `["involvedModules", index]` | 数组内不得有重复模块 ID |
| involvedPages 去重 | `["involvedPages", index]` | 数组内不得有重复页面 ID |
| relatedRequirementIds 去重 | `["relatedRequirementIds", index]` | 数组内不得有重复需求 ID |
| relatedRequirementIds 禁止自关联 | `["relatedRequirementIds", index]` | 不得包含当前需求自身 ID |
| businessRules 去重 | `["businessRules", index]` | 规则值不得重复（基于 trim 后值比较） |
| exceptionRules 去重 | `["exceptionRules", index]` | 异常规则值不得重复 |
| permissionRules 去重 | `["permissionRules", index]` | 权限规则值不得重复 |
| acceptanceCriteria 去重 | `["acceptanceCriteria", index]` | 验收标准值不得重复 |
| pendingQuestions 去重 | `["pendingQuestions", index]` | 待确认问题值不得重复 |
| anchors 按 id 去重 | `["anchors", index, "id"]` | 锚点 id 不得重复 |
| referenceImages 按 id 去重 | `["referenceImages", index, "id"]` | 图片 id 不得重复 |
| updatedAt ≥ createdAt | `["updatedAt"]` | 更新时间不得早于创建时间 |

### 锚点嵌套的完整路径 vs 局部路径

上表中 `anchors`、`referenceImages` 相关校验的错误路径是锚点在 `requirementSchema` 中嵌套时的**完整路径**（Zod 自动将数组外层路径与锚点内部路径拼接）。

当**独立调用**锚点 Schema（如 `multiAnchorSchema.safeParse(...)`）时，错误路径为**局部路径**，不含外层的 `["anchors", anchorIndex]` 前缀：

| 锚点类型 | 校验项 | 独立调用时的局部路径 | 嵌套在 requirementSchema 中的完整路径 |
| --- | --- | --- | --- |
| multi-anchor | item.id 重复 | `["items", index, "id"]` | `["anchors", anchorIndex, "items", index, "id"]` |
| multi-anchor | (page, dataReqId) 组合重复 | `["items", index, "dataReqId"]` | `["anchors", anchorIndex, "items", index, "dataReqId"]` |
| virtual-region | fallbackDataReqIds 重复 | `["fallbackDataReqIds", index]` | `["anchors", anchorIndex, "fallbackDataReqIds", index]` |

测试应覆盖两种调用方式，分别断言局部路径和完整路径。

## 锚点结构

所有锚点只共享公共字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `id` | StableId | 锚点记录的稳定 ID |
| `type` | 'element' \| 'region' \| 'virtual-region' \| 'multi-anchor' \| 'state-anchor' | 锚点类型判别字段 |
| `description` | string | 锚点语义说明 |
| `autoScroll` | boolean | 选择需求后是否自动滚动到锚点 |
| `focusHighlight` | boolean | 选择后是否聚焦高亮 |

### 目标型锚点

`element`、`region`、`virtual-region` 和 `state-anchor` 是目标型锚点，除公共字段外必须包含：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `page` | StableId | 目标所属页面稳定 ID |
| `dataReqId` | StableId | DOM `data-req-id` 或页面运行时注册的稳定标识 |

### element

用于按钮、输入框、标签、表格字段等独立元素。通过 `page` 和 `dataReqId` 定位。

可选字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `elementKind` | ElementKind | 受控元素类型枚举 |

### region

用于筛选区、表格区、表单区、弹窗区等容器。通过容器的 `page` 和 `dataReqId` 定位。

可选字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `regionKind` | RegionKind | 受控区域类型枚举 |

### virtual-region

用于没有独立 DOM 容器但由页面运行时注册的语义区域。`dataReqId` 是运行时注册标识。

可选字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `fallbackDataReqIds` | StableId[] | 关联的稳定备用锚点，不得重复，重复时错误路径为 `["fallbackDataReqIds", index]` |

### multi-anchor

根对象只包含公共字段和 `items`，**不包含** `page` 或 `dataReqId`。

| 字段 | 类型 | 约束 |
| --- | --- | --- |
| `items` | MultiAnchorSubItem[] | 至少 2 个子项 |

每子项字段：

| 字段 | 类型 | 约束 |
| --- | --- | --- |
| `id` | StableId | 子项稳定 ID |
| `page` | StableId | 目标所属页面稳定 ID |
| `dataReqId` | StableId | 目标元素或运行时注册区域的稳定 ID |
| `description` | string | 目标语义说明 |

校验规则：

- 子项只表示稳定目标引用，不允许递归包含另一个 multi-anchor
- 同一根对象内 `item.id` 不得重复，重复时错误路径为 `["items", index, "id"]`
- 同一根对象内 `(page, dataReqId)` 组合不得重复，重复时错误路径为 `["items", index, "dataReqId"]`
- 子项使用 `strictObject` 拒绝未知字段

### state-anchor

用于先切换页面状态再定位目标。除目标型锚点字段外，必须包含 `targetState`。

targetState 字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `key` | StableId | 稳定状态键 |
| `value` | string \| number \| boolean \| null | 目标状态值 |
| `description` | string | 目标状态说明 |

第一阶段 `value` 只允许 `string`、`number`、`boolean` 或 `null`，不得使用 `object`、`array` 或其他复杂类型。状态切换后仍通过 `page` 和 `dataReqId` 定位。

### 严格坐标禁止

所有正式锚点**不得使用**页面绝对坐标，包括但不限于：
`x`、`y`、`top`、`left`、`right`、`bottom`、`width`、`height`、`rect`、`selector`、`xpath`、复杂 CSS 选择器或其他绝对页面坐标字段。

所有锚点 Schema 使用 `strictObject`，未知字段（包括坐标字段）会直接导致校验失败。

## 图片元数据（ReferenceImage）

| 字段 | 类型 | 约束 |
| --- | --- | --- |
| `id` | StableId | 必填 |
| `src` | string | 必填，资源路径 |
| `alt` | string | 必填，替代文本 |
| `title` | string | 可选 |
| `description` | string | 可选 |

所有嵌套对象（referenceImage、multi-anchor item、targetState、各具体锚点）均使用 `strictObject` 拒绝未知字段。

## TypeScript 类型

所有 TypeScript 类型通过 `z.infer<typeof schema>` 从 Zod Schema 推导，不维护重复的手工 interface 或联合类型。

主要导出类型：

- `Requirement` — 正式需求
- `RequirementStatus` — 需求状态
- `RequirementPriority` — 优先级
- `StableId` — 稳定 ID
- `Anchor` — 锚点联合类型
- `ElementAnchor`、`RegionAnchor`、`VirtualRegionAnchor`、`MultiAnchor`、`StateAnchor`
- `MultiAnchorSubItem` — multi-anchor 子项
- `StateAnchorTargetState` — state-anchor.targetState
- `ReferenceImage` — 图片元数据
- `ElementKind`、`RegionKind` — 受控枚举

类型和 Schema 统一从 `src/requirements/schemas/index.ts` 导出。

## 只读需求说明模型（Requirement View）

`src/requirements/products/` 下的 JSON 是"页面只读需求说明模型"，用于快速展示产品经理维护的结构化说明，不是 `requirementSchema` 的替代品，也不直接写入正式需求批次。

### 字段

| 字段 | 类型 | 约束 |
| --- | --- | --- |
| `requirementNo` | string | 必填，trim 后非空 |
| `requirementName` | string | 必填，trim 后非空 |
| `status` | `'已确认' \| '部分确认' \| '待确认' \| '' \| null` | 可缺失，缺失/null/空字符串展示为"待确认" |
| `definition` | `string \| null` | 可缺失 |
| `dataSource` | `string \| null` | 可缺失 |
| `rule` | `string \| null` | 可缺失 |
| `remark` | `string \| null` | 可缺失 |

### 与正式 Requirement 的关系

- 只读需求说明模型用于页面抽屉快速展示，字段更少、规则更简单。
- 正式 Requirement 用于需求批次、版本管理和跨需求关联，要求完整字段。
- 两者独立 Schema、独立校验，不得互相迁就。
- 若后续需要转换为正式 Requirement，必须另行补齐正式 Schema 要求的全部字段和版本信息。

专用 Schema 位于 `src/requirements/schemas/requirement-view.ts`。

## 版本与历史

正式需求批次不得因当前页面变化而覆盖。后续调整使用版本记录或追加变更记录。评审评论使用独立 Schema，不能自动转为正式需求。
