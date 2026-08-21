export type RequirementHistoryType = 'replica' | 'change' | 'mixed';

export interface RequirementHistoryStoryLink {
  label: string;
  storyId: string;
}

export interface RequirementHistoryRecord {
  id: string;
  name: string;
  type: RequirementHistoryType;
  module: string;
  status: '已发布';
  completedAt: string;
  summary: string;
  implementedItems: readonly string[];
  originalSystemItems?: readonly string[];
  changes?: readonly string[];
  storyLinks: readonly RequirementHistoryStoryLink[];
}

export const REQUIREMENT_HISTORY_RECORDS = [
  {
    id: '0015',
    name: '员工角色管理',
    type: 'replica',
    module: '员工',
    status: '已发布',
    completedAt: '2026-08-20',
    summary: '还原员工角色列表与菜单权限配置能力，支持角色维护和删除保护。',
    implementedItems: [
      '角色列表支持职位名称、职务编码筛选和分页浏览。',
      '支持新增、修改和删除角色，修改时可回填最新角色资料。',
      '权限配置覆盖 24 个一级权限域、508 个权限节点，父子节点可独立配置。',
      '已被员工使用的角色禁止删除，未使用角色删除前需要二次确认。',
    ],
    storyLinks: [
      { label: '角色列表', storyId: 'scrm-员工-角色列表-列表--正常列表' },
      { label: '新增角色', storyId: 'scrm-员工-角色列表-新增--默认状态' },
      { label: '修改角色', storyId: 'scrm-员工-角色列表-编辑--多层权限回填' },
      { label: '删除角色', storyId: 'scrm-员工-角色列表-删除--未使用角色' },
    ],
  },
  {
    id: '0014',
    name: '员工组织架构',
    type: 'replica',
    module: '员工',
    status: '已发布',
    completedAt: '2026-08-18',
    summary: '还原员工组织树、员工列表和员工资料维护能力。',
    implementedItems: [
      '支持从员工业务域进入组织架构，展示公司及多层级组织树。',
      '支持选择组织节点查看直属员工，并按姓名、手机号、员工编号搜索。',
      '支持岗位、角色、在职状态筛选和员工启用状态展示。',
      '支持新增、修改员工资料，以及岗位、薪酬类型、门店和角色配置。',
      '支持注销登录和消息测试等员工管理操作。',
    ],
    storyLinks: [
      { label: '组织架构列表', storyId: 'scrm-员工-组织架构-列表--正常列表' },
      { label: '新增员工', storyId: 'scrm-员工-组织架构-新增--默认状态' },
      { label: '编辑员工', storyId: 'scrm-员工-组织架构-编辑--默认回填' },
    ],
  },
  {
    id: '0013',
    name: 'SCRM 多业务域导航',
    type: 'change',
    module: 'SCRM',
    status: '已发布',
    completedAt: '2026-08-17',
    summary: '将 SCRM 工作区从单一潜客管理入口扩展为可承载多个独立业务域的产品工作区。',
    implementedItems: [
      'SCRM 工作区支持潜客管理、员工等多个业务域统一承载。',
      '不同业务页面可以在统一工作区内切换，并保持产品壳和菜单语义一致。',
      '潜客管理继续保持原有业务入口和页面能力。',
    ],
    changes: [
      '原工作区主要围绕潜客管理单一业务域组织。',
      '本次调整为可承载潜客管理、员工等多个独立业务域。',
      '不改变已有潜客管理业务功能。',
    ],
    storyLinks: [
      { label: '门店客户', storyId: 'scrm-潜客管理-门店客户-列表--正常列表' },
      { label: '员工组织架构', storyId: 'scrm-员工-组织架构-列表--正常列表' },
      { label: '员工角色列表', storyId: 'scrm-员工-角色列表-列表--正常列表' },
    ],
  },
  {
    id: '0012',
    name: '到店与拜访记录',
    type: 'replica',
    module: '潜客管理',
    status: '已发布',
    completedAt: '2026-08-14',
    summary: '还原潜客管理下的到店记录与拜访记录独立模块，并保留客户跟进场景入口。',
    implementedItems: [
      '实现独立到店记录列表，支持查看客户到店相关信息。',
      '支持新增到店记录、编辑到店记录和查看到店变更记录。',
      '实现独立拜访记录列表，支持新增和编辑拜访记录。',
      '客户跟进场景可新增到店记录和拜访记录，独立列表保持查询与管理定位。',
      '独立页与跟进详情 Tab 复用同一套记录业务能力。',
    ],
    storyLinks: [
      { label: '到店记录列表', storyId: 'scrm-潜客管理-到店记录-列表--正常列表' },
      { label: '新增到店', storyId: 'scrm-潜客管理-到店记录-新增--默认值' },
      { label: '编辑到店', storyId: 'scrm-潜客管理-到店记录-编辑--默认回填' },
      { label: '到店变更记录', storyId: 'scrm-潜客管理-到店记录-变更记录--有变更记录' },
      { label: '拜访记录列表', storyId: 'scrm-潜客管理-拜访记录-列表--正常列表' },
      { label: '新增拜访', storyId: 'scrm-潜客管理-拜访记录-新增--默认值' },
      { label: '编辑拜访', storyId: 'scrm-潜客管理-拜访记录-编辑--默认回填' },
    ],
  },
] as const satisfies readonly RequirementHistoryRecord[];

export const REQUIREMENT_HISTORY_RECORD_BY_ID = Object.fromEntries(
  REQUIREMENT_HISTORY_RECORDS.map((record) => [record.id, record]),
);

export function getRequirementHistoryRecord(id: string): RequirementHistoryRecord | undefined {
  return REQUIREMENT_HISTORY_RECORD_BY_ID[id] as RequirementHistoryRecord | undefined;
}
