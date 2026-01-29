import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { validatePromoCode, promoCodeErrors } from '@/lib/promo';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting - stricter for promo validation to prevent brute force
    const { allowed, resetIn } = checkRateLimit(request, RATE_LIMITS.api);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests', retryAfter: Math.ceil(resetIn / 1000) },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { code, language = 'en' } = body as { code: string; language?: string };

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const result = await validatePromoCode(code.trim(), session.user.id);

    if (!result.valid) {
      const lang = language === 'de' ? 'de' : 'en';
      const errorKey = result.error as keyof typeof promoCodeErrors.en;
      const errorMessage = promoCodeErrors[lang][errorKey] || result.error;

      return NextResponse.json(
        { valid: false, error: errorMessage },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      promoCode: {
        code: result.promoCode!.code,
        type: result.promoCode!.type,
        value: result.promoCode!.value,
      },
    });
  } catch (error) {
    console.error('Promo validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate promo code' },
      { status: 500 }
    );
  }
}
