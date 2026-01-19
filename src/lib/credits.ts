import prisma from './prisma';

export type TransactionType = 'PURCHASE' | 'USAGE' | 'BONUS' | 'REFUND';

interface UseCreditsParams {
  userId: string;
  amount: number;
  toolType: string;
  description: string;
  inputSize?: number;
  outputSize?: number;
  metadata?: Record<string, unknown>;
}

interface AddCreditsParams {
  userId: string;
  amount: number;
  type: TransactionType;
  description: string;
  metadata?: Record<string, unknown>;
}

/**
 * Check if a user has enough credits
 */
export async function hasEnoughCredits(userId: string, amount: number): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });
  return (user?.credits ?? 0) >= amount;
}

/**
 * Get user's current credit balance
 */
export async function getUserCredits(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });
  return user?.credits ?? 0;
}

/**
 * Use credits for an AI tool operation
 */
export async function useCredits({
  userId,
  amount,
  toolType,
  description,
  inputSize,
  outputSize,
  metadata,
}: UseCreditsParams): Promise<{ success: boolean; newBalance: number; error?: string }> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Check current balance
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { credits: true },
      });

      if (!user || user.credits < amount) {
        throw new Error('Insufficient credits');
      }

      // Deduct credits
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { credits: { decrement: amount } },
        select: { credits: true },
      });

      // Log transaction
      await tx.transaction.create({
        data: {
          userId,
          type: 'USAGE',
          amount: -amount,
          description,
          metadata: metadata ? JSON.stringify(metadata) : null,
        },
      });

      // Log usage
      await tx.usageLog.create({
        data: {
          userId,
          toolType,
          credits: amount,
          inputSize,
          outputSize,
          metadata: metadata ? JSON.stringify(metadata) : null,
        },
      });

      return { success: true, newBalance: updatedUser.credits };
    });

    return result;
  } catch (error) {
    return {
      success: false,
      newBalance: await getUserCredits(userId),
      error: error instanceof Error ? error.message : 'Failed to use credits',
    };
  }
}

/**
 * Add credits to a user's account
 */
export async function addCredits({
  userId,
  amount,
  type,
  description,
  metadata,
}: AddCreditsParams): Promise<{ success: boolean; newBalance: number; error?: string }> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Add credits
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { credits: { increment: amount } },
        select: { credits: true },
      });

      // Log transaction
      await tx.transaction.create({
        data: {
          userId,
          type,
          amount,
          description,
          metadata: metadata ? JSON.stringify(metadata) : null,
        },
      });

      return { success: true, newBalance: updatedUser.credits };
    });

    return result;
  } catch (error) {
    return {
      success: false,
      newBalance: await getUserCredits(userId),
      error: error instanceof Error ? error.message : 'Failed to add credits',
    };
  }
}

/**
 * Get user's transaction history
 */
export async function getTransactionHistory(
  userId: string,
  limit = 20,
  offset = 0
): Promise<{
  transactions: Array<{
    id: string;
    type: string;
    amount: number;
    description: string;
    createdAt: Date;
  }>;
  total: number;
}> {
  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        type: true,
        amount: true,
        description: true,
        createdAt: true,
      },
    }),
    prisma.transaction.count({ where: { userId } }),
  ]);

  return { transactions, total };
}

/**
 * Get user's usage statistics
 */
export async function getUsageStats(
  userId: string,
  days = 30
): Promise<{
  totalCreditsUsed: number;
  byTool: Record<string, number>;
  daily: Array<{ date: string; credits: number }>;
}> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const usage = await prisma.usageLog.findMany({
    where: {
      userId,
      createdAt: { gte: since },
    },
    select: {
      toolType: true,
      credits: true,
      createdAt: true,
    },
  });

  const totalCreditsUsed = usage.reduce((sum, u) => sum + u.credits, 0);

  const byTool: Record<string, number> = {};
  usage.forEach((u) => {
    byTool[u.toolType] = (byTool[u.toolType] || 0) + u.credits;
  });

  const dailyMap: Record<string, number> = {};
  usage.forEach((u) => {
    const date = u.createdAt.toISOString().split('T')[0];
    dailyMap[date] = (dailyMap[date] || 0) + u.credits;
  });

  const daily = Object.entries(dailyMap)
    .map(([date, credits]) => ({ date, credits }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return { totalCreditsUsed, byTool, daily };
}
