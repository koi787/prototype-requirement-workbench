/**
 * 2026-07-scrm-invalid-approval-flow 正式需求批次
 *
 * 加载 requirements.json 并通过正式 Requirement Schema 逐条校验。
 * 校验失败时抛出可定位错误。
 */
import batchData from './requirements.json';
import { requirementSchema, type Requirement } from '../../schemas/requirement';

/** 已校验的批次需求数组（惰性解析） */
let _parsed: Requirement[] | null = null;

function parseAndValidate(): Requirement[] {
  if (_parsed) return _parsed;

  if (!Array.isArray(batchData)) {
    throw new Error('批次 requirements.json 必须是数组');
  }

  const results: Requirement[] = [];
  for (let i = 0; i < batchData.length; i++) {
    const result = requirementSchema.safeParse(batchData[i]);
    if (!result.success) {
      throw new Error(
        `批次第 ${i + 1} 条需求 Schema 校验失败:\n${JSON.stringify(result.error.issues, null, 2)}`,
      );
    }
    results.push(result.data);
  }

  _parsed = results;
  return _parsed;
}

/** 获取已校验的批次需求列表 */
export function getBatchRequirements(): Requirement[] {
  return parseAndValidate();
}

/** 清空缓存（仅用于测试或 HMR） */
export function clearBatchCache(): void {
  _parsed = null;
}

export type { Requirement };
