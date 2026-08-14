# 变更记录

本项目遵循"未发布 / 阶段版本"的方式记录重要变化。

## 未发布

### 变更

- 0012 Cycle B：编辑 Drawer C 级截图级视觉复刻修正（不新增业务）
  - 产品经理真实页面验收结论：编辑 Drawer 视觉还原度不足，C 级不通过；本轮严格按真实系统截图复刻，两个 Drawer 统一视觉语言（共享 `record-shared/recordDrawer.css` 单一来源）。
  - Drawer：宽度维持 50vw，白底、标题普通字重（15px/500）、右上角关闭、标题下方留白；正文 `padding: 8px 24px 40px`，表单只占左/中部一小块，右侧保留大片空白（50vw ≠ 控件占满）。
  - Section 标题：2px × 15px 短蓝竖线 + 8px 间距、14px/500，非大块标题条；分区上下间距 28px。
  - 用户信息：三列平铺改为两行文本（第一行 姓名 | 客资来源，第二行 注册时间），简单文本、行间留白，无 Card/Description/灰色信息框。
  - 表单：横向 `label|control`，label 固定 96px 右对齐，每行独立、字段间距 20px；控件不铺满（单下拉 160px、多选 200px、日期时间 200px、备注 210px，约 360px 表单区）。
  - 意向度：普通 InputNumber 改为三段式步进器 `[－] 值 [＋]`（新增 `record-shared/IntentLevelStepper`，浅灰边框、中间白底、左右浅灰按钮、范围 1–5，中间保留 `role=spinbutton` 可编辑输入）。
  - 确定/取消：移除 sticky footer，改为表单主体下方正文按钮（对齐控件列、间距 36px），小按钮 确定 蓝 / 取消 白。
  - 到店特殊：状态 Tag（已到店 蓝浅底 / 未成交 橙浅底）移至「到店信息」标题行右侧；体验课改为一行只读关联信息（状态 | 体验课编号 | 课程名称 | 合同课卡编号 蓝色链接），非 Card/大输入框；「结果分析」独立分区位于确定/取消按钮下方，保持较大间距。
  - 测试：新增 `record-shared/__tests__/RecordDrawerLayout.test.tsx` 3 项结构断言（50vw、两行用户信息、横向 label|control、窄控件包装、步进器与边界 1~5、无 sticky footer、窄 textarea、状态 Tag、结果分析同抽屉），避免像素级硬断言；既有功能测试 20 项全部继续通过，全量 467 项通过；lint/typecheck/build/build-storybook/`git diff --check` 全部通过。
  - 冻结项零改动：未修改 updateVisitRecord/updateArrivalRecord/Provider/store/下次拜访时间与结果分析业务逻辑/19 列/32 列/Mock 结构/操作菜单/菜单布局/筛选/分页；未新增 create 入口、未做变更记录 Drawer、未修改 `shared/admin`。
  - 同步 `docs/task-specs/0012-arrival-visit-modules.md`（§22 追加「C 级截图级视觉复刻修正」执行记录）。

