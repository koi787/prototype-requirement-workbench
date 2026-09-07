# 0020｜美容检测移动端 V1

## 1. 任务确认卡

- **任务模式**：M2｜标准业务页面。
- **产品域**：真实用户侧归属“移动端｜奥本运动”；“奥本中台”仅提供本仓库内的原型访问入口。
- **业务目标**：在奥本运动移动端新增“我的 → 美容检测”，支持查看最近一次报告、历史记录、进入任一次历史报告，并为当前正在查看的最新/历史报告生成美容检测分享卡片。
- **修改范围**：美容检测统一模型与纯适配、稳定多记录 Mock、移动端美容检测入口与报告页、单项报告展开/收起、历史 Bottom Sheet 与完整报告切换、悬浮分享入口与分享卡片/渠道原型反馈、奥本中台 Storybook 原型入口、真实业务 Story、测试及必要文档。
- **明确不做**：真实厂家接口、厂家 H5 iframe、检测图片/人脸、三脸报告、AI 重写、商品推荐、真实微信 SDK/保存相册权限、SCRM 美容记录后台、数据库、LocalStorage、新依赖及无关重构。
- **业务规则**：页面只消费标准 `BeautyReport[]`，以唯一 `currentRecordId` 派生当前完整报告和分享数据；分享卡与体测分享卡保持同族结构，奥本账号信息与检测业务白名单分层传入，不消费厂家护理建议；厂家字段解释与字符串/数字类型归一化在纯 adapter 边界收敛；综合等级由 `Score` 按 A—E 规则转换；详细分析顺序由当前报告 `Result[]` 中 `skin/senility` 分组的 `Children[]` 动态驱动，再匹配 `Status = 100` 且为正脸的有效 `ResultDetail`。
- **UI 等级**：B 级。最终移动端效果图决定关键布局、密度、颜色与卡片视觉；厂家 H5 截图只用于确认数据和业务结构，不是视觉复刻目标。产品经理未明确要求 C 级，不自行升级为像素级验收。
- **验收标准**：Cycle A 报告/历史与 Cycle B 分享分别完成开发侧自检和产品经理真实页面验收；全部确认后，Codex 才执行唯一一次 Formal Review。

## 2. 编号、规划现场与正式实施基线

- `0019` 已由 `docs/task-specs/0019-scrm-body-assessment-report-visual-upgrade.md` 占用，因此本任务使用下一个可用编号 `0020`。
- 规划时 `main` 与 `origin/main` 均为 `9a122e00f9e9a7abfe499086a39049a9cbcbfb38`。
- 规划现场位于未收口的 `feature/0019-scrm-body-assessment-report-visual-upgrade`，且已有 0019 业务改动；这些内容不属于 0020，本轮不得修改、暂存或提交。
- 0020 不得直接在当前脏工作区开发。正式开发前必须等待 0019 收口，由产品经理确认最新干净 `main`，再从该时点的 `origin/main` 创建独立 `feature/0020-beauty-assessment-mobile-v1`（或产品经理最终指定名称），并将正式基线 hash 回写本任务单。
- 本规划轮只创建本任务单，不修改业务代码，不执行 Git 写操作。

## 3. 背景与仓库现状

0016 已建立：

- “移动端｜奥本运动”产品域。
- `AobenSportMobileRoot → UserCenterPage → BodyAssessmentReport` 的移动端链路。
- 移动端固定 viewport、标题栏、滚动区、卡片视觉和返回交互。
- `src/shared/body-assessment/` 下跨产品纯模型、adapter 和稳定数据源。
- SCRM 客户详情中的“体测美容记录”，其中美容记录目前仅为空状态。

当前仓库尚不存在：

- `src/products/aoben-middle-platform/` 产品运行时或产品壳。
- 美容检测统一模型、页面、Mock 或正式 Story。
- 可供本任务直接读取的美容厂家完整 JSON fixture。

规划期间产品经理已将 4 张美容检测参考图放入 `docs/reference/beauty-assessment-mobile-v1/`；其视觉与业务用途按第 16 节冻结。参考图不能替代尚未提供的厂家完整 JSON 字段合同。

因此 0020 应复用 0016 已验证的移动端产品边界和“shared 纯数据、products 放 UI”的依赖方向，但不得把体测模型改造成同时承载美容检测，也不得为了一个原型入口自行建设完整奥本中台。

## 4. 产品链路与原型入口

### 4.1 真实用户侧链路

```text
移动端｜奥本运动
→ 我的
→ 美容检测
→ 最近一次美容检测报告
```

- 在现有 `UserCenterPage` 功能服务区增加唯一“美容检测”入口，默认规划紧邻现有“体测”入口；若最终移动端参考图明确了其他位置，以参考图为准。
- 点击后由 `AobenSportMobileRoot` 切换到美容检测报告，不新增路由和第二套移动端壳。
- 报告返回时回到当前用户中心；不得进入 SCRM 或奥本中台业务页面。

### 4.2 奥本中台原型访问入口

```text
奥本中台
→ 美容检测
→ 移动端报告
```

- 该入口是 Storybook 原型验收入口，不代表真实用户侧产品归属，也不是本期要复刻的中台业务页面。
- 当前不存在奥本中台产品壳，因此本期不得凭空设计中台 Sidebar、TopBar、菜单权限、路由或仪表盘。
- 允许在 `src/stories/` 建立最小“奥本中台/美容检测/移动端报告”入口 Story；入口应渲染/进入同一套奥本运动美容检测移动端页面，不能复制真实组件或建立第二套状态。
- 若产品经理后续提供奥本中台真实壳与入口截图，应另行确认范围；不得在 0020 V1 中自行扩展。

## 5. 页面范围与固定信息架构

美容检测报告从上至下固定为：

1. 整体情况。
2. 问题分析。
3. 护理建议。
4. 详细分析（单项报告）。

同时包含：

- 页面标题栏与返回入口。
- 右上角“查看历史记录”。
- 移动端 viewport 内的悬浮“分享报告”按钮。

“基本信息”不得另起独立区块，必须与“整体情况”合并。不得增加趋势、雷达图、皮肤年龄、风险结论、商品推荐或任务单未确认的字段。

## 6. 统一 BeautyReport 模型

