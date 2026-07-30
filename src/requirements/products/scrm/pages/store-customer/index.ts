import requirementData from './requirements.json';
import {
  requirementViewMapSchema,
  validateRequirementKeys,
  type RequirementViewMap,
  type RequirementViewEntry,
} from '../../../../schemas/requirement-view';

/**
 * 已校验的门店客户需求说明数据。
 *
 * 在模块加载时执行 Zod 解析；校验失败时抛出可定位错误。
 * 产品经理修改 requirements.json 后，Vite HMR 会重新加载本模块并重新校验。
 */
let _parsedData: RequirementViewMap | null = null;

function parseAndValidate(): RequirementViewMap {
  if (_parsedData) return _parsedData;

  // 1. 校验根结构
  const result = requirementViewMapSchema.safeParse(requirementData);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  [${i.path.map(String).join('.')}] ${i.message}`)
      .join('\n');
    throw new Error(`requirements.json Schema 校验失败:\n${issues}`);
  }

  // 2. 交叉校验 15 个 key
  const keyError = validateRequirementKeys(result.data);
  if (keyError) {
    throw new Error(`requirements.json key 校验失败: ${keyError}`);
  }

  _parsedData = result.data;
  return _parsedData;
}

/** 已校验的需求数据（惰性解析，首次访问时校验） */
export function getRequirements(): RequirementViewMap {
  return parseAndValidate();
}

/** 根据 requirement key 读取单条需求，不存在时返回 undefined */
export function getRequirement(key: string): RequirementViewEntry | undefined {
  return getRequirements()[key];
}

/** 清空缓存（仅用于测试或 HMR 强制重新加载） */
export function clearRequirementCache(): void {
  _parsedData = null;
}

export type { RequirementViewMap, RequirementViewEntry };
