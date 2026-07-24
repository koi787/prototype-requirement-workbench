export {
  // 基础工具 Schema
  stableIdSchema,
  isoDateTimeSchema,
  publishedVersionSchema,
  nonEmptyTrimmedString,

  // 枚举 Schema
  requirementStatusSchema,
  requirementPrioritySchema,
  elementKindSchema,
  regionKindSchema,

  // 锚点 Schema
  elementAnchorSchema,
  regionAnchorSchema,
  virtualRegionAnchorSchema,
  multiAnchorSchema,
  multiAnchorSubItemSchema,
  stateAnchorSchema,
  stateAnchorTargetStateSchema,
  anchorUnionSchema,

  // 子结构 Schema
  referenceImageSchema,

  // 正式需求根 Schema
  requirementSchema,

  // TypeScript 类型（从 Zod Schema 推导）
  type StableId,
  type RequirementStatus,
  type RequirementPriority,
  type ElementKind,
  type RegionKind,
  type ReferenceImage,
  type ElementAnchor,
  type RegionAnchor,
  type VirtualRegionAnchor,
  type MultiAnchor,
  type MultiAnchorSubItem,
  type StateAnchor,
  type StateAnchorTargetState,
  type Anchor,
  type Requirement,
} from './requirement';

export {
  requirementConfirmationStatusSchema,
  requirementConfirmationStatusOptionalSchema,
  requirementViewEntrySchema,
  requirementViewMapSchema,
  EXPECTED_REQUIREMENT_KEYS,
  validateRequirementKeys,
  type RequirementConfirmationStatus,
  type RequirementViewEntry,
  type RequirementViewMap,
} from './requirement-view';
