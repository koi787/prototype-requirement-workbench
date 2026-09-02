# 0018｜移动端体测历史记录与成绩分享

## 1. 任务确认卡

- **任务模式**：M2｜单产品域多状态功能增强。
- **产品域**：移动端｜奥本运动。
- **业务目标**：体测入口默认展示最新记录，支持查看并切换完整历史报告；为当前记录生成只包含评分、奥本展示等级和鼓励信息的轻量分享卡片。
- **修改范围**：移动端体测记录选择状态、历史 Bottom Sheet、固定悬浮分享入口、分享预览/渠道原型反馈、跨产品纯评分等级映射、真实 Story 与测试。
- **明确不做**：真实历史 API、数据库、LocalStorage、微信 SDK、相册权限、后端制图、详细身体数据分享、SCRM 新功能及 0012—0017 业务改造。
- **业务规则**：正式页面只由 `currentRecordId` 决定当前完整报告和分享内容；InBody/BIACN 混排但共用统一报告；奥本展示等级与鼓励文案只有一套共享映射。
- **UI 等级**：B 级关键视觉还原。已落库草图确定结构、层级和视觉方向，继续沿用 0016 移动端报告风格；未要求对草图做 C 级像素复刻。
- **验收标准**：Cycle A 历史记录闭环与 Cycle B 分享闭环分别通过产品经理真实页面验收，随后才进入正式 Review 和发布。

## 2. 正式实施基线与现状

- 当前稳定分支：`main`。
- 任务规划时基线：`9a122e0`（`feat: optimize visit record follow-up workflow`）。开发前须再次同步并记录当时最新 `origin/main`，不得假设本规划时 hash 永久不变。
- 0016 已发布，现有移动端入口为 `AobenSportMobileRoot → BodyAssessmentReport`。
- 现有共享模型 `BodyAssessmentReport` 已包含 `source`、`recordId`、`customerId`、`measuredAt`、score 和完整报告字段。
- `getBodyAssessmentRecordsByCustomerId` 已按 `measuredAt` 倒序返回 canonical InBody/BIACN 记录，可作为正式历史数据入口继续扩展。
- 当前 `BodyAssessmentReport` 内部仍以独立 `source` state 控制报告，并允许点击评分区域切换来源；0018 必须按第 8 节将其与正式产品链路隔离。

本轮只创建任务单，不创建 feature 分支，不执行 Git 写操作。后续实施应从最新干净 `main` 创建独立 `feature/0018-...` 分支，具体分支名由产品经理另行确认。

## 3. 总体产品链路

```text
我的
→ 体测
→ 默认展示 measuredAt 最新的一条记录
   ├─ 历史记录 >
   │  → Bottom Sheet
   │  → 选择记录
   │  → currentRecordId 更新
   │  → 当前完整报告切换
   └─ 右下悬浮分享
      → 当前记录分享卡片预览
      → 保存到相册 / 微信好友原型反馈
```

历史列表、报告正文和分享卡必须始终引用同一个 `currentRecord`。不得分别维护 source、score 或“最新记录”作为第二状态源。

## 4. currentRecordId 与默认最新记录

- 进入正式“用户中心 → 体测”链路时，先获取当前客户全部体测记录，按 `measuredAt` 倒序排列。
- 默认 `currentRecordId` 为排序后第一条，即最新记录；当前 canonical 数据下 BIACN `2026-08-20 12:02:51` 晚于 InBody `2025-05-14 13:38:53`，因此正式入口默认应展示 BIACN，而不是硬编码 InBody。
- `currentRecord` 必须由 `records.find(recordId)` 派生；其 `recordId/source/measuredAt/score/完整 ViewModel` 不得拆成可相互漂移的独立状态。
- Story 可通过稳定 `initialRecordId` 指定初始历史记录；未指定或无效时回退到最新记录。
- 当前记录为空属于防御状态：不渲染伪造报告，历史组件显示“暂无历史记录”。本期正式 fixture 至少有一条记录。
- 切换记录只保存在当前前端 Runtime；刷新后重新选择最新记录，不写 LocalStorage。

建议由移动端 body-assessment 页面控制器持有 `records/currentRecordId/historyOpen/shareOpen`。`BodyAssessmentReport` 只消费明确的当前 report；无需引入 Context、Provider 或状态管理库。

## 5. 历史记录入口

