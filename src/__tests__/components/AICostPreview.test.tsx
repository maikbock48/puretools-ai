import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AICostPreview from '@/components/AICostPreview';

describe('AICostPreview', () => {
  const defaultProps = {
    lng: 'en' as const,
    type: 'translator' as const,
    creditsRequired: 11,
    wordCount: 5000,
  };

  it('renders cost preview title', () => {
    render(<AICostPreview {...defaultProps} />);
    expect(screen.getByText('Cost Preview')).toBeInTheDocument();
  });

  it('renders word count when provided', () => {
    render(<AICostPreview {...defaultProps} />);
    expect(screen.getByText(/5,000 words/)).toBeInTheDocument();
  });

  it('renders page count when provided', () => {
    render(<AICostPreview {...defaultProps} pageCount={10} />);
    expect(screen.getByText(/10 pages/)).toBeInTheDocument();
  });

  it('renders audio duration when provided', () => {
    render(<AICostPreview {...defaultProps} type="transcriber" audioDuration={125} />);
    expect(screen.getByText(/2m 5s duration/)).toBeInTheDocument();
  });

  it('renders file size when provided', () => {
    render(<AICostPreview {...defaultProps} fileSize={1048576} />);
    expect(screen.getByText('1 MB')).toBeInTheDocument();
  });

  it('shows cost breakdown', () => {
    render(<AICostPreview {...defaultProps} />);
    expect(screen.getByText('Cost Breakdown')).toBeInTheDocument();
    expect(screen.getByText('AI Processing Cost')).toBeInTheDocument();
    expect(screen.getByText('Service Fee (10%)')).toBeInTheDocument();
    expect(screen.getByText('Total Credits')).toBeInTheDocument();
  });

  it('calculates and displays total credits', () => {
    render(<AICostPreview {...defaultProps} creditsRequired={11} />);
    expect(screen.getByText(/11 credits/)).toBeInTheDocument();
  });

  it('shows sufficient balance message when balance is enough', () => {
    render(<AICostPreview {...defaultProps} creditsRequired={50} />);
    expect(screen.getByText('Sufficient balance')).toBeInTheDocument();
  });

  it('shows insufficient balance message when balance is not enough', () => {
    render(<AICostPreview {...defaultProps} creditsRequired={150} />);
    expect(screen.getByText('Insufficient balance')).toBeInTheDocument();
  });

  it('shows transparency note', () => {
    render(<AICostPreview {...defaultProps} />);
    expect(screen.getByText('We show exact costs upfront. No hidden fees.')).toBeInTheDocument();
  });

  it('shows pricing info for translator', () => {
    render(<AICostPreview {...defaultProps} type="translator" />);
    expect(screen.getByText('~0.5 credits per 1000 words')).toBeInTheDocument();
  });

  it('shows pricing info for transcriber', () => {
    render(<AICostPreview {...defaultProps} type="transcriber" />);
    expect(screen.getByText('~1 credit per minute of audio')).toBeInTheDocument();
  });

  it('shows pricing info for summarizer', () => {
    render(<AICostPreview {...defaultProps} type="summarizer" />);
    expect(screen.getByText('~0.3 credits per 1000 words')).toBeInTheDocument();
  });

  describe('Button actions', () => {
    it('calls onConfirm when confirm button is clicked', () => {
      const onConfirm = vi.fn();
      render(<AICostPreview {...defaultProps} onConfirm={onConfirm} />);

      fireEvent.click(screen.getByText('Process Now'));
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when cancel button is clicked', () => {
      const onCancel = vi.fn();
      render(<AICostPreview {...defaultProps} onCancel={onCancel} />);

      fireEvent.click(screen.getByText('Cancel'));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('disables confirm button when balance is insufficient', () => {
      const onConfirm = vi.fn();
      render(<AICostPreview {...defaultProps} creditsRequired={150} onConfirm={onConfirm} />);

      const button = screen.getByText('Top up credits');
      expect(button).toBeDisabled();
    });
  });

  describe('German localization', () => {
    it('renders German title', () => {
      render(<AICostPreview {...defaultProps} lng="de" />);
      expect(screen.getByText('Kosten-Vorschau')).toBeInTheDocument();
    });

    it('renders German buttons', () => {
      render(<AICostPreview {...defaultProps} lng="de" onConfirm={() => {}} onCancel={() => {}} />);
      expect(screen.getByText('Jetzt verarbeiten')).toBeInTheDocument();
      expect(screen.getByText('Abbrechen')).toBeInTheDocument();
    });
  });
});
