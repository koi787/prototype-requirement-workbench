# 0019｜SCRM 体测详情简易报告视觉升级

## 1. 任务确认卡

- **任务模式**：M2｜标准业务页面视觉升级。
- **产品域**：SCRM → 客户 → 客户详情 → 体测美容记录 → 体测记录 → 查看 → 体测详情。
- **任务性质**：现有体测详情的视觉与信息架构升级，不新增业务能力。
- **业务目标**：将现有字段平铺式体测详情升级为轻量、专业、可快速阅读的后台体测报告，同时保持既有双来源数据、客户关联和 Drawer 链路不变。
- **修改范围**：`CustomerAssessmentDetailDrawer` 内部报告布局、展示层级、卡片化指标表达、节段数据空间表达、必要的本地线性 SVG/样式、真实 Story 和相关测试。
- **明确不做**：新增体测字段、修改 InBody/BIACN 映射、修改体测判断、修改客户列表/详情基本信息、修改历史列表/来源筛选、后端/API/数据库/LocalStorage、新路由或新状态库。
- **UI 等级**：B 级。关键层级、布局、密度和后台报告风格按参考图收敛；参考图不构成业务数据来源，也不要求通过逐像素复刻产生不存在的数据。
- **验收标准**：产品经理先完成真实 SCRM 页面验收；通过后再进行唯一一次 Formal Review。任何无数据支撑的视觉内容均为 Blocking。

## 2. 实施前必须确认

实施 Agent 必须先阅读根目录 `AGENTS.md`、本任务单和 `docs/task-specs/0016-body-assessment-integration.md`，并检查：

- `src/shared/body-assessment/` 的标准模型、适配器、formatter 和数据源。
- `src/products/scrm/modules/customer-management/` 的客户列表、客户详情、体测记录列表和详情 Drawer。
- 当前真实链路：

  ```text
  ScrmWorkspace
  → customer-list
  → CustomerDetailDrawer
  → 体测美容记录
  → CustomerBodyAssessmentPanel
  → 查看
  → CustomerAssessmentDetailDrawer
  ```

当前实现基线包含：

- `BodyAssessmentReport` 统一模型，含 `source`、`recordId`、`customerId`、`measuredAt`、`score`、`core`、`bodyComposition`、五部位 `muscleContent/fatContent` 和 `recommendations`。
- `AssessmentMetric` 支持 `number | null`、单位和精度；节段模型额外包含数据层 `status`。
- shared formatter 已负责数值、精度、空值和正负号展示。
- 当前 `CustomerAssessmentDetailDrawer` 使用约 `70vw` 的嵌套 Drawer，并已有基本信息、核心指标、身体成分、肥胖分析、节段肌肉、节段脂肪和调节建议内容。

如果任务要求与实际 shared 模型、0016 已冻结规则或当前代码冲突，先停止相关实现并报告，不为视觉设计补造数据。

## 3. 数据真实性最高原则

0019 的任何 UI 元素必须可追溯至以下之一：

1. `src/shared/body-assessment/` 已确认字段。
2. 0016 已冻结的适配、格式化或衍生值规则。
3. 已明确存在且已确认的奥本产品规则。

展示边界：

- 有具体数值，才能展示数值。
- 有设备明确返回并已进入统一模型的 `grade/status`，才允许展示该状态；但 0016 已确认的节段 UI 规则是只展示 kg/% 数值，`grade/status` 留在数据层，不渲染“偏低/正常/偏高”文案。
- 只有存在 `lower/upper/reference range`，才能绘制范围带、刻度或正常区间。
- 只有存在明确百分比/标准值，才能绘制百分比或相对标准表达。
- 只有存在明确 recommendation text，才能展示建议文案。
- 只有一个裸数值时，只能进行数值型视觉表达。

禁止根据常识、网络标准、外部厂家报告或参考图自行补充：正常范围、偏高/偏低、风险等级、推荐区间、标准百分比、健康判断、训练建议、饮食建议、热量建议、身体年龄、体型分析或 AI 文案。

## 4. 参考图使用边界

参考图只用于确定：

