import { Metadata } from 'next';
import { languages, Language } from '@/i18n/settings';
import PrivacyClient from './PrivacyClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lng: string }>;
}): Promise<Metadata> {
  const { lng: rawLng } = await params;
  const lng = languages.includes(rawLng as Language) ? (rawLng as Language) : 'en';

  const titles = {
    en: 'Privacy Policy - PureTools AI',
    de: 'Datenschutzerklärung - PureTools AI',
  };

  return {
    title: titles[lng],
    description: lng === 'de'
      ? 'Erfahren Sie, wie PureTools AI Ihre Privatsphäre schützt. Keine Datenerfassung, keine Tracking, 100% lokale Verarbeitung.'
      : 'Learn how PureTools AI protects your privacy. No data collection, no tracking, 100% local processing.',
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng: rawLng } = await params;
  const lng = languages.includes(rawLng as Language) ? (rawLng as Language) : 'en';

  return <PrivacyClient lng={lng} />;
}
