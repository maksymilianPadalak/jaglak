import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import InstrumentShowcase from './InstrumentShowcase';

describe('InstrumentShowcase', () => {
  it('renders the Instrument heading', () => {
    render(<InstrumentShowcase />);
    expect(screen.getByRole('heading', { name: /Instrument/i })).toBeInTheDocument();
  });

  it('renders the description', () => {
    render(<InstrumentShowcase />);
    expect(screen.getByText(/AI-powered virtual instruments/i)).toBeInTheDocument();
  });

  it('renders all feature items', () => {
    render(<InstrumentShowcase />);
    expect(screen.getByText(/Custom oscillators and waveforms/i)).toBeInTheDocument();
    expect(screen.getByText(/Advanced modulation routing/i)).toBeInTheDocument();
    expect(screen.getByText(/Built-in effects and filtering/i)).toBeInTheDocument();
    expect(screen.getByText(/MIDI support and automation/i)).toBeInTheDocument();
  });

  it('renders the CTA button', () => {
    render(<InstrumentShowcase />);
    const button = screen.getByRole('link', { name: /Build Your Instrument/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('href', '/chat');
  });

  it('renders the PluginPreview component', () => {
    render(<InstrumentShowcase />);
    expect(screen.getByText('AI Synthesizer')).toBeInTheDocument();
  });

  it('has correct layout structure', () => {
    const { container } = render(<InstrumentShowcase />);
    const gridElement = container.querySelector('.grid');
    expect(gridElement).toBeInTheDocument();
  });
});
