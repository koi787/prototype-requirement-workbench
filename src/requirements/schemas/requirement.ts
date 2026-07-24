import { z } from 'zod';

// ============================================================================
// 1. 基础工具 Schema
// ============================================================================

/**
 * 稳定 ID 格式：
 * - 只允许小写英文、数字和短横线
 * - 不允许短横线开头
 * - 不允许短横线结尾
 * - 不允许连续短横线
 */
const stableIdRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** 稳定 ID Schema */
export const stableIdSchema = z
  .string()
  .regex(
    stableIdRegex,
    'Stable ID must be lowercase alphanumeric with single hyphens, no leading/trailing/consecutive hyphens',
  );

/** 带时区的 ISO 8601 日期时间 Schema */
export const isoDateTimeSchema = z.iso.datetime({ offset: true });

/**
 * 已发布版本号格式：
 * - v{major}.{minor}.{patch}，例如 v1.0.0
 * - null 表示未发布草稿
 */
const versionRegex = /^v\d+\.\d+\.\d+$/;

/** 已发布版本 Schema */
export const publishedVersionSchema = z.union([
  z.string().regex(versionRegex, 'Published version must be v{major}.{minor}.{patch}, e.g. v1.0.0'),
  z.null(),
]);

/** 非空 trim 后字符串：不允许仅包含空格的标题、描述、规则或验收标准 */
export const nonEmptyTrimmedString = z
  .string()
  .trim()
  .nonempty('String must not be empty or whitespace-only');

// ============================================================================
// 内部辅助：唯一性校验
// ============================================================================

/**
 * 在已 trim 的字符串数组中查找重复项索引。
 * 第一次出现的值保留为合法来源，后续重复项被标记。
 */
function findDuplicateIndices(arr: string[]): number[] {
  const seen = new Set<string>();
  const duplicates: number[] = [];
  for (let i = 0; i < arr.length; i++) {
    const value = arr[i]!;
    if (seen.has(value)) {
      duplicates.push(i);
    } else {
      seen.add(value);
    }
  }
  return duplicates;
}

/**
 * 在对象数组中按 id 字段查找重复项索引。
 */
function findDuplicateIdIndices<T extends { id: string }>(arr: T[]): number[] {
  const seen = new Set<string>();
  const duplicates: number[] = [];
  for (let i = 0; i < arr.length; i++) {
    const id = arr[i]!.id;
    if (seen.has(id)) {
      duplicates.push(i);
    } else {
      seen.add(id);
    }
  }
  return duplicates;
}

// ============================================================================
// 2. 枚举 Schema
// ============================================================================

/** 需求状态枚举：只允许七种状态 */
export const requirementStatusSchema = z.enum([
  'draft',
  'pending-confirmation',
  'confirmed',
  'developing',
  'testing',
  'completed',
  'deprecated',
]);

/** 优先级枚举：只允许 P0—P5 */
export const requirementPrioritySchema = z.enum([
  'P0',
  'P1',
  'P2',
  'P3',
  'P4',
  'P5',
]);

// ============================================================================
// 3. 锚点 Schema
// ============================================================================

/**
 * 公共锚点字段：
 * 所有五种锚点共享 id、type、description、autoScroll、focusHighlight。
 * description 仅供人类阅读，不参与定位计算。
 */
const anchorBaseFields = {
  id: stableIdSchema,
  description: nonEmptyTrimmedString,
  autoScroll: z.boolean(),
  focusHighlight: z.boolean(),
};

/**
 * 目标型锚点字段：
 * element、region、virtual-region、state-anchor 都需要 page 和 dataReqId。
 */
const targetedAnchorFields = {
  page: stableIdSchema,
  dataReqId: stableIdSchema,
};

// --- 3.1 element 锚点 ---

/** element 元素类型受控枚举 */
export const elementKindSchema = z.enum([
  'button',
  'input',
  'select',
  'label',
  'table-field',
  'other',
]);

