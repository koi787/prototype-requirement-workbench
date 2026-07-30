import { describe, it, expect } from 'vitest';
import {
  requirementViewEntrySchema,
  requirementViewMapSchema,
  validateRequirementKeys,
  EXPECTED_REQUIREMENT_KEYS,
} from './requirement-view';

// ============================================================================
// requirementViewEntrySchema
// ============================================================================

describe('requirementViewEntrySchema', () => {
  const validEntry = {
    requirementNo: 'SC-01-01',
    requirementName: '首次分配时间',
    status: '待确认',
    definition: '展示客户首次分配时间的字段。',
    dataSource: null,
    rule: null,
    remark: '本轮不得根据模拟数据反推正式取值规则。',
  };

  it('完整合法 Entry 通过', () => {
    const result = requirementViewEntrySchema.safeParse(validEntry);
    expect(result.success).toBe(true);
  });

  it('可选字段全部缺失时通过', () => {
    const result = requirementViewEntrySchema.safeParse({
      requirementNo: 'SC-01-01',
      requirementName: '测试',
    });
    expect(result.success).toBe(true);
  });

  it('可选字段为 null 时通过', () => {
    const result = requirementViewEntrySchema.safeParse({
      requirementNo: 'SC-01-01',
      requirementName: '测试',
      definition: null,
      dataSource: null,
      rule: null,
      remark: null,
    });
    expect(result.success).toBe(true);
  });

  it('可选字段为空字符串时通过（trim 后为空视为无内容）', () => {
    const result = requirementViewEntrySchema.safeParse({
      requirementNo: 'SC-01-01',
      requirementName: '测试',
      definition: '',
      dataSource: '',
      rule: '',
      remark: '',
    });
    expect(result.success).toBe(true);
  });

  it('可选字段为纯空格时通过并规范为空字符串', () => {
    const result = requirementViewEntrySchema.safeParse({
      requirementNo: 'SC-01-01',
      requirementName: '测试',
      definition: '   ',
      dataSource: '\t',
      rule: '\n',
      remark: ' \t ',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.definition).toBe('');
      expect(result.data.dataSource).toBe('');
      expect(result.data.rule).toBe('');
      expect(result.data.remark).toBe('');
    }
  });

  it('requirementNo 缺失失败', () => {
    const result = requirementViewEntrySchema.safeParse({
      requirementName: '测试',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'));
      expect(paths).toContain('requirementNo');
    }
  });

  it('requirementNo 空字符串失败', () => {
    const result = requirementViewEntrySchema.safeParse({
      requirementNo: '   ',
      requirementName: '测试',
    });
    expect(result.success).toBe(false);
  });

  it('requirementName 缺失失败', () => {
    const result = requirementViewEntrySchema.safeParse({
      requirementNo: 'SC-01-01',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'));
      expect(paths).toContain('requirementName');
    }
  });

  it('requirementName 空字符串失败', () => {
    const result = requirementViewEntrySchema.safeParse({
      requirementNo: 'SC-01-01',
      requirementName: '',
    });
    expect(result.success).toBe(false);
  });

  it('status 缺失时通过', () => {
    const result = requirementViewEntrySchema.safeParse({
      requirementNo: 'SC-01-01',
      requirementName: '测试',
    });
    expect(result.success).toBe(true);
  });

  it('status 为 null 时通过', () => {
    const result = requirementViewEntrySchema.safeParse({
      requirementNo: 'SC-01-01',
      requirementName: '测试',
      status: null,
    });
    expect(result.success).toBe(true);
  });

  it('status 为空字符串时通过', () => {
    const result = requirementViewEntrySchema.safeParse({
      requirementNo: 'SC-01-01',
      requirementName: '测试',
      status: '',
    });
    expect(result.success).toBe(true);
  });

  it('status 为纯空格时通过并规范为空字符串', () => {
    const result = requirementViewEntrySchema.safeParse({
      requirementNo: 'SC-01-01',
      requirementName: '测试',
      status: '   ',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('');
    }
  });

  it('三个合法状态通过', () => {
    const statuses = ['已确认', '部分确认', '待确认'];
    statuses.forEach((status) => {
      const result = requirementViewEntrySchema.safeParse({
        requirementNo: 'SC-01-01',
        requirementName: '测试',
        status,
      });
      expect(result.success).toBe(true);
    });
  });

  it('非空非法状态失败', () => {
    const result = requirementViewEntrySchema.safeParse({
      requirementNo: 'SC-01-01',
      requirementName: '测试',
      status: 'unconfirmed',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'));
      expect(paths).toContain('status');
    }
  });

  it('未知字段失败', () => {
    const result = requirementViewEntrySchema.safeParse({
      ...validEntry,
      unknownField: 'should fail',
    });
    expect(result.success).toBe(false);
  });

  it('非法 stable requirement key 作为 map key 失败', () => {
    const result = requirementViewMapSchema.safeParse({
      'Invalid-Key!!!': validEntry,
    });
    expect(result.success).toBe(false);
  });

  it('根节点不是对象时失败', () => {
    const result = requirementViewMapSchema.safeParse('not-an-object');
    expect(result.success).toBe(false);
  });

  it('根节点为空对象时 schema 通过（key 交叉校验另做）', () => {
    const result = requirementViewMapSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

// ============================================================================
// requirementViewMapSchema 与 key 交叉校验（0008 闭环二：15 条）
// ============================================================================

describe('validateRequirementKeys', () => {
  it('恰好 15 个预期 key 通过', () => {
    const data = Object.fromEntries(
      EXPECTED_REQUIREMENT_KEYS.map((k) => [
        k,
        { requirementNo: 'SC-TEST', requirementName: '测试' },
      ]),
    );
    const error = validateRequirementKeys(data);
    expect(error).toBeNull();
  });

  it('缺少 key 失败', () => {
    const data = Object.fromEntries(
      EXPECTED_REQUIREMENT_KEYS.slice(0, 14).map((k) => [
        k,
        { requirementNo: 'SC-TEST', requirementName: '测试' },
      ]),
    );
    const error = validateRequirementKeys(data);
    expect(error).not.toBeNull();
    expect(error).toContain('缺少 requirement key');
  });

  it('多余 key 失败', () => {
    const data = Object.fromEntries(
      [...EXPECTED_REQUIREMENT_KEYS, 'extra-key'].map((k) => [
        k,
        { requirementNo: 'SC-TEST', requirementName: '测试' },
      ]),
    );
    const error = validateRequirementKeys(data);
    expect(error).not.toBeNull();
    expect(error).toContain('多余 requirement key');
  });
});

// ============================================================================
// EXPECTED_REQUIREMENT_KEYS 完整性（0008 闭环二：15 条）
// ============================================================================

describe('EXPECTED_REQUIREMENT_KEYS', () => {
  it('恰好 15 个 key', () => {
    expect(EXPECTED_REQUIREMENT_KEYS).toHaveLength(15);
  });

  it('所有 key 使用合法 stable ID 格式', () => {
    const stableIdPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    EXPECTED_REQUIREMENT_KEYS.forEach((key) => {
      expect(key).toMatch(stableIdPattern);
    });
  });

  it('15 个 key 不重复', () => {
    const unique = new Set(EXPECTED_REQUIREMENT_KEYS);
    expect(unique.size).toBe(15);
  });
});
