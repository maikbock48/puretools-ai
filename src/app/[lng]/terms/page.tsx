import { Metadata } from 'next';
import { languages, Language } from '@/i18n/settings';
import TermsClient from './TermsClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lng: string }>;
}): Promise<Metadata> {
  const { lng: rawLng } = await params;
  const lng = languages.includes(rawLng as Language) ? (rawLng as Language) : 'en';

  const titles = {
    en: 'Terms of Service - PureTools AI',
    de: 'Nutzungsbedingungen - PureTools AI',
  };

  return {
    title: titles[lng],
    description: lng === 'de'
      ? 'Nutzungsbedingungen für PureTools AI. Einfache, faire Bedingungen für unsere kostenlosen und Premium-Tools.'
      : 'Terms of Service for PureTools AI. Simple, fair terms for our free and premium tools.',
  };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng: rawLng } = await params;
  const lng = languages.includes(rawLng as Language) ? (rawLng as Language) : 'en';

  return <TermsClient lng={lng} />;
}