- 0012 Cycle B 第一阶段：到店记录 / 拜访记录编辑详情 Drawer（edit，C 级 UI 口径）
  - 编辑 Drawer：`VisitRecordDrawer` / `ArrivalRecordDrawer` 均右侧 Drawer、宽度 50vw、标题「编辑拜访记录」「编辑到店记录」、覆盖底部页面 + 遮罩、内容区独立纵向滚动、右上角关闭、页脚 取消/确定；保存原位写回运行时状态后关闭，取消仅关闭不保存，无路由跳转、无新 Modal。
  - 拜访 Drawer「拜访信息」7 字段严格顺序（*拜访方式 *拜访时间 *意向度 *改善需求 *意向课程 下次拜访时间 拜访备注）；拜访方式选项 系统外呼/自主拨打/企微/微信；意向度 InputNumber 1–5 数字步进；改善需求 10 项多选、意向课程 7 项单选；下次拜访时间 可空 DateTime（回填/修改/清空，空值显示 `--`，格式 `YYYY-MM-DD HH:mm:ss`）；拜访备注多行。
  - 到店 Drawer「到店信息」8 字段严格顺序（*预约门店 体验课 *到店时间 *意向度 *改善需求 *意向课程 预约备注，底部独立「结果分析」分区）；当前状态只读展示 已到店/未到店 + 已成交/未成交 Tag；体验课只读关联信息（状态/体验课编号/课程名称/合同课卡编号，仅用现有 Mock）；结果分析为普通业务字段，与其他到店字段一起保存（非独立实体/流程/子模块）。
  - 用户信息只读：姓名/客资来源/注册时间，来自客户主数据（按记录 `customerKey` 关联），编辑不修改客户主数据。
  - 单一运行时状态：`record-shared/recordRuntimeStore.tsx` 的 `RecordRuntimeStoreProvider` 挂在产品层共同祖先（`StoreCustomerList`），覆盖 独立到店页 / 独立拜访页 / 门店客户跟进详情两个记录 Tab（三消费者读同一 state 实例，禁止各页面自建 Provider）；提供 `getArrivalRecords/getVisitRecords/getArrivalRecordsByCustomerKey/getVisitRecordsByCustomerKey/updateArrivalRecord/updateVisitRecord`；刷新恢复初始 Mock，不落盘（无 LocalStorage/API/数据库/新依赖）；create 保留无入口（§8 冻结）。
  - 编辑入口：`record-shared/RecordOperationCell` 将列表「操作」菜单的「编辑」项接入 `RecordEditActionsContext`（产品层提供），拜访/到店独立页与跟进详情 Tab 操作列均打开同一对编辑 Drawer；「变更记录」菜单项保留但本期不实现，无「开发中」提示。
  - 日期时间无 dayjs 方案：`record-shared/DateTimeField` = 可编辑 Input（字符串）+ 后缀日历 Popover 内非受控 DatePicker（取 `dateString` 第二参），不引入 dayjs 依赖。
  - Storybook：拜访 3 个编辑 Drawer 故事（默认回填 / 下次拜访时间有值 / 下次拜访时间为空）+ 到店 4 个（默认回填 / 已到店未成交 / 结果分析有值 / 结果分析为空），均渲染真实组件。
  - 测试：新增 拜访编辑交互 11 项、到店编辑交互 9 项、store 5 项（含 修改/清空下次拜访时间、结果分析修改、独立页/跟进详情 Tab 两端同步、取消不保存、单一状态实例、无 Provider 严格抛错）；更新独立页/跟进详情测试接入 store Provider；全量 464 项测试通过；lint/typecheck/build/build-storybook/`git diff --check` 全部通过。
  - 冻结项零改动：到店 32 列顺序、拜访 19 列顺序、下次拜访时间第 7 列、筛选区、导出、分页、菜单布局、Cycle A 页面骨架、跟进流程、跟进概览、跟进旅程、通话 13 列、分配 2 列、门店客户 52 列、Requirement、无效审批、新办成交金额、shared/admin 均未修改。
  - 未实施：ArrivalChangeRecordDrawer、新增到店/新增拜访入口、提醒、今日待办、系统外呼联动、0010 Phase 2。
  - 同步 `docs/task-specs/0012-arrival-visit-modules.md`（新增 §22 Cycle B 第一阶段执行记录）。

