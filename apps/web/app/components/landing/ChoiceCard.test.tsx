import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChoiceCard from './ChoiceCard';
import { Music } from 'lucide-react';

describe('ChoiceCard', () => {
  const defaultProps = {
    icon: Music,
    title: 'Instrument',
    description: 'Generate synthesizers and samplers',
    href: '/chat',
  };

  it('renders the title', () => {
    render(<ChoiceCard {...defaultProps} />);
    expect(screen.getByText('Instrument')).toBeInTheDocument();
  });

  it('renders the description', () => {
    render(<ChoiceCard {...defaultProps} />);
    expect(screen.getByText(/Generate synthesizers and samplers/i)).toBeInTheDocument();
  });

  it('renders the "Start Building" call to action', () => {
    render(<ChoiceCard {...defaultProps} />);
    expect(screen.getByText('Start Building')).toBeInTheDocument();
  });

  it('links to the correct href', () => {
    render(<ChoiceCard {...defaultProps} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/chat');
  });

  it('renders the icon', () => {
    const { container } = render(<ChoiceCard {...defaultProps} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('has hover effect classes', () => {
    const { container } = render(<ChoiceCard {...defaultProps} />);
    const card = container.querySelector('.hover\\:bg-black');
    expect(card).toBeInTheDocument();
  });
});
