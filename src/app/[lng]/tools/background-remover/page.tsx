import { Metadata } from 'next';
import { languages, Language } from '@/i18n/settings';
import BackgroundRemoverClient from './BackgroundRemoverClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lng: string }>;
}): Promise<Metadata> {
  const { lng: rawLng } = await params;
  const lng = languages.includes(rawLng as Language) ? (rawLng as Language) : 'en';

  const titles = {
    en: 'Background Remover - Remove Image Backgrounds Free - PureTools AI',
    de: 'Hintergrund Entfernen - Bildhintergründe kostenlos entfernen - PureTools AI',
  };

  const descriptions = {
    en: 'Free AI-powered background remover. Remove backgrounds from images instantly in your browser. No uploads, 100% private, no watermarks.',
    de: 'Kostenloser KI-gestützter Hintergrund-Entferner. Entfernen Sie Bildhintergründe sofort in Ihrem Browser. Keine Uploads, 100% privat, keine Wasserzeichen.',
  };

  return {
    title: titles[lng],
    description: descriptions[lng],
    keywords: lng === 'de'
      ? ['Hintergrund entfernen', 'Bildhintergrund löschen', 'KI', 'kostenlos', 'privat', 'ohne Wasserzeichen']
      : ['background remover', 'remove background', 'AI', 'free', 'private', 'no watermark'],
  };
}

export default async function BackgroundRemoverPage({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng: rawLng } = await params;
  const lng = languages.includes(rawLng as Language) ? (rawLng as Language) : 'en';

  return <BackgroundRemoverClient lng={lng} />;
}