- 在体测报告顶部检测日期区域增加 `历史记录 >`。
- 左侧/主体继续显示当前记录检测日期时间，右侧为历史入口。
- 不新增独立历史记录页面、一级导航或路由。
- 入口必须处于正式报告 DOM 中，且不改变 0016 固定报告字段骨架。

## 6. 历史记录 Bottom Sheet

- 点击历史入口后，在当前移动端 viewport 内显示半透明蒙层和从底部出现的 Bottom Sheet。
- 提供明确关闭按钮；点击遮罩可关闭。
- 下滑关闭仅在现有移动端能力可低成本复用时支持，不作为 Blocking，不得为此引入手势库。
- Sheet 打开时报告滚动内容保持背景上下文但不可误操作。
- 关闭不改变 `currentRecordId`。

### 6.1 可视数量与滚动

- “最多 5 条”仅表示可视区域约能完整呈现 5 条记录，不是数据截断规则。
- 1—5 条时 Sheet 高度随内容自适应。
- 超过 5 条时 Sheet 保持最大高度，历史列表区域 `overflow-y: auto`，所有更早记录继续可滚动访问。
- 禁止通过 `slice(0, 5)`、分页或只加载最近 5 条实现。
- 至少一条当前报告存在时，历史列表必须包含当前记录。

### 6.2 排序与单条结构

- 历史记录严格按 `measuredAt` 倒序，最新在前。
- 每条只展示：检测日期时间、数据来源、身体评分、奥本统一体测等级。
- 推荐紧凑格式：`2026-09-01 10:25 | InBody | 87分 | 良好`，最终排版遵循本地草图与移动端可读性。
- 不展示体重、体脂率、手机号、客户 ID、measurement ID、设备编号或设备型号。
- InBody/BIACN 可直接混排，source 只是记录属性，不提供设备预筛选或来源修改。

### 6.3 当前选中态与切换

- 当前 `recordId === currentRecordId` 的条目必须有明显选中态，优先采用浅背景、字体强调和右侧/左侧勾选符号，不新增复杂组件。
- 点击任意条目后按顺序执行：更新 `currentRecordId` → 关闭 Sheet → 派生新的 `currentRecord` → 整份报告重新渲染。
- 必须联动检测日期、source、评分、核心指标、身体成分、节段肌肉、节段脂肪、调节建议和后续分享内容；禁止只更新日期或分数。

## 7. 历史数据与 Fixture 策略

- `src/shared/body-assessment/` 继续作为 InBody/BIACN 标准模型与 canonical 数据的唯一事实来源。
- 正式链路复用 `getBodyAssessmentRecordsByCustomerId(customerId)`，不在移动端复制适配规则或设备 JSON。
- 为验证单条、5 条和 >5 条滚动，允许新增稳定 prototype history fixtures；额外记录只复用既有标准 ViewModel，改变 `recordId`、`measuredAt` 等原型元数据。
- 不修改既有 InBody/BIACN 指标映射，不伪造厂商原始 JSON、设备字段或新的身体指标口径。
- >5 条演示 fixture 必须与 canonical 客户记录集合分离，通过 Story/测试显式注入移动端页面；不得让其进入 SCRM 当前 `getBodyAssessmentRecordsByCustomerId` 默认结果，避免已发布 SCRM 体测列表无故增加记录。
- 87、90+ 等分享等级演示数据属于 ShareCard 产品状态 fixture，不得伪装成真实设备历史响应，也不得进入正式历史列表。

## 8. 与 0016 评分点击切换的冲突处理

0016 的“点击评分区域 InBody ↔ BIACN”是原型演示辅助交互；0018 的 `currentRecordId` 是正式业务状态。最终规则冻结如下：

- 正式“用户中心 → 体测”链路中，评分区域不得切换 source，也不得把当前记录改成另一设备来源。
- source 只能来自 `currentRecord.source`；用户通过历史记录选择另一条记录时，source 才随 record 一起变化。
- 现有 InBody报告/BIACN报告 Story 改为通过不同 `initialRecordId` 展示固定来源。
- 如确需保留 0016 演示切换，只能通过显式、默认关闭的 Story/test-only prop 启用，并同时切换到另一条真实 fixture record；不得只替换 source 或拼接不存在的 record。
- 生产入口不得传入该演示开关，测试必须证明生产评分区域没有“切换体测报告来源”行为。
- 推荐移除报告组件内部独立 `source` state，让报告组件消费 `report`；兼容层只可留在 Story 装配边界，不能形成第二状态源。

