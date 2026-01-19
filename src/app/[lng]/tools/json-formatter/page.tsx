import { Metadata } from 'next';
import { languages, Language } from '@/i18n/settings';
import JsonFormatterClient from './JsonFormatterClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lng: string }>;
}): Promise<Metadata> {
  const { lng: rawLng } = await params;
  const lng = languages.includes(rawLng as Language) ? (rawLng as Language) : 'en';

  const titles = {
    en: 'JSON Formatter & Validator - PureTools AI',
    de: 'JSON Formatierer & Validator - PureTools AI',
  };

  const descriptions = {
    en: 'Free online JSON formatter, validator, and beautifier. Format, minify, and validate JSON data instantly in your browser. 100% private - no data uploaded.',
    de: 'Kostenloser Online JSON Formatierer, Validator und Verschönerer. Formatieren, minimieren und validieren Sie JSON-Daten sofort in Ihrem Browser. 100% privat - keine Daten hochgeladen.',
  };

  return {
    title: titles[lng],
    description: descriptions[lng],
    keywords: lng === 'de'
      ? ['JSON Formatierer', 'JSON Validator', 'JSON Beautifier', 'JSON minimieren', 'kostenlos', 'online', 'privat']
      : ['JSON formatter', 'JSON validator', 'JSON beautifier', 'JSON minify', 'free', 'online', 'private'],
  };
}

export default async function JsonFormatterPage({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng: rawLng } = await params;
  const lng = languages.includes(rawLng as Language) ? (rawLng as Language) : 'en';

  return <JsonFormatterClient lng={lng} />;
}
