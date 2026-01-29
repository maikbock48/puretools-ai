import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getReferralStats } from '@/lib/referral';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const { allowed, resetIn } = checkRateLimit(request, RATE_LIMITS.api);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests', retryAfter: Math.ceil(resetIn / 1000) },
        { status: 429 }
      );
    }

    const stats = await getReferralStats(session.user.id);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Failed to get referral stats:', error);
    return NextResponse.json(
      { error: 'Failed to get referral stats' },
      { status: 500 }
    );
  }
}
