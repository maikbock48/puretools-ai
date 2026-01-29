import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { stripe, getPackageById, CreditPackageId } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

// Allowed languages to prevent open redirect
const ALLOWED_LANGUAGES = ['en', 'de'];

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { packageId, language: rawLanguage = 'en' } = body as {
      packageId: CreditPackageId;
      language?: string;
    };

    // Validate language to prevent open redirect
    const language = ALLOWED_LANGUAGES.includes(rawLanguage) ? rawLanguage : 'en';

    const creditPackage = getPackageById(packageId);

    if (!creditPackage) {
      return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
    }

    // Get or create Stripe customer
    let stripeCustomerId: string;

    const existingCustomer = await prisma.stripeCustomer.findUnique({
      where: { userId: session.user.id },
    });

    if (existingCustomer) {
      stripeCustomerId = existingCustomer.stripeCustomerId;
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: session.user.email || undefined,
        name: session.user.name || undefined,
        metadata: {
          userId: session.user.id,
        },
      });

      await prisma.stripeCustomer.create({
        data: {
          userId: session.user.id,
          stripeCustomerId: customer.id,
        },
      });

      stripeCustomerId = customer.id;
    }

    // Create checkout session
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: creditPackage.currency,
            product_data: {
              name: `${creditPackage.credits} Credits`,
              description: `PureTools AI Credit Package - ${creditPackage.name}`,
            },
            unit_amount: creditPackage.price,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: session.user.id,
        packageId: creditPackage.id,
        credits: creditPackage.credits.toString(),
      },
      success_url: `${baseUrl}/${language}/dashboard?payment=success`,
      cancel_url: `${baseUrl}/${language}/pricing?payment=cancelled`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
