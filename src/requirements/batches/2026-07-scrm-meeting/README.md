# 2026-07 SCRM 推进会

这是正式需求批次的预留目录。第一阶段不写入演示需求，也不虚构会议业务规则。

## 正式需求 Schema

本批次中的需求数据需符合 `src/requirements/schemas/` 中定义的正式需求 Schema：

- 稳定 ID 使用小写英文、数字和短横线格式
- 需求状态限于 7 种枚举值，优先级限于 P0—P5
- 锚点使用 element、region、virtual-region、multi-anchor、state-anchor 五种结构
- 禁止使用页面绝对坐标定位
- 跨字段校验：模块归属、数组去重、时间先后等

具体字段定义和校验规则见项目根目录 `REQUIREMENT_SCHEMA.md`。
