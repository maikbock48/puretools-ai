import { describe, it, expect, vi, beforeEach } from 'vitest';

// Create hoisted mocks
const { mockPrisma } = vi.hoisted(() => {
  return {
    mockPrisma: {
      newsletterSubscriber: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
    },
  };
});

vi.mock('@/lib/prisma', () => ({
  default: mockPrisma,
}));

// Mock rate limit to always allow
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(() => ({ allowed: true, remaining: 59, resetIn: 60000 })),
  RATE_LIMITS: { api: { interval: 60000, limit: 60 } },
}));

// Import after mocking
import { POST, DELETE } from '@/app/api/newsletter/subscribe/route';
import { NextRequest } from 'next/server';

function createMockRequest(
  method: string,
  body?: Record<string, unknown>,
  url = 'http://localhost/api/newsletter/subscribe'
): NextRequest {
  return {
    method,
    json: () => Promise.resolve(body || {}),
    url,
    headers: new Map(),
    nextUrl: new URL(url),
  } as unknown as NextRequest;
}

describe('Newsletter API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/newsletter/subscribe', () => {
    it('creates new subscriber with valid email', async () => {
      mockPrisma.newsletterSubscriber.findUnique.mockResolvedValue(null);
      mockPrisma.newsletterSubscriber.create.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        language: 'en',
        isActive: true,
      });

      const request = createMockRequest('POST', {
        email: 'test@example.com',
        language: 'en',
        source: 'website',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.message).toBe('subscribed');
      expect(mockPrisma.newsletterSubscriber.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          language: 'en',
          source: 'website',
        },
      });
    });

    it('returns error for missing email', async () => {
      const request = createMockRequest('POST', {});

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Email is required');
    });

    it('returns error for invalid email format', async () => {
      const request = createMockRequest('POST', { email: 'invalid-email' });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid email format');
    });

    it('handles already subscribed users', async () => {
      mockPrisma.newsletterSubscriber.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        isActive: true,
      });

      const request = createMockRequest('POST', { email: 'test@example.com' });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('already_subscribed');
    });

    it('reactivates inactive subscriber', async () => {
      mockPrisma.newsletterSubscriber.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        isActive: false,
      });
      mockPrisma.newsletterSubscriber.update.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        isActive: true,
      });

      const request = createMockRequest('POST', {
        email: 'test@example.com',
        language: 'de',
        source: 'footer',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('resubscribed');
      expect(mockPrisma.newsletterSubscriber.update).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        data: expect.objectContaining({
          isActive: true,
          language: 'de',
          source: 'footer',
        }),
      });
    });

    it('normalizes email to lowercase', async () => {
      mockPrisma.newsletterSubscriber.findUnique.mockResolvedValue(null);
      mockPrisma.newsletterSubscriber.create.mockResolvedValue({});

      const request = createMockRequest('POST', { email: 'TEST@EXAMPLE.COM' });

      await POST(request);

      expect(mockPrisma.newsletterSubscriber.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'test@example.com',
        }),
      });
    });
  });

  describe('DELETE /api/newsletter/subscribe', () => {
    it('unsubscribes existing subscriber', async () => {
      mockPrisma.newsletterSubscriber.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        isActive: true,
      });
      mockPrisma.newsletterSubscriber.update.mockResolvedValue({});

      const request = createMockRequest(
        'DELETE',
        undefined,
        'http://localhost/api/newsletter/subscribe?email=test@example.com'
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('unsubscribed');
    });

    it('returns error for missing email', async () => {
      const request = createMockRequest('DELETE');

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Email is required');
    });

    it('returns error for non-existent subscriber', async () => {
      mockPrisma.newsletterSubscriber.findUnique.mockResolvedValue(null);

      const request = createMockRequest(
        'DELETE',
        undefined,
        'http://localhost/api/newsletter/subscribe?email=notfound@example.com'
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Subscriber not found');
    });
  });
});
