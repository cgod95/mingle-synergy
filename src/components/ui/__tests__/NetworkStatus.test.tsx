
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import NetworkStatus from '../NetworkStatus';
import { NETWORK_STATUS_EVENT } from '../../../utils/networkMonitor';

describe('NetworkStatus', () => {
  // Mock the navigator.onLine property
  let onLineSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock navigator.onLine
    onLineSpy = vi.spyOn(navigator, 'onLine', 'get');
    onLineSpy.mockReturnValue(true); // Default to online
    
    // Mock addEventListener and removeEventListener
    vi.spyOn(document, 'addEventListener');
    vi.spyOn(document, 'removeEventListener');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should not render when online by default', () => {
    onLineSpy.mockReturnValue(true);
    const { container } = render(<NetworkStatus />);
    expect(container.firstChild).toBeNull();
  });

  it('should render when offline', () => {
    onLineSpy.mockReturnValue(false);
    render(<NetworkStatus />);
    expect(screen.getByText(/You're offline/i)).toBeInTheDocument();
  });

  it('should listen to network status events', () => {
    render(<NetworkStatus />);
    expect(document.addEventListener).toHaveBeenCalledWith(
      NETWORK_STATUS_EVENT,
      expect.any(Function)
    );
  });
  
  it('should update when receiving network status events', () => {
    onLineSpy.mockReturnValue(true); // Start online
    const { container } = render(<NetworkStatus />);
    
    // Simulate going offline
    fireEvent(document, new CustomEvent(NETWORK_STATUS_EVENT, { 
      detail: { status: 'offline' } 
    }));
    
    expect(screen.getByText(/You're offline/i)).toBeInTheDocument();
    
    // Simulate going back online
    fireEvent(document, new CustomEvent(NETWORK_STATUS_EVENT, { 
      detail: { status: 'online' } 
    }));
    
    expect(screen.getByText(/You're back online/i)).toBeInTheDocument();
  });
});