- 0012 Cycle A：到店记录/拜访记录独立模块化（M3-S，C 级 UI 口径，未进入 Cycle B）
  - 产品层菜单：潜客管理子菜单前三项为 门店客户 / 到店记录 / 拜访记录，可点击切换内容槽位；正式 key 沿用 `store-customer`、`arrival-record`、`visit-record`，不再使用 `visit-record-2` 等临时 key。
  - 单一来源业务模块：新建 `prospect-management/record-shared/`（RecordCellVisuals、recordFormatters）、`arrival-record/`、`visit-record/`、`navigation/prospectManagementPages.ts`；一套到店/拜访 types、columns、mock、formatters 与状态视觉同时被独立页面与跟进详情 Tab 消费，不再保留第二套列定义。
  - 拜访记录升级为 19 列：第 7 列"下次拜访时间"（字段名 `nextVisitTime`，`string | null`，格式 `YYYY-MM-DD HH:mm:ss`，空值显示 `--`，位于 客资来源 之后、预约门店 之前）；跟进详情拜访记录 Tab 与独立页同步升级。
  - 独立页面：`ArrivalRecordPage`（12 筛选字段 + 搜索/重置/导出，32 列列表 + 分页）、`VisitRecordPage`（8 筛选字段 + 搜索/重置/导出，19 列列表 + 分页）；两页仅提供归集、查询、筛选、查看，不渲染任何 添加记录/新增/编辑 按钮。
  - 数据迁移：`followUpShared.tsx` 迁移为 `record-shared/`；`followUpTypes.ts` 中的 ArrivalRecord/VisitRecord/formatRecordAmount 迁移至对应模块；`callRecordColumns.tsx` 仅改导入路径（13 列定义未动）；旧 `followUpShared.tsx`、旧到店/拜访 columns 文件删除。
  - Storybook：新增 `SCRM/潜客管理/到店记录`（正常列表、空数据）、`SCRM/潜客管理/拜访记录`（正常列表、下次拜访时间有值、下次拜访时间为空、空数据）；0011 跟进详情拜访记录 Story 描述同步为 19 列。
  - 测试：独立页真实 DOM 测试（到店 10 项、拜访 12 项）+ 菜单切换 6 项 + 既有 0011/全局回归保留，全量 421 项测试全部通过。
  - 保护清单零改动：0011 用户信息、五个 Tab、操作条四入口、overview Tooltip/hover、旅程、客资有效性、通话 13 列、分配 2 列、门店客户 52 列、Requirement 体系、shared/admin API、StatusTags.tsx、requirements.json 等均有回归测试覆盖。
  - 同步 `docs/task-specs/0012-arrival-visit-modules.md`（新增 §21 Cycle A 执行记录：已交付、说明与限定、待办）。
  - C 级验收修正（3 项视觉）：是否成交 统一 Tag 风格（已成交 绿色 `#52c41a/#f6ffed/#b7eb8f`、未成交 橙色，新增 `record-shared/DealStatusTag`，未改 StatusTags.tsx 与字段值/业务判断）；到店/拜访列表"意向度"列改为纯数字文本（跟进旅程卡 `意向度N` 蓝色 Tag 保留不变）；操作列由蓝色"详情"链接改为 操作 按钮 + Dropdown（白色/极浅背景、浅灰边框、小尺寸后台按钮；到店菜单 编辑/变更记录，拜访菜单仅 编辑，顺序固定；点击为 Cycle B 占位 no-op，仅关闭菜单，不打开 Drawer/不 Mock 写回/不弹 toast）。通话记录操作列维持 0011 的"详情"链接不变；到店/拜访独立页与跟进详情 Tab 共享 columns 自然同步。测试新增 14 项真实 DOM 交互断言（到店 +5、拜访 +4、跟进详情 +5），全量 439 项通过；32/19 列顺序、第 7 列、52 列、shared/admin 零改动。
  - 待产品经理 C 级修复后复验；验收确认后进入 Cycle B（单一运行时数据源、create/edit Drawer、ArrivalChangeRecordDrawer、新增入口）。

- 0011 Cycle 1 用户信息顶部操作条去状态标签（产品经理最终页面验收修正，未进入 Cycle 2，未实施 Phase 2）
  - 从用户信息顶部操作条删除 已到店/未到店、已成交/未成交 业务状态标签（删除 VisitedTag/DealTag 在操作条中的渲染及对应 `.store-customer-followup-op-status-tags` 死样式）；顶部操作条最终为 手动变更 / 更多操作 / 添加到店 / 添加拜访记录 四项，顺序固定，操作条为操作区，不根据 isVisited/isDeal 自动添加任何状态标签。
  - 仅删除操作条这一处使用；VisitedTag/DealTag 组件本身、CustomerRecord 状态字段、到店旅程卡状态标签、到店记录 Tab 状态标签与既有业务逻辑零改动。
  - 浅灰操作条、蓝色文字入口、浅蓝描边按钮与 spacing 全部保持不变。
  - 同步 `docs/task-specs/0011-store-customer-follow-up-detail.md`（删除“操作条开头展示到店/成交状态标签”规则，明确操作条最终四项，测试规划第 19 项改为操作条仅四项且不含状态标签）。
  - 测试覆盖同步：操作条不显示 已到店/未到店/已成交/未成交 + 四项严格保留；到店旅程卡状态标签与到店记录 Tab 状态展示测试保留通过；跟进详情测试 44→45 项，全量 393 项测试全部保留通过。

