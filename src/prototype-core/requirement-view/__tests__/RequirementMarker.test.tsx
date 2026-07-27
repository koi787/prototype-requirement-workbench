import { describe, it, expect, afterEach } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { RequirementMarker } from '../RequirementMarker';
import { RequirementViewProvider } from '../RequirementViewContext';

afterEach(() => cleanup());

/** 在指定模式下渲染 RequirementMarker 的轻量辅助函数 */
function renderMarker(
  mode: 'prototype' | 'requirement',
  props: Partial<Parameters<typeof RequirementMarker>[0]> = {},
) {
  return render(
    <RequirementViewProvider
      initialMode={mode}
      initialControlExpanded={mode === 'requirement'}
    >
      <RequirementMarker
        requirementKey="test-key"
        displayNumber={1}
        targetId="test-target"
        positionLabel="测试"
        {...props}
      />
    </RequirementViewProvider>,
  );
}

// ============================================================================
// 0007 样式职责隔离测试
// ============================================================================

describe('RequirementMarker 样式隔离', () => {
  describe('原型体验模式（prototype）', () => {
    it('有 children 时使用中性原型包裹层，不将 marker 视觉类泄漏到业务文字容器', () => {
      renderMarker('prototype', {
        className: 'requirement-marker--header',
        children: <span data-testid="business-text">首次分配时间</span>,
      });

      // 业务文字存在
      const businessText = document.querySelector('[data-testid="business-text"]');
      expect(businessText).toBeTruthy();
      expect(businessText!.textContent).toBe('首次分配时间');

      // 业务文字的父级是原型包裹层
      const wrapper = businessText!.parentElement;
      expect(wrapper).toBeTruthy();

      // 原型包裹层使用中性类名，不包含 marker 视觉类
      expect(wrapper!.classList.contains('requirement-marker-prototype-target')).toBe(true);
      expect(wrapper!.classList.contains('requirement-marker--header')).toBe(false);
      expect(wrapper!.classList.contains('requirement-marker--inline')).toBe(false);
      expect(wrapper!.classList.contains('requirement-marker')).toBe(false);
    });

    it('原型包裹层不在 marker 的 font-size/width/height 作用域内', () => {
      renderMarker('prototype', {
        className: 'requirement-marker--header',
        children: <span data-testid="business-text">预约到店时间</span>,
      });

      const wrapper = document.querySelector('.requirement-marker-prototype-target');
      expect(wrapper).toBeTruthy();

      // requirement-marker-prototype-target 自身不设置 font-size，业务文字继承父级
      expect(wrapper!.classList.contains('requirement-marker--header')).toBe(false);
    });

    it('无 children 时不渲染任何内容', () => {
      const { container } = renderMarker('prototype');
      expect(container.querySelector('[data-requirement-number]')).toBeNull();
      expect(container.querySelector('.requirement-marker-prototype-target')).toBeNull();
    });
  });

  describe('需求查看模式（requirement）', () => {
    it('编号点 marker 获得 className，但 children 不在 marker 样式作用域内', () => {
      renderMarker('requirement', {
        className: 'requirement-marker--header',
        children: <span data-testid="business-text">首次分配时间</span>,
      });

      // marker 存在且包含 header 类
      const marker = document.querySelector('[data-requirement-number="1"]');
      expect(marker).toBeTruthy();
      expect(marker!.classList.contains('requirement-marker--header')).toBe(true);

      // marker 自身可保留独立小字号（10px 来自 requirement-marker--header）
      // 但这只影响编号圆点自身，不泄漏到 children
      expect(marker!.textContent).toBe('1');

      // children 包裹在 requirement-marker-target 中，作为 marker 的兄弟节点
      const target = document.querySelector('.requirement-marker-target');
      expect(target).toBeTruthy();

      // 业务文字的父级是 requirement-marker-target，不继承 marker 的样式
      const businessText = document.querySelector('[data-testid="business-text"]');
      expect(businessText).toBeTruthy();
      expect(businessText!.parentElement!.classList.contains('requirement-marker-target')).toBe(true);

      // 业务文字不在 marker 内部
      expect(marker!.contains(businessText)).toBe(false);
    });

    it('编号点样式 class 仅作用于 marker 元素自身', () => {
      renderMarker('requirement', {
        className: 'requirement-marker--inline',
        children: <span data-testid="business-text">行内状态</span>,
      });

      const marker = document.querySelector('[data-requirement-number="1"]');
      expect(marker).toBeTruthy();
      expect(marker!.classList.contains('requirement-marker--inline')).toBe(true);

      // marker 有独立字号（10px），但 children 不受影响
      const target = document.querySelector('.requirement-marker-target');
      expect(target).toBeTruthy();
      // target 不包含 marker 视觉类
      expect(target!.classList.contains('requirement-marker--inline')).toBe(false);
      expect(target!.classList.contains('requirement-marker--header')).toBe(false);
    });

    it('无 children 时仅渲染 marker 圆点', () => {
      const { container } = renderMarker('requirement');

      const marker = document.querySelector('[data-requirement-number="1"]');
      expect(marker).toBeTruthy();
      expect(marker!.textContent).toBe('1');

      // 没有 target wrapper
      expect(container.querySelector('.requirement-marker-target')).toBeNull();
    });
  });

  describe('两种模式样式来源一致', () => {
    it('两种模式下 children 都不在 marker 视觉类的作用域内', () => {
      // 原型模式
      const proto = renderMarker('prototype', {
        className: 'requirement-marker--header',
        children: <span>相同文字</span>,
      });
      const protoChild = proto.container.querySelector('.requirement-marker-prototype-target > span');
      expect(protoChild).toBeTruthy();
      // 原型包裹层不含 header 类
      expect(
        proto.container.querySelector('.requirement-marker-prototype-target')!.classList.contains('requirement-marker--header'),
      ).toBe(false);

      cleanup();

      // 需求模式
      const req = renderMarker('requirement', {
        className: 'requirement-marker--header',
        children: <span>相同文字</span>,
      });
      const reqChild = req.container.querySelector('.requirement-marker-target > span:last-child');
      expect(reqChild).toBeTruthy();
      // children 的父级是 requirement-marker-target，不含 header 类
      expect(
        req.container.querySelector('.requirement-marker-target')!.classList.contains('requirement-marker--header'),
      ).toBe(false);
    });
  });

  // ==========================================================================
  // 0007 限定修复：两种模式真实计算样式比较
  // ==========================================================================

  describe('两种模式业务文字计算样式一致', () => {
    /**
     * 在明确父级业务文字样式的容器中渲染 RequirementMarker。
     * 父级样式由测试显式控制，不依赖 Ant Design 或全局样式。
     */
    function renderInStyledParent(mode: 'prototype' | 'requirement') {
      return render(
        <RequirementViewProvider
          initialMode={mode}
          initialControlExpanded={mode === 'requirement'}
        >
          <div
            data-testid="parent-container"
            style={{
              fontSize: '14px',
              fontWeight: 500,
              lineHeight: '22px',
            }}
          >
            <RequirementMarker
              requirementKey="test-key"
              displayNumber={1}
              targetId="test-target"
              positionLabel="测试"
              className="requirement-marker--header"
            >
              <span data-testid="business-text">测试文字</span>
            </RequirementMarker>
          </div>
        </RequirementViewProvider>,
      );
    }

    it('两种模式下业务文字的 fontSize 相等且等于父级 14px', () => {
      // 原型模式
      const proto = renderInStyledParent('prototype');
      const protoText = proto.getByTestId('business-text');
      const protoStyles = getComputedStyle(protoText);

      cleanup();

      // 需求模式
      const req = renderInStyledParent('requirement');
      const reqText = req.getByTestId('business-text');
      const reqStyles = getComputedStyle(reqText);

      // 两种模式 fontSize 相等
      expect(protoStyles.fontSize).toBe(reqStyles.fontSize);
      // 两种模式均等于父级设定值 14px
      expect(protoStyles.fontSize).toBe('14px');
      expect(reqStyles.fontSize).toBe('14px');
    });

    it('两种模式下业务文字的 fontWeight 相等且等于父级 500', () => {
      const proto = renderInStyledParent('prototype');
      const protoText = proto.getByTestId('business-text');
      const protoStyles = getComputedStyle(protoText);

      cleanup();

      const req = renderInStyledParent('requirement');
      const reqText = req.getByTestId('business-text');
      const reqStyles = getComputedStyle(reqText);

      // 两种模式 fontWeight 相等
      expect(protoStyles.fontWeight).toBe(reqStyles.fontWeight);
      // 两种模式均等于父级设定值 500
      expect(protoStyles.fontWeight).toBe('500');
      expect(reqStyles.fontWeight).toBe('500');
    });

    it('两种模式下业务文字的 lineHeight 相等且等于父级 22px', () => {
      const proto = renderInStyledParent('prototype');
      const protoText = proto.getByTestId('business-text');
      const protoStyles = getComputedStyle(protoText);

      cleanup();

      const req = renderInStyledParent('requirement');
      const reqText = req.getByTestId('business-text');
      const reqStyles = getComputedStyle(reqText);

      // 两种模式 lineHeight 相等
      expect(protoStyles.lineHeight).toBe(reqStyles.lineHeight);
      // 两种模式均等于父级设定值 22px
      expect(protoStyles.lineHeight).toBe('22px');
      expect(reqStyles.lineHeight).toBe('22px');
    });

    it('编号圆点保留独立小字号（10px），但此样式不作用于业务文字', () => {
      const req = renderInStyledParent('requirement');

      // 编号圆点自身
      const marker = req.container.querySelector('[data-requirement-number="1"]') as HTMLElement;
      expect(marker).toBeTruthy();
      const markerStyles = getComputedStyle(marker);
      // 编号圆点使用 requirement-marker--header 的 10px 字号
      expect(markerStyles.fontSize).toBe('10px');

      // 业务文字
      const businessText = req.getByTestId('business-text');
      expect(marker.contains(businessText)).toBe(false);
      const businessStyles = getComputedStyle(businessText);
      // 业务文字保持父级 14px，不受编号圆点样式影响
      expect(businessStyles.fontSize).toBe('14px');
    });

    it('若 prototype-target 被添加 font-size:10px，业务文字计算样式将变为 10px 从而使测试失败', () => {
      // 本测试验证：业务文字的计算样式来自父级继承而非 prototype-target 包裹层。
      // 当前 prototype-target 仅为 display:inline，无字号声明。
      // 如果将来有人为 .requirement-marker-prototype-target 添加 font-size:10px，
      // 下面 getComputedStyle 结果会变为 10px，与期望的 14px 不符，测试必然失败。
      const proto = renderInStyledParent('prototype');
      const protoText = proto.getByTestId('business-text');

      // 确认包裹层是 prototype-target
      const wrapper = protoText.parentElement;
      expect(wrapper).toBeTruthy();
      expect(wrapper!.classList.contains('requirement-marker-prototype-target')).toBe(true);

      // 计算样式必须来自父级 14px，而非包裹层的任何字号设定
      const styles = getComputedStyle(protoText);
      expect(styles.fontSize).toBe('14px');
      expect(styles.fontWeight).toBe('500');
      expect(styles.lineHeight).toBe('22px');
    });
  });
});

