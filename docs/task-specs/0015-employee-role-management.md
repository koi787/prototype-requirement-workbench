# 0015｜员工 / 角色列表与角色权限配置

## 0. Cycle B 需求确认卡

- **任务模式**：M2｜标准业务页面模式。
- **当前阶段**：0015 Cycle A 已完成，并通过产品经理 C 级真实页面视觉验收；本任务单从此不再重复规划 Cycle A。
- **业务目标**：在已验收的角色列表上，完成角色新增、编辑、权限选择和删除的纯前端 Runtime 闭环。
- **修改范围**：只允许扩展 `employee-management/role-management` 内的角色业务能力、对应 Story 和测试；对既有 RoleListPage 做最小接线。
- **明确不做**：不修改潜客业务、`shared/admin`、SCRM 产品壳或 production registry 链路；不做真实 RBAC、权限控制菜单显示、后端、LocalStorage、数据库、新依赖、0010 Phase 2、0016 或其他额外需求。
- **业务规则**：create/edit 共用唯一 `RoleDrawer`；每个带 Checkbox 的生产权限节点都是可独立选择和保存的权限项，角色保存所有已选节点的稳定 `permissionIds`；未被员工使用的角色二次确认后可删除，已绑定角色禁止删除；所有变更只保留在当前页面 Runtime。
- **UI 等级**：C｜真实后台截图是唯一主要视觉基线，不得自由重设计。
- **验收标准**：新增/编辑共用 Drawer，字段、多层权限回填、父子节点独立选择、展开收起、保存/取消、删除保护与 Runtime 列表同步正确；Cycle A 页面视觉和产品 registry 链路无回归；完整门禁通过。

## 1. 当前基线与状态

开发分支：

```text
feature/0015-employee-role-management
```

该分支 Git 基点为：

```text
f544b628de51111b422381733a5da9d052adafb8
```

Cycle B 的实际代码基线是当前分支上已完成并通过 C 级视觉验收的 Cycle A 工作区，不得回到 `f544b628` 重做列表，也不得覆盖当前未提交成果。

Cycle B 已完成第一版开发，但尚未进入 Formal Review。产品经理新补充的三批“修改角色 → 选择菜单”生产截图证明第一版权限树的“父子强级联 + 只保存叶子”模型与生产事实不符。后续任务是 **0015 Cycle B 权限结构限定修复**，不是重新开发整个 Cycle B。

当前已完成并冻结：

- `ScrmWorkspace → SCRM_PAGE_REGISTRY → employee-role-list → RoleListPage` 真实链路；
- 员工菜单中“角色列表 / 组织架构”及选中态；
- 职位名称、职务编码 draft/applied 筛选；
- 固定 6 列表格；
- 分页、空数据、稳定 Mock；
- `SCRM/员工/角色列表/列表` Story 和 Cycle A 测试；
- Cycle A 已验收的 C 级 CSS 视觉。

旧 stash `backup: 0010 phase1 before 52-column baseline` 必须继续保留，不得 pop、apply、drop 或改名。

## 2. Cycle B 唯一实施范围

Cycle B 只实施：

1. `RoleDrawer`（create/edit 共用）。
2. 职位名称、职务编码、选择菜单三个表单字段。
3. 按三批生产截图逐字重建完整权限树，所有带 Checkbox 节点相互独立选择。
4. 新增、编辑、取消的 Role Runtime 闭环。
5. 未绑定角色删除确认与已绑定角色删除保护。
6. 对应 Story、测试和页面专用 CSS。

不重做 Cycle A 菜单、registry、列表、筛选、分页、空态或 Story 归档。

## 3. RoleDrawer create/edit 复用方案

新增和编辑必须复用同一个业务 Drawer：

```ts
interface RoleDrawerProps {
  mode: 'create' | 'edit';
  open: boolean;
  role?: RoleRecord | null;
  onCancel: () => void;
  onSubmit: (draft: RoleDraft) => void;
}
```

页面级状态建议：

```ts
type RoleDrawerState =
  | { open: false; mode: null; roleId: null }
  | { open: true; mode: 'create'; roleId: null }
  | { open: true; mode: 'edit'; roleId: string };
```

责任边界：

- `RoleListPage` 管理 Drawer 的打开、关闭、当前 mode、当前角色 id 和 Runtime 角色列表。
- `RoleDrawer` 只管理当次表单草稿、校验和提交，不直接修改 Runtime 数组。
- create/edit 使用同一套 DOM、表单字段、权限树和 footer；只通过 mode 改变标题、默认值和职务编码是否 disabled。
- 禁止复制 `CreateRoleDrawer` / `EditRoleDrawer` 两套实现。
- Drawer 从右侧打开，底层 RoleListPage 保持存在；右上角可关闭，内容过高时 Drawer 内部独立滚动。
- Footer 只包含截图可确认的“取消 / 确定”操作；顺序、尺寸、Drawer 宽度和间距按真实截图做 C 级对照。

## 4. 表单字段与校验

表单只允许三个字段：

1. **职位名称**：必填；create/edit 均可编辑。
2. **职务编码**：必填；create 可编辑，edit disabled。
3. **选择菜单**：必填；使用权限树，至少选择一个可保存权限节点。

提交规则：

- 提交前对职位名称和职务编码执行 `trim()`。
- 空白值不得通过必填校验。
- 必填校验文案使用项目现有后台语气：`请输入职位名称`、`请输入职务编码`、`请选择菜单`。
- 当前需求没有确认角色名称或职务编码唯一性校验；本 Cycle 不得自行增加重复拦截规则。
- 不增加角色状态、备注、创建人、员工数、权限范围、可见门店或其他截图未确认字段。

