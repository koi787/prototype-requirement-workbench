import { useRequirementView } from './RequirementViewContext';
import type { RequirementViewEntry } from '../../requirements/schemas/requirement-view';

// ============================================================================
// 类型
// ============================================================================

export interface RequirementDrawerProps {
  /** 根据 key 获取需求数据（由页面提供已校验的数据访问函数） */
  getRequirementData: (key: string) => RequirementViewEntry | undefined;
}

// ============================================================================
// 内部组件：空字段占位
// ============================================================================

/**
 * 判断值是否应隐藏（缺失、null、空字符串或纯空格）。
 */
function isBlankValue(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  return false;
}

/**
 * 回退 status 为"待确认"。
 */
function resolveStatus(status: unknown): string {
  if (status === undefined || status === null || (typeof status === 'string' && status.trim() === '')) {
    return '待确认';
  }
  return status as string;
}

// ============================================================================
// 内部组件：可选字段区
// ============================================================================

function FieldSection({ title, value }: { title: string; value: unknown }) {
  if (isBlankValue(value)) return null;
  return (
    <div className="requirement-drawer-field">
      <h4 className="requirement-drawer-field-title">{title}</h4>
      <p className="requirement-drawer-field-content requirement-drawer-field-content--multiline">
        {value as string}
      </p>
    </div>
  );
}

// ============================================================================
// 抽屉内容
// ============================================================================

function DrawerContent({ entry }: { entry: RequirementViewEntry }) {
  return (
    <div className="requirement-drawer-content">
      <div className="requirement-drawer-field">
        <h4 className="requirement-drawer-field-title">需求编号</h4>
        <p className="requirement-drawer-field-content requirement-drawer-field-content--no">
          {entry.requirementNo}
        </p>
      </div>

      <div className="requirement-drawer-field">
        <h4 className="requirement-drawer-field-title">需求名称</h4>
        <p className="requirement-drawer-field-content requirement-drawer-field-content--name">
          {entry.requirementName}
        </p>
      </div>

      <div className="requirement-drawer-field">
        <h4 className="requirement-drawer-field-title">当前确认状态</h4>
        <p className="requirement-drawer-field-content">
          <span className={`requirement-drawer-status requirement-drawer-status--${resolveStatus(entry.status)}`}>
            {resolveStatus(entry.status)}
          </span>
        </p>
      </div>

      <FieldSection title="基础定义" value={entry.definition} />
      <FieldSection title="数据来源" value={entry.dataSource} />
      <FieldSection title="取值或计算规则" value={entry.rule} />
      <FieldSection title="备注" value={entry.remark} />
    </div>
  );
}

// ============================================================================
// 主组件
// ============================================================================

/**
 * 右侧只读需求抽屉。
 *
 * 展示顺序固定：需求编号 → 需求名称 → 确认状态 → 基础定义 → 数据来源 → 规则 → 备注。
 * 空字段完全隐藏，空 status 回退为"待确认"。
 * 无全屏遮罩，允许直接点击其他需求点切换内容。
 */
export function RequirementDrawer({ getRequirementData }: RequirementDrawerProps) {
  const {
    drawerOpen,
    selectedRequirementKey,
    closeDrawer,
    returnToPrototype,
  } = useRequirementView();

  if (!drawerOpen) return null;

  const entry = selectedRequirementKey
    ? getRequirementData(selectedRequirementKey)
    : undefined;

  if (!entry) return null;

  return (
    <div className="requirement-drawer-overlay" onClick={closeDrawer}>
      <aside
        className="requirement-drawer"
        data-req-id="requirement-drawer"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="requirement-drawer-header">
          <h3 className="requirement-drawer-title">需求说明</h3>
        </div>

        <div className="requirement-drawer-body">
          <DrawerContent entry={entry} />
        </div>

        <div className="requirement-drawer-footer">
          <button
            className="requirement-drawer-btn requirement-drawer-btn--close"
            onClick={closeDrawer}
            aria-label="关闭需求抽屉"
          >
            关闭
          </button>
          <button
            className="requirement-drawer-btn requirement-drawer-btn--return"
            onClick={returnToPrototype}
            aria-label="返回原型体验模式"
          >
            返回原型体验
          </button>
        </div>
      </aside>
    </div>
  );
}
