
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import NotFound from '../NotFound';

// Mock the logger
vi.mock('@/utils/Logger', () => ({
  default: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

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
    
    expect(screen.getByText('404 - Not Found')).toBeInTheDocument();
    expect(screen.getByText(/The page you are looking for does not exist/i)).toBeInTheDocument();
    expect(screen.getByText(/Back to Home/i)).toBeInTheDocument();
  });

  it('logs error to logger', async () => {
    const logger = await import('@/utils/Logger');
    const loggerSpy = vi.spyOn(logger.default, 'error').mockImplementation(() => {});
    
    render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    );
    
    expect(loggerSpy).toHaveBeenCalledWith(
      '404 Error: User attempted to access non-existent route:',
      '/non-existent-route'
    );
    
    loggerSpy.mockRestore();
  });
});
