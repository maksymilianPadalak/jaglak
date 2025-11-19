import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PluginPreview from './PluginPreview';

describe('PluginPreview', () => {
  it('renders the plugin title', () => {
    render(<PluginPreview />);
    expect(screen.getByText('AI Synthesizer')).toBeInTheDocument();
  });

  it('renders all knob labels', () => {
    render(<PluginPreview />);
    expect(screen.getByText('Cutoff')).toBeInTheDocument();
    expect(screen.getByText('Resonance')).toBeInTheDocument();
    expect(screen.getByText('Attack')).toBeInTheDocument();
  });

  it('renders all slider labels', () => {
    render(<PluginPreview />);
    expect(screen.getByText('Volume')).toBeInTheDocument();
    expect(screen.getByText('Pan')).toBeInTheDocument();
  });

  it('renders the preview caption', () => {
    render(<PluginPreview />);
    expect(screen.getByText(/Preview: AI-Generated Plugin Interface/i)).toBeInTheDocument();
  });

  it('renders the waveform SVG', () => {
    const { container } = render(<PluginPreview />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders correct number of knobs', () => {
    const { container } = render(<PluginPreview />);
    const knobs = container.querySelectorAll('.rounded-full');
    expect(knobs.length).toBe(3);
  });
});
