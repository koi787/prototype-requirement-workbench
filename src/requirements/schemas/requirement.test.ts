import { describe, it, expect } from 'vitest';
import {
  requirementSchema,
  requirementStatusSchema,
  requirementPrioritySchema,
  stableIdSchema,
  isoDateTimeSchema,
  publishedVersionSchema,
  elementAnchorSchema,
  regionAnchorSchema,
  virtualRegionAnchorSchema,
  multiAnchorSchema,
  multiAnchorSubItemSchema,
  stateAnchorSchema,
  stateAnchorTargetStateSchema,
  anchorUnionSchema,
  referenceImageSchema,
  elementKindSchema,
  regionKindSchema,
} from './requirement';
import type { Requirement, Anchor } from './requirement';

// ============================================================================
// 测试辅助
// ============================================================================

/**
 * 构建一条完整合法的基础需求数据（不含锚点）。
 * 所有字段使用通用演示名称，不包含真实 SCRM 业务数据。
 */
function makeValidRequirement(overrides: Partial<Requirement> = {}): Requirement {
  return {
    id: 'demo-req-001',
    title: '工作台能力演示需求',
    product: 'demo-product',
    module: 'demo-module',
    involvedModules: ['demo-module'],
    requirementBatch: 'demo-batch',
    involvedPages: ['demo-page'],
    status: 'draft',
    priority: 'P2',
    background: '这是一个用于演示工作台能力的测试需求',
    description: '验证正式需求数据模型的 Zod Schema、类型推导和跨字段校验',
    trigger: '用户点击工作台中的演示按钮',
    businessRules: ['规则应当清晰明确'],
    exceptionRules: ['异常情况应有友好提示'],
    permissionRules: ['仅演示用途'],
    interactionResult: '展示校验通过或失败的详细信息',
    acceptanceCriteria: ['所有合法数据通过 Zod 校验'],
    pendingQuestions: ['是否需要补充更多演示场景'],
    referenceImages: [],
    relatedRequirementIds: [],
    anchors: [],
    createdAt: '2026-01-15T10:30:00.000Z',
    updatedAt: '2026-06-20T14:00:00.000Z',
    publishedVersion: null,
    ...overrides,
  };
}

/**
 * 构建一个合法的 element 锚点。
 */
function makeValidElementAnchor(overrides: Record<string, unknown> = {}) {
  return {
    id: 'demo-submit-button',
    type: 'element' as const,
    description: '演示提交按钮',
    autoScroll: true,
    focusHighlight: true,
    page: 'demo-page',
    dataReqId: 'demo-submit-button',
    elementKind: 'button' as const,
    ...overrides,
  };
}

/**
 * 构建一个合法的 region 锚点。
 */
function makeValidRegionAnchor(overrides: Record<string, unknown> = {}) {
  return {
    id: 'demo-filter-region',
    type: 'region' as const,
    description: '演示筛选区域',
    autoScroll: true,
    focusHighlight: false,
    page: 'demo-page',
    dataReqId: 'demo-filter-region',
    regionKind: 'filter' as const,
    ...overrides,
  };
}

/**
 * 构建一个合法的 virtual-region 锚点。
 */
function makeValidVirtualRegionAnchor(overrides: Record<string, unknown> = {}) {
  return {
    id: 'demo-semantic-region',
    type: 'virtual-region' as const,
    description: '演示虚拟区域',
    autoScroll: false,
    focusHighlight: true,
    page: 'demo-page',
    dataReqId: 'demo-semantic-region',
    ...overrides,
  };
}

/**
 * 构建一个合法的 multi-anchor 锚点（根对象不含 page/dataReqId）。
 */
function makeValidMultiAnchor(overrides: Record<string, unknown> = {}) {
  return {
    id: 'demo-multi-anchor',
    type: 'multi-anchor' as const,
    description: '演示多锚点组合',
    autoScroll: true,
    focusHighlight: true,
    items: [
      {
        id: 'demo-multi-item-1',
        page: 'demo-page',
        dataReqId: 'demo-button-1',
        description: '第一个目标按钮',
      },
      {
        id: 'demo-multi-item-2',
        page: 'demo-page',
        dataReqId: 'demo-button-2',
        description: '第二个目标按钮',
      },
    ],
    ...overrides,
  };
}

/**
 * 构建一个合法的 state-anchor 锚点。
 */
function makeValidStateAnchor(overrides: Record<string, unknown> = {}) {
  return {
    id: 'demo-state-anchor',
    type: 'state-anchor' as const,
    description: '演示状态锚点',
    autoScroll: true,
    focusHighlight: true,
    page: 'demo-page',
    dataReqId: 'demo-state-element',
    targetState: {
      key: 'tab',
      value: 'details',
      description: '切换到详情标签页',
    },
    ...overrides,
  };
}

// ============================================================================
// 1. 基础工具 Schema 测试
// ============================================================================

describe('stableIdSchema', () => {
  it('应接受合法的小写英文数字短横线 ID', () => {
    expect(stableIdSchema.safeParse('demo-submit-button').success).toBe(true);
    expect(stableIdSchema.safeParse('a').success).toBe(true);
    expect(stableIdSchema.safeParse('abc123').success).toBe(true);
    expect(stableIdSchema.safeParse('page-v2').success).toBe(true);
    expect(stableIdSchema.safeParse('my-long-id-with-many-parts').success).toBe(true);
  });

  it('应拒绝短横线开头的 ID', () => {
    const r = stableIdSchema.safeParse('-demo-button');
    expect(r.success).toBe(false);
  });

  it('应拒绝短横线结尾的 ID', () => {
    const r = stableIdSchema.safeParse('demo-button-');
    expect(r.success).toBe(false);
  });

  it('应拒绝连续短横线的 ID', () => {
    const r = stableIdSchema.safeParse('demo--button');
    expect(r.success).toBe(false);
  });

  it('应拒绝大写字母', () => {
    expect(stableIdSchema.safeParse('Demo-Submit-Button').success).toBe(false);
    expect(stableIdSchema.safeParse('DEMO').success).toBe(false);
  });

  it('应拒绝空字符串', () => {
    expect(stableIdSchema.safeParse('').success).toBe(false);
  });

  it('应拒绝包含特殊字符的字符串', () => {
    expect(stableIdSchema.safeParse('demo_button').success).toBe(false);
    expect(stableIdSchema.safeParse('demo@button').success).toBe(false);
    expect(stableIdSchema.safeParse('demo button').success).toBe(false);
  });
});

