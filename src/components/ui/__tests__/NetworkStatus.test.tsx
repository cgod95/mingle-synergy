
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import NetworkStatus from '../NetworkStatus';

describe('NetworkStatus', () => {
  const originalOnLine = window.navigator.onLine;
  let onLineSpy: any;

  beforeEach(() => {
    // Mock navigator.onLine
    onLineSpy = vi.spyOn(navigator, 'onLine', 'get');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should not render when online', () => {
    onLineSpy.mockReturnValue(true);
    const { container } = render(<NetworkStatus />);
    expect(container.firstChild).toBeNull();
  });

  it('should render when offline', () => {
    onLineSpy.mockReturnValue(false);
    render(<NetworkStatus />);
    expect(screen.getByText(/You're offline/i)).toBeInTheDocument();
  });
});
