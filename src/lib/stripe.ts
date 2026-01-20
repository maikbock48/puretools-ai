import Stripe from 'stripe';

// Lazy initialization to avoid build-time errors
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    });
  }
  return stripeInstance;
}

// For backwards compatibility - getter that lazily initializes
export const stripe = {
  get customers() { return getStripe().customers; },
  get checkout() { return getStripe().checkout; },
  get webhooks() { return getStripe().webhooks; },
};

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