## 5. 菜单权限树

### 5.1 权限数据唯一事实源

产品经理已人工核对三批“修改角色 → 选择菜单”生产截图，并将可确认结构整理为本任务单第 5.2 节。第 5.2 节的文字结构是本轮权限数据唯一事实源；开发 Agent 不再查找、重新解释或自行拼接截图。

第一版仅有“小程序 / 排行榜”的局部数据已失效，不得继续作为完整生产权限集。修复时必须：

- 逐字保留第 5.2 节中的权限文案、层级、顺序和重复出现的业务语义；
- 不得自行补造第 5.2 节不存在的一级菜单、中间节点、叶子权限或按钮权限；
- 不得修饰、简写、纠错、“规范化”或替换生产权限原文；
- 不得根据历史代码名、开发习惯或常规 RBAC 设计推测缺失节点；
- 按“同一父路径 + 同一生产原文”识别节点；同名但处于不同父路径的节点必须分别保留并使用不同 id。

下列文案已确认为生产原文示例，转录时必须原样保留：

- `删除用户-慎用（权限别给）`
- `是否教练`
- `组织架构-消息测试`
- `课卡合同-红冲`
- `公海用户有效期`

第 5.2 节的中文 label、层级与顺序必须直接用于实现与数据验收，不得被第一版代码或旧任务单的局部权限数据覆盖。

### 5.2 完整生产权限树

以下每一个显示节点都带 Checkbox，均须拥有独立稳定 `permissionId`：

