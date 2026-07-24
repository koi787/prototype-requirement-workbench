import { useRequirementView } from './RequirementViewContext';
import './requirement-view.css';

// ============================================================================
// 类型
// ============================================================================

export interface RequirementMarkerProps {
  /** requirement key（稳定关联 JSON） */
  requirementKey: string;
  /** 显示编号（1-12） */
  displayNumber: number;
  /** target data-req-id（用于高亮定位） */
  targetId: string;
  /** aria-label 后缀（如 "表头"、"行内"、"筛选"） */
  positionLabel?: string;
  /** 额外 CSS 类 */
  className?: string;
  /** 子元素（点击目标区域） */
  children?: React.ReactNode;
  /** 点击时是否只打开需求说明（不执行原有业务动作） */
  preventDefaultAction?: boolean;
  /** 原有点击处理（需求模式下拦截，原型模式下透传） */
  onOriginalClick?: (e: React.MouseEvent) => void;
  /**
   * 是否由当前可见编号点注册 data-req-id。
   * Ant Design 可能复制表头 ReactNode，列级目标应传 false，并由正式注册区保证逻辑唯一。
   */
  exposeDataReqId?: boolean;
}

// ============================================================================
// 组件
// ============================================================================

/**
 * 需求编号点：蓝色圆形背景 + 白色阿拉伯数字。
 *
 * 需求查看模式下可见；原型体验模式下隐藏。
 * 点击打开对应需求抽屉，选中后高亮。
 */
export function RequirementMarker({
  requirementKey,
  displayNumber,
  targetId,
  positionLabel,
  className = '',
  children,
  preventDefaultAction = true,
  onOriginalClick,
  exposeDataReqId = true,
}: RequirementMarkerProps) {
  const {
    mode,
    selectedRequirementKey,
    selectedTargetId,
    selectRequirement,
  } = useRequirementView();

  const isSelected =
    selectedRequirementKey === requirementKey && selectedTargetId === targetId;

  const ariaLabel = `需求编号 ${displayNumber}（${positionLabel ?? '需求点'}），点击查看需求`;

  const handleMarkerClick = (e: React.MouseEvent) => {
    if (mode !== 'requirement') return;
    e.stopPropagation();
    e.preventDefault();
    selectRequirement(requirementKey, targetId);
  };

  const handleTargetClick = (e: React.MouseEvent) => {
    if (mode === 'requirement' && preventDefaultAction) {
      e.stopPropagation();
      e.preventDefault();
      selectRequirement(requirementKey, targetId);
      return;
    }
    onOriginalClick?.(e);
  };

  if (mode !== 'requirement') {
    // 原型体验模式：不显示编号点，透传原始点击
    if (children) {
      return (
        <span className={className} onClick={onOriginalClick}>
          {children}
        </span>
      );
    }
    return null;
  }

  const marker = (
    <span
      className={`requirement-marker ${isSelected ? 'requirement-marker--selected' : ''} ${className}`}
      data-requirement-key={requirementKey}
      data-requirement-number={displayNumber}
      data-target-id={targetId}
      data-req-id={exposeDataReqId ? targetId : undefined}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      title="点击查看需求"
      onClick={handleMarkerClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          selectRequirement(requirementKey, targetId);
        }
      }}
    >
      {displayNumber}
    </span>
  );

  if (children) {
    return (
      <span
        className={`requirement-marker-target ${isSelected ? 'requirement-marker-target--selected' : ''}`}
        onClick={handleTargetClick}
      >
        {marker}
        {children}
      </span>
    );
  }

  return marker;
}