建议在 `src/shared/beauty-assessment/` 建立无 UI 的标准模型、纯 adapter、稳定 Mock 与测试：

```ts
interface BeautyReport {
  recordId: string;
  vendorReportId: string | null;
  vendorTaskId: string | null;
  vendorCustomerId: string | null;
  customerId: string | null;
  basic: {
    score: number | null;
    scoreLevel: 'A' | 'B' | 'C' | 'D' | 'E' | null;
    skinType: string | null;
    skinLabels: string[];
    sex: 'female' | 'male' | null;
    age: number | null;
    detectTime: string | null;
    testCount: number | null;
  };
  summary: {
    problemAnalysis: string[];
    careAdvice: string[];
  };
  items: BeautyReportItem[];
}

interface BeautyReportItem {
  type: string;
  name: string;
  score: number | null;
  level: number | null;
  levelName: string | null;
  problemAnalysis: string[];
  careAdvice: string[];
}
```

- `vendorReportId ← report/getlist.reportId`，`vendorTaskId ← result.json.TaskId`，`vendorCustomerId ← CustomerId`；三者均统一转为字符串保存，且不得冒充奥本业务 ID。
- 不得假设 `report/getlist.reportId` 与 `result.json.TaskId` 表示同一身份，也不得在任一字段缺失时用另一字段回填；只有厂家后续明确确认两者身份等价后才能另行简化。
- `customerId` 专用于奥本客户 ID；原型尚未完成真实客户绑定时可以使用明确的奥本 fixture ID 或 `null`，不得回填厂家 `CustomerId`。
- `recordId` 是前端当前记录选择的稳定唯一键，应与厂家报告身份建立可追溯关系但不得与 `customerId` 混用；历史选择始终使用 `recordId`。
- `BeautyReport` 与 `BodyAssessmentReport` 是不同业务合同，不得用可选字段把两者合并成巨型检测模型。
- shared 只承载类型、纯映射、纯 adapter、稳定 fixture 和无 UI 选择器，不得 import React 或 `src/products/`。
- 移动端报告只消费 `BeautyReport`，不得在 JSX 直接读取 `ComprehensiveProposal`、`ResultDetail` 等厂家原始路径。

## 7. 厂家字段映射

### 7.1 整体情况

| 页面字段 | 厂家来源 | 规则 |
|---|---|---|
| 综合得分 | `Score` | 保留厂家数值；缺失时展示 `--`，不得补造 |
| 综合得分等级 | `Score` | 按第 8 节转换，不读取不存在的厂家顶层等级 |
| 肤质类型 | `LevelName` | 示例 `DSPW`；缺失时展示 `--` |
| 肤质标签 | `LevelLabel[]` | 示例 `干 / 敏 / 色 / 衰`；按厂家顺序展示 |
| 性别 | `Customer.Sex` | `female → 女`，`male → 男`，其他/缺失 → `--` |
| 年龄 | `Customer.Age` | 展示整数年龄；缺失 → `--` |
| 检测时间 | `ServerCreateTime` | 作为弱化辅助信息，不自行变更时区或补造时间 |
| 检测次数 | `Customer.Count` | 作为弱化辅助信息；缺失 → `--` |
| 厂家报告 ID | `report/getlist.reportId` | 归一化为 `vendorReportId: string \| null`，不直接展示 |
| 厂家任务 ID | `result.json.TaskId` | 归一化为 `vendorTaskId: string \| null`，不直接展示，不与 `vendorReportId` 互相回填 |
| 厂家客户 ID | `CustomerId` | 归一化为 `vendorCustomerId: string \| null`，不直接展示 |
| 奥本客户 ID | 奥本客户绑定结果 | 写入 `customerId`；本期 Mock 必须与厂家 ID 明确不同，不直接展示 |

### 7.2 综合建议

| 页面区域 | 厂家来源 | 规则 |
|---|---|---|
| 问题分析 | `ComprehensiveProposal[]` 中 `title === "问题分析"` 的 `content` | 只提取文本，保持原文与原顺序 |
| 护理建议 | `ComprehensiveProposal[]` 中 `title === "护理建议"` 的 `content` | 支持多段/多条，保持原文与原顺序 |

- `content` 若为厂家返回的多段结构，adapter 只做无损文本归一化，不合并、改写或总结语义。
- 图片、图片 URL、富媒体节点一律不进入 V1 ViewModel。
- 找不到对应 title 时返回空数组，页面不显示伪造结论。

### 7.3 单项报告

| 标准字段 | 厂家来源 |
|---|---|
| `type` | `ResultDetail[].Type` |
| `name` | `ResultDetail[].Name` |
| `score` | `ResultDetail[].Score` |
| `level` | `ResultDetail[].Level` |
| `levelName` | `ResultDetail[].LevelName` |
| `problemAnalysis` | 当前项 `Content` 中 `title === "问题分析"` 的文本内容 |
| `careAdvice` | 当前项 `Content` 中 `title === "日常护理建议"` 或 `title === "护理建议"` 的文本内容，按原顺序合并到同一数组 |

- 厂家原始 `Status/FaceType` 必须先在 adapter 边界完成类型归一化，再按归一化后的 `Status === 100 && FaceType === 2` 过滤有效正脸结果并进入标准模型；不得直接对厂家原始值执行数字严格判断。
- 厂家实际键名、大小写或 `content` 数据结构如与上述已确认合同不一致，开发 Agent 必须暂停 adapter 的冲突部分并报告，不得靠猜测兼容多种虚构结构。
- 顶部 `scoreLevel` 是奥本基于综合 `Score` 的 A—E 转换；单项 `level/levelName` 是厂家当前项目结果，两者不得混用。

### 7.4 厂家字段类型归一化

厂家接口中的 `Status`、`FaceType`、`Score`、`Level`、`Customer.Age`、`Customer.Count`、`reportId`、`TaskId`、`CustomerId` 等字段可能以字符串或数字返回。Adapter 必须先在边界完成类型归一化，再执行筛选、排序、等级转换和展示：

