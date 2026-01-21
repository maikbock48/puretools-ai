import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { languages, Language } from '@/i18n/settings';

// Lazy load audio cutter (includes FFmpeg.wasm)
const AudioCutterClient = dynamic(() => import('./AudioCutterClient'), {
  loading: () => (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-5xl px-4 animate-pulse">
        <div className="h-16 w-16 mx-auto rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-4 h-8 w-48 mx-auto rounded bg-zinc-200 dark:bg-zinc-800" />
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
    en: 'Audio Cutter - Trim Audio Files Online Free - PureTools AI',
    de: 'Audio Schneider - Audio-Dateien kostenlos online schneiden - PureTools AI',
  };

  const descriptions = {
    en: 'Free online audio cutter and trimmer. Cut MP3, WAV, OGG files directly in your browser. No uploads, 100% private. Visual waveform editor.',
    de: 'Kostenloser Online-Audio-Schneider und -Trimmer. Schneiden Sie MP3, WAV, OGG-Dateien direkt in Ihrem Browser. Keine Uploads, 100% privat. Visueller Wellenform-Editor.',
  };

  return {
    title: titles[lng],
    description: descriptions[lng],
    keywords: lng === 'de'
      ? ['Audio schneiden', 'MP3 schneiden', 'Audio trimmen', 'kostenlos', 'online', 'privat', 'Wellenform']
      : ['audio cutter', 'MP3 cutter', 'trim audio', 'free', 'online', 'private', 'waveform editor'],
  };
}

export default async function AudioCutterPage({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng: rawLng } = await params;
  const lng = languages.includes(rawLng as Language) ? (rawLng as Language) : 'en';

  return <AudioCutterClient lng={lng} />;
}
