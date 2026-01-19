import { Metadata } from 'next';
import { languages, Language } from '@/i18n/settings';
import OcrScannerClient from './OcrScannerClient';

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
