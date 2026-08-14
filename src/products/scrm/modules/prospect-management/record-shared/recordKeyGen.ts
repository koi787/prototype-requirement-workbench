/**
 * 0012 Cycle B2 - 新建记录稳定 Mock key / id 生成。
 *
 * 新建到店/拜访记录由前端生成本地 Mock 唯一标识：依据既有记录 key / id 扫描
 * 出最大值并递增（a1..a7 → a8，AR001..AR007 → AR008；v1..v3 → v4，VS001..VS003
 * → VS004）。不使用时间戳/随机数，保证前端测试可稳定复现、不重复。
 * 仅生成本地 Mock 标识，不涉及后端 ID 规则、不修改客户主数据。
 */

/** 依据既有记录 key 生成下一个稳定 key（前缀 + 最大序号 + 1）。 */
export function nextRecordKey(existingKeys: string[], prefix: string): string {
  let max = 0;
  for (const key of existingKeys) {
    if (key.startsWith(prefix)) {
      const num = Number(key.slice(prefix.length));
      if (Number.isFinite(num) && num > max) max = num;
    }
  }
  return `${prefix}${max + 1}`;
}

/** 依据既有记录 id 生成下一个稳定 id（前缀 + 最大序号 + 1，序号补齐 3 位）。 */
export function nextRecordId(existingIds: string[], prefix: string): string {
  let max = 0;
  for (const id of existingIds) {
    if (id.startsWith(prefix)) {
      const num = Number(id.slice(prefix.length));
      if (Number.isFinite(num) && num > max) max = num;
    }
  }
  return `${prefix}${String(max + 1).padStart(3, '0')}`;
}