## 9. 分享悬浮按钮

- 在报告 viewport 右下区域新增小圆形悬浮按钮：白底、极轻阴影、橙色分享图标。
- 按钮应位于移动端 viewport 内、报告滚动容器外，报告滚动时位置保持稳定；不要使用相对整张 Storybook 浏览器窗口的错误定位。
- 位置需避开调节建议、底部手势安全区和关键报告数据；参考 `悬浮按钮分享图1.png`。
- 不做大胶囊按钮，不新增图标依赖；优先使用现有 icon 能力或可控内联 SVG。
- 历史 Sheet 或分享预览打开时，按钮必须隐藏或降至不可点击层，不能浮在蒙层/弹层之上。

## 10. 分享预览与渠道面板

点击悬浮按钮后，在移动端 viewport 内展示：

1. 深色/半透明蒙层。
2. 中部分享卡片预览。
3. 底部“分享至”渠道面板。
4. `保存到相册`、`微信好友` 两个渠道。
5. 明确关闭按钮。

- 点击两个渠道只提供稳定原型反馈，可使用现有轻量反馈样式；不调用真实 SDK、权限或下载接口。
- 关闭分享预览后恢复报告及悬浮分享按钮，`currentRecordId` 保持不变。
- 分享预览打开时，历史 Sheet 不得同时处于可交互状态；两个 overlay 互斥。
- UI 结构参考 `悬浮按钮分享图2.png` 和 `分享卡片草图.png`。

## 11. 分享卡片内容与隐私边界

分享卡片允许包含：

- 当前用户昵称或 `@用户名`（复用现有移动端稳定用户 fixture，不新增真实 PII）。
- 固定引导语：`看看这次我的身体状态怎么样`。
- `我的身体评分`。
- 当前记录身体评分。
- 奥本统一体测等级。
- 对应状态鼓励符号和鼓励文案。
- 奥本运动品牌区域。
- 仓库已有且经确认可复用的二维码/小程序码视觉资产。

分享卡片严格禁止展示：体重、体脂率、骨骼肌、BMI、年龄、身高、手机号、客户 ID、`measurement.id`、`device_sn`、设备型号及任何完整报告数据。

当前仓库未发现独立可复用的二维码/小程序码资产；在产品经理提供正式资产前可以省略该区域或使用非扫码功能的品牌占位视觉，禁止从草图裁切、生成伪可扫码二维码或引入二维码依赖。

## 12. 分享内容跟随当前记录

- 打开分享预览时，从当前 `currentRecord` 派生 `score/scoreLevel/encouragement`，不得重新取最新记录。
- 用户选择历史记录后再分享，卡片必须展示被选记录的分数、等级和文案。
- 分享预览打开期间不得因列表排序或默认值把 `currentRecordId` 重置为最新。
- 分享卡片只消费轻量 `ShareSummary`/等价 view model，不接收完整 report 对象更安全；构造摘要时仅白名单取昵称、score、level、encouragement、icon/color。

## 13. 奥本统一体测等级

InBody 和 BIACN 均使用“奥本展示等级”，不得对外描述为厂商官方等级或医学健康等级。

| score 范围 | 等级 | 鼓励文案 | 建议色 |
|---|---|---|---|
| `< 70` | 待提升 | 还有进步空间，坚持一下，下次会更好。 | `#FFB648` |
| `70 ≤ score < 80` | 标准 | 状态在线，保持好节奏，继续稳步提升。 | `#42C7B6` |
| `80 ≤ score < 90` | 良好 | 状态不错，离优秀又近了一步。 | `#FFC96B` |
| `score ≥ 90` | 优秀 | 状态很棒，继续保持这份自律。 | `#FFB11B` |

- `score > 100` 仍为优秀，不设置上限截断。
- 等级、文案、颜色和 icon 语义形成唯一 `score → scoreMeta` 纯映射，放在 `src/shared/body-assessment/`。
- 历史列表与分享卡消费同一结果；不得在 ShareCard、Report 或 History JSX 重复阈值判断或文案。
- 当前 canonical InBody `67 → 待提升`，BIACN `70 → 标准`。

### 13.1 状态鼓励符号