```text
小程序
├ 今日数据
├ 扫一扫
├ 开门码
├ 待上课程
├ 课时统计
├ 上课记录
├ 门店排课
├ 美容师资料
├ 服务门店
├ 美容师档期
├ 教练资料
├ 上课门店
├ 档期管理
├ 券包赠送
├ 服务费
├ 专属码
├ 一键休息
├ 我的证书
└ 分享有礼

排行榜
├ 金额，课时是否可见
├ 远程开门
├ 五维问卷
├ 小奥同学
├ 线下体验核销
├ 门禁设置
└ 系统操作手册

首页
├ 趋势图
└ 五维问卷-下载二维码

预约
├ 团课
│  ├ 复制课表
│  ├ 下载课表
│  ├ 团课课表-新增
│  ├ 一键开启
│  └ 团课-用户代约课
├ 私教
│  └ 私教-用户代约课
└ 美容预约

品项
├ 商品类目
│  ├ 品项类型-编辑
│  ├ 品项类型-新增
│  └ 品项类型-删除
└ 权益设置
   ├ 瑜伽品项
   │  ├ 品项课卡-新增
   │  ├ 品项课卡-编辑
   │  └ 品项管理-删除
   ├ 美容品项
   │  ├ 美容品项-新增
   │  ├ 美容品项-编辑
   │  └ 美容品项-删除
   ├ 产品管理
   │  └ 售卖设置
   └ 组合权益
      ├ 组合权益-新增
      ├ 组合权益-编辑
      └ 组合权益-删除

教培班
├ 教培班-编辑
├ 教培班-删除
├ 教培班-购买记录
├ 教培班-录单
├ 教培班-转班
├ 教培班-上课导师
└ 教培班-下单

集训营
├ 集训营-新增
├ 集训营-编辑
├ 集训营-删除
├ 购买记录
└ 下单

基础资料
├ 瑜伽类型
│  ├ 瑜伽类型-新增
│  ├ 瑜伽类型-编辑
│  └ 瑜伽类型-删除
├ 美容类型
│  ├ 美容类型-编辑
│  ├ 美容类型-售卖设置
│  ├ 美容类型-配料清单
│  └ 美容类型-新增
├ 产品信息
│  └ 产品-业务设置
├ 场地费
└ 债权课时费

库存管理
├ 门店库存
├ 直接调拨单
│  ├ 普通调拨单金额
│  └ 退货调拨单金额
├ 盘点库存
├ 盘点单
└ 其他出入库单

收银
├ 收银
└ 配料

门店人员
├ 人才招募
├ 瑜伽教练
│  ├ 教练列表
│  │  ├ 教练列表-查看详情
│  │  ├ 教练列表-私教会员明细
│  │  ├ 编辑课程
│  │  └ 教练列表-赠送存量分
│  ├ 资料审核
│  │  └ 教练修改记录-查看详情
│  ├ 教练标签配置
│  ├ 证书审核
│  │  ├ 教练证书记录-通过
│  │  └ 教练证书记录-拒绝
│  ├ 上课记录
│  │  ├ 教练上课记录-查看详情
│  │  ├ 教练上课记录-导出
│  │  └ 教练上课记录-取消约课
│  └ 教培上课导师
└ 美容师
   ├ 美容师列表
   ├ 美容师资料审核
   └ 美容服务记录

订单
├ 合同中心
│  ├ 课卡合同-导出
│  ├ 课卡合同-修改课时
│  ├ 课卡合同-查看详情
│  ├ 课卡合同-补单
│  ├ 课卡合同-结转
│  ├ 课卡合同-退款
│  ├ 课卡合同-转让
│  ├ 课卡合同-延期
│  ├ 课卡合同-停卡
│  ├ 课卡合同-售后
│  ├ 课卡合同-红冲
│  ├ 课卡合同-券包导入
│  └ 课卡合同-课卡导入
└ 订单中心
   ├ 订单中心-导出
   ├ 订单中心-取消订单
   ├ 订单中心-作废
   └ 订单中心-修改购买门店

记录
├ 券包赠送记录
├ 券包使用记录
│  └ 券包使用记录-导出
├ 反馈管理
│  └ 问题反馈记录
│     └ 问题反馈记录-处理
├ 反馈模块
│  ├ 反馈模块-编辑
│  └ 反馈模块-删除
├ 冻结记录
│  ├ 冻结记录-导出
│  └ 冻结记录-开卡
├ 转卡记录
├ 延期记录
└ 签到记录

门店
├ 数据大屏
├ 门店列表
│  ├ 门店新增
│  ├ 推荐位管理
│  └ 门店列表-编辑
├ 用户端配置
│  └ 视频配置
├ 门店房间
│  ├ 门店房间-新增
│  ├ 门店房间-编辑
│  ├ 门店房间-删除
│  └ 门店房间-日程
├ 数据看板
├ 数据概览
├ 门店轮播图
│  ├ 门店轮播图-新增
│  ├ 门店轮播图-编辑
│  └ 门店轮播图-删除
├ 通店区域
│  ├ 通店区域-编辑
│  └ 通店区域-删除
├ 店铺装修
├ 认购申请
└ 店铺入驻申请

客户
├ 客户列表
│  ├ 用户列表-查看详情
│  ├ 美团抖音核销
│  ├ 用户合并
│  ├ 优惠券失效
│  ├ 储值金充值
│  ├ 删除用户-慎用（权限别给）
│  ├ 用户资料修改
│  ├ 新增积分
│  ├ 创建用户
│  ├ 解绑第三方平台
│  ├ 地推问券-查看
│  ├ 券包录单
│  ├ 课包录单
│  ├ 课卡录单
│  ├ 换套餐
│  ├ 退回
│  └ 同步
├ 客户统计
├ 约课记录
│  ├ 用户上课记录-查看详情
│  ├ 约课记录-导出
│  ├ 上课记录-取消约课
│  └ 用户-补签
├ 合并记录
├ 美容预约记录
├ 客户运营
│  └ 会员等级
│     ├ 会员等级-新增
│     ├ 会员等级-编辑
│     └ 会员等级-删除
├ 储值管理
│  ├ 储值设置
│  │  ├ 金额设置-新增
│  │  ├ 金额设置-编辑
│  │  └ 金额设置-删除
│  ├ 储值合同
│  │  ├ 储值合同-录入
│  │  ├ 储值合同-导出
│  │  └ 储值合同-退款
│  └ 储值流水
│     └ 储值流水-导出
├ 客户消息记录
└ 用户趋势

潜客管理
├ 门店客户
│  ├ 导出记录
│  ├ 分配
│  ├ 转让
│  ├ 设置标签
│  ├ 跟进记录
│  ├ 客资来源变更登记
│  ├ 跟进详情
│  ├ 备注
│  ├ 添加到店记录
│  ├ 添加拜访记录
│  ├ 标注无效客资
│  ├ 拨打电话
│  ├ 已丢单
│  └ 添加共享人
├ 员工座席
│  ├ 员工座席-新增
│  ├ 员工座席-编辑
│  └ 员工座席-删除
├ 客户公海
│  ├ 公海-分配
│  ├ 公海-转让
│  ├ 公海-设置标签
│  ├ 公海用户有效期
│  ├ 公海-导出
│  ├ 公海-通话记录
│  ├ 公海-拨打电话
│  ├ 公海-添加用户
│  ├ 公海-编辑用户
│  ├ 公海-导出平台分析
│  ├ 公海-变更为无效
│  ├ 公海-添加到店记录
│  ├ 公海-标注无效客户
│  └ 公海-跟进详情
├ 无效公海
│  ├ 无效公海-导出
│  ├ 无效公海-编辑
│  ├ 无效公海-设置标签
│  ├ 无效公海-跟进记录
│  ├ 无效公海-变更为有效
│  ├ 无效公海-备注
│  └ 无效公海-跟进详情
├ 我负责的
│  ├ 我负责的-跟进
│  ├ 公海-导入
│  ├ 跟进详情
│  ├ 备注
│  ├ 设置标签
│  ├ 添加到店记录
│  ├ 添加拜访记录
│  ├ 标注无效客资
│  ├ 拨打电话
│  └ 我负责的-导出
├ 到店记录
│  └ 到店记录-导出
├ 通话记录
│  └ 通话记录-导出
├ 标签分组
└ 拜访记录
   └ 拜访记录-导出

员工
├ 角色列表
│  ├ 角色列表-新增
│  ├ 角色列表-编辑
│  └ 角色列表-删除
├ 组织架构
│  ├ 组织架构-编辑
│  ├ 是否教练
│  ├ 组织架构-注销登录
│  ├ 组织架构-消息测试
│  └ 组织架构-新增员工
├ 员工消息记录
├ 存量分
├ 对账单
└ 确认对账单
   ├ 对账单-导入
   └ 对账单-导出

联营
├ 联营店汇总
├ 联营对账单
│  ├ 联营对账单-导入
│  └ 联营对账单-导出
└ 天九联营汇总
   ├ 天九联营汇总-导入
   └ 天九联营汇总-导出

财务
├ 业务报表
│  ├ 订单课程报表
│  ├ 消耗课程报表
│  ├ 剩余权益报表
│  └ 门店业绩汇总
├ 课时报表
│  ├ 教练课时统计
│  │  └ 教练课时统计-导出
│  ├ 用户课卡统计
│  │  └ 用户课卡统计-导出
│  ├ 教室使用统计
│  ├ 用户课程消耗汇总
│  ├ 教练课程消耗汇总
│  ├ 用户门店上课统计
│  │  └ 用户门店上课统计-导出
│  ├ 门店消耗课时统计
│  └ 上课人数分组统计
├ 收款管理
│  ├ 收款流水
│  │  ├ 收款流水-导出
│  │  └ 收款流水-拆分
│  ├ 收款汇总
│  │  └ 收款汇总-导出
│  ├ 收款渠道配置
│  │  ├ 收款渠道配置-新增
│  │  ├ 收款渠道配置-编辑
│  │  └ 收款渠道配置-删除
│  └ 企微收款记录
├ 订单报表
│  ├ 订单卡项汇总
│  │  └ 订单卡项汇总-导出
│  └ 订单课程汇总
│     └ 订单课程汇总-导出
├ 退款管理
│  └ 退款记录
│     ├ 退款记录-确认退款
│     └ 退款记录-导出
├ 结转金记录
│  ├ 结转金-修改
│  └ 结转金记录-导出
├ 客户剩余权益
│  └ 课卡快照-导出
├ 权益变动记录
├ 消耗记录
│  ├ 品项消耗
│  │  ├ 课卡消耗-录入
│  │  ├ 课卡消耗-导出
│  │  └ 课卡消耗-用户上课详情
│  ├ 配料记录
│  └ 产品消耗
│     └ 产品消耗-导出
├ 消耗报表
│  ├ 门店消耗报表
│  │  └ 门店消耗报表-导出
│  └ 课卡消耗记录
├ 业绩报表
│  ├ 个人业绩报表
│  │  └ 个人业绩报表-导出
│  ├ 个人业绩汇总
│  ├ 业绩记录
│  │  ├ 业绩记录-分单
│  │  └ 业绩记录-导出
│  ├ 业绩课程汇总
│  │  └ 业绩课程汇总-导出
│  ├ 业绩卡项汇总
│  │  └ 业绩卡项汇总-导出
│  ├ 门店业绩报表
│  │  └ 门店业绩报表-导出
│  ├ 门店业绩趋势
│  └ 门店数据盘点
│     └ 门店数据盘点-导出
├ 异业消耗
│  └ 异业消耗报表
│     ├ 异业消耗报表-导入
│     └ 异业消耗报表-导出
├ 客户订单报表
│  └ 客户订单报表-导出
├ 客户报表
│  └ 客户报表-导出记录
└ 门店对账
   ├ 门店账单总览
   └ 门店对账单

加盟
├ 加盟保证汇总
├ 加盟商结算
└ 加盟商对账单
   └ 加盟商对账单-导出

加盟商
├ 加盟商对账单
├ 用户课程消耗
└ 课卡消耗明细

版本发布
├ 奥本运动App版本
└ 奥本中台App版本

设置
├ 文件
│  ├ 文件列表
│  │  ├ 文件列表-上传
│  │  └ 文件列表-删除
│  └ 文件夹列表
│     ├ 文件夹列表-添加文件夹
│     ├ 文件夹列表-编辑
│     └ 文件夹列表-删除
├ 文章
│  ├ 文章类型
│  │  ├ 文章类型-新增
│  │  ├ 文章类型-编辑
│  │  └ 文章类型-删除
│  └ 文章列表
│     ├ 文章列表-新增
│     ├ 文章列表-编辑
│     └ 文章列表-删除
├ 通知人员设置
│  ├ 人事通知-新增
│  ├ 人事通知-编辑
│  └ 人事通知-删除
├ 五维问卷
│  ├ 问卷类型
│  ├ 问题列表
│  └ 得分评价
├ 店铺装修
│  ├ 业务模块配置
│  └ 小程序弹窗
├ 菜单管理
│  ├ 菜单管理-新增
│  ├ 菜单管理-编辑
│  └ 菜单管理-删除
├ 消息短信模板
│  ├ 消息短信模块-编辑
│  └ 消息短信模板-删除
├ 设备列表
│  ├ 新增设备
│  ├ 远程开门
│  └ 入场记录
├ 证书类型
│  ├ 证书类型-新增
│  ├ 证书类型-编辑
│  └ 证书类型-删除
├ 公众号管理
├ 字典管理
│  ├ 字典管理-新增
│  ├ 字典管理-编辑
│  └ 字典管理-删除
├ 系统设置
├ 储物柜
│  ├ 储物柜-编辑
│  ├ 储物柜-删除
│  ├ 储物柜-操作日志
│  ├ 储物柜-二维码上传
│  ├ 储物柜-箱格列表
│  ├ 箱格列表-编辑
│  ├ 箱格列表-开柜
│  └ 箱格列表-清箱
├ 地区管理
└ 日志监控
   ├ 登录日志
   └ 操作日志

营销
├ 分享记录
│  └ 分享记录-导出
├ 核销记录
│  ├ 美团抖音核销记录-撤销
│  ├ 核销记录-导出
│  ├ 抖音业绩绑定
│  └ 抖音对账单明细导出
├ 优惠券管理
│  ├ 优惠券列表
│  │  ├ 优惠券-新增
│  │  ├ 优惠券-编辑
│  │  ├ 优惠券-删除
│  │  └ 优惠券-赠送
│  ├ 券包列表
│  │  ├ 券包管理-新增
│  │  ├ 券包管理-编辑
│  │  ├ 券包管理-删除
│  │  └ 券包管理-赠送券包
│  └ 赠送记录
├ 活动管理
│  └ 活动列表
├ 积分管理
│  ├ 积分合同
│  ├ 积分记录
│  │  └ 积分记录-导出
│  └ 积分规则
│     ├ 积分规则-新增
│     ├ 积分规则-编辑
│     └ 积分规则-删除
└ 分销报表
   ├ 分销绩效
   │  └ 分销绩效-导出
   └ 分销订单
      └ 分销订单-导出
```

