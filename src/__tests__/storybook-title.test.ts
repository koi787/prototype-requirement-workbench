import { describe, it, expect } from 'vitest';

describe('Storybook 产品菜单目录', () => {
  it('门店客户 Story title 使用产品菜单路径 SCRM/潜客管理/门店客户/列表', async () => {
    const mod = await import('../stories/StoreCustomerList.stories');
    expect(mod.default.title).toBe('SCRM/潜客管理/门店客户/列表');
  });

  it('Story title 不含旧名称"示例 SCRM"', async () => {
    const mod = await import('../stories/StoreCustomerList.stories');
    expect(mod.default.title).not.toContain('示例 SCRM');
  });

  it('新增 Story 按业务模块归入到店记录/拜访记录 新增 分组，无"新增记录入口"开发视角分组', async () => {
    const arrivalCreate = await import('../stories/ArrivalRecordCreate.stories');
    const visitCreate = await import('../stories/VisitRecordCreate.stories');
    expect(arrivalCreate.default.title).toBe('SCRM/潜客管理/到店记录/新增');
    expect(visitCreate.default.title).toBe('SCRM/潜客管理/拜访记录/新增');
    expect(arrivalCreate.default.title).not.toContain('新增记录入口');
    expect(visitCreate.default.title).not.toContain('新增记录入口');
  });

  it('编辑 Story 按业务模块归入到店记录/拜访记录 编辑 分组', async () => {
    const arrivalEdit = await import('../stories/ArrivalRecordEdit.stories');
    const visitEdit = await import('../stories/VisitRecordEdit.stories');
    expect(arrivalEdit.default.title).toBe('SCRM/潜客管理/到店记录/编辑');
    expect(visitEdit.default.title).toBe('SCRM/潜客管理/拜访记录/编辑');
  });

  it('变更记录 Story 按业务模块归入到店记录/变更记录 分组，无开发视角分组', async () => {
    const change = await import('../stories/ArrivalChangeRecord.stories');
    expect(change.default.title).toBe('SCRM/潜客管理/到店记录/变更记录');
    expect(change.default.title).not.toContain('Cycle B3');
    expect(change.default.title).not.toContain('测试');
  });
});
