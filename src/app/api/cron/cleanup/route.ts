import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// This endpoint is called by Vercel Cron daily at 3 AM
// It cleans up old data to keep the database lean

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (set in Vercel)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // Allow requests from Vercel Cron (they have special headers)
      const isVercelCron = request.headers.get('x-vercel-cron') === '1';
      if (!isVercelCron && process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const results = {
      expiredSessions: 0,
      oldUsageLogs: 0,
      inactiveSubscribers: 0,
    };

    // 1. Delete expired sessions (older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const expiredSessions = await prisma.session.deleteMany({
      where: {
        expires: {
          lt: thirtyDaysAgo,
        },
      },
    });
    results.expiredSessions = expiredSessions.count;

    // 2. Delete usage logs older than 90 days (keep for analytics)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const oldUsageLogs = await prisma.usageLog.deleteMany({
      where: {
        createdAt: {
          lt: ninetyDaysAgo,
        },
      },
    });
    results.oldUsageLogs = oldUsageLogs.count;

    // 3. Delete newsletter subscribers who unsubscribed more than 1 year ago
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const inactiveSubscribers = await prisma.newsletterSubscriber.deleteMany({
      where: {
        isActive: false,
        unsubscribedAt: {
          lt: oneYearAgo,
        },
      },
    });
    results.inactiveSubscribers = inactiveSubscribers.count;

    console.log('Cleanup completed:', results);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      cleaned: results,
    });
  } catch (error) {
    console.error('Cleanup cron error:', error);
    return NextResponse.json(
      { error: 'Cleanup failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
