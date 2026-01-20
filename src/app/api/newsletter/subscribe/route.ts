import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    // Rate limit check
    const { allowed, remaining, resetIn } = checkRateLimit(request, RATE_LIMITS.api);

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': Math.ceil(resetIn / 1000).toString(),
          },
        }
      );
    }

    const body = await request.json();
    const { email, language = 'en', source = 'website' } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email: trimmedEmail },
    });

    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        // Already subscribed and active
        return NextResponse.json(
          { success: true, message: 'already_subscribed' },
          { status: 200 }
        );
      } else {
        // Reactivate subscription
        await prisma.newsletterSubscriber.update({
          where: { email: trimmedEmail },
          data: {
            isActive: true,
            language,
            source,
            unsubscribedAt: null,
          },
        });

        return NextResponse.json(
          { success: true, message: 'resubscribed' },
          { status: 200 }
        );
      }
    }

    // Create new subscriber
    await prisma.newsletterSubscriber.create({
      data: {
        email: trimmedEmail,
        language,
        source,
      },
    });

    return NextResponse.json(
      { success: true, message: 'subscribed' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    );
  }
}

// Unsubscribe endpoint
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email: trimmedEmail },
    });

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Subscriber not found' },
        { status: 404 }
      );
    }

    // Soft delete - mark as inactive
    await prisma.newsletterSubscriber.update({
      where: { email: trimmedEmail },
      data: {
        isActive: false,
        unsubscribedAt: new Date(),
      },
    });

    return NextResponse.json(
      { success: true, message: 'unsubscribed' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe. Please try again.' },
      { status: 500 }
    );
  }
}
