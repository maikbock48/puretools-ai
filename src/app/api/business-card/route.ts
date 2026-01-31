import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';

// POST - Create a new shareable business card
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      firstName,
      lastName,
      title,
      company,
      phone,
      email,
      website,
      address,
      bgColor,
      textColor,
      accentColor,
      photo,
    } = body;

    // Validate required fields
    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      );
    }

    // Generate a short, URL-friendly ID
    const id = nanoid(10);

    // Set expiration to 1 year from now
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const businessCard = await prisma.businessCard.create({
      data: {
        id,
        firstName,
        lastName,
        title: title || null,
        company: company || null,
        phone: phone || null,
        email: email || null,
        website: website || null,
        address: address || null,
        bgColor: bgColor || '#1e3a5f',
        textColor: textColor || '#ffffff',
        accentColor: accentColor || '#60a5fa',
        photo: photo || null,
        expiresAt,
      },
    });

    return NextResponse.json({
      success: true,
      id: businessCard.id,
    });
  } catch (error) {
    console.error('Error creating business card:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to create business card: ${errorMessage}` },
      { status: 500 }
    );
  }
}