/** element 锚点：用于按钮、输入框、标签、选择器和表格字段等独立元素 */
export const elementAnchorSchema = z.strictObject({
  type: z.literal('element'),
  ...anchorBaseFields,
  ...targetedAnchorFields,
  elementKind: elementKindSchema.optional(),
});

// --- 3.2 region 锚点 ---

/** region 区域类型受控枚举 */
export const regionKindSchema = z.enum([
  'filter',
  'form',
  'table',
  'modal',
  'other',
]);

/** region 锚点：用于筛选区、表单区、表格区、弹窗区等容器 */
export const regionAnchorSchema = z.strictObject({
  type: z.literal('region'),
  ...anchorBaseFields,
  ...targetedAnchorFields,
  regionKind: regionKindSchema.optional(),
});

// --- 3.3 virtual-region 锚点 ---

/** virtual-region 锚点：没有独立 DOM 容器但由页面运行时注册的语义区域 */
export const virtualRegionAnchorSchema = z
  .strictObject({
    type: z.literal('virtual-region'),
    ...anchorBaseFields,
    ...targetedAnchorFields,
    fallbackDataReqIds: z.array(stableIdSchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.fallbackDataReqIds || data.fallbackDataReqIds.length === 0) {
      return;
    }
    const seen = new Set<string>();
    for (let i = 0; i < data.fallbackDataReqIds.length; i++) {
      const value = data.fallbackDataReqIds[i]!;
      if (seen.has(value)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `fallbackDataReqIds contains duplicate value at index ${i}`,
          path: ['fallbackDataReqIds', i],
        });
      } else {
        seen.add(value);
      }
    }
  });

// --- 3.4 multi-anchor 锚点 ---

/** multi-anchor 子项：只表达稳定目标引用，不允许递归包含另一个 multi-anchor */
export const multiAnchorSubItemSchema = z.strictObject({
  id: stableIdSchema,
  page: stableIdSchema,
  dataReqId: stableIdSchema,
  description: nonEmptyTrimmedString,
});

/**
 * multi-anchor 根对象：
 * - 只包含公共字段和 items
 * - 不包含 page 或 dataReqId
 * - items 至少两个子项
 * - 同一 multi-anchor 内 item.id 不得重复
 * - 同一 multi-anchor 内 (page, dataReqId) 组合不得重复
 */
export const multiAnchorSchema = z
  .strictObject({
    type: z.literal('multi-anchor'),
    ...anchorBaseFields,
    items: z.array(multiAnchorSubItemSchema).min(2, 'multi-anchor must have at least 2 sub-items'),
  })
  .superRefine((data, ctx) => {
    // item id 去重
    const seenIds = new Set<string>();
    for (let i = 0; i < data.items.length; i++) {
      const id = data.items[i]!.id;
      if (seenIds.has(id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `multi-anchor sub-item id must be unique, duplicate at index ${i}`,
          path: ['items', i, 'id'],
        });
      } else {
        seenIds.add(id);
      }
    }

    // (page, dataReqId) 组合去重
    const seenTargets = new Set<string>();
    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i]!;
      const key = `${item.page}|${item.dataReqId}`;
      if (seenTargets.has(key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'multi-anchor sub-items must have unique (page, dataReqId) combinations',
          path: ['items', i, 'dataReqId'],
        });
      } else {
        seenTargets.add(key);
      }
    }
  });

// --- 3.5 state-anchor 锚点 ---

/**
 * state-anchor.targetState.value：
 * 第一阶段只允许 string、number、boolean 或 null。
 * 不得使用 any、unknown、object 或 array。
 */
const targetStateValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);

/** state-anchor.targetState */
export const stateAnchorTargetStateSchema = z.strictObject({
  key: stableIdSchema,
  value: targetStateValueSchema,
  description: nonEmptyTrimmedString,
});

