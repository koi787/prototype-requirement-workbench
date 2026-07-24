import { useRequirementView } from './RequirementViewContext';
import { RequirementMarker } from './RequirementMarker';

/**
 * 右侧悬浮模式入口与控制条。
 *
 * 默认显示"查看需求"按钮。
 * 首次点击进入需求查看模式并展开控制条。
 * 控制条显示"原型体验｜需求查看"双选项。
 * 关联编号 12（requirement-view-mode-control）。
 */
export function RequirementModeControl() {
  const {
    mode,
    setMode,
    controlExpanded,
    expandControl,
    returnToPrototype,
  } = useRequirementView();

  const handleViewRequirement = () => {
    setMode('requirement');
    expandControl();
  };

  const handlePrototype = () => {
    returnToPrototype();
  };

  const handleRequirement = () => {
    setMode('requirement');
  };

  if (!controlExpanded) {
    return (
      <div
        className="requirement-mode-control requirement-mode-control--collapsed"
        data-requirement-control="true"
      >
        <button
          className="requirement-mode-btn requirement-mode-btn--primary"
          onClick={handleViewRequirement}
          aria-label="查看需求"
        >
          查看需求
        </button>
      </div>
    );
  }

  return (
    <div
      className="requirement-mode-control requirement-mode-control--expanded"
      data-requirement-control="true"
    >
      <RequirementMarker
        requirementKey="scrm-store-customer-requirement-view-mode"
        displayNumber={12}
        targetId="requirement-view-mode-control"
        positionLabel="模式控制条"
        className="requirement-marker--control"
      />
      <span className="requirement-mode-control-label">模式</span>
      <div className="requirement-mode-toggle">
        <button
          className={`requirement-mode-btn ${mode === 'prototype' ? 'requirement-mode-btn--active' : ''}`}
          onClick={handlePrototype}
          aria-label="原型体验模式"
          aria-pressed={mode === 'prototype'}
        >
          原型体验
        </button>
        <button
          className={`requirement-mode-btn ${mode === 'requirement' ? 'requirement-mode-btn--active-requirement' : ''}`}
          onClick={handleRequirement}
          aria-label="需求查看模式"
          aria-pressed={mode === 'requirement'}
        >
          需求查看
        </button>
      </div>
    </div>
  );
}