### 5.3 独立纯数据文件

建议将完整权限树放入：

```text
src/products/scrm/modules/employee-management/role-management/rolePermissionTree.ts
```

数据结构：

```ts
interface RolePermissionNode {
  id: string;
  label: string;
  children?: readonly RolePermissionNode[];
}
```

数据文件规则：

- 只导出权限节点类型、完整只读树和必要的纯查询/顺序化函数；
- 不放 React 状态、JSX、Drawer、Provider、权限校验引擎或用户授权逻辑；
- 所有带 Checkbox 的真实节点都必须有稳定唯一 id，包括一级节点、中间父节点和叶子节点；
- id 使用确定性的语义路径；建议采用 `employee.role-list.create` 形式，路径段使用小写英文短横线、层级之间使用点号，并结合完整父路径避免同名节点冲突；
- 禁止数组 index、当前遍历序号或会因前方插入节点而整体漂移的编号；后续追加节点不得改变已有节点 id；
- 权限 label 必须保留生产原文，id 的英文表达不得反向修改 label；
- 稳定顺序必须与三批生产截图合并后的真实展示顺序一致。

`RoleDrawer` 不得手写数百个 JSX 节点；它只负责根据纯数据树渲染层级、展开/收起、独立 Checkbox 选择、滚动、回填和保存 `permissionIds`。