- 报告信息层级。
- 卡片布局与指标排列。
- section 结构和留白。
- 节段五部位的人体空间表达。
- 图标风格和后台报告视觉密度。

参考图不得作为字段、指标区间、等级、建议、标准值或业务判断来源。实际 shared 数据规则优先于任务单中的视觉示意，任务单优先于布局草图，布局草图优先于外部厂家默认组件效果。

正式实施前读取以下仓库内参考图，实际文件名以当前目录为准：

```text
docs/reference/0019-scrm-body-assessment-report/01-current-scrm-body-assessment.png
docs/reference/0019-scrm-body-assessment-report/02-biacn-body-composition-report.png
docs/reference/0019-scrm-body-assessment-report/03-biacn-history-segmental-report.png
docs/reference/0019-scrm-body-assessment-report/04-inbody-result-sheet-summary.png
docs/reference/0019-scrm-body-assessment-report/05-inbody-segmental-analysis.png
docs/reference/0019-scrm-body-assessment-report/06-0019-layout-sketch.png
```

`06-0019-layout-sketch.png` 是本次最直接的奥本后台布局参考，但不能覆盖 shared 数据事实。

## 5. 既有链路与冻结范围

必须继续使用真实链路：

```text
ScrmWorkspace
→ SCRM page registry
→ customer-list
→ CustomerListPage
→ CustomerDetailDrawer
→ CustomerBodyAssessmentPanel
→ CustomerAssessmentDetailDrawer
```

约束：

- 外层客户详情 Drawer 继续约 `80vw`。
- 内层体测详情 Drawer 继续约 `70vw`，继续使用右侧嵌套 Drawer、标题“体测详情”、关闭按钮和独立纵向滚动。
- 不创建独立体测页面、新路由或第三套体测详情入口。
- 关闭详情后仍回到当前客户、体测美容记录和原来源筛选状态。
- 不修改 SCRM 客户 32 列、基本信息字段、体测历史 7 列、来源筛选、分页或美容空状态。
- 不修改移动端 0016/0018、0012—0018 其他业务、`prospect-management`、`employee-management`、`shared/admin`。
- 不新增第三方图表库、图标库、状态管理、后端接口或持久化。

## 6. 报告总体结构

报告正文最终收敛为以下 6 个核心区块，顺序固定：

1. 报告摘要。
2. 身体成分。
3. 肥胖分析。
4. 节段肌肉。
5. 节段脂肪。
6. 体重控制目标。

顶部客户/记录上下文和 Drawer 标题属于既有详情上下文，不计入上述 6 个核心区块。InBody 与 BIACN 必须共用同一套报告 UI 骨架，不得分叉成两套页面。

不得因为某个来源缺值删除区块、字段槽位、位置或后续内容；值缺失时遵循 shared 当前空值规则。若本任务视觉文案与 0016 的空值规则发生冲突，保留统一字段槽位并以 shared/0016 规则为准，暂停冲突部分等待确认。

## 7. 区块一：报告摘要

顶部继续保留检测时间和数据来源，并突出身体评分。身体评分旁展示 4 个核心指标：

1. 体重。
2. 体脂率。
3. 骨骼肌。
4. BMI。

推荐视觉结构为“身体评分主卡 + 四项核心指标卡”，但具体卡片样式不得增加数据语义。

BIACN 允许展示：

| 字段 | 值 |
| --- | --- |
| 身体评分 | `70` |
| 体重 | `75.2kg` |
| 体脂率 | `26%` |
| 骨骼肌 | `30.7kg` |
| BMI | `26.0` |

InBody 允许展示：

| 字段 | 值 |
| --- | --- |
| 身体评分 | `67.0` |
| 体重 | `80.7kg` |
| 体脂率 | `26.2%` |
| 骨骼肌 | `33.7kg` |
| BMI | `24.4` |

核心指标卡不得展示正常、偏高、偏低、推荐范围或标准区间。若复用 shared 已正式包含的 `scoreMeta`，等级必须明确标为“奥本展示等级”，不得称为厂商官方等级或医学等级；不得重建第二套阈值。

## 8. 区块二：身体成分

