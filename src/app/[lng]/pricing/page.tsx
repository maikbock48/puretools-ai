import { Metadata } from 'next';
import { languages, Language } from '@/i18n/settings';
import PricingClient from './PricingClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lng: string }>;
}): Promise<Metadata> {
  const { lng: rawLng } = await params;
  const lng = languages.includes(rawLng as Language) ? (rawLng as Language) : 'en';

  const titles = {
    en: 'Pricing - PureTools AI | Free Local Tools & AI Credits',
    de: 'Preise - PureTools AI | Kostenlose Lokale Tools & KI-Credits',
  };

  const descriptions = {
    en: 'Local tools are always free. AI-powered features use a simple credit system. No subscriptions, no hidden fees.',
    de: 'Lokale Tools sind immer kostenlos. KI-Funktionen nutzen ein einfaches Credit-System. Keine Abos, keine versteckten Gebühren.',
  };

  return {
    title: titles[lng],
    description: descriptions[lng],
  };
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng: rawLng } = await params;
  const lng = languages.includes(rawLng as Language) ? (rawLng as Language) : 'en';

  return <PricingClient lng={lng} />;
}
