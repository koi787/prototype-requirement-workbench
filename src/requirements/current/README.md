# 当前已发布需求引用

后续保存当前已发布需求版本的稳定引用。草稿不得直接覆盖此处的已发布内容。

## Schema 校验

正式需求数据通过 `src/requirements/schemas/` 中的 Zod Schema 进行运行时校验：

- `requirementSchema` — 正式需求根 Schema，覆盖全部字段与跨字段校验
- `requirementStatusSchema` — 需求状态枚举（7 种）
- `requirementPrioritySchema` — 优先级枚举（P0—P5）
- `anchorUnionSchema` — 五种锚点可辨识联合类型
- 所有 TypeScript 类型从 Schema 通过 `z.infer` 推导

导入方式：

```typescript
import { requirementSchema, type Requirement } from '../schemas';
```

## 校验规则摘要

- 稳定 ID：小写英文 + 数字 + 短横线，不允许开头/结尾/连续短横线
- 日期时间：带时区的 ISO 8601 格式
- 版本号：`v{major}.{minor}.{patch}` 或 `null`
- 跨字段校验：模块归属、数组去重、禁止自关联、时间先后、锚点目标去重
- 所有嵌套对象拒绝未知字段，包括坐标字段