使用小型数据卡阵列替代纯字段平铺。每张卡只允许包含图标、指标名和当前值，不增加范围条、状态、百分比标准或参考值。

BIACN 允许展示：

- 体脂肪 `19.6kg`。
- 无机盐 `3.9kg`。
- 蛋白质 `11.5kg`。
- 总水分 `40.3kg`，复用现有 `core.totalWater`，不新增模型字段。
- 成分分数 `70`。
- 腰臀比 `0.89`。
- SMI：保留字段槽位，值遵循当前 shared/0016 的缺值规则；不得以 FFMI、`strong_index` 或其他指数替代。

InBody 允许展示：

- 体脂肪 `21.1`。
- 无机盐 `4.1`。
- 蛋白质 `11.8`。
- 总水分 `43.7kg`，复用现有 `core.totalWater`。
- 成分分数 `67.0`。
- 腰臀比 `0.9`。
- SMI `8.1`。

脂肪等级如保留，必须只消费 unified model 的既有字段/值；不得根据其数值解释出新的健康状态。

## 9. 区块三：肥胖分析

只展示已有明确数据的三个指标，并使用横向数据卡或等价指标块：

- BMI。
- 体脂率。
- 腰臀比。

BIACN：`26.0`、`26%`、`0.89`。

InBody：`24.4`、`26.2%`、`0.9`。

禁止低/正常/高刻度、范围轴、健康等级、风险提示或颜色状态判断；当前模型没有统一可靠区间支撑这些表达。

## 10. 区块四：节段肌肉

必须使用统一模型的真实五部位数据，以简洁正面人体 silhouette SVG 周围的数据标注表达空间对应关系：

| 部位 | BIACN | InBody |
| --- | --- | --- |
| 右上肢 | `3.0kg` | 继续消费 unified model 既有 InBody 值和单位 |
| 左上肢 | `2.9kg` | 继续消费 unified model 既有 InBody 值和单位 |
| 躯干 | `24.2kg` | 继续消费 unified model 既有 InBody 值和单位 |
| 右下肢 | `9.1kg` | 继续消费 unified model 既有 InBody 值和单位 |
| 左下肢 | `8.8kg` | 继续消费 unified model 既有 InBody 值和单位 |

人体图只表达部位对应关系，不表达胖瘦、体型、数值比例、好坏或健康状态；不得根据数值改变人体轮廓。BIACN 的 `grade/status` 继续留在数据层，报告 UI 不展示“偏低/正常/偏高”。InBody 不得被为了视觉统一而从既有 `%` 转换成 `kg`。

## 11. 区块五：节段脂肪

采用与节段肌肉相同的人体 silhouette 和五部位定位方式。BIACN 只展示以下真实精度值：

- 右上肢 `0.78kg`。
- 左上肢 `0.89kg`。
- 躯干 `10.4kg`。
- 右下肢 `3.2kg`。
- 左下肢 `3.1kg`。

不得将 `0.78` 舍入为 `0.8`、将 `0.89` 舍入为 `0.9`，不得换算为百分比。UI 不展示 grade、偏高、正常、偏低、百分比或参考标准；数据层 status 继续由统一模型保留。

## 12. 人体 SVG 规则

允许在 SCRM customer-management 模块内部创建或复用一个简洁正面人体 SVG，供节段肌肉和节段脂肪共用。

要求：

- 正面、中性、极简轮廓，不区分性别或真实身材。
- 只包含头、躯干、左右手臂、左右腿等信息定位所需形状。
- 可用轻量引导线连接右上肢、左上肢、躯干、右下肢、左下肢。
- 不使用真人照片、外部付费素材或第三方 SVG/icon 依赖。
- 不让数值改变轮廓、面积、颜色状态或人体比例。

## 13. 区块六：体重控制目标

现有“调节建议”标题改为“体重控制目标”，因为当前模型主要提供控制目标数值，不代表存在 AI 或设备建议文本。

继续消费 `report.recommendations`，UI 不重复计算目标体重、控制值或热量，不在 JSX 重写公式。

BIACN：

