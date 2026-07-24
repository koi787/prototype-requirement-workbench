import React from 'react';
void React;

export function RequirementPanelShell() {
  return (
    <section
      aria-label="需求说明面板"
      style={{
        minHeight: '100%',
        padding: 20,
        color: '#2f3542',
        background: '#fff',
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          padding: '3px 8px',
          borderRadius: 999,
          color: '#0958d9',
          background: '#e6f4ff',
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        工作台能力演示
      </div>
      <h2 style={{ margin: '14px 0 8px', fontSize: 18 }}>需求说明</h2>
      <p style={{ margin: 0, color: '#667085', lineHeight: 1.7 }}>
        当前 Story 暂无关联的正式需求。后续最小示例会通过 Storybook Channel
        将页面锚点与此面板双向联动。
      </p>
    </section>
  );
}