// ============================================================================
// 编号点基础功能（保证 0004 已有能力无回归）
// ============================================================================

describe('RequirementMarker 基础功能', () => {
  it('需求模式渲染编号点并设置稳定 data 属性', () => {
    renderMarker('requirement', {
      requirementKey: 'scrm-store-customer-test',
      displayNumber: 5,
      targetId: 'test-target-id',
      positionLabel: '表头',
    });

    const marker = document.querySelector('[data-requirement-number="5"]');
    expect(marker).toBeTruthy();
    expect(marker!.getAttribute('data-requirement-key')).toBe('scrm-store-customer-test');
    expect(marker!.getAttribute('data-target-id')).toBe('test-target-id');
    expect(marker!.getAttribute('data-req-id')).toBe('test-target-id');
    expect(marker!.getAttribute('role')).toBe('button');
    expect(marker!.getAttribute('aria-label')).toContain('需求编号 5');
    expect(marker!.getAttribute('aria-label')).toContain('表头');
    expect(marker!.textContent).toBe('5');
  });

  it('exposeDataReqId=false 时不设置 data-req-id', () => {
    renderMarker('requirement', {
      requirementKey: 'test',
      displayNumber: 3,
      targetId: 'hidden-target',
      exposeDataReqId: false,
    });

    const marker = document.querySelector('[data-requirement-number="3"]');
    expect(marker).toBeTruthy();
    expect(marker!.hasAttribute('data-req-id')).toBe(false);
  });
});
