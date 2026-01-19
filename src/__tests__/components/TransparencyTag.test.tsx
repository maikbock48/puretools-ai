import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TransparencyTag from '@/components/TransparencyTag';

describe('TransparencyTag', () => {
  describe('Local variant', () => {
    it('renders local badge with correct text in English', () => {
      render(<TransparencyTag type="local" lng="en" />);
      expect(screen.getByText('Free & Local')).toBeInTheDocument();
    });

    it('renders local badge with correct text in German', () => {
      render(<TransparencyTag type="local" lng="de" />);
      expect(screen.getByText('Kostenlos & Lokal')).toBeInTheDocument();
    });

    it('renders minimal variant correctly', () => {
      render(<TransparencyTag type="local" lng="en" variant="minimal" />);
      expect(screen.getByText('Free')).toBeInTheDocument();
    });

    it('renders full variant with explanation', () => {
      render(<TransparencyTag type="local" lng="en" variant="full" />);
      expect(screen.getByText('0€ API costs')).toBeInTheDocument();
      expect(screen.getByText(/runs entirely in your browser/i)).toBeInTheDocument();
    });
  });

  describe('AI variant', () => {
    it('renders AI badge with correct text in English', () => {
      render(<TransparencyTag type="ai" lng="en" />);
      expect(screen.getByText('AI-Powered')).toBeInTheDocument();
    });

    it('renders AI badge with correct text in German', () => {
      render(<TransparencyTag type="ai" lng="de" />);
      expect(screen.getByText('KI-gestützt')).toBeInTheDocument();
    });

    it('renders minimal AI variant correctly', () => {
      render(<TransparencyTag type="ai" lng="en" variant="minimal" />);
      expect(screen.getByText('AI')).toBeInTheDocument();
    });

    it('renders full AI variant with pay-per-use info', () => {
      render(<TransparencyTag type="ai" lng="en" variant="full" />);
      expect(screen.getByText('Pay-per-use')).toBeInTheDocument();
    });
  });

  describe('Tooltip interaction', () => {
    it('shows tooltip on click when showTooltip is true', () => {
      render(<TransparencyTag type="local" lng="en" showTooltip={true} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(screen.getByText('Why is this free?')).toBeInTheDocument();
    });

    it('does not show tooltip when showTooltip is false', () => {
      render(<TransparencyTag type="local" lng="en" showTooltip={false} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(screen.queryByText('Why is this free?')).not.toBeInTheDocument();
    });
  });
});
