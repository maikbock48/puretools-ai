import { Metadata } from 'next';
import { languages, Language } from '@/i18n/settings';
import { prisma } from '@/lib/prisma';
import BusinessCardViewClient from './BusinessCardViewClient';

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ lng: string }>;
  searchParams: Promise<{ id?: string }>;
}): Promise<Metadata> {
  const { lng: rawLng } = await params;
  const { id } = await searchParams;
  const lng = languages.includes(rawLng as Language) ? (rawLng as Language) : 'en';

  if (!id) {
    return {
      title: lng === 'de' ? 'Visitenkarte nicht gefunden' : 'Business Card Not Found',
    };
  }

  // Fetch card data for metadata
  const card = await prisma.businessCard.findUnique({
    where: { id },
    select: { firstName: true, lastName: true, company: true },
  });

  if (!card) {
    return {
      title: lng === 'de' ? 'Visitenkarte nicht gefunden' : 'Business Card Not Found',
    };
  }

  const name = `${card.firstName} ${card.lastName}`;
  const company = card.company || '';

  return {
    title: lng === 'de'
      ? `${name} - Digitale Visitenkarte`
      : `${name} - Digital Business Card`,
    description: lng === 'de'
      ? `Digitale Visitenkarte von ${name}${company ? ` bei ${company}` : ''}. Scannen Sie den QR-Code um die Kontaktdaten zu speichern.`
      : `Digital business card of ${name}${company ? ` at ${company}` : ''}. Scan the QR code to save contact details.`,
    robots: 'noindex, nofollow',
  };
}

export default async function BusinessCardViewPage({
  params,
  searchParams,
}: {
  params: Promise<{ lng: string }>;
  searchParams: Promise<{ id?: string }>;
}) {
  const { lng: rawLng } = await params;
  const lng = languages.includes(rawLng as Language) ? (rawLng as Language) : 'en';
  const { id } = await searchParams;

  // If no ID provided, show error
  if (!id) {
    return (
      <BusinessCardViewClient
        lng={lng}
        cardData={{
          firstName: '',
          lastName: '',
          title: '',
          company: '',
          phone: '',
          email: '',
          website: '',
          address: '',
        }}
        colors={{
          bgColor: '#1e3a5f',
          textColor: '#ffffff',
          accentColor: '#60a5fa',
        }}
        photo={null}
        error={lng === 'de' ? 'Keine Karten-ID angegeben' : 'No card ID provided'}
      />
    );
  }

  // Fetch card from database
  const card = await prisma.businessCard.findUnique({
    where: { id },
  });

  // Check if card exists and not expired
  if (!card) {
    return (
      <BusinessCardViewClient
        lng={lng}
        cardData={{
          firstName: '',
          lastName: '',
          title: '',
          company: '',
          phone: '',
          email: '',
          website: '',
          address: '',
        }}
        colors={{
          bgColor: '#1e3a5f',
          textColor: '#ffffff',
          accentColor: '#60a5fa',
        }}
        photo={null}
        error={lng === 'de' ? 'Visitenkarte nicht gefunden' : 'Business card not found'}
      />
    );
  }

  if (card.expiresAt && card.expiresAt < new Date()) {
    return (
      <BusinessCardViewClient
        lng={lng}
        cardData={{
          firstName: '',
          lastName: '',
          title: '',
          company: '',
          phone: '',
          email: '',
          website: '',
          address: '',
        }}
        colors={{
          bgColor: '#1e3a5f',
          textColor: '#ffffff',
          accentColor: '#60a5fa',
        }}
        photo={null}
        error={lng === 'de' ? 'Diese Visitenkarte ist abgelaufen' : 'This business card has expired'}
      />
    );
  }

  // Increment view count (fire and forget)
  prisma.businessCard.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {});

  const cardData = {
    firstName: card.firstName,
    lastName: card.lastName,
    title: card.title || '',
    company: card.company || '',
    phone: card.phone || '',
    email: card.email || '',
    website: card.website || '',
    address: card.address || '',
  };

  const colors = {
    bgColor: card.bgColor,
    textColor: card.textColor,
    accentColor: card.accentColor,
  };

  return (
    <BusinessCardViewClient
      lng={lng}
      cardData={cardData}
      colors={colors}
      photo={card.photo}
    />
  );
}