- `Status`、`FaceType`：接受数字或可解析的数字字符串，归一化为数字后再判断 `100`、`2`；禁止直接使用 `raw.Status === 100` 一类依赖原始类型的严格判断。
- `Score`、单项 `Score`、`Age`、`Count`：接受 number 或去除首尾空白后可安全解析的数值字符串；空字符串、非有限值和不可解析内容归一化为 `null`，不得默认为 `0`。
- `Level`：接受 number 或去除首尾空白后可安全解析的数值字符串，归一化为 `number | null`；空字符串、非有限值和不可解析内容均为 `null`，不得默认为 `0`。
- `LevelName`、标签和文本字段：归一化为去除首尾空白的展示字符串；`BeautyReportItem.levelName` 保持 `string | null`，不与数值 `level` 混用。
- `reportId`、`TaskId`、`CustomerId`：无论原始为字符串还是数字，均分别归一化为稳定字符串；不得参与数值运算，不得互相代用，也不得写入奥本 `customerId`。
- 所有业务判断只消费归一化后的值。原始字段形态差异不得泄漏到 React JSX。

## 8. 综合得分等级规则

厂家未提供独立顶层等级，统一按原始 `Score` 转换：

| Score 范围 | 页面等级 |
|---|---|
| `80 ≤ Score ≤ 100` | A级 |
| `60 ≤ Score < 80` | B级 |
| `40 ≤ Score < 60` | C级 |
| `20 ≤ Score < 40` | D级 |
| `0 ≤ Score < 20` | E级 |

- 示例：`Score = 46 → C级`。
- 映射应为唯一纯函数，不得散落在报告 JSX、Story 或 Mock 中。
- 有小数时使用原始数值直接判断，不先四舍五入。
- `Score` 缺失、非数值或超出 `0—100` 时不擅自截断，返回 `null` 并展示 `--`；超界业务含义列入待确认项。

## 9. 区块一｜整体情况

整体情况合并展示：

- 综合得分（主视觉）。
- 综合得分等级。
- 肤质类型。
- 肤质标签。
- 性别。
- 年龄。
- 检测时间（弱化）。
- 检测次数（弱化）。

约束：

- 主次层级以最终移动端效果图为准，不照搬厂家黑色 H5。
- 肤质标签只展示厂家 `LevelLabel[]`，不自行解释 DSPW 或增加标签。
- 不展示头像、脸部照片、设备信息、客户手机号或其他身份信息。
- 未提供值统一使用轻量 `--`，不删除固定字段标签；数组为空时不制造占位标签。

## 10. 区块二｜问题分析

- 只展示 `summary.problemAnalysis`。
- 完全使用厂家返回文本，不调用 AI，不润色、不总结、不补充结论。
- 支持原始多段文本顺序展示。
- 不展示厂家配图。
- 内容为空时不显示空卡片；页面直接衔接下一有效区块。

## 11. 区块三｜护理建议

- 只展示 `summary.careAdvice`。
- 按厂家返回顺序展示，支持多段/多条，不限定三条。
- 不展示厂家配图，不增加商品、项目或疗程推荐。
- 内容为空时不显示空卡片。

## 12. 区块四｜详细分析与服务端动态顺序

详细分析不得将 16 个项目写成厂家永久固定白名单。正式顺序算法为：

1. 遍历当前报告 `Result[]`，按其原始出现顺序定位业务标识为 `skin`、`senility` 的分组。
2. 按每个分组自身 `Children[]` 的原始顺序依次展开项目，形成当前报告的展示顺序和项目集合。
3. 使用 Children 中的稳定项目标识（优先厂家 `Type`，`Name` 作为展示文案与经确认的辅助匹配）关联对应 `ResultDetail`。
4. 对匹配结果使用归一化后的 `Status === 100`、`FaceType === 2` 过滤有效正脸结果。
5. 只渲染当前服务端配置中存在且有有效 `ResultDetail` 的项目。

当前已确认报告的验收顺序为：

1. 油脂。
2. 毛孔。
3. 黑头。
4. 浅层色素。
5. 混合斑。
6. 痤疮。
7. 屏障。
8. 卟啉。
9. 深层色素。
10. 棕色色素。
11. 紫外线斑。
12. 敏感红素图。
13. 敏感热力图。
14. 皱纹。
15. 粗糙度。
16. 胶原。

规则：

- 上述 16 项是当前已确认报告/fixture 的验收基准，不是代码过滤清单，也不是厂家未来永久项目合同。
- 厂家后续在 `skin/senility.Children[]` 中新增项目时，只要能匹配到有效正脸 `ResultDetail`，页面必须按服务端位置动态展示，不得因不在上述 16 项中而丢弃。
- 某项未返回有效详情、归一化后 `Status !== 100` 或 `FaceType !== 2` 时跳过，其他项目保持 `Children[]` 相对顺序。
- 不为了凑齐 16 项生成空行、空数据或虚构结果，也不得按分数或等级重排。
- 有效 `ResultDetail` 若没有出现在 `skin/senility.Children[]`，因缺少已确认位置，本期不擅自追加到末尾。
- 若同一 Children 项匹配多个同时有效的正脸结果，去重规则必须由产品经理/厂家确认，不得擅自取第一条或最后一条。

## 13. 单项报告展示与交互

每行收起态固定展示：

```text
项目名称      分数    等级    展开箭头
```

示例仅用于结构说明：

```text
油脂          74分    B       ›
毛孔          41分    C       ›
黑头          61分    B       ›
```

- 单项分数、等级和名称必须来自当前项，不按综合评分重新计算。
- 所有项目默认收起。
- 点击单项切换自身展开/收起；再次点击恢复收起。
- 多项可同时展开，不采用强制互斥手风琴。
- 展开箭头只反映当前项状态，并提供 `aria-expanded` 等可访问语义。
- 展开内容依次为“问题分析”和“日常护理建议”。某部分为空时不展示该部分标题或空容器；两部分都为空时行仍可展示结果，但展开后不得出现伪文案。
- 不展示科普知识、检测图片、三脸图片、左右脸切换、`Area`、`Rate`、单项 `Count`、`Image_Composite`、`Image_Background`、`Image_Cover` 或 `Image_Example`。

## 14. 历史记录与分享正式范围

历史记录和分享均为 0020 本期正式范围，不再是占位入口。美容检测页面控制器统一持有：

```text
records
currentRecordId
currentRecord
historyOpen
shareOpen
```

