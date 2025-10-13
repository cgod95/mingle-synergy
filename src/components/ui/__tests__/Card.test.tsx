import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../card';

describe('Card Component', () => {
  it('renders basic card with content', () => {
    render(
      <Card>
        <CardContent>Card content</CardContent>
      </Card>
    );
    
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders card with header', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>Content</CardContent>
      </Card>
    );
    
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card Description')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders card with footer', () => {
    render(
      <Card>
        <CardContent>Content</CardContent>
        <CardFooter>Footer content</CardFooter>
      </Card>
    );
    
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('applies custom className to card', () => {
    render(
      <Card className="custom-class">
        <CardContent>Custom styled card</CardContent>
      </Card>
    );
    
    const card = screen.getByText('Custom styled card').closest('div')?.parentElement;
    expect(card).toHaveClass('custom-class');
  });

  it('renders with proper structure', () => {
    render(
      <Card>
        <CardContent>Simple card</CardContent>
      </Card>
    );
    
    const card = screen.getByText('Simple card').closest('div');
    expect(card).toBeInTheDocument();
  });

  it('has proper semantic structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    );
    
    // Check that title is rendered as h3
    const title = screen.getByRole('heading', { level: 3 });
    expect(title).toHaveTextContent('Title');
  });

  it('applies proper spacing classes', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
        </CardHeader>
        <CardContent>Content</CardContent>
      </Card>
    );
    
    const header = screen.getByText('Title').closest('div');
    const content = screen.getByText('Content').closest('div');
    
    expect(header).toHaveClass('p-6');
    expect(content).toHaveClass('p-6', 'pt-0');
  });
}); 