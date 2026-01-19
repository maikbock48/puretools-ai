import { Metadata } from 'next';
import { languages, Language } from '@/i18n/settings';
import AITranscriberClient from './AITranscriberClient';

const meta = {
  en: {
    title: 'AI Audio Transcriber - PureTools',
    description: 'Convert speech to text with Whisper AI. Support for 12+ languages. Export to TXT or SRT. Pay only what you use.',
  },
  de: {
    title: 'KI-Audio-Transkription - PureTools',
    description: 'Sprache in Text umwandeln mit Whisper AI. Unterstützung für 12+ Sprachen. Export als TXT oder SRT. Zahle nur was du nutzt.',
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

export default async function AITranscriberPage({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng: rawLng } = await params;
  const lng = languages.includes(rawLng as Language) ? (rawLng as Language) : 'en';

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <AITranscriberClient lng={lng} />
    </div>
  );
}