- `currentRecord` 必须由 `records + currentRecordId` 派生；报告正文、历史选中态和分享卡不得分别维护第二套 score、grade、skinType 或 record 状态。
- 进入美容检测时按归一化后的 `basic.detectTime` 倒序选择最新有效记录；相同时间保持稳定 fixture/接口顺序，不以厂家或奥本 ID 大小推断先后。
- 当前最新报告和用户选中的任意历史报告使用同一 `BeautyAssessmentReport`，不得开发两套详情页面。

### 14.1 历史记录列表与切换

- 页面右上角显示“查看历史记录”，位置和视觉与正式发布的体测报告历史入口保持一致。
- 点击后在当前移动端 viewport 内打开带蒙层的底部 Bottom Sheet；支持关闭按钮和点击遮罩关闭。
- 历史记录按 `basic.detectTime` 倒序，最新在前；缺失/不可解析时间排在有效时间之后，不能变成最新记录。
- 单条建议展示：检测时间、综合得分、综合等级、肤质类型；不得展示厂家/奥本客户 ID、手机号、人脸或详细问题分析。
- 当前 `recordId === currentRecordId` 的记录有清晰选中态。
- 1—5 条时 Sheet 随内容自适应；超过 5 条时保持约 5 条可视高度，列表内部纵向滚动，数据不得 `slice(0, 5)` 截断。
- 点击记录后更新 `currentRecordId`、关闭 Sheet，并联动切换整体情况、问题分析、护理建议、详细分析及分享内容。
- 空记录提供“暂无美容检测记录”防御状态，不生成伪报告。

### 14.2 悬浮分享入口与分享预览

- 在移动端 viewport 合适位置展示固定悬浮“分享报告”按钮，不得在页面底部增加第二个大块按钮。
- 点击后打开“半透明蒙层 + 分享卡片预览 + 底部分享渠道面板”；历史 Sheet 与分享预览互斥，任一 overlay 打开时悬浮按钮不得浮在其上或继续响应点击。
- 渠道与正式体测原型一致：保存到相册、微信好友；本期只产生稳定原型反馈，不调用真实 SDK、系统权限或下载能力。
- 关闭分享后回到当前报告，`currentRecordId` 不变。

### 14.3 当前报告与历史报告共用分享

- 分享内容始终由 `currentRecord` 派生。进入页面默认分享最新报告；选择历史记录后，同一悬浮按钮分享该次历史报告。
- “历史报告可分享”指先选择并进入该历史报告，再使用页面统一分享入口；本期不在历史列表每行新增第二套分享按钮。
- 美容分享卡与已正式发布的体测分享卡保持同族结构；允许在账号展示层呈现奥本当前账号头像、用户名，并固定展示“晒一下我的美容检测报告”。
- 当前账号头像和用户名属于奥本账号信息，必须来自当前奥本账号上下文或产品层稳定非真实 PII fixture；不得从厂家 `Customer`、`BeautyReport` 或厂家原始响应中取值，也不得回写进检测报告模型。
- 分享卡的检测业务内容仍固定只展示：综合得分、综合等级、肤质类型、肤质标签，以及奥本品牌文案“科学了解肌肤，更好地照顾自我。”。
- 该固定文案属于奥本美容业务的运营配置，不属于厂家检测字段；后续允许由美容业务调整，但不得写入厂家 adapter、厂家原始 fixture 或 `BeautyReport.summary`。
- 分享卡不得截取、总结、拼接或改写厂家“问题分析”“护理建议”“日常护理建议”，也不得用厂家文本动态生成奥本品牌文案。
- 除明确允许的奥本当前账号头像/用户名外，分享卡不得包含检测时间、厂家 `Customer` 姓名/手机号/头像、厂家/奥本客户 ID、厂家报告 ID、厂家任务 ID、人脸/检测图片、年龄、性别、检测次数、问题分析、护理建议、单项结果或原始响应。
- 分享卡消费轻量 `BeautyShareSummary`（或等价白名单 ViewModel），字段只包含 `score/scoreLevel/skinType/skinLabels/brandMessage`；不得直接接收完整厂家响应。卡片中的 A—E 等级继续复用同一综合等级纯函数。
- 奥本账号头像/用户名作为独立账号展示参数传入分享卡；不得扩充 `BeautyShareSummary` 的检测业务白名单，也不得在 `BeautyReport` 中复制第二套账号身份数据。
- `brandMessage` 由美容业务侧固定配置提供，当前值必须逐字为“科学了解肌肤，更好地照顾自我。”；不得从 `currentRecord` 厂家内容中派生。

### 14.4 与体测历史/分享能力的复用边界

- 实施前必须从最新 `origin/main` 确认体测历史/分享哪些能力已经正式合并并有稳定出口；只允许复用已进入正式 main 的移动端 overlay、Bottom Sheet、悬浮入口或分享渠道 API。
- 规划现场可见的 `ae5fb09` 仍只位于 `feature/0018-body-assessment-history-share`，未进入本地 `origin/main`，因此不能作为 0020 直接代码依赖或复制来源。
- 若届时正式 main 已提供合适的产品内通用能力，美容与体测应复用交互壳但分别提供业务数据和卡片内容。
- 若正式能力仍是 body-assessment 私有实现或尚未合并，只要求交互与视觉一致；在美容模块内最小实现，不复制 feature 代码、不反向依赖未发布分支，也不借机抽建新的跨产品基础设施。

## 15. 移动端视觉规则

- 最终移动端效果图是本期唯一主要视觉基线。
- 延续奥本运动移动端白色、轻量、卡片化视觉，不照搬厂家黑色 H5 皮肤。
- 与最新正式 main 中已发布的体测报告保持：移动 viewport、标题栏/返回、滚动容器、卡片圆角、间距、整体信息密度、历史 Bottom Sheet、选中态、overlay 层级、悬浮分享入口和分享渠道交互的一致性。
- 美容报告可复用稳定 shell、viewport、标题栏、移动 icon 和基础设计 token；不得复制 `BodyAssessmentReport` 的身体指标业务 JSX，也不得让美容模块 import 体测私有数据模型。
- 不新增人脸、检测影像、复杂图表、雷达图、装饰性人体图或未经确认的图标。
- 不为适配 Storybook 改动全局移动端 CSS；美容样式应留在自身模块并使用模块域前缀，避免污染体测和用户中心。

