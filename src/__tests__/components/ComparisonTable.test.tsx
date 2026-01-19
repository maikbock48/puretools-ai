import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ComparisonTable from '@/components/ComparisonTable';

describe('ComparisonTable', () => {
  it('renders table title in English', () => {
    render(<ComparisonTable lng="en" />);
    expect(screen.getByText('Why PureTools?')).toBeInTheDocument();
  });

  it('renders table title in German', () => {
    render(<ComparisonTable lng="de" />);
    expect(screen.getByText('Warum PureTools?')).toBeInTheDocument();
  });

  it('renders all comparison rows', () => {
    render(<ComparisonTable lng="en" />);

    // Check all feature names are present
    expect(screen.getByText('Ads & Tracking')).toBeInTheDocument();
    expect(screen.getByText('Basic Tools Cost')).toBeInTheDocument();
    expect(screen.getByText('AI Features')).toBeInTheDocument();
    expect(screen.getByText('Data Privacy')).toBeInTheDocument();
    expect(screen.getByText('Processing Speed')).toBeInTheDocument();
  });

  it('shows PureTools advantages', () => {
    render(<ComparisonTable lng="en" />);

    expect(screen.getByText('Never. Zero ads.')).toBeInTheDocument();
    expect(screen.getByText('Free forever (0€)')).toBeInTheDocument();
    expect(screen.getByText('Pay only what you use')).toBeInTheDocument();
    expect(screen.getByText('Processed locally')).toBeInTheDocument();
    expect(screen.getByText('Instant (your device)')).toBeInTheDocument();
  });

  it('shows competitor disadvantages', () => {
    render(<ComparisonTable lng="en" />);

    expect(screen.getByText('Everywhere (slows you down)')).toBeInTheDocument();
    expect(screen.getByText('Often requires subscription')).toBeInTheDocument();
    expect(screen.getByText('Expensive monthly plans')).toBeInTheDocument();
    expect(screen.getByText('Uploaded to unknown servers')).toBeInTheDocument();
    expect(screen.getByText('Server queue delays')).toBeInTheDocument();
  });

  it('renders no subscription traps badge', () => {
    render(<ComparisonTable lng="en" />);
    expect(screen.getByText('No subscription traps')).toBeInTheDocument();
  });

  it('renders CTA button', () => {
    render(<ComparisonTable lng="en" />);
    expect(screen.getByText('Try for Free')).toBeInTheDocument();
  });

  describe('German localization', () => {
    it('renders German feature names', () => {
      render(<ComparisonTable lng="de" />);

      expect(screen.getByText('Werbung & Tracking')).toBeInTheDocument();
      expect(screen.getByText('Basis-Tools Kosten')).toBeInTheDocument();
      expect(screen.getByText('KI-Features')).toBeInTheDocument();
      expect(screen.getByText('Datenschutz')).toBeInTheDocument();
      expect(screen.getByText('Geschwindigkeit')).toBeInTheDocument();
    });

    it('renders German CTA', () => {
      render(<ComparisonTable lng="de" />);
      expect(screen.getByText('Kostenlos testen')).toBeInTheDocument();
    });
  });
});