- 0011 Cycle 1 最后一轮 C 级视觉微调（产品经理真实系统复验收口补丁，未进入 Cycle 2，未实施 Phase 2）
  - 用户信息再增加留白：row1（头像+姓名+编辑+客资来源变更记录）与 row2（客资来源 | 微信号 | 手机号）间距 12→18px、身份信息区与左右两栏底部留白 20→28px、左右两栏内三行纵向间距 18→28px；字段、左右两栏与业务数据完全不变，采用低密度后台详情信息间距（不紧凑、不松散），label/value 稳定对齐。
  - 跟进概览四张卡 hover：整卡 cursor 体现可交互；hover 轻微抬升（translateY(-1px)）+ 极轻微放大（scale 1.006）+ 轻度阴影 + 边框极轻强化，transition 160ms 平滑且短；四卡统一，克制不跳动、无彩色发光/蓝色粗边框/Dashboard 悬浮。
  - 四张概览卡 info 图标接入现有 Ant Tooltip（placement top，深色背景、白色文字、小圆角、小箭头、在图标上方、不遮挡主数字）；鼠标 hover 与键盘 focus（tabIndex=0 + focus-visible 轻量轮廓）均可触发；四条文案为产品经理确认原文逐字一致：剩余体验课次数→显示用户剩余的体验课次数信息、总到店记录数→显示用户的总到店记录数统计、总拜访次数→显示用户的总拜访次数统计、总成交金额（元）→显示用户的总成交金额统计。
  - 整卡点击业务结果尚未确认：本轮只复刻 hover 交互视觉与可交互反馈，不跳转 Tab、不开 Drawer、不新增路由、不新增业务点击结果，待产品经理确认后单独补交互。
  - 顶部 5 个 Tab、操作条、用户信息字段、跟进旅程 Select、旅程卡、客资有效性旅程、旅程分页、四类记录表、columns.tsx、shared/admin、Requirement 体系与 52 列基线零改动。
  - 同步 `docs/task-specs/0011-store-customer-follow-up-detail.md`（用户信息宽松详情间距、四卡 hover 反馈、info Tooltip 四条原文、整卡点击行为未确认说明，测试规划新增 27–30 项）。
  - 测试覆盖同步：四卡 info 入口 ×4、四条 Tooltip 文案逐字一致、四卡字段/顺序/主值不变、点击概览卡无任何业务跳转/抽屉/新交互；跟进详情测试 37→44 项，全量 385 项测试全部保留通过。

