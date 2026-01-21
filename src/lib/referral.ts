import prisma from './prisma';
import { nanoid } from 'nanoid';

const REFERRAL_BONUS = 100; // Credits awarded to both parties

/**
 * Generate a unique referral code for a user
 */
export function generateReferralCode(): string {
  return `PT${nanoid(8).toUpperCase()}`;
}

/**
 * Get or create a referral code for a user
 */
export async function getOrCreateReferralCode(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  });

  if (user?.referralCode) {
    return user.referralCode;
  }

  // Generate and save new code
  let code = generateReferralCode();
  let attempts = 0;

  while (attempts < 5) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { referralCode: code },
      });
      return code;
    } catch (error) {
      // Code collision, try again
      code = generateReferralCode();
      attempts++;
    }
  }

  throw new Error('Failed to generate unique referral code');
}

/**
 * Find user by referral code
 */
export async function findUserByReferralCode(code: string) {
  return prisma.user.findUnique({
    where: { referralCode: code.toUpperCase() },
    select: { id: true, name: true },
  });
}

/**
 * Apply referral bonus when a new user signs up
 */
export async function applyReferralBonus(
  referrerId: string,
  referredId: string
): Promise<{ success: boolean; error?: string }> {
  // Check if referral already exists
  const existingReferral = await prisma.referral.findUnique({
    where: {
      referrerId_referredId: {
        referrerId,
        referredId,
      },
    },
  });

  if (existingReferral) {
    return { success: false, error: 'Referral already exists' };
  }

  // Can't refer yourself
  if (referrerId === referredId) {
    return { success: false, error: 'Cannot refer yourself' };
  }

  try {
    await prisma.$transaction([
      // Create referral record
      prisma.referral.create({
        data: {
          referrerId,
          referredId,
          bonusCredits: REFERRAL_BONUS,
          status: 'completed',
          referrerPaid: true,
          referredPaid: true,
          completedAt: new Date(),
        },
      }),
      // Add credits to referrer
      prisma.user.update({
        where: { id: referrerId },
        data: { credits: { increment: REFERRAL_BONUS } },
      }),
      // Add credits to referred user
      prisma.user.update({
        where: { id: referredId },
        data: { credits: { increment: REFERRAL_BONUS } },
      }),
      // Log transaction for referrer
      prisma.transaction.create({
        data: {
          userId: referrerId,
          type: 'BONUS',
          amount: REFERRAL_BONUS,
          description: 'Referral bonus - friend signed up',
        },
      }),
      // Log transaction for referred user
      prisma.transaction.create({
        data: {
          userId: referredId,
          type: 'BONUS',
          amount: REFERRAL_BONUS,
          description: 'Referral bonus - signed up with referral',
        },
      }),
    ]);

    return { success: true };
  } catch (error) {
    console.error('Failed to apply referral bonus:', error);
    return { success: false, error: 'Failed to apply referral bonus' };
  }
}

/**
 * Get referral statistics for a user
 */
export async function getReferralStats(userId: string) {
  const [user, referrals] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true },
    }),
    prisma.referral.findMany({
      where: { referrerId: userId },
      select: {
        id: true,
        bonusCredits: true,
        status: true,
        createdAt: true,
        referred: {
          select: { name: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const totalEarned = referrals
    .filter((r) => r.status === 'completed')
    .reduce((sum, r) => sum + r.bonusCredits, 0);

  return {
    referralCode: user?.referralCode || null,
    totalReferrals: referrals.length,
    successfulReferrals: referrals.filter((r) => r.status === 'completed').length,
    totalCreditsEarned: totalEarned,
    referrals: referrals.map((r) => ({
      id: r.id,
      status: r.status,
      creditsEarned: r.bonusCredits,
      referredAt: r.createdAt,
      referredName: r.referred.name,
    })),
  };
}
