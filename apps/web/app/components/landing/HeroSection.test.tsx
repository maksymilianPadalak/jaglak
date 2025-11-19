import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HeroSection from './HeroSection';

describe('HeroSection', () => {
  it('renders the main heading', () => {
    render(<HeroSection />);
    expect(screen.getByText(/First Ever AI Plugin Generator/i)).toBeInTheDocument();
  });

  it('renders the description text', () => {
    render(<HeroSection />);
    expect(screen.getByText(/Create professional-quality audio plugins/i)).toBeInTheDocument();
  });

  it('contains a Sparkles icon', () => {
    const { container } = render(<HeroSection />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('has correct styling classes', () => {
    const { container } = render(<HeroSection />);
    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass('border-2', 'border-black', 'bg-white');
  });
});