- 0011 Cycle 1 第二轮 C 级视觉限定修正（产品经理基于真实系统页面新一轮验收反馈，未进入 Cycle 2，未实施 Phase 2）
  - 跟进旅程 Select 位置：由模块标题行最右改为紧跟标题左侧（间距约 10px、宽 168px），不再使用 `justify-content: space-between` 推到最右；六项固定选项不变。
  - 用户信息：恢复姓名旁“编辑”；“客资来源变更记录”从最右移回紧邻姓名（row1 = 头像 + 姓名 + 编辑 + 客资来源变更记录）；操作条开头新增 到店/成交业务状态标签（已到店/未到店、已成交/未成交，由当前 CustomerRecord 现有字段派生，未新增第二套状态字段）；信息行纵向间距、label/value 间距与左右两栏留白放宽。
  - 跟进概览：卡片内部纵向留白增加；“总拜访次数”卡“未拜访时长”改为上下层级（label 上、value 下），其余字段/Mock/四卡结构不变。
  - 跟进旅程卡按真实系统还原：header（左侧状态标签 + 右侧“详情”）+ 浅分隔线 + 单列纵向 body（到店卡 到店时间/预约门店/体验课/改善需求/意向课程；拜访卡 拜访时间/改善需求/意向课程；通话卡沿用既有字段统一视觉）；不再使用左右双栏字段网格。
  - 新增“客资有效性”旅程记录：标注无效客资 / 恢复有效客资 各一条（header 标签区分）；卡字段为 提交时间/提交员工/备注/附件（附件为静态占位/缩略图 Mock，不真实上传）；历史操作记录与当前无效审批状态字段业务语义相互独立；“客资有效性”筛选只展示该类记录、“全部”与其他类型混合倒序。
  - 旅程列表底部新增现有后台风格分页（复用 AdminPagination，`journey-pagination-area` 锚点）：共 N 条、默认 10 条/页、上一页/下一页（不足 10 条正确禁用）；切换筛选后总数与分页状态同步；纯前端 Mock，无后端/LocalStorage。
  - 四类记录 Tab（到店 32 / 拜访 18 / 通话 13 / 分配 2 列）本轮零业务改动；52 列基线、Requirement 与审批保护无回归；shared/admin 零改动（仅页面复用 AdminPagination）。
  - 同步修正 `docs/task-specs/0011-store-customer-follow-up-detail.md`（Select 靠标题左侧、编辑与客资来源变更记录位置、操作条状态标签、用户信息间距、旅程卡真实结构、客资有效性旅程定义与字段、旅程分页，移除“旅程卡待真实截图确认”旧描述）与 `CHANGELOG.md`。
  - Story 文档同步：跟进旅程有数据改为 Select 靠标题左侧 + 旅程卡真实结构 + 客资有效性事件 + 分页描述。
  - 测试覆盖同步 18 项验证：Select 与标题同一左侧区域、编辑恢复、客资来源变更记录位于身份区、操作条到店/成交状态标签、到店旅程卡字段顺序与单列结构、拜访旅程卡字段顺序、客资有效性筛选与 Mock、客资有效性字段、全部混合展示、时间倒序、分页存在/默认 10 条/页/筛选后总数同步、概览“未拜访时长”上下层级；四类记录 Tab 与 52 列保护测试全部保留。

- 0011 Cycle 1 第一轮 C 级视觉限定修正（产品经理真实页面验收反馈，未进入 Cycle 2，未实施 Phase 2）
  - 顶部五 Tab 改为内容区顶部浅灰容器平铺文字菜单：未选中灰色、选中为系统蓝色文字，移除标准 Ant 下划线与 ink；功能与顺序不变。
  - 用户信息重构：顶部独立浅灰操作条（手动变更 / 更多操作 蓝色文字，添加到店 / 添加拜访记录 浅蓝描边按钮，操作条不在姓名/头像行内）；身份区 row1 = 头像 + 姓名 + 客资来源变更记录、row2 = 客资来源 | 微信号 | 手机号；左右两栏（左：预约门店 / 跟进人 / 进入公海时间；右：共享人（值+添加）/ 标签（编辑+变更记录）/ 注册时间）。已移除 客户状态、姓名旁“编辑”、分配信息、分配记录入口；“添加到店”文案修正（非“添加到店记录”）。
  - 跟进概览由简单四主值卡片升级为主值 + 分组详细统计：剩余体验课次数（总体验课次数/总体验课卡数）、总到店记录数（有体验课到店次数/未到店次数 + 上次/首次到店时间）、总拜访次数（未拜访时长 + 上次/首次拜访时间）、总成交金额（元）（剩余价值/总退款金额 + 总成交课卡数/成交课程类型）；组间浅分隔线、右上角 CSS 信息图标视觉、主值数字加大、无趋势图表。
  - 跟进旅程筛选由六项按钮改为模块标题行右侧单一 Select（默认全部，六项固定选项：全部/到店记录/拜访记录/通话记录/已丢单/客资有效性）；旅程记录卡视觉保持现状，待产品经理补充实际系统截图后另行验收。
  - 四类记录表（到店 32 / 拜访 18 / 通话 13 / 分配 2 列）本轮零业务改动；52 列基线、Requirement 与审批保护无回归；shared/admin 零改动。
  - 同步修正 `docs/task-specs/0011-store-customer-follow-up-detail.md`（Tab 视觉、用户信息、概览详细统计、单一 Select、旅程卡待截图验收、测试规划与验收清单）与 `CHANGELOG.md`。
  - Story 文档同步：跟进旅程有数据改为单一 Select 描述，“分配记录入口”引用移除。
  - 测试覆盖同步 15 项验证：五个 Tab、用户信息无客户状态/编辑/分配信息/分配记录入口、操作条四入口、四张概览卡分组详细字段、单一 Select 默认全部与六项顺序、无 `journey-filter-*` 六按钮、筛选结果可用、四类记录表与 52 列保护全部保留。