## 16. 参考图目录与使用规则

检查结果：当前 `docs/reference/` 采用根目录历史文件与按任务子目录并存的方式；本任务参考图已放入建议目录：

```text
docs/reference/beauty-assessment-mobile-v1/
```

| 实际文件 | 尺寸 | 正式用途 |
|---|---:|---|
| `01-final-mobile-report.png` | 863 × 1822 | **唯一主要视觉参考**；决定奥本移动端报告的白色轻量风格、四区块层级、综合得分、标签、单项列表、历史入口和悬浮分享按钮布局 |
| `02-vendor-overall-report.png` | 2928 × 1540 | **厂家业务/数据参考**；用于理解基本信息、综合得分、肤质、等级分析及厂家综合报告结构，不复刻其黑色 H5 视觉和脸部图片 |
| `03-vendor-item-report.png` | 3014 × 1554 | **厂家业务/数据参考**；用于理解项目顺序、问题分析和护理建议内容结构，不复刻其黑色 H5 视觉、影像或底部厂家导航 |
| `04-history-share-reference.png` | 770 × 1544 | **美容历史/分享内容参考**；用于确认美容历史和分享卡的业务内容组成，不取代已正式发布的体测历史/分享能力对具体交互和样式的优先基准 |

- `01-final-mobile-report.png` 是本任务唯一主要视觉基线；若其示意数据与已确认接口字段规则冲突，字段规则优先，视觉布局不变。
- `02-vendor-overall-report.png`、`03-vendor-item-report.png` 均不是视觉复刻目标，不得据其补录人脸、手机号、姓名、图片、厂家导航或任务单未确认字段。
- `04-history-share-reference.png` 只冻结美容历史/分享内容参考；历史 Bottom Sheet、分享卡结构、overlay、关闭、渠道和层级等具体交互/样式，仍以开发基线中已正式发布的体测能力为优先基准。
- 目录内 `.DS_Store` 不是需求资产，后续 Git 收口不得纳入提交。
- 不得移动、删除、裁切或重命名上述原图；若后续新增参考图，须在本表按实际文件名补充用途。

## 17. Mock 与数据真实性

- 本期不请求真实厂家接口，使用稳定、无真实 PII、无脸部照片的多记录 prototype fixture。
- 推荐在 `src/shared/beauty-assessment/` 保留“厂家形态输入 fixture → adapter → BeautyReport”的可追溯链路；不得在页面组件硬编码报告内容。
- 已确认的示例可用于固定验收：`Score = 46 → C级`、`LevelName = DSPW`、`LevelLabel = [干, 敏, 色, 衰]`，以及油脂 `74/B`、毛孔 `41/C`、黑头 `61/B`。
- 为覆盖当前 16 项验收顺序、服务端新增项目、缺项、无效状态、空内容及历史切换，允许增加明确标注为原型的稳定 Mock 值；不得宣称这些值来自厂家真实报告，也不得虚构新的业务判断。
- 历史 Mock 至少包含 3 条不同 `reportId/TaskId/ServerCreateTime/Score` 的同一奥本客户记录，并刻意让部分 `reportId` 与 `TaskId` 值不同、`vendorCustomerId` 与奥本 `customerId` 不同，证明报告/任务/客户身份不会混用。
- 至少一组厂家形态 fixture 使用字符串形式的 `Status/FaceType/Score/Level/Age/Count/reportId/TaskId/CustomerId`，另一组可使用数字形式，验证 adapter 归一化后的结果一致。
- Mock 必须包含 `Result[]` 中 `skin/senility.Children[]` 的服务端顺序；允许加入一个不在当前 16 项验收样本中的新 Children 项，并配套有效 `ResultDetail`，证明动态项目不会被硬编码名单丢弃。
- Mock 可包含 `ComprehensiveProposal` 和 `ResultDetail` 的最小已确认字段，但不得伪造完整厂家响应、Token、URL、客户手机号、脸部图片或设备敏感信息。
- 奥本品牌文案不属于厂家 fixture，不得塞入 `ComprehensiveProposal` 或 `ResultDetail`；由移动端美容业务配置单独提供。
- 分享卡所需奥本账号头像/用户名必须来自奥本产品层账号上下文或稳定非真实 PII fixture，不得塞入厂家 `Customer` 或 `BeautyReport`。
- 页面运行时只读，不新增 Provider/store，不写 LocalStorage，不模拟保存或回写厂家数据。

## 18. 已验证接口链路与本期边界

真实系统已验证的厂家链路为：

1. `GET /openapi/accounts/getaccesstoken`：获取 Token。
2. `GET /openapi/customer/getlist`：获取客户档案。
3. `GET /openapi/report/getlist`：获取检测报告列表。
4. 读取 `report/getlist` 返回的 `resultJsonUrl`：获取完整报告。
5. `GET /openapi/report/geth5url`：获取厂家 H5。

未来真实身份链路为：

```text
CustomerId
→ 厂家客户档案
→ 完整手机号
→ 奥本手机号
→ 奥本 customer_id
```

模型身份必须保持：

```text
report/getlist.reportId → vendorReportId
result.json.TaskId      → vendorTaskId
CustomerId              → vendorCustomerId
奥本 customer_id         → customerId
```

`vendorReportId` 与 `vendorTaskId` 必须独立保留；在厂家正式确认两者身份等价前，不得将二者合并、互相回填或用于替代另一字段。

0020 只要求标准模型字段与真实数据结构对齐，并用稳定奥本 fixture ID 演示同一客户的多条历史；不实现上述 HTTP、Token、手机号匹配、真实绑定、鉴权、缓存、错误重试或 H5 获取。任务单和 Mock 禁止写入真实 Token、手机号、URL 签名或客户资料。

## 19. Storybook 信息架构

Story 必须遵循真实产品归属：

```text
移动端｜奥本运动
└─ 我的
   └─ 美容检测
      ├─ 报告详情
      │  ├─ 最近一次报告
      │  ├─ 历史报告
      │  └─ 单项报告展开
      ├─ 历史记录
      │  ├─ 单条记录
      │  └─ 多条记录
      └─ 分享报告
         ├─ 当前报告
         └─ 历史报告

奥本中台
└─ 美容检测
   └─ 移动端报告
      └─ 进入报告
```

