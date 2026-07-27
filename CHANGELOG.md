# 变更记录

本项目遵循"未发布 / 阶段版本"的方式记录重要变化。

## 未发布

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
