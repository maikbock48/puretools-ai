import { describe, it, expect, vi, beforeEach } from 'vitest';

// Create hoisted mocks
const { mockPrisma } = vi.hoisted(() => {
  return {
    mockPrisma: {
      user: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      transaction: {
        create: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
      },
      usageLog: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
      $transaction: vi.fn(),
    },
  };
});

vi.mock('@/lib/prisma', () => ({
  default: mockPrisma,
}));

// Import after mocking
import {
  hasEnoughCredits,
  getUserCredits,
  useCredits,
  addCredits,
  getTransactionHistory,
  getUsageStats,
} from '@/lib/credits';

describe('Credits System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('hasEnoughCredits', () => {
    it('returns true when user has enough credits', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ credits: 100 });

      const result = await hasEnoughCredits('user-123', 50);

      expect(result).toBe(true);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        select: { credits: true },
      });
    });

    it('returns false when user has insufficient credits', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ credits: 30 });

      const result = await hasEnoughCredits('user-123', 50);

      expect(result).toBe(false);
    });

    it('returns false when user has exactly the required amount', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ credits: 50 });

      const result = await hasEnoughCredits('user-123', 50);

      expect(result).toBe(true);
    });

    it('returns false when user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await hasEnoughCredits('user-123', 50);

      expect(result).toBe(false);
    });
  });

  describe('getUserCredits', () => {
    it('returns user credits when user exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ credits: 75 });

      const result = await getUserCredits('user-123');

      expect(result).toBe(75);
    });

    it('returns 0 when user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await getUserCredits('user-123');

      expect(result).toBe(0);
    });
  });

  describe('useCredits', () => {
    it('successfully deducts credits for valid transaction', async () => {
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          user: {
            findUnique: vi.fn().mockResolvedValue({ credits: 100 }),
            update: vi.fn().mockResolvedValue({ credits: 90 }),
          },
          transaction: { create: vi.fn() },
          usageLog: { create: vi.fn() },
        };
        return callback(tx);
      });

      const result = await useCredits({
        userId: 'user-123',
        amount: 10,
        toolType: 'translate',
        description: 'Translation of 500 words',
      });

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(90);
      expect(result.error).toBeUndefined();
    });

    it('fails when user has insufficient credits', async () => {
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          user: {
            findUnique: vi.fn().mockResolvedValue({ credits: 5 }),
          },
        };
        return callback(tx);
      });
      mockPrisma.user.findUnique.mockResolvedValue({ credits: 5 });

      const result = await useCredits({
        userId: 'user-123',
        amount: 10,
        toolType: 'translate',
        description: 'Translation',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Insufficient credits');
    });

    it('includes metadata when provided', async () => {
      const createTransactionMock = vi.fn();
      const createUsageLogMock = vi.fn();

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          user: {
            findUnique: vi.fn().mockResolvedValue({ credits: 100 }),
            update: vi.fn().mockResolvedValue({ credits: 95 }),
          },
          transaction: { create: createTransactionMock },
          usageLog: { create: createUsageLogMock },
        };
        return callback(tx);
      });

      await useCredits({
        userId: 'user-123',
        amount: 5,
        toolType: 'summarize',
        description: 'Summarization',
        inputSize: 1000,
        outputSize: 200,
        metadata: { language: 'en' },
      });

      expect(createUsageLogMock).toHaveBeenCalledWith({
        data: expect.objectContaining({
          inputSize: 1000,
          outputSize: 200,
          metadata: JSON.stringify({ language: 'en' }),
        }),
      });
    });
  });

  describe('addCredits', () => {
    it('successfully adds credits for purchase', async () => {
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          user: {
            update: vi.fn().mockResolvedValue({ credits: 150 }),
          },
          transaction: { create: vi.fn() },
        };
        return callback(tx);
      });

      const result = await addCredits({
        userId: 'user-123',
        amount: 50,
        type: 'PURCHASE',
        description: 'Credit package purchase',
      });

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(150);
    });

    it('adds bonus credits for new users', async () => {
      const createTransactionMock = vi.fn();

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          user: {
            update: vi.fn().mockResolvedValue({ credits: 10 }),
          },
          transaction: { create: createTransactionMock },
        };
        return callback(tx);
      });

      await addCredits({
        userId: 'user-123',
        amount: 10,
        type: 'BONUS',
        description: 'Welcome bonus',
      });

      expect(createTransactionMock).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: 'BONUS',
          amount: 10,
        }),
      });
    });
  });

  describe('getTransactionHistory', () => {
    it('returns transactions with pagination', async () => {
      const mockTransactions = [
        { id: '1', type: 'PURCHASE', amount: 50, description: 'Purchase', createdAt: new Date() },
        { id: '2', type: 'USAGE', amount: -5, description: 'Translation', createdAt: new Date() },
      ];

      mockPrisma.transaction.findMany.mockResolvedValue(mockTransactions);
      mockPrisma.transaction.count.mockResolvedValue(10);

      const result = await getTransactionHistory('user-123', 20, 0);

      expect(result.transactions).toHaveLength(2);
      expect(result.total).toBe(10);
      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: { createdAt: 'desc' },
        take: 20,
        skip: 0,
        select: expect.any(Object),
      });
    });

    it('supports custom limit and offset', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([]);
      mockPrisma.transaction.count.mockResolvedValue(0);

      await getTransactionHistory('user-123', 5, 10);

      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5,
          skip: 10,
        })
      );
    });
  });

  describe('getUsageStats', () => {
    it('returns aggregated usage statistics', async () => {
      const mockUsage = [
        { toolType: 'translate', credits: 10, createdAt: new Date('2026-01-15') },
        { toolType: 'translate', credits: 5, createdAt: new Date('2026-01-15') },
        { toolType: 'summarize', credits: 3, createdAt: new Date('2026-01-16') },
      ];

      mockPrisma.usageLog.findMany.mockResolvedValue(mockUsage);

      const result = await getUsageStats('user-123', 30);

      expect(result.totalCreditsUsed).toBe(18);
      expect(result.byTool).toEqual({
        translate: 15,
        summarize: 3,
      });
      expect(result.daily).toHaveLength(2);
    });

    it('returns empty stats when no usage', async () => {
      mockPrisma.usageLog.findMany.mockResolvedValue([]);

      const result = await getUsageStats('user-123', 30);

      expect(result.totalCreditsUsed).toBe(0);
      expect(result.byTool).toEqual({});
      expect(result.daily).toHaveLength(0);
    });

    it('filters by date range', async () => {
      mockPrisma.usageLog.findMany.mockResolvedValue([]);

      await getUsageStats('user-123', 7);

      expect(mockPrisma.usageLog.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          createdAt: { gte: expect.any(Date) },
        },
        select: expect.any(Object),
      });
    });
  });
});
