# 需求原型工作台

需求原型工作台（Prototype Requirement Workbench）是一个长期维护的本地代码项目，用于集中展示多个产品、模块、页面与结构化需求说明。

这是统一低敏版本，同时用于：

- 内部开发人员查看业务原型、页面交互和结构化需求说明。
- 产品、研发和测试围绕同一原型进行后续协作。
- 用户个人作品集展示。
- 后续所有产品、模块、页面和需求查看能力的持续迭代。

Storybook 是当前唯一主要入口；Vite 应用首页仅承担最小启动说明，不建设第二套工作台。

本项目中的所有数据均为示例数据，不包含真实客户资料、真实接口、登录系统或生产提交。

## 当前阶段

第一阶段只建设工程骨架和最小交互闭环，产品目录为"示例 SCRM"。能力演示数据不会写入正式需求批次。

## 技术栈

- React
- TypeScript 严格模式
- Vite
- Storybook React + Vite
- Ant Design
- Zod
- Vitest
- React Testing Library
- ESLint
- pnpm

## 本地启动

```bash
pnpm install
pnpm storybook
```

Vite 最小说明页：

```bash
pnpm dev
```

质量检查：

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm build-storybook
```

## 原型体验与需求查看

### 原型体验模式

默认模式，展示页面完整的交互原型，不显示需求编号点。

### 需求查看模式

点击页面右上方"查看需求"按钮进入，页面上显示 1—12 号蓝色需求编号点。点击编号点打开右侧抽屉，查看该需求的结构化说明（编号、名称、定义、数据来源、规则和备注）。

## JSON 需求说明

12 条需求说明位于 `src/requirements/products/scrm/pages/store-customer/requirements.json`，通过专用 Zod Schema 校验。可以直接修改 JSON 文件更新需求说明，修改后 HMR 即时生效。

## 如何新增需求

1. GPT 分析和澄清产品需求，产品经理确认范围、规则和验收标准。
2. Codex 阅读 `AGENTS.md`、现有产品目录和需求批次，检查是否已有同类内容。
3. Codex 在 `docs/task-specs/` 保存面向 Claude + DeepSeek V4 的开发任务单。
4. Claude + DeepSeek V4 在 VS Code 中按任务单开发；页面代码放入 `src/products/`，需求数据放入 `src/requirements/`，不得混写。
5. Claude + DeepSeek V4 完成开发侧测试后，将修改清单和验证结果交给 Codex。
6. Codex 负责 Review、独立验证、文档检查和 Git 提交；未经确认不合并 `main` 或推送远程仓库。

## 协作角色

- GPT：产品需求分析、澄清和任务拆解。
- Claude + DeepSeek V4：具体代码开发和开发侧自检。
- Codex：仓库管理、任务单维护、代码 Review、质量验证、项目文档和 Git 版本管理。

Codex 默认不直接开发业务功能。只有产品经理明确说"请直接修复"时，Codex 才能修改已明确定位的 Review 问题，且不得重构或扩大范围。

## 项目结构

详细边界见 `PROJECT_STRUCTURE.md`，数据定义见 `REQUIREMENT_SCHEMA.md`，工程规范见 `AGENTS.md`。

## 公开使用边界

- 本项目可使用 Storybook 或 Vite 静态构建产物作为个人作品展示。
- 本项目不包含真实客户资料、内部接口、登录凭据或生产环境配置。
- 公开部署前需再次确认无敏感信息残留。
