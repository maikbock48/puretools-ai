import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendDay3TipsEmail, sendDay7ReminderEmail } from '@/lib/email';

// This endpoint is called by Vercel Cron daily at 8 AM
// It sends automated emails to users on day 3 and day 7 after signup

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (set in Vercel)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // Allow requests from Vercel Cron (they have special headers)
      const isVercelCron = request.headers.get('x-vercel-cron') === '1';
      if (!isVercelCron && process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const now = new Date();
    const results = {
      day3Sent: 0,
      day3Failed: 0,
      day7Sent: 0,
      day7Failed: 0,
    };

    // Calculate date ranges
    // Day 3: Users who signed up between 3-4 days ago
    const day3Start = new Date(now);
    day3Start.setDate(day3Start.getDate() - 4);
    day3Start.setHours(0, 0, 0, 0);

    const day3End = new Date(now);
    day3End.setDate(day3End.getDate() - 3);
    day3End.setHours(0, 0, 0, 0);

    // Day 7: Users who signed up between 7-8 days ago
    const day7Start = new Date(now);
    day7Start.setDate(day7Start.getDate() - 8);
    day7Start.setHours(0, 0, 0, 0);

    const day7End = new Date(now);
    day7End.setDate(day7End.getDate() - 7);
    day7End.setHours(0, 0, 0, 0);

    // Find users for Day 3 email
    const day3Users = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: day3Start,
          lt: day3End,
        },
        email: { not: null },
        day3EmailSent: false,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    // Find users for Day 7 email
    const day7Users = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: day7Start,
          lt: day7End,
        },
        email: { not: null },
        day7EmailSent: false,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    // Send Day 3 emails
    for (const user of day3Users) {
      if (!user.email) continue;

      const result = await sendDay3TipsEmail(
        user.email,
        user.name || 'there',
        'en' // Default to English, could be improved by storing user language preference
      );

      if (result.success) {
        await prisma.user.update({
          where: { id: user.id },
          data: { day3EmailSent: true },
        });
        results.day3Sent++;
      } else {
        results.day3Failed++;
        console.error(`Failed to send Day 3 email to ${user.email}:`, result.error);
      }
    }

    // Send Day 7 emails
    for (const user of day7Users) {
      if (!user.email) continue;

      const result = await sendDay7ReminderEmail(
        user.email,
        user.name || 'there',
        'en' // Default to English
      );

      if (result.success) {
        await prisma.user.update({
          where: { id: user.id },
          data: { day7EmailSent: true },
        });
        results.day7Sent++;
      } else {
        results.day7Failed++;
        console.error(`Failed to send Day 7 email to ${user.email}:`, result.error);
      }
    }

    console.log('Email cron completed:', results);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      sent: {
        day3: results.day3Sent,
        day7: results.day7Sent,
      },
      failed: {
        day3: results.day3Failed,
        day7: results.day7Failed,
      },
      queued: {
        day3: day3Users.length,
        day7: day7Users.length,
      },
    });
  } catch (error) {
    console.error('Email cron error:', error);
    return NextResponse.json(
      { error: 'Email cron failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