- 0011 Cycle 1：门店客户跟进详情
  - 唯一入口：门店客户列表行级"操作"菜单第一项"跟进详情"，点击在右侧打开一级抽屉——标题"跟进详情"、宽 70vw、右上角关闭；抽屉打开期间底层列表的筛选、排序、分页与滚动位置保持不变，不做路由跳转、不替换页面。
  - 固定五个 Tab：跟进流程 / 到店记录 / 拜访记录 / 通话记录 / 分配记录，默认跟进流程；Tab 切换保持抽屉打开且客户不变，名称与顺序固定、不随 Mock 动态变化。
  - 跟进流程三段：用户信息 → 跟进概览 → 跟进旅程。用户信息直接来自当前列表选中的 CustomerRecord（姓名/头像/客户状态/客资来源/手机号/预约门店/跟进人/分配信息/共享人/标签/公海时间/注册时间），顶部提供 编辑 / 手动变更 / 更多操作 / 添加到店记录 / 添加拜访记录 视觉入口；"分配记录入口"仅切换到本抽屉的"分配记录"Tab。
  - 跟进概览四张等宽卡片：剩余体验课次数 / 总到店记录数 / 总拜访次数 / 总成交金额（元），白底浅边框小圆角、无趋势图表；金额统一两位小数、空值显示 `--`。
  - 跟进旅程六项固定筛选（全部 / 到店记录 / 拜访记录 / 通话记录 / 已丢单 / 客资有效性），事件按时间倒序（最新在前）；到店卡与拜访卡含状态标签、意向度与业务字段，空态显示"暂无数据"；Mock 通过稳定客户 key 关联当前列表客户，可稳定复现空态与填充态。
  - 四类记录只读列表：到店 32 列 / 拜访 18 列 / 通话 13 列（横向滚动、操作列固定右侧、金额统一两位小数且空值 `--`、姓名蓝色链接、是否到店/是否成交状态标签复用现有样式、通话时长蓝色样式、操作列仅视觉）；分配记录仅 分配人 / 分配时间 两列，无操作列、不制造横向滚动。列定义保留在 0011 页面模块 `follow-up-detail/` 内，不下沉 shared/admin。
  - 复用 0010 Phase 1 的 AdminDataTable，shared/admin 零改动；52 列基线、SC-08-10（标记无效客资）、displayNumber 13 等既有需求点与列定义均未改动。
  - 新增 8 个 Story（操作菜单打开跟进详情 / 跟进详情默认跟进流程 / 跟进旅程有数据 / 到店记录 / 拜访记录 / 通话记录 / 分配记录 / 需求查看模式跟进详情），记录 Tab Story 通过夹具刷新直接进入对应 Tab。
  - 新增 `follow-up-detail/__tests__/StoreCustomerListFollowUp.test.tsx`；与既有测试合计 380 项全部通过。

