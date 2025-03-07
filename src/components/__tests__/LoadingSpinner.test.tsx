import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders a loading spinner with default props', () => {
    render(<LoadingSpinner />);
    
    // Check that the spinner exists with the right role
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    
    // Should have the correct CSS classes for default size/color
    expect(spinner).toHaveClass('border-blue-500');
  });
  
  it('renders a loading spinner with custom size', () => {
    render(<LoadingSpinner size="large" />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    
    // Check that style is applied with the large size (48px)
    expect(spinner).toHaveStyle('width: 48px');
    expect(spinner).toHaveStyle('height: 48px');
  });
  
  it('renders a loading spinner with custom color', () => {
    render(<LoadingSpinner color="red" />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    
    // Should have the red color class
    expect(spinner).toHaveClass('border-red-500');
  });
  
  it('renders with custom text', () => {
    const testText = 'Loading game...';
    render(<LoadingSpinner text={testText} />);
    
    // Check that the loading text is displayed
    const text = screen.getByText(testText);
    expect(text).toBeInTheDocument();
  });
  
  it('applies additional className if provided', () => {
    render(<LoadingSpinner className="mt-10 p-4" />);
    
    const container = screen.getByRole('status').parentElement;
    expect(container).toHaveClass('mt-10');
    expect(container).toHaveClass('p-4');
  });
});