import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getOrCreateReferralCode } from '@/lib/referral';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