- 门店客户列表 52 列字段基线（当前状态，不追溯改写 0008 历史"当时 51 列"事实）
  - 当前页面共 52 列，前 3 列固定为"姓名 → 手机号 → 客资来源"；第 9 列为"标记无效客资"，第 10 列为"拜访次数"，第 11 列为"近7天到店次数"，第 12 列为"无效审批状态"，第 13 列为"ID"；"首次分配时间"位于尾部第 50 列、"创建时间"第 51 列、"操作"固定为第 52 列。
  - 新增"标记无效客资"列（列 key `invalidCustomerFlag`），作为最终业务结果字段，由无效审批状态实时派生：`approved → 是`，`null / pending / rejected → 否`；与"无效审批状态"的字段、需求对象与展示语义相互独立，不把 `invalidApprovalStatus` 作为新列 dataIndex，不新增第二套模拟状态字段。
  - 新增列级稳定锚点 `invalid-customer-flag-column`；已有需求点编号与 `requirementNo` 保持不变。
  - 标记无效客资正式需求映射已接入（编号经产品经理确认）：requirement key `scrm-store-customer-invalid-customer-flag`，displayNumber 13，requirementNo SC-08-10，targetId `invalid-customer-flag-column`；`REQUIREMENT_POINTS`、当前页面 `requirements.json`、`EXPECTED_REQUIREMENT_KEYS` 三套映射均扩展为 16 条且完全一致，displayNumber 唯一集合为 1～13；不重排任何已有编号，WB-01 仍为 12，9/10 共享机制保持不变。
  - 正常列表 Story 补充最新 52 列说明；现有排序、分页、固定列与横向滚动行为保持不变。

- 门店客户列表字段顺序紧急调整（当前状态）：将既有"拜访次数"从原第 25 列移动到第 10 列，将既有"近7天到店次数"从原第 23 列移动到第 11 列；原第 10 列及其后字段顺延，"无效审批状态"调整为第 12 列、"ID"调整为第 13 列。两个移动字段仅改变位置，字段 key、数据来源和展示逻辑均保持不变；Requirement 标识与映射不变。

- 门店客户列表首次分配时间位置修正：将"首次分配时间"从原第 11 列移至尾部倒数区域，明确为第 50 列（紧邻"创建时间"之前）。`firstAssignTime` 字段名、数据逻辑与排序能力保持不变，requirement key、requirementNo SC-01-01、displayNumber 1、targetId `first-allocation-time-column` 均保持不变；总列数仍严格为 52。后续前部字段顺序以本节最新 52 列当前状态为准。

- 0008 闭环一：门店客户列表字段调整
  - 删除"实际到店状态""实际成交状态"两列及其类型、模拟数据和需求点。
  - 预约到店时间移至最新分配时间与是否到店之间（第 4 列），保留排序和需求查看隔离。
  - 新增"新办成交金额"列（`firstDealAmount: number | null`），位于是否成交之后，保留两位小数，空值显示 `--`，`0` 显示 `0.00`，不支持排序。
  - "无效客资状态"统一更名为"无效审批状态"，数据层使用 `null | 'pending' | 'approved' | 'rejected'`，展示映射为 `--` / 待审核（橙） / 审核通过（绿） / 审核退回（红）。
  - 筛选区同步更新为"无效审批状态"，提供待审核、审核通过、审核退回三种选项。
  - 当前页面需求点更新为 9 条（1—8、12），对应 0008 闭环一字段；模式控制编号 12 由 prototype-core 维护。
  - 6 个测试文件、279 项测试全部通过（含 0008 闭环一限定修复新增的 4 项新办成交金额与筛选验证测试）。