describe('isoDateTimeSchema', () => {
  it('应接受 UTC Z 结尾的 ISO 8601 日期时间', () => {
    expect(isoDateTimeSchema.safeParse('2026-01-15T10:30:00.000Z').success).toBe(true);
  });

  it('应接受带时区偏移的 ISO 8601 日期时间', () => {
    expect(isoDateTimeSchema.safeParse('2026-01-15T10:30:00.000+08:00').success).toBe(true);
    expect(isoDateTimeSchema.safeParse('2026-01-15T10:30:00.000-05:00').success).toBe(true);
  });

  it('应拒绝不带时区的日期时间', () => {
    expect(isoDateTimeSchema.safeParse('2026-01-15T10:30:00').success).toBe(false);
    expect(isoDateTimeSchema.safeParse('2026-01-15T10:30:00.000').success).toBe(false);
  });

  it('应拒绝纯日期字符串', () => {
    expect(isoDateTimeSchema.safeParse('2026-01-15').success).toBe(false);
  });

  it('应拒绝非法日期字符串', () => {
    expect(isoDateTimeSchema.safeParse('invalid-date').success).toBe(false);
    expect(isoDateTimeSchema.safeParse('').success).toBe(false);
  });
});

describe('publishedVersionSchema', () => {
  it('应接受合法版本号', () => {
    expect(publishedVersionSchema.safeParse('v1.0.0').success).toBe(true);
    expect(publishedVersionSchema.safeParse('v0.1.0').success).toBe(true);
    expect(publishedVersionSchema.safeParse('v10.20.30').success).toBe(true);
  });

  it('应接受 null（未发布草稿）', () => {
    expect(publishedVersionSchema.safeParse(null).success).toBe(true);
  });

  it('应拒绝非法版本格式', () => {
    expect(publishedVersionSchema.safeParse('v1.0').success).toBe(false);
    expect(publishedVersionSchema.safeParse('1.0.0').success).toBe(false);
    expect(publishedVersionSchema.safeParse('v1.0.0-alpha').success).toBe(false);
    expect(publishedVersionSchema.safeParse('vv1.0.0').success).toBe(false);
    expect(publishedVersionSchema.safeParse('').success).toBe(false);
  });
});

// ============================================================================
// 2. 枚举 Schema 测试
// ============================================================================

describe('requirementStatusSchema', () => {
  const validStatuses = [
    'draft',
    'pending-confirmation',
    'confirmed',
    'developing',
    'testing',
    'completed',
    'deprecated',
  ];

  it.each(validStatuses)('应接受合法状态: %s', (status) => {
    expect(requirementStatusSchema.safeParse(status).success).toBe(true);
  });

  it('应拒绝非法状态', () => {
    expect(requirementStatusSchema.safeParse('archived').success).toBe(false);
    expect(requirementStatusSchema.safeParse('in-progress').success).toBe(false);
    expect(requirementStatusSchema.safeParse('').success).toBe(false);
    expect(requirementStatusSchema.safeParse('DRAFT').success).toBe(false);
  });

  it('应只有七种合法状态', () => {
    expect(requirementStatusSchema.options).toHaveLength(7);
  });
});

describe('requirementPrioritySchema', () => {
  const validPriorities = ['P0', 'P1', 'P2', 'P3', 'P4', 'P5'];

  it.each(validPriorities)('应接受合法优先级: %s', (priority) => {
    expect(requirementPrioritySchema.safeParse(priority).success).toBe(true);
  });

  it('应拒绝非法优先级', () => {
    expect(requirementPrioritySchema.safeParse('P6').success).toBe(false);
    expect(requirementPrioritySchema.safeParse('p0').success).toBe(false);
    expect(requirementPrioritySchema.safeParse('high').success).toBe(false);
    expect(requirementPrioritySchema.safeParse('').success).toBe(false);
  });

  it('应只有六种合法优先级', () => {
    expect(requirementPrioritySchema.options).toHaveLength(6);
  });
});

// ============================================================================
// 3. elementKind / regionKind 枚举测试
// ============================================================================

describe('elementKindSchema', () => {
  it('应接受合法元素类型', () => {
    expect(elementKindSchema.safeParse('button').success).toBe(true);
    expect(elementKindSchema.safeParse('select').success).toBe(true);
    expect(elementKindSchema.safeParse('other').success).toBe(true);
  });

  it('应拒绝非法元素类型', () => {
    expect(elementKindSchema.safeParse('unknown-kind').success).toBe(false);
  });
});

describe('regionKindSchema', () => {
  it('应接受合法区域类型', () => {
    expect(regionKindSchema.safeParse('form').success).toBe(true);
    expect(regionKindSchema.safeParse('modal').success).toBe(true);
    expect(regionKindSchema.safeParse('other').success).toBe(true);
  });

  it('应拒绝非法区域类型', () => {
    expect(regionKindSchema.safeParse('unknown-kind').success).toBe(false);
  });
});

// ============================================================================
// 4. 锚点 Schema 独立测试
// ============================================================================

