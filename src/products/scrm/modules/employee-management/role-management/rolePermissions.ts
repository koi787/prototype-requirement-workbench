import { ROLE_PERMISSION_TREE, flattenRolePermissionTree } from './rolePermissionTree';
import type { DataNode } from 'antd/es/tree';
import type { RolePermissionNode } from './rolePermissionTree';

export { ROLE_PERMISSION_TREE, flattenRolePermissionTree } from './rolePermissionTree';

const ALL_PERMISSION_NODES = flattenRolePermissionTree();
const ALL_PERMISSION_IDS = new Set(ALL_PERMISSION_NODES.map((node) => node.id));

export const ROLE_PERMISSION_NODE_IDS = ALL_PERMISSION_NODES.map((node) => node.id);
export const ROLE_PERMISSION_LEAF_IDS = ALL_PERMISSION_NODES
  .filter((node) => !node.children?.length)
  .map((node) => node.id);

export const MINI_PROGRAM_PERMISSION_IDS = ROLE_PERMISSION_TREE[0]?.children?.map((node) => node.id) ?? [];
export const RANKING_PERMISSION_ID = ROLE_PERMISSION_TREE[1]?.id ?? '';

export function normalizePermissionIds(permissionIds: readonly string[]): string[] {
  const selected = new Set(permissionIds.filter((id) => ALL_PERMISSION_IDS.has(id)));
  return ROLE_PERMISSION_NODE_IDS.filter((id) => selected.has(id));
}

export function permissionSample(index: number): string[] {
  const roots = ROLE_PERMISSION_TREE;
  const samples: readonly (readonly string[])[] = [
    [roots[0]!.id],
    [roots[3]!.id, roots[3]!.children![0]!.id],
    [roots[2]!.children![0]!.id],
    [
      roots[10]!.id,
      roots[10]!.children![1]!.id,
      roots[10]!.children![1]!.children![0]!.id,
      roots[10]!.children![1]!.children![0]!.children![0]!.id,
    ],
  ];
  return normalizePermissionIds(samples[index % samples.length]!);
}

export function permissionTreeToDataNodes(nodes: readonly RolePermissionNode[]): DataNode[] {
  return nodes.map((node) => ({
    key: node.id,
    title: node.label,
    ...(node.children?.length ? { children: permissionTreeToDataNodes(node.children) } : {}),
  }));
}
