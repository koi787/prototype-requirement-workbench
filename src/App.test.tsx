import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('Vite 最小说明页', () => {
  it('明确 Storybook 是唯一主要入口', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: '需求原型工作台' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Storybook 是当前唯一主要入口/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '请从 Storybook 进入工作台' }),
    ).toBeDisabled();
  });
});