- 0008 闭环二：无效审批流程（已完成正式 Review 后限定修复）
  - "标记无效客资"抽屉：只展示理由（必填，红色 *）和附件（非必填）。
  - 审核无效标注抽屉：审核意见水平排列，必填带红色 *；退回时备注必填（红色 *），通过时非必填（无 *）；确认按钮提交中禁用防重复提交。
  - 无效标注详情抽屉：补全完整字段结构，-- 占位空值；行级锚点使用 `invalid-approval-detail-${record.key}`。
  - 审批状态类型收紧为 `InvalidApprovalStatus = 'pending' | 'approved' | 'rejected' | null`；状态流转增加守卫（仅 null/rejected 可申请，仅 pending 可审核）。
  - 操作菜单纯状态驱动：null/rejected → 标记无效客资，pending → 审核无效标注，approved → 不显示。
  - 详情仅通过点击非空无效审批状态标签打开。
  - 预置审批数据：pending（李四）有完整申请数据且无已完成审核数据；approved（陈晨）、rejected（周杰）均有完整申请和审核模拟数据。
  - 补齐 `2026-07-scrm-invalid-approval-flow` 正式需求批次（8 条需求，P1/developing），并通过 `getBatchRequirements()` 运行时 Requirement Schema 校验。
  - 5 个字段支持排序（首次分配时间、最新分配时间、预约到店时间、是否到店、是否成交），空值始终排在末尾。
  - 7 个测试文件、327 项测试全部通过（补齐防重复提交、三种审批详情实际值、五列完整升降序与空值末尾验证，并移除固定列下标和 Ant Design 私有 CSS 类依赖）。

### 修复

- 需求查看通用文字样式：修复 `RequirementMarker` 在原型模式中将编号点视觉类（如 `requirement-marker--header` 的 `font-size: 10px`）泄漏到业务文字包裹层的问题。现在原型模式使用中性 `requirement-marker-prototype-target` 包裹层，需求模式编号样式仅作用于编号圆点自身，两种模式下业务文字均继承父级字号、字重和行高。
- 限定修复（Codex Review）：移除 StoreCustomerList 测试中的可选 `if` 假通过；新增 RequirementMarker `getComputedStyle` 真实计算样式比较测试（fontSize / fontWeight / lineHeight），验证两种模式业务文字样式一致且等于父级设定值。6 文件 / 275 项测试全部通过。
- SCRM 品牌名称统一：页面左侧导航品牌区改为「SCRM系统」、主体顶部系统标题改为「SCRM管理系统」、Storybook 业务目录改为 `SCRM/潜客管理/门店客户`，清除全部「示例 SCRM」旧名称。
- 同步更新 `PROJECT_STRUCTURE.md` 和 `CHANGELOG.md` 中的名称引用。

### 新增

- 初始化统一低敏版需求原型工作台。
- 建立项目治理规则、目录边界、需求 Schema 说明和协作流程。
- 正式需求数据模型与校验规则：
  - 正式需求 Zod Schema，覆盖全部字段及跨字段校验。
  - 七种需求状态枚举、六种优先级枚举。
  - 五种锚点可辨识联合类型（element / region / virtual-region / multi-anchor / state-anchor）。
  - StableId 格式校验（禁止开头/结尾/连续短横线）。
  - 跨字段校验：module 归属、数组去重、禁止自关联、时间先后、锚点目标去重。
  - 带时区 ISO 8601 日期时间校验。
  - `v{major}.{minor}.{patch}` 版本格式校验。
  - 171 个 Schema Vitest 测试用例覆盖合法与非法场景。
  - TypeScript 类型全部从 Zod Schema 通过 `z.infer` 推导。
  - 所有嵌套对象拒绝未知字段（含坐标字段）。
- 门店客户列表：
  - 52 列完整列表页，含左侧导航、顶部系统栏、顶部标签、筛选区、表格和分页。
  - 支持搜索、重置、筛选、排序、分页、操作菜单和导出反馈。
  - 6 个 Story 覆盖正常、加载、空数据、筛选无结果、查询失败和导出成功。
- 需求查看模式：
  - 独立 requirements.json + 专用 Zod Schema，12 条需求说明数据。
  - 原型体验/需求查看双模式，蓝色圆形白色数字编号点 1—12。
  - 右侧只读需求抽屉，空字段隐藏，空状态回退"待确认"。
  - 预约到店时间排序隔离，操作菜单业务动作隔离。
  - 模式切换保持筛选、排序、分页、展开状态和横向滚动。
  - 2 个新模式 Story + Schema 测试，全部 251 个测试通过。
- 低敏统一版本初始化：去除品牌标识与身份信息，项目可同时用于内部协作与作品集展示。
