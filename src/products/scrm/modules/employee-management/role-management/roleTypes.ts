/** 0015 Cycle A - 角色列表只读记录。 */
export interface RoleRecord {
  id: string;
  roleName: string;
  roleCode: string;
  permissionIds: string[];
  updatedAt: string;
  operatorName: string;
}

export interface RoleFilter {
  roleName: string;
  roleCode: string;
}

export interface RoleDraft {
  roleName: string;
  roleCode: string;
  permissionIds: string[];
}