- 目标体重 `65.0kg`。
- 去脂体重 `55.6kg`。
- 体重控制 `-10.2kg`。
- 脂肪控制 `-11.6kg`。
- 肌肉控制 `+1.4kg`。
- 建议热量摄入显示中文长横线 `—`，不得显示 TEE `2515`。

InBody：

- 目标体重 `72.9kg`。
- 去脂体重 `59.6`。
- 体重控制 `-7.8`。
- 脂肪控制 `-10.2`。
- 肌肉控制 `+2.4`。
- 建议热量摄入 `2449`。

正负号和颜色只允许进行轻量数值层级表达，不得自动解释为减重、增肌、降低脂肪或改善代谢。

## 14. 禁止的无数据视觉

最终 UI 不得出现以下未经 shared 数据明确支持的内容：

- 正常范围、参考范围、标准区间、推荐区间。
- 偏低、正常、偏高等节段状态文案。
- 未经确认的百分比、相对标准比例或完成百分比。
- 风险等级、身体年龄、基础代谢、TEE、健壮指数。
- 体型矩阵、营养评价、训练建议、饮食建议。
- 报告摘要 AI 文案或“建议逐步减重”“建议增加肌肉”等推断文本。
- 任何参考图中存在但 shared 模型没有的字段。

如果漂亮的设计需要 shared 当前没有的数据，删除该设计；不得为了设计扩展模型或伪造字段。发现 raw source 有字段但 unified model 未纳入时，停止并报告，不自行扩大范围。

## 15. 图标规范

允许创建轻量内联线性 SVG icon，用于增强已有指标识别。可覆盖体重、体脂率、骨骼肌、BMI、水分、体脂肪、蛋白质、无机盐、腰臀比、评分及方向等已有指标。

要求：

- 统一线性风格，约 20–24px，单色或轻品牌蓝。
- 不新增图标库、不使用付费资源、不直接复制第三方报告图标。
- 图标只增强识别，不增加业务含义、状态或健康判断。

## 16. 整体视觉与滚动

定位为“轻量专业体测报告 + 奥本 SCRM 后台风格”，不是移动端报告复制、BI 大屏、营销页或医疗诊断报告。

建议：

- 白底、浅灰边框、轻蓝 section 标识、统一小卡片。
- 圆角约 8–12px，适量留白，数值层级明显，Label 较轻。
- 不使用霓虹、重渐变、复杂动画、巨大仪表盘或复杂图表。
- 继续使用 70vw 二级 Drawer，报告内容整体纵向滚动。
- 顶部标题和关闭按钮保持稳定；不修改嵌套 Drawer 层级。

## 17. Storybook 规划

继续归入真实产品菜单，不新增独立体测产品根：

```text
SCRM
└─ 客户
   └─ 客户详情
      └─ 体测美容记录
         ├─ BIACN详情
         └─ InBody详情
```

两个 Story 都必须通过：

```text
ScrmWorkspace
→ SCRM_PAGE_REGISTRY
→ customer-list
→ CustomerListPage
→ CustomerDetailDrawer
→ CustomerBodyAssessmentPanel
→ CustomerAssessmentDetailDrawer
```

禁止直接孤立 render 报告组件、使用 Story 专用假 Drawer/假 Runtime、绕过 production outlet 或创建 `0019`、Cycle、Mock、Dev、Demo、Test 等产品导航概念。不得复制两套报告组件；InBody/BIACN 只能由不同真实记录数据驱动同一报告 UI 骨架。

## 18. 测试规划

### 18.1 数据真实性

覆盖 BIACN：

1. 评分 `70`。
2. `75.2kg`、`26%`、`30.7kg`、BMI `26.0`。
3. 身体成分 `19.6kg`、`3.9kg`、`11.5kg`、`40.3kg`、`70`、`0.89`。
4. SMI 槽位存在且遵循当前缺值规则。
5. 五部位节段肌肉数值和五部位节段脂肪精度正确。
6. 目标/控制值正确，建议热量为 `—`，不出现 `2515`。

覆盖 InBody：

