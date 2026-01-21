import prisma from './prisma';

export interface PromoCodeValidation {
  valid: boolean;
  error?: string;
  promoCode?: {
    id: string;
    code: string;
    type: 'credits' | 'discount_percent' | 'discount_fixed';
    value: number;
    description?: string | null;
  };
}

/**
 * Validate a promo code for a specific user
 */
export async function validatePromoCode(
  code: string,
  userId: string
): Promise<PromoCodeValidation> {
  const promoCode = await prisma.promoCode.findUnique({
    where: { code: code.toUpperCase() },
    include: {
      redemptions: {
        where: { userId },
      },
    },
  });

  if (!promoCode) {
    return { valid: false, error: 'INVALID_CODE' };
  }

  if (!promoCode.isActive) {
    return { valid: false, error: 'CODE_INACTIVE' };
  }

  if (promoCode.expiresAt && promoCode.expiresAt < new Date()) {
    return { valid: false, error: 'CODE_EXPIRED' };
  }

  if (promoCode.maxUses && promoCode.usedCount >= promoCode.maxUses) {
    return { valid: false, error: 'CODE_EXHAUSTED' };
  }

  if (promoCode.redemptions.length > 0) {
    return { valid: false, error: 'ALREADY_USED' };
  }

  return {
    valid: true,
    promoCode: {
      id: promoCode.id,
      code: promoCode.code,
      type: promoCode.type as 'credits' | 'discount_percent' | 'discount_fixed',
      value: promoCode.value,
      description: promoCode.description,
    },
  };
}

/**
 * Redeem a credits-type promo code
 */
export async function redeemCreditsPromoCode(
  code: string,
  userId: string
): Promise<{ success: boolean; credits?: number; error?: string }> {
  const validation = await validatePromoCode(code, userId);

  if (!validation.valid || !validation.promoCode) {
    return { success: false, error: validation.error };
  }

  if (validation.promoCode.type !== 'credits') {
    return { success: false, error: 'NOT_CREDITS_CODE' };
  }

  const credits = validation.promoCode.value;

  // Use a transaction to ensure atomicity
  await prisma.$transaction([
    // Add credits to user
    prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: credits } },
    }),
    // Create transaction record
    prisma.transaction.create({
      data: {
        userId,
        type: 'BONUS',
        amount: credits,
        description: `Promo code: ${code}`,
        metadata: JSON.stringify({ promoCodeId: validation.promoCode.id }),
      },
    }),
    // Create redemption record
    prisma.promoCodeRedemption.create({
      data: {
        promoCodeId: validation.promoCode.id,
        userId,
        creditsAwarded: credits,
      },
    }),
    // Increment used count
    prisma.promoCode.update({
      where: { id: validation.promoCode.id },
      data: { usedCount: { increment: 1 } },
    }),
  ]);

  return { success: true, credits };
}

/**
 * Calculate discount for checkout
 */
export function calculateDiscount(
  promoCode: { type: string; value: number; minPurchase?: number | null },
  purchaseAmount: number // in cents
): { discountAmount: number; valid: boolean; error?: string } {
  if (promoCode.minPurchase && purchaseAmount < promoCode.minPurchase) {
    return { discountAmount: 0, valid: false, error: 'MIN_PURCHASE_NOT_MET' };
  }

  if (promoCode.type === 'discount_percent') {
    const discount = Math.round((purchaseAmount * promoCode.value) / 100);
    return { discountAmount: discount, valid: true };
  }

  if (promoCode.type === 'discount_fixed') {
    const discount = Math.min(promoCode.value, purchaseAmount);
    return { discountAmount: discount, valid: true };
  }

  return { discountAmount: 0, valid: false, error: 'INVALID_DISCOUNT_TYPE' };
}

/**
 * Error messages for promo codes
 */
export const promoCodeErrors = {
  en: {
    INVALID_CODE: 'Invalid promo code',
    CODE_INACTIVE: 'This promo code is no longer active',
    CODE_EXPIRED: 'This promo code has expired',
    CODE_EXHAUSTED: 'This promo code has reached its usage limit',
    ALREADY_USED: 'You have already used this promo code',
    NOT_CREDITS_CODE: 'This code cannot be redeemed for credits',
    MIN_PURCHASE_NOT_MET: 'Minimum purchase amount not met',
    INVALID_DISCOUNT_TYPE: 'Invalid discount type',
  },
  de: {
    INVALID_CODE: 'Ungültiger Promo-Code',
    CODE_INACTIVE: 'Dieser Promo-Code ist nicht mehr aktiv',
    CODE_EXPIRED: 'Dieser Promo-Code ist abgelaufen',
    CODE_EXHAUSTED: 'Dieser Promo-Code hat sein Nutzungslimit erreicht',
    ALREADY_USED: 'Du hast diesen Promo-Code bereits verwendet',
    NOT_CREDITS_CODE: 'Dieser Code kann nicht für Credits eingelöst werden',
    MIN_PURCHASE_NOT_MET: 'Mindestbestellwert nicht erreicht',
    INVALID_DISCOUNT_TYPE: 'Ungültiger Rabatttyp',
  },
};
