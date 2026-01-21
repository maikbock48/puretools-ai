import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { languages, Language } from '@/i18n/settings';
import { getTranslation } from '@/i18n/server';
import { generateToolMetadata, getStructuredData } from '@/lib/seo';

// Lazy load the heavy video trimmer component (includes FFmpeg.wasm)
const VideoTrimmerClient = dynamic(() => import('./VideoTrimmerClient'), {
  loading: () => (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            <div className="mt-4 h-8 w-64 mx-auto rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="mt-2 h-4 w-96 mx-auto rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
          <div className="h-64 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
        </div>
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
  const { t } = await getTranslation(lng);
  return generateToolMetadata('videoTrimmer', t, lng);
}

export default async function VideoTrimmerPage({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng: rawLng } = await params;
  const lng = languages.includes(rawLng as Language) ? (rawLng as Language) : 'en';
  const { t } = await getTranslation(lng);

  const structuredData = getStructuredData('videoTrimmer', t);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <VideoTrimmerClient lng={lng} />
    </>
  );
}
