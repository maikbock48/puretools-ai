import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HeroSection from '@/components/HeroSection';

describe('HeroSection', () => {
  describe('English content', () => {
    it('renders fair messaging badge', () => {
      render(<HeroSection lng="en" />);
      expect(screen.getByText('No Ads. No Tracking. Ever.')).toBeInTheDocument();
    });

    it('renders main headline', () => {
      render(<HeroSection lng="en" />);
      expect(screen.getByText('Honest Tools.')).toBeInTheDocument();
      expect(screen.getByText('Fair Prices.')).toBeInTheDocument();
      expect(screen.getByText('Zero BS.')).toBeInTheDocument();
    });

    it('renders value proposition', () => {
      render(<HeroSection lng="en" />);
      expect(screen.getByText(/Local tasks run free in your browser/)).toBeInTheDocument();
      expect(screen.getByText(/Your files never leave your device/)).toBeInTheDocument();
    });

    it('renders trust badges', () => {
      render(<HeroSection lng="en" />);
      expect(screen.getByText('100% Privacy')).toBeInTheDocument();
      expect(screen.getByText('No subscription traps')).toBeInTheDocument();
      expect(screen.getByText('AI: Pay-per-use only')).toBeInTheDocument();
    });

    it('renders CTA buttons', () => {
      render(<HeroSection lng="en" />);
      expect(screen.getByText('Explore Tools')).toBeInTheDocument();
      expect(screen.getByText('See Pricing')).toBeInTheDocument();
    });

    it('renders stats section', () => {
      render(<HeroSection lng="en" />);
      expect(screen.getByText('10+')).toBeInTheDocument();
      expect(screen.getByText('Free Tools')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByText('Local Processing')).toBeInTheDocument();
    });

    it('renders zero stats for ads and subscriptions', () => {
      render(<HeroSection lng="en" />);
      const zeros = screen.getAllByText('0');
      expect(zeros.length).toBeGreaterThanOrEqual(2);
      expect(screen.getByText('Ads')).toBeInTheDocument();
      expect(screen.getByText('Forced Subscriptions')).toBeInTheDocument();
    });
  });

  describe('German content', () => {
    it('renders German badge', () => {
      render(<HeroSection lng="de" />);
      expect(screen.getByText('Keine Werbung. Kein Tracking. Niemals.')).toBeInTheDocument();
    });

    it('renders German headline', () => {
      render(<HeroSection lng="de" />);
      expect(screen.getByText('Ehrliche Tools.')).toBeInTheDocument();
      expect(screen.getByText('Faire Preise.')).toBeInTheDocument();
      expect(screen.getByText('Null Bullshit.')).toBeInTheDocument();
    });

    it('renders German value proposition', () => {
      render(<HeroSection lng="de" />);
      expect(screen.getByText(/Lokale Aufgaben erledigt dein Browser kostenlos/)).toBeInTheDocument();
    });

    it('renders German trust badges', () => {
      render(<HeroSection lng="de" />);
      expect(screen.getByText('100% Privatsphäre')).toBeInTheDocument();
      expect(screen.getByText('Keine Abo-Fallen')).toBeInTheDocument();
      expect(screen.getByText('KI: Nur Pay-per-Use')).toBeInTheDocument();
    });

    it('renders German CTA buttons', () => {
      render(<HeroSection lng="de" />);
      expect(screen.getByText('Tools entdecken')).toBeInTheDocument();
      expect(screen.getByText('Preise ansehen')).toBeInTheDocument();
    });
  });

  describe('Links', () => {
    it('has correct tools link', () => {
      render(<HeroSection lng="en" />);
      const toolsLink = screen.getByText('Explore Tools').closest('a');
      expect(toolsLink).toHaveAttribute('href', '#tools');
    });

    it('has correct pricing link for English', () => {
      render(<HeroSection lng="en" />);
      const pricingLink = screen.getByText('See Pricing').closest('a');
      expect(pricingLink).toHaveAttribute('href', '/en/pricing');
    });

    it('has correct pricing link for German', () => {
      render(<HeroSection lng="de" />);
      const pricingLink = screen.getByText('Preise ansehen').closest('a');
      expect(pricingLink).toHaveAttribute('href', '/de/pricing');
    });
  });
});
