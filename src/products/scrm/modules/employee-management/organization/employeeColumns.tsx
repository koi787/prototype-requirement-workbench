/**
 * 0014 Cycle A - 员工列表 10 列定义与操作菜单（业务列，保留在 employee-management）。
 *
 * 列定义顺序严格固定（0014 §8）：ID / 姓名 / 启用状态 / 员工编号 / 手机号 /
 * 业绩门店 / 岗位 / 更新时间 / 操作人 / 操作。操作菜单只允许 编辑 / 注销登录 /
 * 消息测试 三项（0014 §9，编辑、消息测试蓝色，注销登录红色）。
 *
 * 列定义与真实渲染 DOM 表头顺序必须同时测试（不能只断言数组）。
 */
import type { ReactNode } from 'react';
import { Button, Dropdown, Switch, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import type { EmployeeRecord } from './organizationTypes';
import { maskMobile, positionLabel, storeLabel } from './organizationMockData';

/** 10 列共享定义 key（测试：列定义顺序与真实 DOM 表头顺序共用）。 */
export const EMPLOYEE_COLUMN_KEYS: readonly string[] = [
  'id',
  'name',
  'enabled',
  'employeeNo',
  'mobile',
  'performanceStoreId',
  'positionIds',
  'updatedAt',
  'operatorName',
  'action',
];

/** 操作菜单固定三项（0014 §9：编辑 / 注销登录 / 消息测试）。 */
export const ACTION_MENU_ITEMS: readonly { key: string; label: string; color: string }[] = [
  { key: 'edit', label: '编辑', color: '#1677ff' },
  { key: 'logout', label: '注销登录', color: '#f5222d' },
  { key: 'message', label: '消息测试', color: '#1677ff' },
];

/** 空值统一展示 --。 */
function orDash(value: string | undefined | null): string {
  return value ?? '--';
}

/** 岗位多值展示：按截图密度使用小号标签。 */
function renderPositions(positionIds: string[]): ReactNode {
  if (!positionIds || positionIds.length === 0) {
    return '--';
  }
  return (
    <>
      {positionIds.map((positionId) => (
        <Tag key={positionId} className="organization-position-tag">
          {orDash(positionLabel(positionId))}
        </Tag>
      ))}
    </>
  );
}

/** 操作列：下拉菜单（仅三项），行为回调由 OrganizationPage 注入（传整条记录）。 */
function renderAction(
  record: EmployeeRecord,
  onAction: (record: EmployeeRecord, actionKey: string) => void,
): ReactNode {
  const menuItems: MenuProps['items'] = ACTION_MENU_ITEMS.map((item) => ({
    key: item.key,
    label: item.label,
    style: { color: item.color },
  }));
  return (
    <Dropdown
      menu={{ items: menuItems, onClick: ({ key }) => onAction(record, key) }}
      trigger={['click']}
      destroyOnHidden
    >
      <Button
        type="default"
        size="small"
        className="organization-operation-btn"
        data-req-id={`employee-operation-menu-${record.id}`}
      >
        操作
      </Button>
    </Dropdown>
  );
}

/** 构建员工列表 10 列（启用 Switch 与操作回调由页面注入，读写同一 Runtime 记录）。 */
export function buildEmployeeColumns(params: {
  onToggleEnabled: (id: string, checked: boolean) => void;
  onAction: (record: EmployeeRecord, actionKey: string) => void;
}): ColumnsType<EmployeeRecord> {
  const { onToggleEnabled, onAction } = params;
  return [
    {
      key: 'id',
      title: 'ID',
      dataIndex: 'id',
      width: 90,
      render: (value: string) => orDash(value),
    },
    {
      key: 'name',
      title: '姓名',
      dataIndex: 'name',
      width: 110,
      render: (value: string) => orDash(value),
    },
    {
      key: 'enabled',
      title: '启用状态',
      width: 90,
      render: (_, record) => (
        <Switch
          size="small"
          className="organization-switch"
          checked={record.enabled}
          onChange={(checked) => onToggleEnabled(record.id, checked)}
          data-req-id={`employee-enabled-${record.id}`}
        />
      ),
    },
    {
      key: 'employeeNo',
      title: '员工编号',
      dataIndex: 'employeeNo',
      width: 100,
      render: (value: string) => orDash(value),
    },
    {
      key: 'mobile',
      title: '手机号',
      width: 130,
      render: (_, record) => maskMobile(record.mobile),
    },
    {
      key: 'performanceStoreId',
      title: '业绩门店',
      dataIndex: 'performanceStoreId',
      width: 130,
      render: (value: string) => orDash(storeLabel(value)),
    },
    {
      key: 'positionIds',
      title: '岗位',
      width: 170,
      render: (_, record) => renderPositions(record.positionIds),
    },
    {
      key: 'updatedAt',
      title: '更新时间',
      dataIndex: 'updatedAt',
      width: 180,
      render: (value: string) => orDash(value),
    },
    {
      key: 'operatorName',
      title: '操作人',
      dataIndex: 'operatorName',
      width: 110,
      render: (value: string) => orDash(value),
    },
    {
      key: 'action',
      title: '操作',
      width: 120,
      render: (_, record) => renderAction(record, onAction),
    },
  ];
}