- 待提升：成长、小芽或上升语义。
- 标准：确认或点赞语义。
- 良好：握拳或加油语义。
- 优秀：皇冠、星星或奖杯语义。
- 具体 icon 以本地最终草图/产品经理验收为准，使用现有 icon 或可控 SVG，不新增依赖。
- icon key 可作为 score meta 的稳定语义值；实际 React 图标映射留在移动端 UI，避免 shared 依赖 products/React 视觉组件。

## 14. 分享卡片视觉规则

- 主背景统一采用草图中的青蓝渐变，不按四个等级切换四套背景。
- 主标题、大分数、鼓励文案为白色；次级说明为半透明白。
- 仅等级文字和状态符号按等级色变化。
- 卡片整体、头像/用户名、品牌区、圆角、留白和底部渠道面板参考本地草图，不增加霓虹、复杂动画或多套主题。
- 草图中出现的文案仅作视觉布局参考；正式引导语和四档鼓励文案以本任务单第 11、13 节为准。

## 15. 本地视觉参考

四张参考图已实际存在于 `docs/reference/`，但任务规划时仍为未跟踪文件；后续实施/收口须在获得 Git 授权后与 0018 一并纳入正确分支，确保其他开发环境可读取：

| 实际文件名 | 尺寸 | 作用 |
|---|---:|---|
| `历史记录弹层草图.png` | 1176 × 1038 | 历史入口、蒙层、单条/多条 Bottom Sheet 和选中态 |
| `悬浮按钮分享图1.png` | 558 × 1052 | 报告右下悬浮按钮位置与视觉 |
| `悬浮按钮分享图2.png` | 684 × 1362 | 分享预览、底部渠道面板和关闭入口 |
| `分享卡片草图.png` | 816 × 1220 | 分享卡片结构、青蓝主视觉、等级及鼓励信息 |

这些实际文件替代需求草案中建议的 `06—09` 英文命名，不要求为了任务规划重命名。视觉优先级：本地草图 > 0016 当前移动端视觉 > 默认组件效果。开发 Agent 不得依赖当前对话中的临时图片。

## 16. Storybook 信息架构

继续归入真实产品域，不创建新产品根：

```text
移动端｜奥本运动
└─ 体测
   ├─ 体测报告
   │  └─ 最新记录
   ├─ 历史记录
   │  ├─ 单条记录
   │  └─ 多条记录
   └─ 分享
      ├─ 待提升
      ├─ 标准
      ├─ 良好
      └─ 优秀
```

- 现有 InBody报告、BIACN报告 Story 可保留为来源明确的固定初始记录状态，或在不丢失真实业务入口的前提下最小归并；不得复制报告组件。
- “多条记录”必须覆盖 >5 条可滚动状态，不能只做正好 5 条。
- 分享待提升/标准可使用 canonical InBody 67、BIACN 70；良好 87、优秀 90+ 使用明确标注的 ShareCard 产品状态 fixture，不进入正式历史。
- Story 名称和目录不得出现 0018、Cycle、Mock、Dev、Test、Demo 等开发概念。
- 如需通过 `initialHistoryOpen`、`initialShareOpen`、`initialRecordId` 等 props 稳定复现状态，这些只用于 Story/测试装配，不改变生产默认行为。

## 17. 测试规划｜历史记录

至少覆盖以下真实 DOM/Runtime 行为：

1. 从用户中心进入体测，默认 `currentRecordId` 为 `measuredAt` 最新记录，而非硬编码 InBody。
2. 页面存在 `历史记录 >`，点击打开 Bottom Sheet，关闭按钮和遮罩关闭有效。
3. 历史记录按 `measuredAt` 倒序，InBody/BIACN 混排。
4. 当前记录有可感知选中态和可访问语义。
5. 1 条记录时 Sheet 高度/内容正常，至少展示当前记录。
6. 5 条记录全部可见。
7. >5 条时内部列表可滚动，DOM/数据未被截断。
8. 点击记录更新 `currentRecordId` 并关闭 Sheet。
9. 日期、source、评分、核心指标、身体成分、节段和调节建议整份联动。
10. source 只读，用户不能修改当前历史记录来源。
11. 空记录显示“暂无历史记录”，不渲染伪造报告。
12. 生产链路评分区域不切换 source；如保留 demo prop，只在显式 Story/test 状态生效。

测试不得只断言数组排序或 fixture 常量，必须实际打开 Sheet、选择条目并验证报告 DOM。

## 18. 测试规划｜等级映射

共享纯函数必须保护边界：