### 5.4 独立选择规则（替换旧强级联模型）

生产截图已证明父节点本身是独立权限项，子节点可以在父节点未选中时独立选中。正式规则为：

- 每个带 Checkbox 的节点均为独立权限项；
- 勾选父节点只增加该父节点 id，不自动勾选任何子节点；
- 取消父节点只移除该父节点 id，不自动取消已选子节点；
- 勾选子节点不强制勾选父节点；
- 取消子节点不改变父节点的独立选中状态；
- 不把“全部子节点已选”派生成父节点已选；
- 不展示、不存储、不测试传统 Tree 半选态；
- 如使用 Ant Design Tree，必须使用能保持节点独立勾选的配置（如 `checkStrictly`），但不得把 Ant 的返回结构暴露为业务数据模型。

### 5.5 permissionIds 正式定义

```ts
permissionIds: string[]
```

`permissionIds` 保存当前所有已独立选中的权限节点 id，可以包含：

- 一级节点 id；
- 中间父节点 id；
- 叶子节点 id。

不保存 label、展开状态或节点层级副本。提交时只对已选 id 去重，并按完整生产权限树的预序展示顺序输出；不删除非叶子 id，不自动补全父节点或子节点。

### 5.6 展开收起与视觉

- 展开/收起只改变权限树的视觉展示，不得增加、删除或改写任何 `permissionIds`；
- 带 children 的节点按生产截图显示灰色展开箭头，叶子节点不显示伪展开控件；
- 权限区域使用截图确认的固定高度，内部独立纵向滚动；
- Drawer Footer 必须稳定可见，不得随数百个权限节点滚出可见区；
- 多级节点缩进、灰色展开箭头、Checkbox 大小、行高、字号和节点间距必须以三批生产截图为 C 级基线；
- edit 打开时，一级、中间父节点和叶子节点的已选状态都必须按 `permissionIds` 准确回填；
- 不新增传统级联语义下的“全选”或半选视觉。截图若有独立的真实 Checkbox 节点，则它只代表自身权限。

## 6. 新增、编辑、回填与取消

### 6.1 create 默认值

```ts
const DEFAULT_ROLE_DRAFT: RoleDraft = {
  roleName: '',
  roleCode: '',
  permissionIds: [],
};
```

- Drawer 标题：`新增角色`。
- 三个字段初始为空，职务编码可编辑。
- 所有 Checkbox 默认未选；权限树初始展开状态按三批生产截图还原，且不影响选中集合。
- 每次从关闭状态重新打开 create，都必须恢复上述默认草稿，不得泄漏上一次未保存输入。

### 6.2 edit 回填

- Drawer 标题：`修改角色`。
- 按当前 `roleId` 从 Role Runtime 读取最新记录，不保留过期 record 对象副本。
- 职位名称回填 `roleName`，可编辑。
- 职务编码回填 `roleCode`，显示 disabled 态并且不允许保存时被覆盖。
- 权限树根据 `permissionIds` 逐节点独立回填；一级节点、中间父节点和叶子节点都可被单独回填，不派生父子勾选或半选。
- 一条角色保存后再次打开编辑，必须看到最新名称和权限。

### 6.3 保存和取消

- create 保存：追加一条新 RoleRecord，列表总数立即更新，当前筛选仍按 appliedFilters 生效。
- edit 保存：只更新指定 id 的 `roleName`、`permissionIds`、`updatedAt`、`operatorName`；`roleCode` 保持原值。
- 保存成功后关闭 Drawer，列表立即读取同一 Runtime 集合。
- 点击取消、右上角关闭或其他截图已确认的关闭入口：丢弃草稿，不修改 Runtime。
- 关闭后重开必须从 default/current record 重新初始化，不保留上一次验证错误或未保存值。

