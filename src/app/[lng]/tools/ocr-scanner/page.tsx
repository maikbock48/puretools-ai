import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { languages, Language } from '@/i18n/settings';

// Lazy load OCR scanner (includes Tesseract.js ~3MB)
const OcrScannerClient = dynamic(() => import('./OcrScannerClient'), {
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
    en: 'Privacy OCR Scanner - Extract Text from Images - PureTools AI',
    de: 'Datenschutz OCR Scanner - Text aus Bildern extrahieren - PureTools AI',
  };

  const descriptions = {
    en: 'Free private OCR scanner that extracts text from images directly in your browser. Supports 13+ languages. No uploads, 100% offline, completely private.',
    de: 'Kostenloser privater OCR-Scanner, der Text aus Bildern direkt in Ihrem Browser extrahiert. Unterstützt 13+ Sprachen. Keine Uploads, 100% offline, vollständig privat.',
  };

  return {
    title: titles[lng],
    description: descriptions[lng],
    keywords: lng === 'de'
      ? ['OCR', 'Texterkennung', 'Bild zu Text', 'kostenlos', 'privat', 'offline', 'mehrsprachig']
      : ['OCR', 'text recognition', 'image to text', 'free', 'private', 'offline', 'multilingual'],
  };
}

export default async function OcrScannerPage({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng: rawLng } = await params;
  const lng = languages.includes(rawLng as Language) ? (rawLng as Language) : 'en';

  return <OcrScannerClient lng={lng} />;
}