describe('elementAnchorSchema', () => {
  it('应接受合法 element 锚点', () => {
    const result = elementAnchorSchema.safeParse(makeValidElementAnchor());
    expect(result.success).toBe(true);
  });

  it('应接受不含 elementKind 的 element 锚点', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { elementKind: _elementKind, ...anchor } = makeValidElementAnchor();
    expect(elementAnchorSchema.safeParse(anchor).success).toBe(true);
  });

  it('应拒绝缺少 page 的 element 锚点', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { page: _page, ...anchor } = makeValidElementAnchor();
    const result = elementAnchorSchema.safeParse(anchor);
    expect(result.success).toBe(false);
  });

  it('应拒绝缺少 dataReqId 的 element 锚点', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { dataReqId: _dataReqId, ...anchor } = makeValidElementAnchor();
    const result = elementAnchorSchema.safeParse(anchor);
    expect(result.success).toBe(false);
  });

  it('应拒绝包含绝对坐标字段的 element 锚点', () => {
    const result = elementAnchorSchema.safeParse({
      ...makeValidElementAnchor(),
      x: 100,
      y: 200,
    });
    expect(result.success).toBe(false);
  });

  it('应拒绝包含未知字段的 element 锚点', () => {
    const result = elementAnchorSchema.safeParse({
      ...makeValidElementAnchor(),
      selector: '.my-button',
    });
    expect(result.success).toBe(false);
  });

  it('应拒绝非法 ID 的 element 锚点', () => {
    const result = elementAnchorSchema.safeParse({
      ...makeValidElementAnchor(),
      page: 'Invalid-Page',
    });
    expect(result.success).toBe(false);
  });

  it('应拒绝非法 elementKind', () => {
    const result = elementAnchorSchema.safeParse({
      ...makeValidElementAnchor(),
      elementKind: 'unknown-kind',
    });
    expect(result.success).toBe(false);
  });
});

describe('regionAnchorSchema', () => {
  it('应接受合法 region 锚点', () => {
    const result = regionAnchorSchema.safeParse(makeValidRegionAnchor());
    expect(result.success).toBe(true);
  });

  it('应拒绝缺少 page 的 region 锚点', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { page: _page, ...anchor } = makeValidRegionAnchor();
    expect(regionAnchorSchema.safeParse(anchor).success).toBe(false);
  });

  it('应拒绝包含绝对坐标的 region 锚点', () => {
    const result = regionAnchorSchema.safeParse({
      ...makeValidRegionAnchor(),
      top: 0,
      left: 0,
      width: 100,
      height: 200,
    });
    expect(result.success).toBe(false);
  });
});

describe('virtualRegionAnchorSchema', () => {
  it('应接受合法 virtual-region 锚点', () => {
    const result = virtualRegionAnchorSchema.safeParse(makeValidVirtualRegionAnchor());
    expect(result.success).toBe(true);
  });

  it('应接受含 fallbackDataReqIds 的 virtual-region 锚点', () => {
    const result = virtualRegionAnchorSchema.safeParse({
      ...makeValidVirtualRegionAnchor(),
      fallbackDataReqIds: ['demo-fallback-1', 'demo-fallback-2'],
    });
    expect(result.success).toBe(true);
  });

  it('应拒绝 fallbackDataReqIds 重复', () => {
    const result = virtualRegionAnchorSchema.safeParse({
      ...makeValidVirtualRegionAnchor(),
      fallbackDataReqIds: ['demo-fallback-1', 'demo-fallback-1'],
    });
    expect(result.success).toBe(false);
  });

  it('应拒绝 fallbackDataReqIds 含空字符串', () => {
    const result = virtualRegionAnchorSchema.safeParse({
      ...makeValidVirtualRegionAnchor(),
      fallbackDataReqIds: ['demo-fallback-1', ''],
    });
    expect(result.success).toBe(false);
  });

  it('应拒绝缺少 page 的 virtual-region 锚点', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { page: _page, ...anchor } = makeValidVirtualRegionAnchor();
    expect(virtualRegionAnchorSchema.safeParse(anchor).success).toBe(false);
  });
});