## 7. Role Runtime 与 Mock 方案

### 7.1 数据结构

Cycle A 的 RoleRecord 扩展为：

```ts
interface RoleRecord {
  id: string;
  roleName: string;
  roleCode: string;
  permissionIds: string[];
  updatedAt: string;
  operatorName: string;
}

interface RoleDraft {
  roleName: string;
  roleCode: string;
  permissionIds: string[];
}
```

`permissionIds` 是唯一可变权限真值；可包含任意已选一级、中间父节点或叶子节点 id。不存储节点 label、展开状态或其他派生视觉状态。

### 7.2 Runtime 归属

- `RoleListPage` 初始化一份 Role Runtime 集合，列表、筛选、分页、RoleDrawer 和删除都从该集合派生。
- 不建立产品级 Provider/store，不修改 `ScrmWorkspace`。
- 刷新页面或 Story 重新挂载后恢复初始 Mock，不做 LocalStorage 持久化。
- Story 需要固定初始状态时，可通过 RoleListPage 明确的测试/Story 入参注入初始记录或初始 Drawer 状态，不复制页面业务。

### 7.3 稳定 Mock 扩展

- 当前每条 ROLE_MOCK 必须按完整生产权限树补齐稳定 `permissionIds`，且每个 id 都必须能在 `rolePermissionTree.ts` 中唯一定位。
- 至少包含：只选一级节点且子节点全未选、只选中间父节点、只选多层叶子节点、一级/中间/叶子混合选中四种稳定回填样例。
- create 新 id 按当前数字 id 的最大值 + 1 生成；不使用数组下标作为身份。
- create/edit 的 `operatorName` 在原型阶段固定为 `管理员`。
- `updatedAt` 使用当前前端时间格式化为 `YYYY-MM-DD HH:mm:ss`；测试应固定时钟或断言格式，不写时间竞态断言。

## 8. 与 0014 EmployeeDrawer.roleIds 的联动边界

### 8.1 本 Cycle 结论

Cycle B **不实施 RoleListPage 与 0014 EmployeeDrawer 的运行时双向联动**。

原因与边界：

- 0014 `EmployeeDrawer` 仍使用已发布的稳定 `ROLE_OPTIONS` 和 `EmployeeRecord.roleIds`；不修改 Drawer、组织架构 Runtime 或其 Story。
- 当前 Cycle A RoleList Mock 的数字 id 与 0014 `ROLE_OPTIONS.value` 属于两套尚未对齐的稳定身份；本 Cycle 不猜测映射，不迁移已发布员工数据。
- 新增/编辑角色只改变 RoleListPage 内的 Runtime，EmployeeDrawer 选项不随之变化。
- 这一边界必须在 Story 描述和交付报告中明示，不得宣称已实现跨页角色同步。

### 8.2 已绑定角色删除保护的可测试接口

删除保护不得为了接入 0014 而修改 EmployeeDrawer。RoleListPage 应使用一个最小、只读的“已使用角色 id”输入或纯判定函数，例如：

```ts
interface RoleListPageProps {
  initialRoles?: readonly RoleRecord[];
  initialDrawer?: { mode: 'create' | 'edit'; roleId?: string };
  usedRoleIds?: readonly string[];
}
```

规则：

- 默认 `usedRoleIds` 只来自角色模块的稳定 Mock，不 import 或改写 0014 员工 Runtime。
- 测试/Story 可注入某个 RoleRecord.id 验证“已绑定不可删除”。
- 本接口只是删除保护输入，不是双向 Runtime store，不得通过它修改员工数据。

## 9. 删除闭环

### 9.1 已绑定角色

当 `record.id` 存在于 `usedRoleIds` 时：

- 点击“删除”不得移除 Runtime 记录。
- 不打开可确认删除的二次确认框。
- 使用现有 Ant Design 反馈能力提示：`该角色已被员工使用，无法删除`。
- 列表总数、当前页和数据必须保持不变。

### 9.2 未绑定角色

点击“删除”后使用项目已有 Ant Design 确认能力，不新增公共 Modal 组件。默认文案：

- 标题：`删除角色`
- 正文：`确认删除角色“{roleName}”吗？删除后不可恢复。`
- 取消按钮：`取消`
- 确认按钮：`确认删除`

交互规则：

- 取消：关闭确认框，数据不变。
- 确认：按 stable id 从同一 Role Runtime 集合删除记录。
- 删除后筛选结果、总数和分页同步重算。如当前页删除后超出新总页数，回到最后一个有效页；无数据时显示 Cycle A 已验收空态。

## 10. Storybook 归档

保留已验收：

```text
SCRM / 员工 / 角色列表 / 列表
```

Cycle B 新增：

```text
SCRM
└─ 员工
   └─ 角色列表
      ├─ 新增
      │  ├─ 默认状态
      │  └─ 已填写
      ├─ 编辑
      │  ├─ 多层权限回填
      │  └─ 父节点独立选中
      └─ 删除
         ├─ 未绑定确认
         └─ 已绑定禁止
```

建议拆分 Story 文件以满足单一 meta/title：

- `EmployeeRoleCreate.stories.tsx` → `SCRM/员工/角色列表/新增`
- `EmployeeRoleEdit.stories.tsx` → `SCRM/员工/角色列表/编辑`
- `EmployeeRoleDelete.stories.tsx` → `SCRM/员工/角色列表/删除`