- “移动端｜奥本运动”Story 证明真实用户侧产品入口与报告状态。
- “奥本中台”Story 证明原型工程入口可进入同一移动端页面；不得复制 BeautyReport、Mock 或报告组件。
- 至少提供：最近一次报告、历史报告、多条历史（覆盖 >5 条内部滚动）、单项默认收起、多项展开、动态新增项目、缺少部分单项内容/缺项防御状态、当前报告分享、历史报告分享，以及奥本中台入口。
- Story title/导航不得出现 `0020`、V1、Cycle、Mock、Dev、Test、Fixture 等开发视角命名。
- `.storybook/preview.tsx` 如需调整，只能追加“移动端｜奥本运动 → 我的 → 美容检测”和“奥本中台 → 美容检测”的真实菜单排序，不得重排或改名 SCRM/现有 Story。

## 20. 测试规划

### 20.1 Adapter 与模型

1. number 与数字字符串形式的 `Score/Status/FaceType/Level/Age/Count` 得到一致标准值；空串、非有限值和非法字符串归一化为 `null` 而非 `0`，单项 `level` 的类型结果为 `number | null`。
2. string/number 形式的 `report/getlist.reportId`、`result.json.TaskId`、`CustomerId` 分别进入 `vendorReportId/vendorTaskId/vendorCustomerId` 字符串字段，且不覆盖奥本 `customerId`。
3. 在 `reportId` 与 `TaskId` 值不同或任一缺失的 fixture 中，两个标准字段仍各自保持正确值/`null`，不互相回填。
4. `Score/LevelName/LevelLabel/Customer/ServerCreateTime` 正确进入 `BeautyReport.basic`；单项 `levelName` 保持 `string | null`；`female/male/未知` 分别显示女、男、`--`。
5. 综合等级保护 `0/19/20/39/40/46/59/60/79/80/100` 边界，缺失和超界不补造等级。
6. 只读取 `ComprehensiveProposal` 中标题精确匹配的“问题分析”“护理建议”，文本与顺序不被改写。
7. 单项 `Content.title` 为“日常护理建议”或“护理建议”时均归一化进入同一 `careAdvice`，两种标题同时存在时按原顺序合并且不重复生成字段。
8. 字符串 `"100"/"2"` 与数字 `100/2` 均可命中有效 `ResultDetail`；其他状态/脸型被排除。
9. 项目顺序真实来自 `Result[] → skin/senility → Children[]`；当前 16 项 fixture 顺序正确，缺项/无效项跳过且其他 Children 相对顺序不变。
10. 在 Children 中增加一个不属于当前 16 项样本的新有效项目后，标准 `items[]` 和页面均动态出现该项目，证明不存在硬编码白名单过滤。
11. 有效详情不在 Children 中时不会被无序追加；重复有效匹配不会被静默任选。
12. 原始图片字段和未授权字段不进入标准 ViewModel。

### 20.2 真实移动端 DOM/交互

1. 用户中心存在唯一“美容检测”入口，点击进入美容报告，返回恢复用户中心。
2. 页面固定区块顺序为整体情况 → 问题分析 → 护理建议 → 详细分析。
3. `Score = 46` 真实显示 C级，DSPW、肤质标签、性别、年龄、检测时间和次数按主次展示。
4. 问题分析/护理建议保留厂家文本和顺序，不出现图片。
5. 当前确认 fixture 的详细分析真实 DOM 顺序符合 16 项验收基准；服务端 Children 新增有效项目可按配置位置动态出现。
6. 所有单项默认收起；点击展开、再次收起；多个项目可同时展开。
7. 某项问题分析或护理建议为空时，不渲染对应空标题/空区域。
8. 页面不存在脸部照片、三脸切换、光源影像、`Area/Rate/Count`、图片字段或商品推荐。
9. 移动 viewport、滚动区和返回结构继续成立，体测入口与体测报告不回退。

### 20.3 历史记录

1. 进入美容检测默认选择 `basic.detectTime` 最新有效记录，而非 fixture 数组第一条或最大 ID。
2. 点击“查看历史记录”打开 Bottom Sheet；关闭按钮和遮罩关闭有效，且不改变当前记录。
3. 历史列表按检测时间倒序；缺失/非法时间排在有效时间之后。
4. 当前 `recordId` 具有真实选中态和可访问语义。
5. 1 条、5 条和 >5 条状态正确；>5 条列表内部滚动且 DOM/数据未被截断。
6. 点击历史记录更新唯一 `currentRecordId`、关闭 Sheet，并联动更新整体、摘要、详细分析和后续分享内容。
7. 历史列表不显示厂家/奥本 ID、手机号、人脸或详细分析。
8. 空记录显示“暂无美容检测记录”，不渲染伪报告。

### 20.4 分享报告

1. 悬浮分享按钮位于移动 viewport，报告滚动后仍可操作；历史/分享 overlay 打开时层级与点击隔离正确。
2. 点击后真实展示分享卡、蒙层和渠道面板；关闭后当前报告与 `currentRecordId` 不变。
3. 默认最新报告分享内容来自当前最新 `currentRecord`。
4. 选择任意历史记录后再分享，score、A—E 等级和肤质类型/标签全部来自所选 `currentRecord`；不得回退到最新记录。
5. 分享卡真实展示奥本当前账号头像/用户名和“晒一下我的美容检测报告”；账号值来自奥本账号上下文/产品层 fixture，将厂家 `Customer` 头像或姓名改成不同值不得影响分享卡账号区。
6. 检测业务区只包含第 14.3 节 `BeautyShareSummary` 白名单字段，并逐字展示奥本品牌文案“科学了解肌肤，更好地照顾自我。”；除允许的奥本账号展示外，不得展示检测时间、厂家客户信息、年龄、性别、次数、任何 ID、人脸/检测图片、问题/护理文本、单项结果或原始字段。
7. 使用包含厂家护理建议的 fixture 时，分享 DOM 不得出现其原文、节选、摘要、改写或关键词拼接；修改厂家护理建议不得改变固定品牌文案。
8. 保存到相册、微信好友分别产生稳定原型反馈，但不调用真实 SDK、下载或权限。
9. 历史 Sheet 与分享预览互斥，不存在悬浮按钮点击穿透。

