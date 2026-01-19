import { Metadata } from 'next';
import { languages, Language } from '@/i18n/settings';
import AITranslatorClient from './AITranslatorClient';

const meta = {
  en: {
    title: 'AI Document Translator - PureTools',
    description: 'Translate text and documents with AI precision. Support for 15+ languages. Pay only what you use.',
  },
  de: {
    title: 'KI-Dokumentübersetzer - PureTools',
    description: 'Texte und Dokumente mit KI-Präzision übersetzen. Unterstützung für 15+ Sprachen. Zahle nur was du nutzt.',
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

export default async function AITranslatorPage({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng: rawLng } = await params;
  const lng = languages.includes(rawLng as Language) ? (rawLng as Language) : 'en';

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <AITranslatorClient lng={lng} />
    </div>
  );
}
