import { Metadata } from 'next';
import { languages, Language } from '@/i18n/settings';
import AISummarizerClient from './AISummarizerClient';

const meta = {
  en: {
    title: 'AI Text Summarizer - PureTools',
    description: 'Condense long texts into concise summaries with AI. Choose bullet points, paragraphs, or executive style. Pay only what you use.',
  },
  de: {
    title: 'KI-Textzusammenfassung - PureTools',
    description: 'Lange Texte mit KI zu prägnanten Zusammenfassungen verdichten. Wähle Stichpunkte, Absätze oder Executive-Stil. Zahle nur was du nutzt.',
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lng: string }>;
}): Promise<Metadata> {
  const { lng: rawLng } = await params;
  const lng = languages.includes(rawLng as Language) ? (rawLng as Language) : 'en';
  const t = meta[lng];

  return {
    title: t.title,
    description: t.description,
    openGraph: {
      title: t.title,
      description: t.description,
    },
  };
}

export default async function AISummarizerPage({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng: rawLng } = await params;
  const lng = languages.includes(rawLng as Language) ? (rawLng as Language) : 'en';

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <AISummarizerClient lng={lng} />
    </div>
  );
}
