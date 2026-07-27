# 项目结构与模块边界

## 根目录

```text
.
├── .storybook/               # Storybook 配置与本地 Addon 注册
├── src/
│   ├── products/             # 当前产品页面
│   ├── requirements/         # 需求数据、批次与 Schema
│   ├── prototype-core/       # 工作台核心交互能力
│   ├── shared/               # 跨产品公共代码
│   └── stories/              # 能力演示和工作台入口 Story
├── public/attachments/       # 原型可用的非敏感静态附件
└── docs/                     # 规则、任务单、决策和版本说明
```

## 产品目录

```text
src/products/scrm/
├── modules/                  # 按业务模块组织页面
├── pages/                    # 跨模块或产品级页面入口
├── shared/                   # 仅供 SCRM 复用的代码
└── assets/                   # 产品内图片和静态资源
```

模块页面代表当前最新状态。新增需求应优先更新已有页面；只有确有并行版本需求时才新建页面变体。

## 需求目录

```text
src/requirements/
├── batches/
│   └── 2026-07-scrm-meeting/ # 正式批次目录，第一阶段保持空记录
├── current/                  # 当前已发布需求引用
├── products/                 # 按产品的页面只读需求说明 JSON
│   └── scrm/
│       └── pages/
│           └── store-customer/  # 门店客户需求说明
└── schemas/                  # Zod Schema、类型和枚举
```

需求批次记录历史语境，不承担当前页面组件实现。能力演示数据放在 `src/stories/` 附近的 demo 数据文件，不进入正式批次。

`src/requirements/products/` 下的 JSON 是只读需求说明模型，用于快速展示产品经理维护的结构化说明，不是 `requirementSchema` 的替代品，也不直接写入正式需求批次。

## 原型核心

- `requirement-anchor/`：稳定锚点组件、注册与事件。
- `highlight/`：滚动、单锚点及多锚点高亮。
- `requirement-panel/`：Storybook 右侧 Addon Panel 和详情视图。
- `requirement-view/`：需求查看模式、编号点、只读抽屉和双模式状态管理。
- `display-mode/`：演示/需求模式，以及卡片/列表详情偏好。
- `review-mode/`：第一阶段仅保留评审数据接口和扩展位置。

## Storybook 信息架构

Story title 组织两套浏览维度：

- `SCRM/潜客管理/门店客户`
- `需求批次/批次名称/...`
- `工作台能力演示/...`

两套目录可以引用同一页面实现，但不得复制业务页面代码或把历史批次当作当前页面。

