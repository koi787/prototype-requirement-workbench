# AGENTS.md

## 项目定位

这是长期维护的产品需求 HTML 交互原型仓库。Storybook 是唯一主要工作台入口；Vite 首页仅保留最小启动说明。当前产品与历史需求批次必须分别维护，历史记录不得因当前页面更新而删除或覆盖。

## 技术栈

使用 React、TypeScript 严格模式、Vite、Storybook React + Vite、Ant Design、Zod、Vitest、React Testing Library、ESLint 和 pnpm。第一阶段使用 React Context 与 localStorage 管理显示设置，不主动引入额外状态管理库。

只使用稳定依赖版本并提交 `pnpm-lock.yaml`。不得自行切换 Node.js、大范围升级依赖或安装维护状态不明的第三方需求标注插件。

## 长期角色分工

- GPT：负责产品需求分析、需求澄清、页面与状态范围、业务规则、验收标准和开发任务拆解。
- Claude + DeepSeek V4：在 VS Code 中依据已确认任务单执行具体代码开发。
- Codex：负责仓库管理、开发任务单维护、代码 Review、质量验证、项目文档维护和 Git 版本管理。

Codex 默认不得主动开发业务功能，不得直接实现 Schema、页面组件、需求锚点、高亮、Storybook Channel 或需求面板。产品经理明确说"请直接修复"后，Codex 才可以修改代码；即使获得该授权，也只能修复已经明确定位的 Review 问题，不得顺带重构、扩展功能或扩大文件范围。

Codex 可以在未获代码修复授权时执行只读检查、安全验证、任务单和治理文档维护，以及经确认的 Git 操作。具体代码开发请求应先转化为 `docs/task-specs/` 下的任务单，交给 Claude + DeepSeek V4 执行。

## 执行前规则

每次任务开始前必须：

1. 阅读本文件和相关任务单。
2. 检查当前分支、工作区状态和现有目录。
3. 判断所属产品、模块、页面与需求批次。
4. 搜索同类页面和需求，避免重复创建。
5. 说明计划修改的文件范围，以及属于当前页面更新、需求批次新增还是并行版本。
6. 业务范围或规则有实质歧义时，先列出待确认项；未确认前不得进行大范围修改。
7. Codex 收到功能开发请求时，默认只维护任务单，不直接修改代码；Review 后如需 Codex 修改，必须等待产品经理明确说"请直接修复"。

## 目录边界

- `src/products/`：当前产品页面、模块和产品内共享组件。
- `src/requirements/`：正式需求数据、批次、当前发布引用和 Schema。
- `src/prototype-core/`：锚点、高亮、需求面板、显示模式与评审接口。
- `src/shared/`：跨产品通用组件、布局、Hook 和工具。
- `src/stories/`：工作台能力演示及跨模块 Story 入口。
- `docs/task-specs/`：经确认的执行任务单。
- `public/attachments/`：可公开进入原型构建的静态附件；禁止放置敏感资料。

页面组件不得内嵌正式需求说明。需求数据不得反向依赖具体页面组件。公共能力不得放入单一业务模块。演示数据必须标注"工作台能力演示"，不得写入正式需求批次记录。

## 需求数据规则

- 正式需求必须通过 `src/requirements/schemas/` 的 Zod Schema 校验。
- 需求 ID、产品 ID、模块 ID、页面 ID 和锚点 ID 必须稳定、唯一、使用小写英文短横线格式。
- 正式需求至少覆盖 `REQUIREMENT_SCHEMA.md` 约定的字段。
- 当前页面与历史批次是不同概念；历史批次只追加调整记录，不得随当前页面重写或删除。
- 正式需求、评审评论和能力演示数据必须使用不同的数据结构与目录。
- 草稿与已发布版本应保留独立版本语义，后续实现不得让草稿直接覆盖已发布内容。

## 锚点规则

- 页面需求位置统一使用 `data-req-id="stable-anchor-id"`。
- 正式定位不得依赖绝对屏幕坐标。
- 不得以复杂、脆弱的 CSS 选择器作为主要关联方式。
- 锚点需支持 element、region、virtual-region、multi-anchor 和 state-anchor 的模型扩展。
- 一条需求可以关联多个锚点，一个锚点也可以关联多条需求。
- 双向联动必须通过稳定 ID 与 Storybook 官方 Channel 通信实现。

## Git 规则