/**
 * state-anchor 锚点：
 * 用于先切换页面状态再定位目标元素。
 * 状态完成后仍通过 page 和 dataReqId 定位。
 */
export const stateAnchorSchema = z.strictObject({
  type: z.literal('state-anchor'),
  ...anchorBaseFields,
  ...targetedAnchorFields,
  targetState: stateAnchorTargetStateSchema,
});

// --- 锚点可辨识联合 ---

/**
 * 五种锚点联合类型：
 * 以 type 作为判别字段，每个分支 Schema 的 type 都已收窄为对应 z.literal()。
 */
export const anchorUnionSchema = z.discriminatedUnion('type', [
  elementAnchorSchema,
  regionAnchorSchema,
  virtualRegionAnchorSchema,
  multiAnchorSchema,
  stateAnchorSchema,
]);

// ============================================================================
// 4. 子结构 Schema
// ============================================================================

/** 引用图片元数据 */
export const referenceImageSchema = z.strictObject({
  id: stableIdSchema,
  src: nonEmptyTrimmedString,
  alt: nonEmptyTrimmedString,
  title: nonEmptyTrimmedString.optional(),
  description: nonEmptyTrimmedString.optional(),
});

// ============================================================================
// 5. 正式需求根 Schema
// ============================================================================

/**
 * 正式需求 Schema：
 * 覆盖任务单第 5-8 节全部字段，包含跨字段校验。
 * 使用 .strict() 拒绝未知字段。
 */
export const requirementSchema = z
  .strictObject({
    // 需求基础字段
    id: stableIdSchema,
    title: nonEmptyTrimmedString,
    product: stableIdSchema,
    module: stableIdSchema,
    involvedModules: z.array(stableIdSchema).min(1, 'involvedModules must contain at least one module'),
    requirementBatch: stableIdSchema,
    involvedPages: z.array(stableIdSchema).min(1, 'involvedPages must contain at least one page'),

    // 状态与优先级
    status: requirementStatusSchema,
    priority: requirementPrioritySchema,

    // 需求描述
    background: nonEmptyTrimmedString,
    description: nonEmptyTrimmedString,

    // 规则字段
    trigger: nonEmptyTrimmedString,
    businessRules: z.array(nonEmptyTrimmedString),
    exceptionRules: z.array(nonEmptyTrimmedString),
    permissionRules: z.array(nonEmptyTrimmedString),
    interactionResult: nonEmptyTrimmedString,
    acceptanceCriteria: z.array(nonEmptyTrimmedString).min(1, 'acceptanceCriteria must contain at least one item'),
    pendingQuestions: z.array(nonEmptyTrimmedString),

    // 关联字段
    referenceImages: z.array(referenceImageSchema),
    relatedRequirementIds: z.array(stableIdSchema),
    anchors: z.array(anchorUnionSchema),

    // 版本字段
    createdAt: isoDateTimeSchema,
    updatedAt: isoDateTimeSchema,
    publishedVersion: publishedVersionSchema,
  })
  .superRefine((data, ctx) => {
    // 1. involvedModules 必须包含 module
    if (!data.involvedModules.includes(data.module)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'involvedModules must include the primary module',
        path: ['involvedModules'],
      });
    }

    // 2. involvedModules 去重（路径精确到重复项索引）
    for (const idx of findDuplicateIndices(data.involvedModules)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `involvedModules contains duplicate value at index ${idx}`,
        path: ['involvedModules', idx],
      });
    }

    // 3. involvedPages 去重
    for (const idx of findDuplicateIndices(data.involvedPages)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `involvedPages contains duplicate value at index ${idx}`,
        path: ['involvedPages', idx],
      });
    }

    // 4. relatedRequirementIds 去重
    for (const idx of findDuplicateIndices(data.relatedRequirementIds)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `relatedRequirementIds contains duplicate value at index ${idx}`,
        path: ['relatedRequirementIds', idx],
      });
    }

    // 5. relatedRequirementIds 禁止自关联（路径精确到自关联项索引）
    const selfRefIdx = data.relatedRequirementIds.indexOf(data.id);
    if (selfRefIdx !== -1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'relatedRequirementIds must not include the current requirement ID',
        path: ['relatedRequirementIds', selfRefIdx],
      });
    }

    // 6. businessRules 去重
    for (const idx of findDuplicateIndices(data.businessRules)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `businessRules contains duplicate value at index ${idx}`,
        path: ['businessRules', idx],
      });
    }

    // 7. exceptionRules 去重
    for (const idx of findDuplicateIndices(data.exceptionRules)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `exceptionRules contains duplicate value at index ${idx}`,
        path: ['exceptionRules', idx],
      });
    }

    // 8. permissionRules 去重
    for (const idx of findDuplicateIndices(data.permissionRules)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `permissionRules contains duplicate value at index ${idx}`,
        path: ['permissionRules', idx],
      });
    }

    // 9. acceptanceCriteria 去重
    for (const idx of findDuplicateIndices(data.acceptanceCriteria)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `acceptanceCriteria contains duplicate value at index ${idx}`,
        path: ['acceptanceCriteria', idx],
      });
    }

    // 10. pendingQuestions 去重
    for (const idx of findDuplicateIndices(data.pendingQuestions)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `pendingQuestions contains duplicate value at index ${idx}`,
        path: ['pendingQuestions', idx],
      });
    }

    // 11. anchors 按 id 去重
    for (const idx of findDuplicateIdIndices(data.anchors)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `anchors contains duplicate id at index ${idx}`,
        path: ['anchors', idx, 'id'],
      });
    }

    // 12. referenceImages 按 id 去重
    for (const idx of findDuplicateIdIndices(data.referenceImages)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `referenceImages contains duplicate id at index ${idx}`,
        path: ['referenceImages', idx, 'id'],
      });
    }

    // 13. updatedAt 不得早于 createdAt
    if (new Date(data.updatedAt) < new Date(data.createdAt)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'updatedAt must not be earlier than createdAt',
        path: ['updatedAt'],
      });
    }
  });

