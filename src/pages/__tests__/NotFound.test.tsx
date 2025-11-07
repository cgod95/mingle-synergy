
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import NotFound from '../NotFound';

// Mock the useLocation hook
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: () => ({
      pathname: '/non-existent-route'
    })
  };
});

describe('NotFound', () => {
  it('renders the 404 page', () => {
    render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    );
    
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText(/Page not found/i)).toBeInTheDocument();
    expect(screen.getByText(/Return to Home/i)).toBeInTheDocument();
  });

  it('logs error to console', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    );
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('404 Error'), 
      expect.stringContaining('/non-existent-route')
    );
    
    consoleSpy.mockRestore();
  });
});
