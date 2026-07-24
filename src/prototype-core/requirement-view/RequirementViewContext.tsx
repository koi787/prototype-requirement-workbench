/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

// ============================================================================
// 类型
// ============================================================================

/** 需求查看模式 */
export type RequirementViewMode = 'prototype' | 'requirement';

/** Context 值类型 */
export interface RequirementViewContextValue {
  /** 当前模式 */
  mode: RequirementViewMode;
  /** 直接设置模式 */
  setMode: (mode: RequirementViewMode) => void;
  /** 当前选中的 requirement key（null 表示无选中） */
  selectedRequirementKey: string | null;
  /** 当前选中的 targetId（null 表示无选中） */
  selectedTargetId: string | null;
  /** 选中需求点（同时设置 key 和 targetId） */
  selectRequirement: (key: string, targetId: string) => void;
  /** 清空选中 */
  clearSelection: () => void;
  /** 抽屉是否打开 */
  drawerOpen: boolean;
  /** 打开抽屉 */
  openDrawer: () => void;
  /** 关闭抽屉（清空选中，保持需求查看模式） */
  closeDrawer: () => void;
  /** 返回原型体验（关闭抽屉，清空选中，切换模式） */
  returnToPrototype: () => void;
  /** 控制条是否已展开 */
  controlExpanded: boolean;
  /** 展开控制条 */
  expandControl: () => void;
}

// ============================================================================
// Context
// ============================================================================

const RequirementViewContext = createContext<RequirementViewContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

export interface RequirementViewProviderProps {
  /** 初始模式（默认 prototype） */
  initialMode?: RequirementViewMode;
  /** 初始是否展开控制条 */
  initialControlExpanded?: boolean;
  children: ReactNode;
}

export function RequirementViewProvider({
  initialMode = 'prototype',
  initialControlExpanded = false,
  children,
}: RequirementViewProviderProps) {
  const [mode, setMode] = useState<RequirementViewMode>(initialMode);
  const [selectedRequirementKey, setSelectedRequirementKey] = useState<string | null>(null);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [controlExpanded, setControlExpanded] = useState(initialControlExpanded);

  const selectRequirement = useCallback((key: string, targetId: string) => {
    setSelectedRequirementKey(key);
    setSelectedTargetId(targetId);
    setDrawerOpen(true);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedRequirementKey(null);
    setSelectedTargetId(null);
  }, []);

  const openDrawer = useCallback(() => {
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setSelectedRequirementKey(null);
    setSelectedTargetId(null);
  }, []);

  const returnToPrototype = useCallback(() => {
    setDrawerOpen(false);
    setSelectedRequirementKey(null);
    setSelectedTargetId(null);
    setMode('prototype');
    setControlExpanded(false);
  }, []);

  const expandControl = useCallback(() => {
    setControlExpanded(true);
  }, []);

  const value: RequirementViewContextValue = {
    mode,
    setMode,
    selectedRequirementKey,
    selectedTargetId,
    selectRequirement,
    clearSelection,
    drawerOpen,
    openDrawer,
    closeDrawer,
    returnToPrototype,
    controlExpanded,
    expandControl,
  };

  return (
    <RequirementViewContext.Provider value={value}>
      {children}
    </RequirementViewContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

/**
 * 使用需求查看上下文。
 * 必须在 RequirementViewProvider 内调用。
 */
export function useRequirementView(): RequirementViewContextValue {
  const ctx = useContext(RequirementViewContext);
  if (!ctx) {
    throw new Error('useRequirementView must be used within RequirementViewProvider');
  }
  return ctx;
}