- `69`、`69.9` → 待提升。
- `70`、`79`、`79.9` → 标准。
- `80`、`89`、`89.9` → 良好。
- `90`、`100+` → 优秀。
- InBody/BIACN 相同 score 得到同一 meta。
- 四档 label、encouragement、color、icon key 与第 13 节唯一配置一致。

除纯函数测试外，历史列表和分享 DOM 需各至少一次真实消费同一映射结果。

## 19. 测试规划｜分享

至少覆盖：

1. 分享悬浮按钮位于报告 viewport，滚动报告后仍可见。
2. 历史 Sheet 打开时分享按钮不在上层且不可点击。
3. 点击分享打开蒙层、卡片和渠道面板；历史 Sheet 与分享预览互斥。
4. 分享卡来自当前 `currentRecord`，而非最新记录或独立 source state。
5. InBody 67 → 待提升；BIACN 70 → 标准；87 → 良好；90+ → 优秀。
6. 四档鼓励文案、等级色和符号语义正确。
7. 卡片包含允许的昵称/引导语/评分/等级/鼓励/品牌内容。
8. 卡片不出现体重、体脂率、骨骼肌、BMI、年龄、身高、手机号、客户/设备 ID、设备型号或完整报告内容。
9. 保存到相册、微信好友分别产生稳定原型反馈，不调用真实能力。
10. 关闭预览恢复报告和悬浮按钮，当前记录不变。
11. 切换历史记录后再分享，score/level/encouragement 随所选记录更新。
12. 不写 LocalStorage；刷新恢复默认最新记录与关闭状态。

不得只测 score mapping 常量，必须覆盖真实交互和 DOM 隐私白名单/黑名单。

## 20. shared 与 mobile 职责边界

依赖方向继续保持：

```text
移动端 ──→ shared/body-assessment ←── SCRM
```

`src/shared/body-assessment/` 可以承载：

- 评分等级/鼓励/颜色/icon key 的纯业务映射。
- canonical 历史记录选择器与稳定标准模型。
- 不污染 canonical 集合的纯 prototype fixture 数据/构造能力及测试。

`src/products/aoben-sport-mobile/modules/body-assessment/` 必须承载：

- `currentRecordId` 页面状态与移动端控制器。
- 历史 Bottom Sheet。
- 悬浮分享按钮。
- 分享预览、ShareCard、渠道反馈。
- 移动端 icon 渲染、overlay 层级、CSS 和交互测试。

禁止 shared import products、React 移动端 UI、Bottom Sheet 或 ShareCard。不得把移动端组件放进 shared，也不得修改 SCRM 来完成 0018。

## 21. 预计文件范围

具体命名可按实施时结构微调，预计：

### shared/body-assessment

- 新增 `bodyAssessmentScoreMeta.ts`（或等价纯映射）及测试。
- 必要时新增隔离的 history Story/test fixtures；不得改变 canonical SCRM 默认记录数量。
- 最小更新 `index.ts` 只读出口和架构守卫测试。

### aoben-sport-mobile/body-assessment

- 修改 `BodyAssessmentReport.tsx`：改为消费明确 report，移除生产 source 切换职责。
- 修改 `AobenSportMobileRoot.tsx`：接入最新记录和 current record 控制器。
- 新增/拆分历史 Sheet、悬浮按钮、分享预览/卡片组件及对应样式/测试，避免把全部状态继续堆入现有报告巨型组件。
- 更新现有移动端报告/root 回归测试。

### Storybook / 文档

- 新增或最小更新 `src/stories/` 下真实移动端状态和 `.storybook/preview.tsx` 排序。
- 更新 `CHANGELOG.md`、本任务单状态；最终发布并验收后新增一条 0018 需求实现记录及测试。
- 将已确认的四张本地草图随后续授权的 0018 feature commit 正式纳入仓库；本规划轮不暂存。

禁止修改 `src/products/scrm/`、`src/products/scrm/shared/admin/` 和 0012—0017 业务。共享类型变化如导致编译适配，只允许最小兼容且不得改变 SCRM 行为。

## 22. Cycle A｜历史记录

范围：

1. 建立正式 records/currentRecordId/currentRecord 单一状态链。
2. 默认选择 measuredAt 最新记录。
3. 增加历史入口、Bottom Sheet、倒序列表和当前选中态。
4. 支持单条、5 条、>5 条内部滚动和防御性空态。
5. 点击记录关闭 Sheet，并联动切换整份统一报告。
6. 收口 0016 评分点击切换，仅保留显式 Story/test 演示能力（如确有必要）。
7. 完成历史 Story、测试和相关最小门禁。

