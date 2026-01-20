import { Metadata } from 'next';
import { languages, Language } from '@/i18n/settings';
import { getTranslation } from '@/i18n/server';
import { generateToolMetadata, getStructuredData } from '@/lib/seo';
import StickerMakerClient from './StickerMakerClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lng: string }>;
}): Promise<Metadata> {
  const { lng: rawLng } = await params;
  const lng = languages.includes(rawLng as Language) ? (rawLng as Language) : 'en';
  const { t } = await getTranslation(lng);
  return generateToolMetadata('stickerMaker', t, lng);
}

export default async function StickerMakerPage({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng: rawLng } = await params;
  const lng = languages.includes(rawLng as Language) ? (rawLng as Language) : 'en';
  const { t } = await getTranslation(lng);

  const structuredData = getStructuredData('stickerMaker', t);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <StickerMakerClient lng={lng} />
    </>
  );
}
