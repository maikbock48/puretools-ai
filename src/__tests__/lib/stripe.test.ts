import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CREDIT_PACKAGES, getPackageById, formatPrice, CreditPackageId } from '@/lib/stripe';

// Mock Stripe to prevent initialization errors
vi.mock('stripe', () => ({
  default: vi.fn(() => ({
    customers: {},
    checkout: {},
    webhooks: {},
  })),
}));

describe('Stripe Configuration', () => {
  describe('CREDIT_PACKAGES', () => {
    it('has exactly 3 packages', () => {
      expect(CREDIT_PACKAGES).toHaveLength(3);
    });

    it('has starter package', () => {
      const starter = CREDIT_PACKAGES.find(p => p.id === 'starter');
      expect(starter).toBeDefined();
      expect(starter?.credits).toBe(50);
      expect(starter?.price).toBe(499);
      expect(starter?.currency).toBe('eur');
    });

    it('has popular package', () => {
      const popular = CREDIT_PACKAGES.find(p => p.id === 'popular');
      expect(popular).toBeDefined();
      expect(popular?.credits).toBe(150);
      expect(popular?.price).toBe(999);
      expect(popular?.popular).toBe(true);
    });

    it('has pro package', () => {
      const pro = CREDIT_PACKAGES.find(p => p.id === 'pro');
      expect(pro).toBeDefined();
      expect(pro?.credits).toBe(500);
      expect(pro?.price).toBe(2499);
    });

    it('all packages have required fields', () => {
      CREDIT_PACKAGES.forEach(pkg => {
        expect(pkg.id).toBeTruthy();
        expect(pkg.name).toBeTruthy();
        expect(pkg.credits).toBeGreaterThan(0);
        expect(pkg.price).toBeGreaterThan(0);
        expect(pkg.currency).toBe('eur');
      });
    });

    it('only one package is marked as popular', () => {
      const popularPackages = CREDIT_PACKAGES.filter(p => (p as typeof CREDIT_PACKAGES[1]).popular);
      expect(popularPackages).toHaveLength(1);
    });

    it('prices are in correct ascending order', () => {
      const prices = CREDIT_PACKAGES.map(p => p.price);
      expect(prices[0]).toBeLessThan(prices[1]);
      expect(prices[1]).toBeLessThan(prices[2]);
    });

    it('credits scale better with higher packages', () => {
      const starter = CREDIT_PACKAGES.find(p => p.id === 'starter')!;
      const popular = CREDIT_PACKAGES.find(p => p.id === 'popular')!;
      const pro = CREDIT_PACKAGES.find(p => p.id === 'pro')!;

      // Calculate cents per credit
      const starterCPC = starter.price / starter.credits;
      const popularCPC = popular.price / popular.credits;
      const proCPC = pro.price / pro.credits;

      // Higher packages should have better value
      expect(popularCPC).toBeLessThan(starterCPC);
      expect(proCPC).toBeLessThan(popularCPC);
    });
  });

  describe('getPackageById', () => {
    it('returns starter package', () => {
      const pkg = getPackageById('starter');
      expect(pkg).toBeDefined();
      expect(pkg?.id).toBe('starter');
    });

    it('returns popular package', () => {
      const pkg = getPackageById('popular');
      expect(pkg).toBeDefined();
      expect(pkg?.id).toBe('popular');
    });

    it('returns pro package', () => {
      const pkg = getPackageById('pro');
      expect(pkg).toBeDefined();
      expect(pkg?.id).toBe('pro');
    });

    it('returns undefined for invalid id', () => {
      // @ts-expect-error - testing invalid input
      const pkg = getPackageById('invalid');
      expect(pkg).toBeUndefined();
    });
  });

  describe('formatPrice', () => {
    it('formats EUR price correctly', () => {
      const formatted = formatPrice(999, 'eur');
      expect(formatted).toContain('9,99');
      expect(formatted).toMatch(/€|EUR/);
    });

    it('formats starter package price', () => {
      const formatted = formatPrice(499, 'eur');
      expect(formatted).toContain('4,99');
    });

    it('formats pro package price', () => {
      const formatted = formatPrice(2499, 'eur');
      expect(formatted).toContain('24,99');
    });

    it('defaults to EUR currency', () => {
      const formatted = formatPrice(999);
      expect(formatted).toContain('9,99');
    });

    it('handles zero amount', () => {
      const formatted = formatPrice(0, 'eur');
      expect(formatted).toContain('0');
    });

    it('handles large amounts', () => {
      const formatted = formatPrice(99999, 'eur');
      expect(formatted).toContain('999,99');
    });

    it('uses German number format', () => {
      // German format uses comma as decimal separator
      const formatted = formatPrice(1050, 'eur');
      expect(formatted).toContain(',');
    });
  });
});