Cycle A 完成后先由产品经理进行真实移动端验收；未通过不得进入 Cycle B。

## 23. Cycle B｜成绩分享

范围：

1. 在 shared 建立唯一奥本 score meta 映射与边界测试。
2. 增加报告右下固定悬浮分享按钮和 overlay 层级控制。
3. 实现 ShareCard、分享预览和底部渠道面板。
4. 绑定当前历史记录的 score/level/encouragement。
5. 实现四档产品状态 Story、隐私字段防泄露测试和两个渠道原型反馈。
6. 完成分享视觉、交互和完整回归门禁。

Cycle B 完成后由产品经理进行真实移动端验收；不得与 Cycle A 并行修改同一工作区。

## 24. 产品验收标准

### Cycle A

- 用户中心进入后默认最新记录；当前 canonical 数据不再默认 InBody。
- 历史入口、Bottom Sheet、蒙层/关闭、倒序、选中态真实可用。
- 1 条/5 条/>5 条均符合自适应与内部滚动规则，数据不截断。
- 点击历史记录后日期、source 和整份报告同步，评分点击不再篡改正式记录来源。

### Cycle B

- 分享按钮在报告滚动中固定、避开安全区，并在 overlay 打开时正确隐藏/降层。
- 分享卡符合草图结构、统一青蓝视觉和四档等级色/符号。
- 当前历史记录决定 score/level/encouragement，切换历史后分享结果同步。
- 卡片不泄露任何详细身体数据或身份/设备标识。
- 保存相册/微信好友只提供稳定产品原型反馈。

两个 Cycle 均通过产品经理验收后，才允许执行唯一一次 Formal Review；如有 Blocking，只做限定修复和一次限定复审。完整验证通过并另获授权后才可 Git 收口与发布。

## 25. 完整验证

每个 Cycle 完成后执行直接相关最小测试；最终交付统一执行：

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm build-storybook
git diff --check
```

禁止为本任务处理无关 warning、测试性能、依赖升级或既有技术债。

## 26. 明确不做与冻结范围

本期不做：

- 真实设备/API 历史查询、数据库、LocalStorage。
- 微信真实 SDK、保存相册权限、后端图片合成、真实二维码生成。
- 分享链接落地页、排行榜、PK、趋势图、体重趋势、历史对比分析。
- 删除/编辑/搜索历史记录、复杂设备筛选或分页。
- SCRM 新功能、美容仪、奥本中台。
- 新状态管理、手势库、二维码库、分享库或其他依赖。
- 0012—0017 业务、SCRM 客户体测、美容记录及 shared/admin 改造。

## 27. 主要风险与限制

- `source` 与 `currentRecordId` 并存为两个可写状态，造成报告、历史选中和分享内容不一致。
- >5 演示 fixture 混入 shared canonical records，导致已发布 SCRM 客户体测列表发生业务回归。
- 评分点击演示行为残留在生产链路，允许用户把历史记录“切换成”另一来源。
- 分享组件接收完整 report 后误渲染敏感身体指标；应使用白名单摘要模型和黑名单 DOM 测试。
- `position: fixed` 相对浏览器而非移动 viewport，导致 Storybook 中悬浮按钮/overlay 错位。
- Sheet 与分享 overlay 的 z-index、滚动锁定和按钮点击穿透冲突。
- 四张参考图当前尚未 Git 跟踪，若未在实施分支正式纳入，其他开发环境无法完成视觉对照。

## 28. Git、需求实现记录与通知

- 本轮只创建 `docs/task-specs/0018-body-assessment-history-share.md`，禁止 `git add`、commit、push、merge、rebase 或任何 stash 操作。
- 后续开发、Review、Git 与 Production 发布均须另获产品经理明确授权，禁止 force push。
- 0018 最终发布并完成产品验收后，按 `AGENTS.md` 只新增一条“0018｜移动端体测历史记录与成绩分享”需求实现记录，记录真实功能、变化和 Story 入口，不写 Agent、测试数、Commit 或开发日志。
- 任务完成通知遵循根目录 `AGENTS.md`：Codex 使用用户级 notify Hook，不手动执行通知命令；其他代理使用各自规定的单一通知机制，不得重复通知。