describe('multiAnchorSchema', () => {
  it('应接受合法 multi-anchor（根对象不含 page 和 dataReqId 时通过）', () => {
    const result = multiAnchorSchema.safeParse(makeValidMultiAnchor());
    expect(result.success).toBe(true);
  });

  it('应拒绝根对象包含 page 时失败', () => {
    const result = multiAnchorSchema.safeParse({
      ...makeValidMultiAnchor(),
      page: 'demo-page',
    });
    expect(result.success).toBe(false);
  });

  it('应拒绝根对象包含 dataReqId 时失败', () => {
    const result = multiAnchorSchema.safeParse({
      ...makeValidMultiAnchor(),
      dataReqId: 'some-id',
    });
    expect(result.success).toBe(false);
  });

  it('应拒绝少于两个子项', () => {
    const result = multiAnchorSchema.safeParse({
      ...makeValidMultiAnchor(),
      items: [
        {
          id: 'demo-single-item',
          page: 'demo-page',
          dataReqId: 'demo-button-1',
          description: '仅有一个子项',
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('应拒绝子项缺少 page', () => {
    const result = multiAnchorSchema.safeParse({
      ...makeValidMultiAnchor(),
      items: [
        {
          id: 'item-1',
          page: 'demo-page',
          dataReqId: 'demo-btn-1',
          description: '正常子项',
        },
        {
          id: 'item-2',
          // 缺少 page
          dataReqId: 'demo-btn-2',
          description: '缺失 page',
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('应拒绝子项缺少 dataReqId', () => {
    const result = multiAnchorSchema.safeParse({
      ...makeValidMultiAnchor(),
      items: [
        {
          id: 'item-1',
          page: 'demo-page',
          dataReqId: 'demo-btn-1',
          description: '正常子项',
        },
        {
          id: 'item-2',
          page: 'demo-page',
          // 缺少 dataReqId
          description: '缺失 dataReqId',
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('应拒绝子项 (page, dataReqId) 组合重复', () => {
    const result = multiAnchorSchema.safeParse({
      ...makeValidMultiAnchor(),
      items: [
        {
          id: 'item-1',
          page: 'demo-page',
          dataReqId: 'demo-btn-1',
          description: '第一个子项',
        },
        {
          id: 'item-2',
          page: 'demo-page',
          dataReqId: 'demo-btn-1',
          description: '与第一个子项目标重复',
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('应接受不同页面相同 dataReqId 的子项', () => {
    const result = multiAnchorSchema.safeParse({
      ...makeValidMultiAnchor(),
      items: [
        {
          id: 'item-1',
          page: 'demo-page',
          dataReqId: 'demo-btn',
          description: '第一页按钮',
        },
        {
          id: 'item-2',
          page: 'demo-page-2',
          dataReqId: 'demo-btn',
          description: '第二页同名按钮',
        },
      ],
    });
    expect(result.success).toBe(true);
  });
});

describe('multiAnchorSubItemSchema', () => {
  it('应接受合法子项', () => {
    const result = multiAnchorSubItemSchema.safeParse({
      id: 'demo-sub-item',
      page: 'demo-page',
      dataReqId: 'demo-button',
      description: '演示子锚点',
    });
    expect(result.success).toBe(true);
  });

  it('应拒绝包含未知字段的子项', () => {
    const result = multiAnchorSubItemSchema.safeParse({
      id: 'demo-sub-item',
      page: 'demo-page',
      dataReqId: 'demo-button',
      description: '演示子锚点',
      x: 100,
    });
    expect(result.success).toBe(false);
  });

  it('应拒绝非法 ID 的子项', () => {
    const result = multiAnchorSubItemSchema.safeParse({
      id: 'Invalid-ID',
      page: 'demo-page',
      dataReqId: 'demo-button',
      description: '演示子锚点',
    });
    expect(result.success).toBe(false);
  });
});

describe('stateAnchorSchema', () => {
  it('应接受合法 state-anchor', () => {
    const result = stateAnchorSchema.safeParse(makeValidStateAnchor());
    expect(result.success).toBe(true);
  });

  it('应拒绝缺少 targetState', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { targetState: _targetState, ...anchor } = makeValidStateAnchor();
    const result = stateAnchorSchema.safeParse(anchor);
    expect(result.success).toBe(false);
  });

  it('应接受 targetState.value 为 string', () => {
    const result = stateAnchorSchema.safeParse({
      ...makeValidStateAnchor(),
      targetState: { key: 'tab', value: 'details', description: '字符串值' },
    });
    expect(result.success).toBe(true);
  });

  it('应接受 targetState.value 为 number', () => {
    const result = stateAnchorSchema.safeParse({
      ...makeValidStateAnchor(),
      targetState: { key: 'step', value: 3, description: '数值' },
    });
    expect(result.success).toBe(true);
  });

  it('应接受 targetState.value 为 boolean', () => {
    const result = stateAnchorSchema.safeParse({
      ...makeValidStateAnchor(),
      targetState: { key: 'expanded', value: true, description: '布尔值' },
    });
    expect(result.success).toBe(true);
  });

  it('应接受 targetState.value 为 null', () => {
    const result = stateAnchorSchema.safeParse({
      ...makeValidStateAnchor(),
      targetState: { key: 'reset', value: null, description: 'null 值' },
    });
    expect(result.success).toBe(true);
  });

  it('应拒绝 targetState.value 为对象', () => {
    const result = stateAnchorSchema.safeParse({
      ...makeValidStateAnchor(),
      targetState: { key: 'config', value: { foo: 'bar' }, description: '对象值' },
    });
    expect(result.success).toBe(false);
  });

  it('应拒绝 targetState.value 为数组', () => {
    const result = stateAnchorSchema.safeParse({
      ...makeValidStateAnchor(),
      targetState: { key: 'items', value: ['a', 'b'], description: '数组值' },
    });
    expect(result.success).toBe(false);
  });

  it('应拒绝缺少 page 的 state-anchor', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { page: _page, ...anchor } = makeValidStateAnchor();
    expect(stateAnchorSchema.safeParse(anchor).success).toBe(false);
  });

  it('应拒绝 targetState 含未知字段', () => {
    const result = stateAnchorSchema.safeParse({
      ...makeValidStateAnchor(),
      targetState: {
        key: 'tab',
        value: 'details',
        description: '含未知字段',
        extraField: 'should be rejected',
      },
    });
    expect(result.success).toBe(false);
  });
});

describe('stateAnchorTargetStateSchema', () => {
  it('应接受合法 targetState', () => {
    const result = stateAnchorTargetStateSchema.safeParse({
      key: 'tab',
      value: 'details',
      description: '详情页标签',
    });
    expect(result.success).toBe(true);
  });

  it('应拒绝含未知字段的 targetState', () => {
    const result = stateAnchorTargetStateSchema.safeParse({
      key: 'tab',
      value: 'details',
      description: '详情页标签',
      extra: 'should fail',
    });
    expect(result.success).toBe(false);
  });
});

describe('anchorUnionSchema', () => {
  it('应通过 type 判别 element 锚点', () => {
    const result = anchorUnionSchema.safeParse(makeValidElementAnchor());
    expect(result.success).toBe(true);
  });

  it('应通过 type 判别 region 锚点', () => {
    const result = anchorUnionSchema.safeParse(makeValidRegionAnchor());
    expect(result.success).toBe(true);
  });

  it('应通过 type 判别 virtual-region 锚点', () => {
    const result = anchorUnionSchema.safeParse(makeValidVirtualRegionAnchor());
    expect(result.success).toBe(true);
  });

  it('应通过 type 判别 multi-anchor 锚点', () => {
    const result = anchorUnionSchema.safeParse(makeValidMultiAnchor());
    expect(result.success).toBe(true);
  });

  it('应通过 type 判别 state-anchor 锚点', () => {
    const result = anchorUnionSchema.safeParse(makeValidStateAnchor());
    expect(result.success).toBe(true);
  });

  it('应拒绝未知锚点 type', () => {
    const result = anchorUnionSchema.safeParse({
      type: 'unknown-type',
      id: 'test-id',
      description: '测试',
      autoScroll: true,
      focusHighlight: false,
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// 5. referenceImageSchema 测试
// ============================================================================

describe('referenceImageSchema', () => {
  it('应接受合法图片元数据', () => {
    const result = referenceImageSchema.safeParse({
      id: 'demo-img-001',
      src: '/assets/demo-screenshot.png',
      alt: '演示截图',
    });
    expect(result.success).toBe(true);
  });

  it('应接受含可选字段的图片元数据', () => {
    const result = referenceImageSchema.safeParse({
      id: 'demo-img-002',
      src: '/assets/demo-screenshot.png',
      alt: '演示截图',
      title: '图1',
      description: '这是演示图片的描述',
    });
    expect(result.success).toBe(true);
  });

  it('应拒绝含未知字段的图片元数据', () => {
    const result = referenceImageSchema.safeParse({
      id: 'demo-img-003',
      src: '/assets/demo-screenshot.png',
      alt: '演示截图',
      width: 800,
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// 6. 正式需求根 Schema 测试：合法场景
// ============================================================================

describe('requirementSchema - 合法数据', () => {
  it('应接受完整合法需求（工作台能力演示）', () => {
    const result = requirementSchema.safeParse(makeValidRequirement());
    expect(result.success).toBe(true);
  });

  it('应接受跨模块需求', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({
        module: 'demo-module',
        involvedModules: ['demo-module', 'demo-module-b', 'demo-module-c'],
      }),
    );
    expect(result.success).toBe(true);
  });

  it('应接受含 element 锚点的需求', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({
        anchors: [makeValidElementAnchor()],
      }),
    );
    expect(result.success).toBe(true);
  });

  it('应接受含所有五种锚点的需求', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({
        anchors: [
          makeValidElementAnchor(),
          makeValidRegionAnchor(),
          makeValidVirtualRegionAnchor(),
          makeValidMultiAnchor(),
          makeValidStateAnchor(),
        ] as Anchor[],
      }),
    );
    expect(result.success).toBe(true);
  });

  it('应接受 publishedVersion 为 null', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({ publishedVersion: null }),
    );
    expect(result.success).toBe(true);
  });

  it('应接受 publishedVersion 为合法版本号', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({ publishedVersion: 'v2.1.0' }),
    );
    expect(result.success).toBe(true);
  });

  it('应接受 createdAt 和 updatedAt 相同', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({
        createdAt: '2026-01-15T10:30:00.000Z',
        updatedAt: '2026-01-15T10:30:00.000Z',
      }),
    );
    expect(result.success).toBe(true);
  });

  it('应接受带时区偏移的日期', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({
        createdAt: '2026-01-15T10:30:00.000+08:00',
        updatedAt: '2026-06-20T14:00:00.000+08:00',
      }),
    );
    expect(result.success).toBe(true);
  });

  it('应接受空规则数组', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({
        businessRules: [],
        exceptionRules: [],
        permissionRules: [],
        pendingQuestions: [],
        referenceImages: [],
        relatedRequirementIds: [],
        anchors: [],
      }),
    );
    expect(result.success).toBe(true);
  });

  it('应接受两个不同 id 但目标相同的根锚点', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({
        anchors: [
          makeValidElementAnchor({ id: 'anchor-a', page: 'demo-page', dataReqId: 'same-target' }),
          makeValidElementAnchor({ id: 'anchor-b', page: 'demo-page', dataReqId: 'same-target' }),
        ] as Anchor[],
      }),
    );
    expect(result.success).toBe(true);
  });
});

// ============================================================================
// 7. 正式需求根 Schema 测试：必填字段缺失
// ============================================================================

describe('requirementSchema - 必填字段缺失', () => {
  const requiredFields = [
    'id',
    'title',
    'product',
    'module',
    'involvedModules',
    'requirementBatch',
    'involvedPages',
    'status',
    'priority',
    'background',
    'description',
    'trigger',
    'businessRules',
    'exceptionRules',
    'permissionRules',
    'interactionResult',
    'acceptanceCriteria',
    'pendingQuestions',
    'referenceImages',
    'relatedRequirementIds',
    'anchors',
    'createdAt',
    'updatedAt',
    'publishedVersion',
  ];

  it.each(requiredFields)('应拒绝缺少 %s 的需求', (field) => {
    const fullReq = makeValidRequirement();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [field as keyof Requirement]: _removed, ...req } = fullReq;
    const result = requirementSchema.safeParse(req);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// 8. 正式需求根 Schema 测试：枚举校验
// ============================================================================

describe('requirementSchema - 枚举校验', () => {
  it('应拒绝非法需求状态', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({ status: 'archived' as Requirement['status'] }),
    );
    expect(result.success).toBe(false);
  });

  it('应拒绝非法优先级', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({ priority: 'P6' as Requirement['priority'] }),
    );
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// 9. 正式需求根 Schema 测试：module 与 involvedModules
// ============================================================================

describe('requirementSchema - module 与 involvedModules', () => {
  it('应拒绝 involvedModules 不含 module', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({
        module: 'demo-module',
        involvedModules: ['demo-module-b', 'demo-module-c'],
      }),
    );
    expect(result.success).toBe(false);
  });

  it('应拒绝 involvedModules 重复', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({
        involvedModules: ['demo-module', 'demo-module'],
      }),
    );
    expect(result.success).toBe(false);
  });

  it('应拒绝 involvedModules 为空数组', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({
        involvedModules: [] as unknown as [string, ...string[]],
      }),
    );
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// 10. 正式需求根 Schema 测试：数组去重
// ============================================================================

describe('requirementSchema - 数组去重', () => {
  it('应拒绝 involvedPages 重复', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({
        involvedPages: ['demo-page', 'demo-page'],
      }),
    );
    expect(result.success).toBe(false);
  });

  it('应拒绝 relatedRequirementIds 重复', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({
        relatedRequirementIds: ['demo-req-002', 'demo-req-002'],
      }),
    );
    expect(result.success).toBe(false);
  });

  it('应拒绝 relatedRequirementIds 自关联', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({
        id: 'demo-req-001',
        relatedRequirementIds: ['demo-req-001'],
      }),
    );
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// 10.5 正式需求根 Schema 测试：字符串数组去重
// ============================================================================

describe('requirementSchema - 字符串数组去重', () => {
  it('应拒绝 businessRules 重复', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({
        businessRules: ['规则一', '规则一'],
      }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      const dupIssue = result.error.issues.find(
        (i) => i.path[0] === 'businessRules' && typeof i.path[1] === 'number',
      );
      expect(dupIssue).toBeDefined();
      expect(dupIssue!.path).toEqual(['businessRules', 1]);
    }
  });

  it('应拒绝 businessRules 在 trim 后重复', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({
        businessRules: ['规则一', ' 规则一 '],
      }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      const dupIssue = result.error.issues.find(
        (i) => i.path[0] === 'businessRules' && typeof i.path[1] === 'number',
      );
      expect(dupIssue).toBeDefined();
      expect(dupIssue!.path).toEqual(['businessRules', 1]);
    }
  });

  it('应拒绝 exceptionRules 重复', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({
        exceptionRules: ['异常一', '异常一'],
      }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      const dupIssue = result.error.issues.find(
        (i) => i.path[0] === 'exceptionRules' && typeof i.path[1] === 'number',
      );
      expect(dupIssue).toBeDefined();
      expect(dupIssue!.path).toEqual(['exceptionRules', 1]);
    }
  });

  it('应拒绝 permissionRules 重复', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({
        permissionRules: ['权限一', '权限一'],
      }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      const dupIssue = result.error.issues.find(
        (i) => i.path[0] === 'permissionRules' && typeof i.path[1] === 'number',
      );
      expect(dupIssue).toBeDefined();
      expect(dupIssue!.path).toEqual(['permissionRules', 1]);
    }
  });

  it('应拒绝 acceptanceCriteria 重复', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({
        acceptanceCriteria: ['标准一', '标准一'],
      }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      const dupIssue = result.error.issues.find(
        (i) => i.path[0] === 'acceptanceCriteria' && typeof i.path[1] === 'number',
      );
      expect(dupIssue).toBeDefined();
      expect(dupIssue!.path).toEqual(['acceptanceCriteria', 1]);
    }
  });

  it('应拒绝 pendingQuestions 重复', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({
        pendingQuestions: ['问题一', '问题一'],
      }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      const dupIssue = result.error.issues.find(
        (i) => i.path[0] === 'pendingQuestions' && typeof i.path[1] === 'number',
      );
      expect(dupIssue).toBeDefined();
      expect(dupIssue!.path).toEqual(['pendingQuestions', 1]);
    }
  });
});

// ============================================================================
// 10.6 正式需求根 Schema 测试：对象 ID 去重
// ============================================================================

describe('requirementSchema - 对象 ID 去重', () => {
  it('应拒绝 anchors 重复 id', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({
        anchors: [
          makeValidElementAnchor({ id: 'anchor-dup', dataReqId: 'btn-1' }),
          makeValidRegionAnchor({ id: 'anchor-dup', dataReqId: 'region-1' }),
        ] as Anchor[],
      }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      const dupIssue = result.error.issues.find(
        (i) => i.path[0] === 'anchors' && i.path[2] === 'id',
      );
      expect(dupIssue).toBeDefined();
      expect(dupIssue!.path).toEqual(['anchors', 1, 'id']);
    }
  });

  it('应拒绝 referenceImages 重复 id', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({
        referenceImages: [
          { id: 'img-dup', src: '/a.png', alt: '图A' },
          { id: 'img-dup', src: '/b.png', alt: '图B' },
        ],
      }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      const dupIssue = result.error.issues.find(
        (i) => i.path[0] === 'referenceImages' && i.path[2] === 'id',
      );
      expect(dupIssue).toBeDefined();
      expect(dupIssue!.path).toEqual(['referenceImages', 1, 'id']);
    }
  });

  it('应拒绝 multi-anchor items 重复 id', () => {
    const result = multiAnchorSchema.safeParse(
      makeValidMultiAnchor({
        items: [
          { id: 'dup-item', page: 'demo-page', dataReqId: 'btn-1', description: '第一个' },
          { id: 'dup-item', page: 'demo-page', dataReqId: 'btn-2', description: '第二个但id重复' },
        ],
      }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      const dupIssue = result.error.issues.find(
        (i) => i.path[0] === 'items' && i.path[2] === 'id',
      );
      expect(dupIssue).toBeDefined();
      expect(dupIssue!.path).toEqual(['items', 1, 'id']);
    }
  });
});

// ============================================================================
// 10.7 正式需求根 Schema 测试：issue path 精确性
// ============================================================================

describe('requirementSchema - issue path 精确性', () => {
  it('involvedModules 重复的 path 应指向重复项索引', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({
        module: 'demo-module',
        involvedModules: ['demo-module', 'other-module', 'demo-module'],
      }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      const dupIssue = result.error.issues.find(
        (i) => i.path[0] === 'involvedModules' && typeof i.path[1] === 'number',
      );
      expect(dupIssue).toBeDefined();
      expect(dupIssue!.path).toEqual(['involvedModules', 2]);
    }
  });

  it('involvedPages 重复的 path 应指向重复项索引', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({
        involvedPages: ['page-a', 'page-b', 'page-a'],
      }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      const dupIssue = result.error.issues.find(
        (i) => i.path[0] === 'involvedPages' && typeof i.path[1] === 'number',
      );
      expect(dupIssue).toBeDefined();
      expect(dupIssue!.path).toEqual(['involvedPages', 2]);
    }
  });

  it('relatedRequirementIds 重复的 path 应指向重复项索引', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({
        relatedRequirementIds: ['ref-a', 'ref-b', 'ref-a'],
      }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      const dupIssue = result.error.issues.find(
        (i) => i.path[0] === 'relatedRequirementIds' && typeof i.path[1] === 'number',
      );
      expect(dupIssue).toBeDefined();
      expect(dupIssue!.path).toEqual(['relatedRequirementIds', 2]);
    }
  });

  it('relatedRequirementIds 自关联的 path 应指向自关联项索引', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({
        id: 'self-ref-req',
        relatedRequirementIds: ['other-req', 'self-ref-req'],
      }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      const selfIssue = result.error.issues.find(
        (i) => i.path[0] === 'relatedRequirementIds' && typeof i.path[1] === 'number',
      );
      expect(selfIssue).toBeDefined();
      expect(selfIssue!.path).toEqual(['relatedRequirementIds', 1]);
    }
  });

  it('businessRules 重复的 path 应指向重复项索引', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({
        businessRules: ['唯一规则', '唯一规则'],
      }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      const dupIssue = result.error.issues.find(
        (i) => i.path[0] === 'businessRules' && typeof i.path[1] === 'number',
      );
      expect(dupIssue).toBeDefined();
      expect(dupIssue!.path).toEqual(['businessRules', 1]);
    }
  });

  it('acceptanceCriteria 重复的 path 应指向重复项索引', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({
        acceptanceCriteria: ['标准', '标准'],
      }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      const dupIssue = result.error.issues.find(
        (i) => i.path[0] === 'acceptanceCriteria' && typeof i.path[1] === 'number',
      );
      expect(dupIssue).toBeDefined();
      expect(dupIssue!.path).toEqual(['acceptanceCriteria', 1]);
    }
  });

  it('anchors 重复 id 的 path 应指向 [anchors, index, id]', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({
        anchors: [
          makeValidElementAnchor({ id: 'same-id', dataReqId: 'btn-a' }),
          makeValidElementAnchor({ id: 'same-id', dataReqId: 'btn-b' }),
        ] as Anchor[],
      }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      const dupIssue = result.error.issues.find(
        (i) => i.path[0] === 'anchors' && i.path[2] === 'id',
      );
      expect(dupIssue).toBeDefined();
      expect(dupIssue!.path).toEqual(['anchors', 1, 'id']);
    }
  });

  it('referenceImages 重复 id 的 path 应指向 [referenceImages, index, id]', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({
        referenceImages: [
          { id: 'dup', src: '/a.png', alt: 'A' },
          { id: 'dup', src: '/b.png', alt: 'B' },
        ],
      }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      const dupIssue = result.error.issues.find(
        (i) => i.path[0] === 'referenceImages' && i.path[2] === 'id',
      );
      expect(dupIssue).toBeDefined();
      expect(dupIssue!.path).toEqual(['referenceImages', 1, 'id']);
    }
  });

  it('multi-anchor item 重复 id 的 path 应指向 [items, index, id]', () => {
    const result = multiAnchorSchema.safeParse(
      makeValidMultiAnchor({
        items: [
          { id: 'same', page: 'demo-page', dataReqId: 'btn-1', description: 'A' },
          { id: 'same', page: 'demo-page', dataReqId: 'btn-2', description: 'B' },
        ],
      }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      const dupIssue = result.error.issues.find(
        (i) => i.path[0] === 'items' && i.path[2] === 'id',
      );
      expect(dupIssue).toBeDefined();
      expect(dupIssue!.path).toEqual(['items', 1, 'id']);
    }
  });

  it('multi-anchor 目标组合重复的 path 应指向 [items, index, dataReqId]', () => {
    const result = multiAnchorSchema.safeParse(
      makeValidMultiAnchor({
        items: [
          { id: 'item-a', page: 'demo-page', dataReqId: 'same-btn', description: 'A' },
          { id: 'item-b', page: 'demo-page', dataReqId: 'same-btn', description: 'B' },
        ],
      }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      const dupIssue = result.error.issues.find(
        (i) => i.path[0] === 'items' && i.path[1] === 1 && i.path[2] === 'dataReqId',
      );
      expect(dupIssue).toBeDefined();
      expect(dupIssue!.path).toEqual(['items', 1, 'dataReqId']);
    }
  });

  it('fallbackDataReqIds 重复的 path 应指向重复项索引', () => {
    const result = virtualRegionAnchorSchema.safeParse({
      ...makeValidVirtualRegionAnchor(),
      fallbackDataReqIds: ['fb-1', 'fb-2', 'fb-1'],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const dupIssue = result.error.issues.find(
        (i) => i.path[0] === 'fallbackDataReqIds' && typeof i.path[1] === 'number',
      );
      expect(dupIssue).toBeDefined();
      expect(dupIssue!.path).toEqual(['fallbackDataReqIds', 2]);
    }
  });

  it('updatedAt 早于 createdAt 的 path 应指向 updatedAt', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({
        createdAt: '2026-06-20T14:00:00.000Z',
        updatedAt: '2026-01-15T10:30:00.000Z',
      }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      const dateIssue = result.error.issues.find(
        (i) => i.path[0] === 'updatedAt',
      );
      expect(dateIssue).toBeDefined();
      expect(dateIssue!.path).toEqual(['updatedAt']);
    }
  });
});

// ============================================================================
// 10.8 正式需求根 Schema 测试：嵌套路径回归（完整路径）
// ============================================================================

describe('requirementSchema - 嵌套路径回归', () => {
  it('嵌套 multi-anchor 目标组合重复时 path 应包含完整锚点路径 ["anchors",0,"items",1,"dataReqId"]', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({
        anchors: [
          makeValidMultiAnchor({
            items: [
              { id: 'ma-item-1', page: 'demo-page', dataReqId: 'same-btn', description: 'A' },
              { id: 'ma-item-2', page: 'demo-page', dataReqId: 'same-btn', description: 'B' },
            ],
          }),
        ] as Anchor[],
      }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      const targetIssue = result.error.issues.find(
        (i) =>
          i.path[0] === 'anchors' &&
          i.path[1] === 0 &&
          i.path[2] === 'items' &&
          i.path[3] === 1 &&
          i.path[4] === 'dataReqId',
      );
      expect(targetIssue).toBeDefined();
      expect(targetIssue!.path).toEqual(['anchors', 0, 'items', 1, 'dataReqId']);
    }
  });

  it('嵌套 multi-anchor item id 重复时 path 应包含完整锚点路径 ["anchors",0,"items",1,"id"]', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({
        anchors: [
          makeValidMultiAnchor({
            items: [
              { id: 'same-id', page: 'demo-page', dataReqId: 'btn-1', description: 'A' },
              { id: 'same-id', page: 'demo-page', dataReqId: 'btn-2', description: 'B' },
            ],
          }),
        ] as Anchor[],
      }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      const targetIssue = result.error.issues.find(
        (i) =>
          i.path[0] === 'anchors' &&
          i.path[1] === 0 &&
          i.path[2] === 'items' &&
          i.path[3] === 1 &&
          i.path[4] === 'id',
      );
      expect(targetIssue).toBeDefined();
      expect(targetIssue!.path).toEqual(['anchors', 0, 'items', 1, 'id']);
    }
  });

  it('嵌套 virtual-region fallbackDataReqIds 重复时 path 应包含完整锚点路径 ["anchors",0,"fallbackDataReqIds",1]', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({
        anchors: [
          makeValidVirtualRegionAnchor({
            fallbackDataReqIds: ['fb-dup', 'fb-dup'],
          }),
        ] as Anchor[],
      }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      const targetIssue = result.error.issues.find(
        (i) =>
          i.path[0] === 'anchors' &&
          i.path[1] === 0 &&
          i.path[2] === 'fallbackDataReqIds' &&
          i.path[3] === 1,
      );
      expect(targetIssue).toBeDefined();
      expect(targetIssue!.path).toEqual(['anchors', 0, 'fallbackDataReqIds', 1]);
    }
  });
});

