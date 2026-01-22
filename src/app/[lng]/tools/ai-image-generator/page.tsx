import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { languages, Language } from '@/i18n/settings';

// Lazy load the AI Image Generator client
const AIImageGeneratorClient = dynamic(() => import('./AIImageGeneratorClient'), {
  loading: () => (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-5xl px-4 animate-pulse">
        <div className="h-16 w-16 mx-auto rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-4 h-8 w-64 mx-auto rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-8 h-64 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  ),
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lng: string }>;
}): Promise<Metadata> {
  const { lng: rawLng } = await params;
  const lng = languages.includes(rawLng as Language) ? (rawLng as Language) : 'en';

  const titles = {
    en: 'AI Image Generator - Create Images from Text - PureTools AI',
    de: 'KI Bildgenerator - Bilder aus Text erstellen - PureTools AI',
  };

  const descriptions = {
    en: 'Generate stunning images from text descriptions using DALL-E 3. Create art, illustrations, and photos with AI. Multiple sizes and styles available.',
    de: 'Erstellen Sie beeindruckende Bilder aus Textbeschreibungen mit DALL-E 3. Kunst, Illustrationen und Fotos mit KI generieren. Verschiedene Größen und Stile verfügbar.',
  };

  return {
    title: titles[lng],
    description: descriptions[lng],
    keywords: lng === 'de'
      ? ['KI Bildgenerator', 'Text zu Bild', 'DALL-E', 'AI Art', 'Bildgenerierung', 'KI Kunst']
      : ['AI image generator', 'text to image', 'DALL-E', 'AI art', 'image generation', 'AI artwork'],
  };
}

export default async function AIImageGeneratorPage({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng: rawLng } = await params;
  const lng = languages.includes(rawLng as Language) ? (rawLng as Language) : 'en';

  return <AIImageGeneratorClient lng={lng} />;
}
