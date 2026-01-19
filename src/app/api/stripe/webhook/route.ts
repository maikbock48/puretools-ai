import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { addCredits } from '@/lib/credits';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;

      const userId = session.metadata?.userId;
      const credits = parseInt(session.metadata?.credits || '0', 10);
      const packageId = session.metadata?.packageId;

      if (!userId || !credits) {
        console.error('Missing metadata in checkout session:', session.id);
        break;
      }

      // Add credits to user
      const result = await addCredits({
        userId,
        amount: credits,
        type: 'PURCHASE',
        description: `Credit purchase - ${packageId}`,
        metadata: {
          stripeSessionId: session.id,
          stripePaymentIntent: session.payment_intent,
          packageId,
        },
      });

      if (result.success) {
        console.log(`Added ${credits} credits to user ${userId}`);
      } else {
        console.error(`Failed to add credits: ${result.error}`);
      }

      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.error('Payment failed:', paymentIntent.id);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

// Disable body parsing, we need raw body for webhook verification
export const config = {
  api: {
    bodyParser: false,
  },
};
