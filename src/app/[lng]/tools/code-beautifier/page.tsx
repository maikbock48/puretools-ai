import { Metadata } from 'next';
import { languages, Language } from '@/i18n/settings';
import CodeBeautifierClient from './CodeBeautifierClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lng: string }>;
}): Promise<Metadata> {
  const { lng: rawLng } = await params;
  const lng = languages.includes(rawLng as Language) ? (rawLng as Language) : 'en';

  const titles = {
    en: 'Code Beautifier - Format JS, TS, HTML, CSS, JSON - PureTools AI',
    de: 'Code Verschönerer - JS, TS, HTML, CSS, JSON formatieren - PureTools AI',
  };

  const descriptions = {
    en: 'Free online code beautifier and formatter. Format JavaScript, TypeScript, HTML, CSS, JSON, and more. Runs entirely in your browser.',
    de: 'Kostenloser Online-Code-Formatierer und Verschönerer. Formatieren Sie JavaScript, TypeScript, HTML, CSS, JSON und mehr. Läuft vollständig in Ihrem Browser.',
  };

  return {
    title: titles[lng],
    description: descriptions[lng],
    keywords: lng === 'de'
      ? ['Code formatieren', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'JSON', 'Prettier', 'kostenlos']
      : ['code formatter', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'JSON', 'Prettier', 'free', 'beautifier'],
  };
}

export default async function CodeBeautifierPage({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng: rawLng } = await params;
  const lng = languages.includes(rawLng as Language) ? (rawLng as Language) : 'en';

  return <CodeBeautifierClient lng={lng} />;
}