// ============================================================================
// 6. TypeScript 类型推导
// ============================================================================

/** 稳定 ID 类型 */
export type StableId = z.infer<typeof stableIdSchema>;

/** 需求状态类型 */
export type RequirementStatus = z.infer<typeof requirementStatusSchema>;

/** 优先级类型 */
export type RequirementPriority = z.infer<typeof requirementPrioritySchema>;

/** element 元素类型 */
export type ElementKind = z.infer<typeof elementKindSchema>;

/** region 区域类型 */
export type RegionKind = z.infer<typeof regionKindSchema>;

/** 引用图片元数据类型 */
export type ReferenceImage = z.infer<typeof referenceImageSchema>;

/** element 锚点类型 */
export type ElementAnchor = z.infer<typeof elementAnchorSchema>;

/** region 锚点类型 */
export type RegionAnchor = z.infer<typeof regionAnchorSchema>;

/** virtual-region 锚点类型 */
export type VirtualRegionAnchor = z.infer<typeof virtualRegionAnchorSchema>;

/** multi-anchor 子项类型 */
export type MultiAnchorSubItem = z.infer<typeof multiAnchorSubItemSchema>;

/** multi-anchor 锚点类型 */
export type MultiAnchor = z.infer<typeof multiAnchorSchema>;

/** state-anchor.targetState 类型 */
export type StateAnchorTargetState = z.infer<typeof stateAnchorTargetStateSchema>;

/** state-anchor 锚点类型 */
export type StateAnchor = z.infer<typeof stateAnchorSchema>;

/** 锚点联合类型 */
export type Anchor = z.infer<typeof anchorUnionSchema>;

/** 正式需求类型 */
export type Requirement = z.infer<typeof requirementSchema>;
