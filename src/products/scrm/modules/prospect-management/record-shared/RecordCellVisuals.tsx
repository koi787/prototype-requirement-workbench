/**
 * 0012 Cycle A - 到店/拜访记录共享单元格视觉组件。
 *
 * 由独立页（到店记录/拜访记录）与跟进详情两个到店/拜访 Tab 共同消费，
 * 单一来源，不得在页面内再复制一份。只导出组件，保持 react-refresh
 * 组件导出规则干净。
 *
 * - IntentLevelTag 仅用于跟进旅程卡（保持 意向度N 蓝色 Tag）；到店/拜访
 *   列表的"意向度"列按真实系统显示纯数字，不消费本组件。
 * - RecordOperationVisual（蓝色"详情"链接）保留给通话记录 Tab（0011 冻结）；
 *   到店/拜访操作列使用 RecordOperationButton（操作 按钮 + Dropdown）。
 */
import { useCallback } from 'react';
import { Button, Dropdown, Tag } from 'antd';
import type { MenuProps } from 'antd';
import { CaretDownIcon } from '../pages/StoreCustomerList/IconComponents';
import { useRecordEditActions } from './recordEditContext';

/** 用户姓名蓝色链接视觉（本阶段不实现跳转） */
export function RecordNameLink({ name }: { name: string }) {
  return <span className="store-customer-followup-name-link">{name}</span>;
}

/** 意向度标签：意向度N（仅跟进旅程卡使用） */
export function IntentLevelTag({ level }: { level: number }) {
  return (
    <Tag
      style={{
        color: '#1677ff',
        background: '#e6f4ff',
        border: '1px solid #91caff',
        borderRadius: 4,
        margin: 0,
      }}
    >
      意向度{level}
    </Tag>
  );
}

/**
 * 是否成交 状态标签：已成交 绿色 Tag、未成交 橙色 Tag，统一风格。
 *
 * 视觉 token 与门店客户既有状态标签（StatusTags）一致：相同圆角、无外边距、
 * 相同橙色/绿色色板。不修改 StatusTags.tsx（0011 门店客户冻结），本组件为
 * 到店记录模块补齐"已成交"分支，不改变字段值与业务判断。
 */
export function DealStatusTag({ value }: { value: string }) {
  if (value === '已成交') {
    return (
      <Tag
        style={{
          color: '#52c41a',
          background: '#f6ffed',
          border: '1px solid #b7eb8f',
          borderRadius: 4,
          margin: 0,
        }}
      >
        已成交
      </Tag>
    );
  }
  if (value === '未成交') {
    return (
      <Tag
        style={{
          color: '#fa8c16',
          background: '#fff7e6',
          border: '1px solid #ffd591',
          borderRadius: 4,
          margin: 0,
        }}
      >
        未成交
      </Tag>
    );
  }
  return <span>{value}</span>;
}

/** 记录列表"操作"列菜单项（Cycle A 为 Cycle B 预留入口，key 稳定唯一） */
export interface RecordOperationItem {
  key: string;
  label: string;
}

/**
 * 记录列表"操作"按钮 + Dropdown。
 *
 * 视觉复用门店客户操作按钮：白色背景、浅灰边框、小尺寸后台按钮；
 * 点击后展开 Dropdown 菜单，点击菜单项通过 onItemClick 回调（Cycle B），
 * 未提供回调时点击菜单项仅关闭菜单（Cycle A 占位，不打开抽屉、不 Mock
 * 写回、不弹任何提示）。
 */
export function RecordOperationButton({
  items,
  dataReqId,
  onItemClick,
}: {
  items: readonly RecordOperationItem[];
  dataReqId?: string;
  onItemClick?: (itemKey: string) => void;
}) {
  const menu: MenuProps = {
    items: items.map((item) => ({ key: item.key, label: item.label })),
    ...(onItemClick
      ? { onClick: ({ key }: { key: React.Key }) => onItemClick(String(key)) }
      : {}),
  };
  return (
    <Dropdown menu={menu} trigger={['click']}>
      <Button
        size="small"
        aria-haspopup="menu"
        className="store-customer-operation-btn"
        data-req-id={dataReqId}
      >
        操作 <CaretDownIcon />
      </Button>
    </Dropdown>
  );
}

/**
 * 记录列表"操作"列单元格：把菜单项接到编辑入口上下文。
 *
 * 在 RecordEditActions 上下文中，"编辑"菜单项打开对应记录编辑抽屉；
 * 到店"变更记录"菜单项（Cycle B3）以到店记录 key 打开只读变更记录 Drawer
 * （独立只读 Mock，不写入运行时状态）。无上下文（独立渲染）时点击为空操作。
 */
export function RecordOperationCell({
  items,
  dataReqId,
  editKind,
  recordKey,
}: {
  items: readonly RecordOperationItem[];
  dataReqId?: string;
  editKind: 'arrival' | 'visit';
  recordKey: string;
}) {
  const actions = useRecordEditActions();
  const handleItemClick = useCallback(
    (itemKey: string) => {
      if (!actions) return;
      if (itemKey === 'edit') {
        if (editKind === 'arrival') {
          actions.openArrivalEdit(recordKey);
        } else {
          actions.openVisitEdit(recordKey);
        }
        return;
      }
      if (itemKey === 'change-record') {
        if (editKind === 'arrival') {
          actions.openArrivalChangeRecord(recordKey);
        }
      }
      // 其余未知菜单项：仅关闭菜单，不打开任何弹层、不弹"开发中"提示。
    },
    [actions, editKind, recordKey],
  );
  return (
    <RecordOperationButton
      items={items}
      {...(dataReqId ? { dataReqId } : {})}
      onItemClick={handleItemClick}
    />
  );
}

/** 记录列表"操作"列视觉入口（通话记录 0011 冻结使用，本阶段不实现动作） */
export function RecordOperationVisual() {
  return <span className="store-customer-followup-op-link">详情</span>;
}
