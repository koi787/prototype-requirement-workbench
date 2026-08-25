import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AobenSportMobileRoot } from './AobenSportMobileRoot';

describe('AobenSportMobileRoot', () => {
  it('connects the user-center body assessment entry to the unified report and back', () => {
    render(<AobenSportMobileRoot />);
    fireEvent.click(screen.getByRole('button', { name: '体测' }));
    expect(screen.getByTestId('aoben-report-root')).toHaveAttribute('data-report-source', 'INBODY');
    expect(screen.queryByTestId('bottom-nav')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '返回用户中心' }));
    expect(screen.getByTestId('aoben-mobile-root')).toBeInTheDocument();
  });
});