### 20.5 奥本中台与 Story

1. 奥本中台 Story 中存在“美容检测”原型入口，点击/进入后渲染同一美容移动报告组件。
2. 中台入口不复制数据或页面状态，不出现虚构 Sidebar/TopBar。
3. Story 的 meta/title 位于第 19 节真实产品层级，不出现任务号或开发命名。
4. Story 真实渲染产品链路，不以静态 HTML 或第二份页面替代。
5. Story 覆盖当前/历史分享和 >5 条历史，且使用同一 records/currentRecordId 状态链。

### 20.6 体测复用与回归

1. 实施代码只 import 最新 main 中已经正式导出的体测通用能力，不出现对 `feature/0018-*` 路径、提交或私有文件的依赖。
2. 若没有稳定通用出口，测试验证美容实现与体测正式交互语义一致，但两者业务数据和报告组件仍隔离。
3. 奥本运动既有体测入口、体测历史/分享（若已正式进入实施基线）和 SCRM 现有业务继续通过回归测试。

测试必须验证真实 DOM 和交互结果，不得只断言常量数组、组件存在或 `if (element)`；不得依赖易碎的私有 CSS 类表达业务结论。

## 21. 预计文件范围

开发时可按当前命名约定微调，但职责边界不得改变。

### 新增

```text
src/shared/beauty-assessment/
├─ beautyAssessmentTypes.ts
├─ beautyAssessmentAdapter.ts
├─ beautyAssessmentMockData.ts
├─ beautyAssessmentSelectors.ts
├─ index.ts
└─ 对应纯数据测试

src/products/aoben-sport-mobile/modules/beauty-assessment/
├─ BeautyAssessmentReport.tsx
├─ BeautyAssessmentHistorySheet.tsx
├─ BeautyAssessmentSharePreview.tsx
├─ BeautyAssessmentShareCard.tsx
├─ beautyAssessmentShareConfig.ts
├─ beautyAssessment.css
└─ 对应页面测试

src/stories/
├─ AobenSportBeautyAssessment.stories.tsx
└─ AobenMiddlePlatformBeautyAssessment.stories.tsx
```

### 最小修改

- `src/products/aoben-sport-mobile/shell/AobenSportMobileRoot.tsx` 及回归测试：增加 `beauty-assessment` view 和返回链路。
- `src/products/aoben-sport-mobile/modules/user-center/UserCenterPage.tsx` 及回归测试：增加唯一“美容检测”入口。
- `src/products/aoben-sport-mobile/index.ts`：导出必要页面/类型。
- 最新 main 中正式发布的移动端历史/分享通用出口：仅在已经存在稳定 API 且无需复制私有 body 业务时按原 API 消费；不得从 feature 分支搬运。
- `.storybook/preview.tsx`：仅在需要时追加真实产品排序。
- `CHANGELOG.md`：开发/发布阶段记录本任务合理变更。
- `src/workbench/requirement-history/requirementHistoryData.ts`：只在 0020 最终发布并完成产品验收后新增一条需求实现记录，不记录开发过程、测试数或 Commit。

### 禁止修改

- `src/products/scrm/`，包括当前 0019 SCRM 体测详情改动。
- `src/products/scrm/shared/admin/`。
- `src/shared/body-assessment/` 的既有体测业务合同和映射，除非出现明确编译阻塞并先报告。
- 0012—0019 已发布/正在实施的业务任务范围。
- 厂家参考图片原文件、依赖清单、Vite 首页或另一套工作台。

## 22. 两个开发闭环与实施顺序

0020 V1 使用 M2 允许的两个开发闭环，不并行修改同一工作区。

### Cycle A｜统一报告、动态项目与历史记录

1. 确认四张参考图、最新干净 main 基线，以及体测历史/分享能力在 main 中的真实合并状态和稳定出口。
2. 建立含 `vendorReportId/vendorTaskId/vendorCustomerId/customerId` 独立身份分层的 `BeautyReport`、综合等级纯映射、数值 `level` 及其他字符串/数字归一化和多记录厂家形态 Mock。
3. 以 `Result[] → skin/senility → Children[]` 建立动态项目顺序，并完成两个护理标题归一化。
4. 实现移动端报告固定四区块和单项多展开交互。
5. 建立 records/currentRecordId/currentRecord 单一状态链，实现默认最新、历史 Bottom Sheet、>5 条滚动和完整报告切换。
6. 接入奥本运动用户中心、返回链路和奥本中台 Storybook 原型入口。
7. 完成 Cycle A Story、测试和相关门禁，交产品经理进行 B 级真实页面验收。

### Cycle B｜当前/历史报告分享

1. 在 Cycle A 已确认的 currentRecord 状态上增加统一悬浮分享入口。
2. 实现隐私白名单 `BeautyShareSummary`、独立奥本当前账号展示参数、固定分享标题、美容业务侧品牌文案配置、分享卡、蒙层、渠道面板和 overlay 互斥；不得消费厂家护理建议。
3. 确认最新报告与任意历史报告都通过同一入口分享当前选择结果。
4. 对齐已正式发布体测分享的交互和视觉；只复用正式 main 稳定 API，不复制未合并代码。
5. 完成当前/历史分享 Story、隐私测试、完整回归和六项门禁，再交产品经理验收。

Cycle A 未通过产品经理验收不得进入 Cycle B；两个 Cycle 全部确认后才允许 Formal Review。

不得拆出第二套“中台美容报告”实现，也不得在本任务中顺带开发 SCRM 美容记录。

## 23. 验收标准

