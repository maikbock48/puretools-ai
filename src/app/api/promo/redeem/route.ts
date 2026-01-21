import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { redeemCreditsPromoCode, promoCodeErrors } from '@/lib/promo';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { code, language = 'en' } = body as { code: string; language?: string };

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const result = await redeemCreditsPromoCode(code.trim(), session.user.id);

    if (!result.success) {
      const lang = language === 'de' ? 'de' : 'en';
      const errorKey = result.error as keyof typeof promoCodeErrors.en;
      const errorMessage = promoCodeErrors[lang][errorKey] || result.error;

      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      credits: result.credits,
      message: language === 'de'
        ? `${result.credits} Credits wurden deinem Konto gutgeschrieben!`
        : `${result.credits} credits have been added to your account!`,
    });
  } catch (error) {
    console.error('Promo redemption error:', error);
    return NextResponse.json(
      { error: 'Failed to redeem promo code' },
      { status: 500 }
    );
  }
}
