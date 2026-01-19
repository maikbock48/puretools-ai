import { Metadata } from 'next';
import { languages, Language } from '@/i18n/settings';
import { getTranslation } from '@/i18n/server';
import AboutClient from './AboutClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lng: string }>;
}): Promise<Metadata> {
  const { lng: rawLng } = await params;
  const lng = languages.includes(rawLng as Language) ? (rawLng as Language) : 'en';

  const titles = {
    en: 'About PureTools AI - Privacy-First Online Tools',
    de: 'Über PureTools AI - Datenschutz-orientierte Online-Tools',
  };

  const descriptions = {
    en: 'Learn about our mission to create privacy-first tools that run entirely in your browser. No data uploads, no tracking, just pure functionality.',
    de: 'Erfahren Sie mehr über unsere Mission, datenschutzorientierte Tools zu entwickeln, die vollständig in Ihrem Browser laufen.',
  };

  return {
    title: titles[lng],
    description: descriptions[lng],
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng: rawLng } = await params;
  const lng = languages.includes(rawLng as Language) ? (rawLng as Language) : 'en';

  return <AboutClient lng={lng} />;
}
