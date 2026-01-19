import { Metadata } from 'next';
import { languages, Language } from '@/i18n/settings';
import ImpressumClient from './ImpressumClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lng: string }>;
}): Promise<Metadata> {
  const { lng: rawLng } = await params;
  const lng = languages.includes(rawLng as Language) ? (rawLng as Language) : 'en';

  const titles = {
    en: 'Legal Notice - PureTools AI',
    de: 'Impressum - PureTools AI',
  };

  const descriptions = {
    en: 'Legal notice and company information for PureTools AI according to German law (§ 5 TMG).',
    de: 'Impressum und Unternehmensangaben für PureTools AI gemäß § 5 TMG.',
  };

  return {
    title: titles[lng],
    description: descriptions[lng],
  };
}

export default async function ImpressumPage({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng: rawLng } = await params;
  const lng = languages.includes(rawLng as Language) ? (rawLng as Language) : 'en';

  return <ImpressumClient lng={lng} />;
}