- 奥本运动用户中心可通过唯一“美容检测”入口进入报告并返回。
- 奥本中台 Storybook 入口可进入同一美容检测移动页面，且不伪造完整中台产品壳。
- 页面区块顺序、字段、等级和厂家文本符合本任务单；当前报告呈现已确认的 16 项验收顺序，但代码由 `skin/senility.Children[]` 动态驱动，不使用永久白名单。
- `Score = 46` 显示 C级；A—E 全部边界由纯函数测试保护。
- string/number 两种厂家字段形态产生一致业务结果，单项 `level` 为 `number | null`、`levelName` 为 `string | null`，`reportId/TaskId/CustomerId/customerId` 身份不混用。
- “日常护理建议”和“护理建议”均进入同一单项护理字段，页面无重复业务区块。
- 详细分析默认收起、可独立展开/收起、多项同时展开；无内容部分不显示空区域。
- 未返回或状态无效项目被跳过，不以空数据凑齐 16 项；服务端 Children 新增有效项目可以动态出现。
- 页面不出现客户脸部照片、厂家检测图片、厂家黑色 H5、AI 文案或未确认字段。
- 默认展示最新美容报告；历史 Bottom Sheet、选中态、>5 条内部滚动和任意历史完整报告切换真实可用。
- 最新和历史报告均可通过同一悬浮入口分享当前正在查看的记录；分享卡与体测保持同族结构，可展示奥本当前账号头像/用户名和“晒一下我的美容检测报告”；检测业务白名单仍只包含综合得分、综合等级、肤质类型、肤质标签和固定奥本品牌文案，渠道为稳定原型反馈。
- 分享卡逐字显示“科学了解肌肤，更好地照顾自我。”，且不截取、总结、拼接或改写任何厂家护理建议。
- 体测历史/分享能力只在正式 main 已提供稳定 API 时复用，发布链路中不包含未合并 feature 代码。
- 既有奥本运动用户中心、体测报告、SCRM 与 0019 改动无回归。
- Storybook 导航表达真实产品结构，最终移动端效果图作为 B 级视觉主要依据。

## 24. 明确不做与冻结范围

本期不做：

- 真实 Token、厂家 HTTP/API、`resultJsonUrl` 下载、`geth5url` iframe、接口错误重试。
- 真实客户手机号匹配、身份绑定、权限或敏感数据。
- 客户脸部照片、检测图片、三脸报告、左右脸切换、各种光源影像、图片缓存。
- 厂家黑色 H5 视觉复刻、AI 二次报告、科普知识、商品/项目/疗程推荐。
- 历史对比、搜索、筛选、分页、删除或编辑历史记录。
- 真实保存相册、真实微信分享/SDK、系统权限、二维码、分享链接或后端制图。
- SCRM 美容记录列表/详情、SCRM 菜单/registry、客户详情改造。
- 完整奥本中台产品壳、菜单体系、权限、路由或数据后台。
- Provider/store、LocalStorage、数据库、后端、新依赖或公共 UI 基础设施。
- 0010 Phase 2、0012—0019 其他需求、当前 0019 工作区内容及无关重构。

## 25. 风险与待确认项

### 开发前必须确认

1. 最新干净 `main` 和 0020 feature 基线；不得从当前 0019 脏工作区开始开发。
2. 第 16 节四张参考图在开发分支均可读取，且 `.DS_Store` 不进入 Git 提交。

### 实现中遇到才暂停对应部分

- 厂家实际 `ResultDetail` 键名、大小写、`Content/content` 结构与本任务确认映射不一致。
- 同一检测项目出现多个同时有效的正脸结果，需要明确去重规则。
- `Score` 出现 `0—100` 以外数值，需要厂家确认，不得自行 clamp 或评级。
- 最终参考图要求的“美容检测”用户中心位置与当前默认“紧邻体测”不一致时，以参考图为准，并同步测试。

主要回归风险：

- 为复用视觉而让美容模块依赖体测私有业务组件，形成两种报告耦合。
- 中台入口复制一套 BeautyReport/状态，导致同一报告出现双实现。
- adapter 在没有真实 payload 时兼容虚构字段或把厂家图片带入 ViewModel。
- 把综合 A—E 等级误用于单项厂家等级。
- 新入口破坏 0016 用户中心宫格顺序、viewport 或体测入口。
- history/report/share 各自维护当前记录，造成历史选中、页面内容和分享卡不一致。
- 误把未进入 main 的体测 feature 代码复制到美容模块，形成隐性分支依赖。
- 把当前 16 项验收样本继续写成永久白名单，导致厂家新增 Children 项被静默丢弃。
- 直接对原始字符串字段做数字严格相等判断，造成有效正脸结果或分数被遗漏。
- 厂家 `CustomerId` 被写入奥本 `customerId`，导致后续客户绑定与历史查询混乱。
- 把 `result.json.TaskId` 当成 `report/getlist.reportId`，或在一方缺失时相互回填，导致厂家报告与任务身份混乱。
- 分享卡读取厂家护理建议并进行节选/摘要/改写，导致厂家检测内容与奥本运营内容边界混乱。
- 为展示分享卡账号区而读取厂家 `Customer` 或把奥本账号信息塞入 `BeautyReport`，造成账号身份与检测客户身份混用。

## 26. 后续可扩展项

以下内容必须另立任务或复用届时已正式发布的专项能力：

- 美容历史记录搜索、筛选、分页、删除、编辑和多次报告对比。
- 分享卡真实图片生成、保存相册权限、微信 SDK、分享链接、二维码和访问落地页。
- SCRM 客户详情美容记录列表和详情。
- 真实厂家 API、客户匹配、鉴权、异常状态与数据刷新。
- 厂家图片在获得隐私、存储与展示授权后的独立方案。
- 奥本中台真实产品壳和美容检测运营能力。
- 美容业务后续调整分享卡运营文案；只能修改美容业务配置，不得改造厂家 adapter 或伪装成厂家字段。

后续扩展必须继续复用同一 `BeautyReport` 业务模型，不得复制第二套厂家字段解释。

## 27. 验证与 Review

开发小闭环先执行相关测试，最终交付前统一执行：

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm build-storybook
git diff --check
```

- 不为本任务处理无关 warning、依赖升级、测试性能或现有技术债。
- 产品经理完成真实页面 B 级验收并明确同意后，Codex 才执行唯一一次 Formal Review；如有 Blocking，只允许一次限定修复与限定复审。
- Git add、commit、push、merge 与 Production 发布必须另获产品经理明确授权。

## 28. 任务完成通知

本任务完成后，必须按照项目根目录 `AGENTS.md` 的“任务完成通知”规则执行：

- Codex 使用用户级 `notify` Hook 自动通知，不手动执行通知命令；
- Claude Code 使用手动通知，并将通知作为最后一个工具操作；
- 其他代理优先使用自身运行时 Hook，没有 Hook 时才手动通知；
- 不得同时使用两种机制，不得重复通知；
- 通知失败不得影响任务结论。
