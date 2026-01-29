import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getOrCreateReferralCode } from '@/lib/referral';
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

    const code = await getOrCreateReferralCode(session.user.id);

    return NextResponse.json({
      code,
      link: `https://puretools.ai?ref=${code}`,
    });
  } catch (error) {
    console.error('Failed to get referral code:', error);
    return NextResponse.json(
      { error: 'Failed to get referral code' },
      { status: 500 }
    );
  }
}
