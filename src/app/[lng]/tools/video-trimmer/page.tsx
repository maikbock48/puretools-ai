import { Metadata } from 'next';
import { languages, Language } from '@/i18n/settings';
import { getTranslation } from '@/i18n/server';
import { generateToolMetadata, getStructuredData } from '@/lib/seo';
import VideoTrimmerClient from './VideoTrimmerClient';

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
