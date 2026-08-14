/**
 * 0012 Cycle B - 意向度三键步进器（C 级复刻真实系统 [－] 1 [＋]）。
 *
 * 真实系统意向度不是铺满的普通数字输入框，而是三段式步进器：左侧减号按钮、
 * 中间当前值、右侧加号按钮，浅灰边框、中间白底、左右按钮浅灰底，范围 1–5。
 *
 * 中间值保留 role="spinbutton" 的可编辑输入（可手工输入/清空），保证既有
 * 功能测试、无障碍与"最小 1 最大 5"边界一致；不依赖 @ant-design/icons，
 * 符号用文本字符渲染，与仓库"不引入图标库"的约定一致。
 */
import type { ChangeEvent } from 'react';

export interface IntentLevelStepperProps {
  /** 当前意向度；null 表示未填写。 */
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
}

export function IntentLevelStepper({
  value,
  onChange,
  min = 1,
  max = 5,
}: IntentLevelStepperProps) {
  const atMin = value === null || value <= min;
  const atMax = value !== null && value >= max;

  const clamp = (num: number) => Math.min(max, Math.max(min, Math.trunc(num)));

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    if (raw === '') {
      onChange(null);
      return;
    }
    const num = Number(raw);
    if (Number.isNaN(num)) {
      onChange(null);
      return;
    }
    onChange(clamp(num));
  };

  const decrease = () => {
    if (value !== null && value > min) onChange(value - 1);
  };

  const increase = () => {
    if (value !== null && value < max) onChange(value + 1);
  };

  return (
    <div className="record-intent-stepper">
      <button
        type="button"
        className="record-intent-stepper-btn"
        aria-label="减少意向度"
        disabled={atMin}
        onClick={decrease}
        data-req-id="intent-level-minus"
      >
        －
      </button>
      <input
        type="text"
        inputMode="numeric"
        className="record-intent-stepper-input"
        role="spinbutton"
        aria-label="意向度"
        value={value ?? ''}
        onChange={handleInput}
      />
      <button
        type="button"
        className="record-intent-stepper-btn"
        aria-label="增加意向度"
        disabled={atMax}
        onClick={increase}
        data-req-id="intent-level-plus"
      >
        ＋
      </button>
    </div>
  );
}

export default IntentLevelStepper;
