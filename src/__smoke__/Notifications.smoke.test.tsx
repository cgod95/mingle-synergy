import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Toaster } from 'react-hot-toast';
import { toast } from 'react-hot-toast';

describe('Notification/Toast - UI Smoke Tests', () => {
  it('can render toast notification', () => {
    const { container } = render(<Toaster />);
    
    // Trigger a toast
    toast.success('Test notification');
    
    // Toaster container should exist
    expect(container).toBeInTheDocument();
  });

  it('toast function exists and can be called', () => {
    expect(typeof toast.success).toBe('function');
    expect(typeof toast.error).toBe('function');
    expect(typeof toast).toBe('function');
  });
});

