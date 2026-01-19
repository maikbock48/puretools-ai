import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
  typescript: true,
});

// Credit packages configuration
export const CREDIT_PACKAGES = [
  {
    id: 'starter',
    name: 'Starter',
    credits: 50,
    price: 499, // cents
    currency: 'eur',
  },
  {
    id: 'popular',
    name: 'Popular',
    credits: 150,
    price: 999,
    currency: 'eur',
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    credits: 500,
    price: 2499,
    currency: 'eur',
  },
] as const;

export type CreditPackageId = (typeof CREDIT_PACKAGES)[number]['id'];

export function getPackageById(id: CreditPackageId) {
  return CREDIT_PACKAGES.find((pkg) => pkg.id === id);
}

export function formatPrice(amount: number, currency: string = 'eur'): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}