所有 Story 必须真实经过 `ScrmWorkspace → SCRM_PAGE_REGISTRY → employee-role-list → RoleListPage`。可通过 product renderContext 注入带稳定初始入参的 RoleListPage，但不得使用 `children` 覆盖 production outlet，不得直接渲染 RoleDrawer 冒充真实业务入口。

Storybook 业务层级不得出现 `0015`、`Cycle B`、`Mock`、`Dev`、`Test` 或“功能验证”。

## 11. Cycle B 测试范围

至少覆盖：

1. 点击“新增角色”打开唯一 RoleDrawer create 模式。
2. 点击行级“编辑”打开同一 RoleDrawer edit 模式，对应 stable id 正确。
3. Drawer 标题、右侧打开、关闭、内部滚动和 footer 存在。
4. create 三字段默认值正确，职务编码可编辑。
5. edit 回填最新 roleName/roleCode/permissionIds，职务编码 disabled。
6. 三个必填校验真实阻止保存。
7. 权限树完整节点数量、层级、顺序和关键生产原文与三批截图逐项一致，不仅包含旧“小程序 / 排行榜”局部数据。
8. 父节点可以单独选中，所有子节点保持未选；`permissionIds` 只增加该父节点 id。
9. 子节点可以在父节点未选时单独选中；`permissionIds` 只增加该子节点 id。
10. 勾选/取消父节点不强制改变子节点，勾选/取消子节点不强制改变父节点。
11. 一级和中间父节点 id 可以与叶子 id 一起保存到 `permissionIds`，重新打开 edit 可准确回填。
12. 多层节点选中状态可正确回填，不产生传统 Tree 半选或隐式父节点选中。
13. 展开/收起多层节点前后 `permissionIds` 完全不变。
14. 完整权限数据中所有 id 唯一、稳定且不依赖数组 index；提交的 `permissionIds` 去重。
15. 至少真实验证以下六条路径存在且层级、顺序、生产原文完全一致：
    - `员工 → 角色列表 → 角色列表-新增`；
    - `潜客管理 → 门店客户 → 标注无效客资`；
    - `订单 → 合同中心 → 课卡合同-退款`；
    - `财务 → 收款管理 → 收款流水 → 收款流水-导出`；
    - `设置 → 文件 → 文件夹列表 → 文件夹列表-编辑`；
    - `营销 → 优惠券管理 → 优惠券列表 → 优惠券-赠送`。
16. create 保存后列表增加一条，数值、完整 permissionIds、总数和筛选派生正确。
17. edit 保存后角色名称/完整权限更新，职务编码保持原值，再次打开回填最新值。
18. 取消/关闭不修改 Runtime，重开不泄漏草稿或校验错误。
19. 已绑定角色点击删除显示准确提示，不打开可确认删除弹层，数据不变。
20. 未绑定角色删除确认文案正确；取消不变，确认后仅按 stable id 删除目标记录。
21. 删除末页最后一条后页码回落到最后有效页；删空时显示已验收空态。
22. 刷新/重新挂载恢复初始 Mock，无 LocalStorage 持久化。
23. Cycle B Story 均经 production registry 真实链路，左侧菜单选中态正确，且只有一套 Sidebar/TopBar。
24. Cycle A 筛选、6 列、分页、空态、菜单和 registry 现有测试全部保留并通过。
25. 0014 OrganizationPage、EmployeeDrawer 和员工 Runtime 现有测试全部保留并通过。

测试质量继续遵守：不使用 `if (element)`、`.skip/.todo/.only`、Ant 私有 class 核心断言或 `cells[数字]` 表达业务语义；必须断言真实 DOM 和业务结果。

## 12. 建议文件变更计划

建议新增：

```text
src/products/scrm/modules/employee-management/role-management/
├─ RoleDrawer.tsx
├─ rolePermissionTree.ts
└─ __tests__/
   └─ roleDrawer.test.tsx

src/stories/EmployeeRoleCreate.stories.tsx
src/stories/EmployeeRoleEdit.stories.tsx
src/stories/EmployeeRoleDelete.stories.tsx
```

建议修改：

```text
src/products/scrm/modules/employee-management/role-management/RoleListPage.tsx
src/products/scrm/modules/employee-management/role-management/roleTypes.ts
src/products/scrm/modules/employee-management/role-management/roleMockData.ts
src/products/scrm/modules/employee-management/role-management/rolePermissions.ts（旧局部数据/叶子过滤实现，迁移后删除或降为不含过期业务规则的纯工具）
src/products/scrm/modules/employee-management/role-management/roleList.css
src/products/scrm/modules/employee-management/role-management/index.ts
src/products/scrm/modules/employee-management/role-management/__tests__/roleList.test.tsx
src/stories/EmployeeRoleList.stories.tsx（仅在需要同步已有入口描述/入参时）
CHANGELOG.md
```

原则上不应再修改 navigation/shell；`employee-role-list` production registry 链路已在 Cycle A 完成。若 Cycle B 必须修改导航才能打开 Drawer，应停止并报告。

## 13. 冻结范围与非目标

禁止修改：

- `src/products/scrm/modules/prospect-management/` 全部文件；
- `src/products/scrm/shared/admin/` 全部实现/API；
- `src/products/scrm/shell/` 和 Cycle A 已完成的 production registry/菜单业务行为；
- 0014 `OrganizationPage`、`EmployeeDrawer`、`organizationTypes`、`organizationMockData`、员工 Runtime 和其 CSS；
- Cycle A 固定 6 列、筛选项、draft/applied 逻辑、分页语义、空态、菜单顺序和已验收 C 级视觉；
- Requirement、无效客资审批、52 / 32 / 19 列、新办成交金额和历史需求批次；
- package.json、pnpm-lock.yaml、Storybook/Vite 公共配置。

