import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CTASection from './CTASection';

describe('CTASection', () => {
  it('renders the heading', () => {
    render(<CTASection />);
    expect(screen.getByRole('heading', { name: /Ready to Create?/i })).toBeInTheDocument();
  });

  it('renders the description', () => {
    render(<CTASection />);
    expect(screen.getByText(/Join the future of audio plugin development/i)).toBeInTheDocument();
  });

  it('renders the CTA button', () => {
    render(<CTASection />);
    const button = screen.getByRole('link', { name: /Get Started Now/i });
    expect(button).toBeInTheDocument();
  });

  it('CTA button links to chat page', () => {
    render(<CTASection />);
    const button = screen.getByRole('link', { name: /Get Started Now/i });
    expect(button).toHaveAttribute('href', '/chat');
  });

  it('has black background styling', () => {
    const { container } = render(<CTASection />);
    const section = container.firstChild as HTMLElement;
    expect(section).toHaveClass('bg-black', 'text-white');
  });

  it('has centered text', () => {
    const { container } = render(<CTASection />);
    const section = container.firstChild as HTMLElement;
    expect(section).toHaveClass('text-center');
  });
});
