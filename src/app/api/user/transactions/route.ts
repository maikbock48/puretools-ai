import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getTransactionHistory } from '@/lib/credits';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { transactions, total } = await getTransactionHistory(session.user.id);

    return NextResponse.json({ transactions, total });
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