- `main` 只保存稳定、可展示版本；大功能在独立分支开发。
- 分支使用 `feature/`、`fix/` 或 `refactor/` 前缀。
- 每完成一个可验证的小闭环提交一次，提交信息使用中文并说明业务内容。
- 不得擅自合并功能分支到 `main`，不得创建远程仓库或公开发布。
- 不提交密钥、账号、Cookie、真实敏感数据、`.env` 或本地缓存。
- 不删除历史需求批次，不使用不可恢复方式覆盖用户文件。

## 测试规则

- 每个小闭环完成后立即执行对应的最小验证。
- 提交前至少保证相关 ESLint、TypeScript、Vitest 检查通过。
- 阶段完成前必须执行 Vite 构建和 Storybook 静态构建。
- 交互能力需覆盖：需求点击高亮锚点、锚点点击选中需求、模式切换和 localStorage 恢复。
- Review 时检查 PC/移动视口、异常状态、重复代码、需求与页面分离、稳定锚点及文档同步。

## 任务完成通知

本规则适用于任务单创建、开发、限定修复、独立 Review、验证、Git 操作、迁移、文档整理和敏感信息扫描。只有产品经理明确要求“本轮静默执行”时，才可以取消该轮通知。

通知机制必须按代理运行环境二选一，不得同时使用自动 Hook 和手动脚本，避免同一任务重复通知。

### Codex：用户级 notify Hook

Codex 使用用户级 `~/.codex/config.toml` 中的 `notify` Hook。Codex 运行时在 `agent-turn-complete` 事件发生后自动调用通知脚本；脚本只在当前工作目录名为 `prototype-requirement-workbench` 时发送“需求原型工作台”横幅和 Glass 声音。

Codex 执行本项目任务时：

- 不得在任务末尾手动执行 `osascript` 或 `afplay`。
- 不得为了发送任务完成通知申请 command approval。
- 不需要把通知命令安排为最后一个工具调用。
- 完成文件操作、验证、Git 状态检查和报告整理后，正常输出最终报告并结束本轮。
- 通知由 Codex 运行时在 `agent-turn-complete` 后自动触发；Hook 成功与否不改变业务任务结论。
- 当前会话若尚未加载新配置，应在报告中提示重启 Codex，而不是退回手动通知。

### Claude Code：手动 macOS 通知

Claude Code 不使用 Codex 的用户级 `notify` Hook，因此继续采用手动通知。Claude 必须先完成全部文件操作、测试、构建、浏览器验收、范围检查、Git 状态检查、Todo 更新和最终报告整理，再把通知命令作为本轮最后一个工具操作。

正常完成时执行：

```bash
if [[ "$(uname -s)" == "Darwin" ]] && command -v osascript >/dev/null 2>&1; then
  osascript -e 'display notification "当前任务已完成，请回到工作台查看结果" with title "需求原型工作台" sound name "Glass"'
  if command -v afplay >/dev/null 2>&1; then
    afplay /System/Library/Sounds/Glass.aiff >/dev/null 2>&1
  fi
else
  printf '\a'
fi
```

因真实阻塞结束时执行：

```bash
if [[ "$(uname -s)" == "Darwin" ]] && command -v osascript >/dev/null 2>&1; then
  osascript -e 'display notification "当前任务已结束，但存在阻塞，请查看报告" with title "需求原型工作台" sound name "Basso"'
  if command -v afplay >/dev/null 2>&1; then
    afplay /System/Library/Sounds/Basso.aiff >/dev/null 2>&1
  fi
else
  printf '\a'
fi
```

Claude 发送通知后不得再调用任何工具，必须立即输出已准备好的最终报告。每轮最多发送一次通知；通知失败不得改变任务结论，但应在最终报告中记录。

### 其他开发代理

其他代理若提供自身运行时通知 Hook，应优先使用运行时 Hook，并禁止同时运行手动脚本。没有运行时 Hook 时，才采用上述 Claude Code 手动通知流程。

正式任务单只引用本章节，不重复粘贴完整通知脚本。所有代理均应确保每个任务最多产生一次结束通知。

## 禁止事项

未经产品经理明确同意，不得：

- 由 Codex 主动实现 Schema、页面组件、锚点、高亮、Storybook Channel、需求面板或其他业务功能。
- 由 Codex 在没有"请直接修复"授权时修改具体代码。
- 以修复单个 Review 问题为由进行重构、功能扩展或扩大修改范围。
- 建设第二套工作台、在线编辑后台、登录权限、数据库或生产后端。
- 开发公网匿名评论、图片上传服务或拖拽设计器。
- 修改项目外文件、系统设置或其他项目。
- 建立公开 GitHub 仓库、上传公司资料、引入付费服务或远程发布。
- 删除历史批次、大范围重构稳定功能或自行进行重大架构调整。