7. 评分 `67.0`。
8. `80.7kg`、`26.2%`、`33.7kg`、BMI `24.4`。
9. 身体成分、SMI `8.1`、控制值和建议热量 `2449` 正确。

### 18.2 禁止内容

10. 报告 DOM 不出现未经授权的正常范围、参考范围、标准百分比、风险等级、基础代谢、身体年龄、TEE 或 AI 建议文案。
11. 对节段区域明确验证不渲染“偏高/正常/偏低”；若页面其他正式区域消费奥本 scoreMeta，不使用会误伤该正式语义的宽泛字符串断言。
12. 不出现 BIACN 专属且本任务未授权的额外指标。

### 18.3 UI 结构

13. 报告摘要、身体成分、肥胖分析、节段肌肉、节段脂肪、体重控制目标六个区块均存在。
14. 节段肌肉和节段脂肪均存在人体定位图，五部位标签与数据对应。
15. InBody 与 BIACN 通过同一报告组件/骨架渲染，字段槽位不因缺值删除、补位或重排。
16. 体重控制目标标题不再使用“调节建议”。

### 18.4 回归与真实链路

17. 7 列体测历史列表、来源筛选和当前客户关联不变。
18. 嵌套 Drawer 打开、关闭和返回当前客户正常。
19. 客户列表真实入口、客户基本信息和客户 32 列结构不回归。
20. 移动端 0016/0018 体测报告、历史记录和分享功能不回归。
21. Story 真实经过 registry/outlet，未使用孤立组件替代真实业务链路。

## 19. 产品验收 Blocking 标准

产品经理重点验收：

1. 顶部评分是否突出且数据正确。
2. 核心指标是否可以快速扫读。
3. 身体成分是否比字段平铺更清晰。
4. 人体节段布局是否自然，左右部位是否正确。
5. 节段数据是否与人体定位一致且没有额外健康判断。
6. 体重控制目标是否清楚，正负号和空值是否正确。
7. 整体是否像 SCRM 后台轻量报告，而不是移动端报告或 BI 大屏。
8. 是否出现任何无数据支撑的“漂亮但错误”内容。

以下直接判 Blocking：

- 伪造、推导或错误映射体测字段。
- 删除统一字段槽位、改变双来源报告骨架或导致数据错位。
- 破坏客户/记录关联、来源筛选、Drawer 链路或移动端回归。
- Story 绕过真实 production registry。
- lint、类型检查、测试或构建失败。

## 20. 实施与交付流程

本任务只规划一个 Cycle：`0019 Cycle A｜SCRM 简易体测报告视觉升级`。

执行顺序：

1. 先完成真实实现和针对性测试。
2. 产品经理进行真实 Story 页面验收。
3. 产品验收通过后，执行唯一一次 Formal Review。
4. 若有 Blocking，只做一一对应的限定修复和一次 Limited Re-review。
5. 未获得另行授权前，不执行 Git 发布或 Production 发布。

最终完整验证：

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm build-storybook
git diff --check
```

不得为本任务处理 Vitest 串行性能、既有 OrganizationPage Hook warning、依赖升级或其他技术债。

## 21. 任务范围冻结

禁止修改或顺带治理：

- 0016/0018 移动端用户中心、体测报告、历史记录和分享。
- 0012—0018 其他业务与需求实现记录。
- SCRM 客户 32 列、客户基本信息、体测历史 7 列、来源筛选、客户 Drawer 壳。
- `src/products/scrm/modules/prospect-management/`。
- `src/products/scrm/modules/employee-management/`。
- `src/products/scrm/shared/admin/`。
- `requirementHistoryData`、导航公共架构、package/lockfile。

不得新增：

- 体测业务字段、厂商原始 JSON、Adapter、ViewModel 或数据计算规则。
- 体测 API、后端、数据库、LocalStorage、新 Provider、新状态库。
- 0016 后续美容字段、统一报告新 Cycle 或 0020/其他新需求。

## 22. 需求单完成状态

本文件是 0019 的正式实施边界。生成本任务单时只允许新增本文件；后续代码实现、产品验收、Formal Review、Git 收口和 Production 发布均需按 `AGENTS.md` 另行获得对应授权。
