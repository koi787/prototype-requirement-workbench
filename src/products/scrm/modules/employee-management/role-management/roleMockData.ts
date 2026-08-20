import type { RoleFilter, RoleRecord } from './roleTypes';
import { permissionSample } from './rolePermissions';

export const DEFAULT_ROLE_FILTER: RoleFilter = { roleName: '', roleCode: '' };

const ROLE_SEEDS = [
  ['72', '美容培训督导', 'mrdd'],
  ['71', '瑜伽培训督导', 'yjdd'],
  ['70', '美容技术顾问', 'MRJSGW'],
  ['69', '美容行政专员', 'MRXZZY'],
  ['68', '天九联营指定', 'TJLYZD'],
  ['67', '天九联营汇总', 'TJLYHZ'],
  ['65', '联营店汇总', 'LYDJS'],
  ['64', '内部联营使用（联营全部菜单）', 'LYDSF'],
  ['63', '数据大屏演示', 'SJDPYS'],
  ['62', '融资部数据专员', 'SFMR'],
] as const;

const GENERATED_ROLE_TEMPLATES = [
  ['门店运营专员', 'MDYYZY'],
  ['区域运营经理', 'QYYLJ'],
  ['培训运营专员', 'PXYYZY'],
  ['数据运营专员', 'SJYYZY'],
  ['联营运营经理', 'LYYYJL'],
] as const;

const GENERATED_ROLES: readonly (readonly [string, string, string])[] = Array.from(
  { length: 55 },
  (_, index) => {
    const [roleName, roleCode] = GENERATED_ROLE_TEMPLATES[index % GENERATED_ROLE_TEMPLATES.length]!;
    return [String(61 - index), roleName, `${roleCode}${String(index + 1).padStart(2, '0')}`] as const;
  },
);

const ALL_ROLE_SEEDS = [...ROLE_SEEDS, ...GENERATED_ROLES];

export const ROLE_MOCK: readonly RoleRecord[] = ALL_ROLE_SEEDS.map(([id, roleName, roleCode], index) => ({
  id,
  roleName,
  roleCode,
  permissionIds: permissionSample(index),
  updatedAt: `2026-08-${String(18 - Math.min(index, 9)).padStart(2, '0')} 10:${String(12 + index).padStart(2, '0')}:00`,
  operatorName: index % 2 === 0 ? '王经理' : '李经理',
}));

export const DEFAULT_USED_ROLE_IDS: readonly string[] = [ROLE_MOCK[0]?.id ?? '72'];

export function nextRoleId(records: readonly RoleRecord[]): string {
  const maxId = records.reduce((max, record) => Math.max(max, Number.parseInt(record.id, 10) || 0), 0);
  return String(maxId + 1);
}

export function formatRoleDate(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function filterRoles(records: readonly RoleRecord[], filter: RoleFilter): RoleRecord[] {
  const roleName = filter.roleName.trim();
  const roleCode = filter.roleCode.trim();
  return records.filter(
    (record) =>
      (!roleName || record.roleName.includes(roleName)) &&
      (!roleCode || record.roleCode.includes(roleCode)),
  );
}