// ============================================================================
// 11. 正式需求根 Schema 测试：日期与版本
// ============================================================================

describe('requirementSchema - 日期与版本', () => {
  it('应拒绝不带时区的 createdAt', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({
        createdAt: '2026-01-15T10:30:00',
      } as Partial<Requirement>),
    );
    expect(result.success).toBe(false);
  });

  it('应拒绝不带时区的 updatedAt', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({
        updatedAt: '2026-06-20T14:00:00',
      } as Partial<Requirement>),
    );
    expect(result.success).toBe(false);
  });

  it('应拒绝 updatedAt 早于 createdAt', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({
        createdAt: '2026-06-20T14:00:00.000Z',
        updatedAt: '2026-01-15T10:30:00.000Z',
      }),
    );
    expect(result.success).toBe(false);
  });

  it('应拒绝非法版本格式', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({
        publishedVersion: 'v1.0',
      } as Partial<Requirement>),
    );
    expect(result.success).toBe(false);
  });

  it('应拒绝纯日期 createdAt', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({
        createdAt: '2026-01-15',
      } as Partial<Requirement>),
    );
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// 12. 正式需求根 Schema 测试：锚点嵌入校验
// ============================================================================

describe('requirementSchema - 锚点嵌入', () => {
  it('应拒绝 multi-anchor 根对象含 page', () => {
    const multiAnchor = makeValidMultiAnchor();
    (multiAnchor as Record<string, unknown>).page = 'demo-page';
    const result = requirementSchema.safeParse(
      makeValidRequirement({ anchors: [multiAnchor as Anchor] }),
    );
    expect(result.success).toBe(false);
  });

  it('应拒绝 multi-anchor 根对象含 dataReqId', () => {
    const multiAnchor = makeValidMultiAnchor();
    (multiAnchor as Record<string, unknown>).dataReqId = 'some-id';
    const result = requirementSchema.safeParse(
      makeValidRequirement({ anchors: [multiAnchor as Anchor] }),
    );
    expect(result.success).toBe(false);
  });

  it('应拒绝 element 锚点含绝对坐标', () => {
    const elem = makeValidElementAnchor();
    (elem as Record<string, unknown>).x = 100;
    (elem as Record<string, unknown>).y = 200;
    const result = requirementSchema.safeParse(
      makeValidRequirement({ anchors: [elem as Anchor] }),
    );
    expect(result.success).toBe(false);
  });

  it('应拒绝 targetState.value 为对象', () => {
    const sa = makeValidStateAnchor();
    (sa as Record<string, unknown>).targetState = {
      key: 'config',
      value: { nested: true },
      description: '对象值',
    };
    const result = requirementSchema.safeParse(
      makeValidRequirement({ anchors: [sa as Anchor] }),
    );
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// 13. 正式需求根 Schema 测试：未知字段拒绝
// ============================================================================

describe('requirementSchema - 未知字段拒绝', () => {
  it('应拒绝含未知字段的需求', () => {
    const result = requirementSchema.safeParse({
      ...makeValidRequirement(),
      extraField: 'should-not-be-here',
    });
    expect(result.success).toBe(false);
  });

  it('应拒绝含坐标字段的需求', () => {
    const result = requirementSchema.safeParse({
      ...makeValidRequirement(),
      pageX: 100,
      pageY: 200,
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// 14. 正式需求根 Schema 测试：内容质量校验
// ============================================================================

describe('requirementSchema - 内容质量', () => {
  it('应拒绝纯空格标题', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({ title: '   ' }),
    );
    expect(result.success).toBe(false);
  });

  it('应拒绝 businessRules 含空字符串', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({ businessRules: ['valid', ''] }),
    );
    expect(result.success).toBe(false);
  });

  it('应拒绝 acceptanceCriteria 含空字符串', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({ acceptanceCriteria: ['   '] }),
    );
    expect(result.success).toBe(false);
  });

  it('应拒绝 acceptanceCriteria 为空数组', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({ acceptanceCriteria: [] }),
    );
    expect(result.success).toBe(false);
  });

  it('应拒绝 involvedPages 为空数组', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({ involvedPages: [] as unknown as [string, ...string[]] }),
    );
    expect(result.success).toBe(false);
  });

  it('应拒绝纯空格 background', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({ background: '   ' }),
    );
    expect(result.success).toBe(false);
  });

  it('应拒绝空字符串 trigger', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({ trigger: '' }),
    );
    expect(result.success).toBe(false);
  });

  it('应拒绝仅空格的 description', () => {
    const result = requirementSchema.safeParse(
      makeValidRequirement({ description: '  ' }),
    );
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// 15. 类型推导验证（编译时检查）
// ============================================================================

describe('TypeScript 类型推导', () => {
  it('从 Schema 推导的类型在运行时可通过 Zod 校验', () => {
    const req = makeValidRequirement();
    const result = requirementSchema.safeParse(req);
    expect(result.success).toBe(true);
    if (result.success) {
      // 编译时验证：这些属性应该能从推导类型中访问
      const id: string = result.data.id;
      const status: string = result.data.status;
      const priority: string = result.data.priority;
      expect(id).toBe('demo-req-001');
      expect(status).toBe('draft');
      expect(priority).toBe('P2');
    }
  });

  it('锚点联合类型可通过 type 推导具体类型', () => {
    const elem = makeValidElementAnchor();
    const result = anchorUnionSchema.safeParse(elem);
    expect(result.success).toBe(true);
    if (result.success && result.data.type === 'element') {
      // type 收窄后应能访问目标型字段
      expect(result.data.page).toBe('demo-page');
      expect(result.data.dataReqId).toBe('demo-submit-button');
    }
  });
});