第一版 Cycle B 已由产品经理确认且本轮同样冻结：

- `RoleDrawer` 整体结构、宽度、字段布局和 footer；
- `roleName`、`roleCode` 字段与 edit 模式 `roleCode disabled`；
- create/edit/cancel Runtime 闭环；
- 删除保护与删除确认逻辑；
- 角色列表、筛选、分页和 registry 接入。

限定修复不得借权限树调整重新设计或重写上述能力。

明确非目标：

- 不实施 0016 或任何其他额外业务需求。
- 不开发公共 `AdminDrawer`、`AdminActionMenu`、`AdminStatusTag`、`AdminEmptyState`。
- 不启动 0010 Phase 2。
- 不实施真实权限校验、登录角色授权、按权限动态菜单或服务端 RBAC。
- 不接后端 API、数据库、LocalStorage 或新服务。
- 不安装任何新依赖，不使用付费插件/元件库/托管服务。

## 14. 实施顺序

Luna｜中 按以下小闭环实施“0015 Cycle B 权限结构限定修复”，不重做整个 Cycle B：

1. 对照三批生产截图，将完整层级、顺序和生产原文逐项转录到独立 `rolePermissionTree.ts`。
2. 删除旧局部“小程序 / 排行榜”数据假设、叶子 id 过滤和父子强级联工具，替换为任意真实节点 id 的稳定去重/排序纯函数。
3. 限定修正 RoleDrawer 的 Checkbox 选择与回填：父子独立，展开收起不改变 `permissionIds`，固定高度权限区独立滚动。
4. 将 ROLE_MOCK 与 create/edit Story 的 `permissionIds` 替换为完整生产树中的稳定节点 id，保留已完成的 Runtime 与删除逻辑。
5. 替换旧级联/半选测试，新增父节点单选、子节点单选、非叶子 id 保存、多层回填和展开无副作用测试。
6. 回归已完成的 RoleDrawer create/edit/cancel、Role Runtime、删除规则、Cycle A 列表与 production registry Story 链路。
7. 执行一次完整门禁后停止，交由产品经理对完整生产权限树做 C 级验收；验收前不进入 Formal Review。

## 15. 验证与门禁

开发期间每个小闭环只运行直接相关的最小测试。Cycle B 完成后执行一轮：

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm build-storybook
git diff --check
```

全部必须通过。Vitest 全局串行和既有 Hook warning 是已接受技术债，0015 不处理，不重复运行多轮全量测试。

## 16. 待确认项

以下事项不得由开发 Agent 自由发挥：

1. **Drawer 精确尺寸**：宽度、表单间距、footer 高度与按钮顺序以产品经理提供的真实截图为准；截图无法确认时必须暂停该视觉细节并询问。
2. **唯一性校验**：当前只实施必填，不默认拦截重复 roleName/roleCode；如产品要求唯一，需另行确认比较规则和文案。
3. **角色身份对齐**：RoleList 数字 id 与 0014 `ROLE_OPTIONS.value` 的正式对应关系尚未确认；本 Cycle 固定不迁移员工数据。
4. **跨页 Runtime 同步**：本 Cycle 固定不实施；若后续要求 RoleList 更改立即影响 EmployeeDrawer，必须单独确认数据迁移和产品层单例 Provider 边界，不得夹带进本轮。
5. **删除确认文案**：本任务单给出的标题/正文/按钮为当前正式实施默认；如真实截图或产品经理后续给出不同文案，以最新明确确认为准。

完整权限树的中文 label、层级和顺序已经由产品经理整理为本任务单第 5.2 节，不再属于待确认项。开发 Agent 不得以代码现状或通用 RBAC 惯例覆盖该事实源。

## 17. 停止条件

出现以下任一情况必须停止并报告：

1. 实施 RoleDrawer 或删除闭环必须修改 `prospect-management`、`shared/admin`、ScrmWorkspace 或 production registry。
2. 为了判断“已绑定”必须改写 0014 EmployeeDrawer/EmployeeRecord Runtime 或猜测角色 id 映射。
3. 真实截图无法支撑 C 级 Drawer/权限树关键视觉决策。
4. 第 5.2 节任一权限节点的原文、父路径或顺序存在无法消除的歧义；此时必须向产品经理确认，不得自行补造、改名或“规范化”。
5. 需要新增公共 Drawer/权限组件、第三方权限树库、新依赖或服务。
6. Cycle A 固定 6 列、筛选、分页、空态或菜单/registry 链路出现回归。

## 18. Git 与交付边界

本轮只完成 Cycle B 权限模型限定修订，不开发代码。后续交给 Luna｜中执行“0015 Cycle B 权限结构与选择模型限定修复”，只修正第一版 Cycle B 的权限纯数据、独立选择、`permissionIds` 保存/回填、对应测试和必要 Story 初始权限数据；不得重新开发整个 Cycle B。

本轮不得执行：

- `git add`；
- commit；
- push；
- merge；
- rebase；
- stash 操作。

Cycle B 开发完成后必须先停止，交由产品经理进行 C 级真实页面验收。产品经理确认后，Codex 才可开始 0015 唯一一次 Formal Review。不得自行扩展 0016 或其他需求。
