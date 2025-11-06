import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import components using relative paths
import Button from '../components/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import LandingPage from '../pages/LandingPage';

// Sample Button test
describe('Button', () => {
  it('renders with correct text and responds to click', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    const btn = screen.getByRole('button', { name: /click me/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalled();
  });
});

// Sample Card test
describe('Card', () => {
  it('renders Card with header and content', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
        </CardHeader>
        <CardContent>Card content here</CardContent>
      </Card>
    );
    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('Card content here')).toBeInTheDocument();
  });
});

// Sample LandingPage test
describe('LandingPage', () => {
  it('renders the landing page', () => {
    render(<LandingPage />);
    // Adjust the text below to something unique on your landing page
    expect(screen.getByText(/mingle/i)).toBeInTheDocument();
  });
}); 