import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUsageStats } from '@/lib/credits';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await getUsageStats(session.user.id);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Failed to fetch usage stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage stats' },
      { status: 500 }
    );
  }
}
