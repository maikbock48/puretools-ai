import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EfficiencyScore from '@/components/EfficiencyScore';

describe('EfficiencyScore', () => {
  const defaultProps = {
    lng: 'en' as const,
    processingTime: 1500,
  };

  it('renders efficiency score title', () => {
    render(<EfficiencyScore {...defaultProps} />);
    expect(screen.getByText('Efficiency Score')).toBeInTheDocument();
  });

  it('renders processing time correctly in milliseconds', () => {
    render(<EfficiencyScore lng="en" processingTime={500} />);
    expect(screen.getByText('500ms')).toBeInTheDocument();
  });

  it('renders processing time correctly in seconds', () => {
    render(<EfficiencyScore lng="en" processingTime={2500} />);
    expect(screen.getByText('2.50s')).toBeInTheDocument();
  });

  it('renders saved bytes when provided', () => {
    render(<EfficiencyScore {...defaultProps} savedBytes={1048576} savedPercent={50} />);
    expect(screen.getByText('1 MB')).toBeInTheDocument();
    expect(screen.getByText('(-50%)')).toBeInTheDocument();
  });

  it('renders item count when provided', () => {
    render(<EfficiencyScore {...defaultProps} itemCount={42} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders local badge', () => {
    render(<EfficiencyScore {...defaultProps} />);
    expect(screen.getByText('Processed on your device')).toBeInTheDocument();
  });

  it('renders zero server cost', () => {
    render(<EfficiencyScore {...defaultProps} />);
    expect(screen.getByText('$0')).toBeInTheDocument();
  });

  describe('German localization', () => {
    it('renders German title', () => {
      render(<EfficiencyScore lng="de" processingTime={1000} />);
      expect(screen.getByText('Effizienz-Score')).toBeInTheDocument();
    });

    it('renders German local badge', () => {
      render(<EfficiencyScore lng="de" processingTime={1000} />);
      expect(screen.getByText('Auf deinem Gerät verarbeitet')).toBeInTheDocument();
    });

    it('renders German zero cost', () => {
      render(<EfficiencyScore lng="de" processingTime={1000} />);
      expect(screen.getByText('0€')).toBeInTheDocument();
    });
  });
});
