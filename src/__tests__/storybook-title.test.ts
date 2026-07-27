import { describe, it, expect } from 'vitest';

describe('0007 Storybook 目录名称', () => {
  it('门店客户 Story title 使用 SCRM 而非旧目录名', async () => {
    const mod = await import(
      '../stories/StoreCustomerList.stories'
    );
    expect(mod.default.title).toBe('SCRM/潜客管理/门店客户');
  });

  it('Story title 不含旧名称"示例 SCRM"', async () => {
    const mod = await import(
      '../stories/StoreCustomerList.stories'
    );
    expect(mod.default.title).not.toContain('示例 SCRM');
  });
});
