import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Retrieve a business card by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const businessCard = await prisma.businessCard.findUnique({
      where: { id },
    });

    if (!businessCard) {
      return NextResponse.json(
        { error: 'Business card not found' },
        { status: 404 }
      );
    }

    // Check if expired
    if (businessCard.expiresAt && businessCard.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Business card has expired' },
        { status: 410 }
      );
    }

    // Increment view count (fire and forget)
    prisma.businessCard.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      card: {
        firstName: businessCard.firstName,
        lastName: businessCard.lastName,
        title: businessCard.title,
        company: businessCard.company,
        phone: businessCard.phone,
        email: businessCard.email,
        website: businessCard.website,
        address: businessCard.address,
        bgColor: businessCard.bgColor,
        textColor: businessCard.textColor,
        accentColor: businessCard.accentColor,
        photo: businessCard.photo,
      },
    });
  } catch (error) {
    console.error('Error fetching business card:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business card' },
      { status: 500 }
    );
  }
}
