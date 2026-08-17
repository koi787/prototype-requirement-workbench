# 示例 SCRM 模块目录

按已确认业务模块建立子目录。第一阶段不创建或虚构真实业务页面。

## 业务域注册边界（0013 起）

- 产品壳 `ScrmWorkspace`（`../shell/ScrmWorkspace.tsx`）与产品级菜单 / 页面注册表
  （`../navigation/`）负责 SCRM 产品组合与页面选择，业务模块只提供页面内容。
- 产品级页面出口位于产品壳：`activePage → normalize → pageRegistry → registration
  → 页面内容`整条页面选择链在 `ScrmWorkspace` 内完成，不经过任何业务模块根。
- 每个一级业务域对应 `./<module>/` 子目录（当前仅 `prospect-management`）。
  潜客管理三个页面的实际内容经渲染上下文 slot 接线（`StoreCustomerList` 兼容入口
  装配 `ProspectManagementRoot` 业务根 + 到店/拜访独立页组件）；注册表只做
  pageKey → slot 映射，不依赖潜客业务组件。
- 新增业务域（如 0014 "员工 → 组织架构"）只需：新建 `./<module>/` 真实页面、
  在产品菜单配置启用对应一级菜单、在页面注册表注册 canonical pageKey、按真实
  产品归档新增 Story。该页面由产品壳出口直接渲染，**绝不经过**潜客业务根
  `ProspectManagementRoot` / 潜客审批 / 跟进详情 / 到店/拜访 Drawer，
  也不需要修改既有 `prospect-management` 内部业务组件或复制壳。
