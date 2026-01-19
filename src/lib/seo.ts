import { Metadata } from 'next';
import { Language } from '@/i18n/settings';

export type ToolKey =
  | 'qrGenerator'
  | 'imageCompressor'
  | 'heicConverter'
  | 'pdfToolkit'
  | 'ocr'
  | 'audioCutter'
  | 'backgroundRemover'
  | 'jsonFormatter'
  | 'aiTranslator'
  | 'aiTranscriber';

interface ToolSEOConfig {
  path: string;
  variant: 'local' | 'ai';
}

export const toolConfigs: Record<ToolKey, ToolSEOConfig> = {
  qrGenerator: { path: 'qr-generator', variant: 'local' },
  imageCompressor: { path: 'image-compressor', variant: 'local' },
  heicConverter: { path: 'heic-converter', variant: 'local' },
  pdfToolkit: { path: 'pdf-toolkit', variant: 'local' },
  ocr: { path: 'ocr', variant: 'local' },
  audioCutter: { path: 'audio-cutter', variant: 'local' },
  backgroundRemover: { path: 'background-remover', variant: 'local' },
  jsonFormatter: { path: 'json-formatter', variant: 'local' },
  aiTranslator: { path: 'ai-translator', variant: 'ai' },
  aiTranscriber: { path: 'ai-transcriber', variant: 'ai' },
};

export function generateToolMetadata(
  toolKey: ToolKey,
  t: (key: string) => string,
  lng: Language
): Metadata {
  const metaTitle = t(`tools.${toolKey}.metaTitle`);
  const metaDescription = t(`tools.${toolKey}.metaDescription`);
  const config = toolConfigs[toolKey];

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: getToolKeywords(toolKey, lng),
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: 'website',
      locale: lng === 'de' ? 'de_DE' : 'en_US',
      url: `https://puretools.ai/${lng}/tools/${config.path}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
    },
    alternates: {
      languages: {
        en: `/en/tools/${config.path}`,
        de: `/de/tools/${config.path}`,
      },
    },
  };
}

function getToolKeywords(toolKey: ToolKey, lng: Language): string[] {
  const keywordsMap: Record<Language, Record<ToolKey, string[]>> = {
    en: {
      qrGenerator: ['QR code', 'QR generator', 'custom QR', 'QR with logo', 'free QR'],
      imageCompressor: ['image compression', 'compress images', 'reduce file size', 'JPG compress', 'PNG compress'],
      heicConverter: ['HEIC to JPG', 'HEIC converter', 'iOS photos', 'iPhone photos', 'convert HEIC'],
      pdfToolkit: ['PDF merge', 'PDF split', 'combine PDF', 'PDF tools', 'free PDF'],
      ocr: ['OCR', 'text recognition', 'extract text', 'image to text', 'OCR free'],
      audioCutter: ['audio cutter', 'MP3 cutter', 'trim audio', 'cut MP3', 'audio editor'],
      backgroundRemover: ['remove background', 'background remover', 'transparent background', 'remove bg'],
      jsonFormatter: ['JSON formatter', 'JSON beautifier', 'format JSON', 'JSON validator'],
      aiTranslator: ['PDF translator', 'document translation', 'AI translation', 'translate PDF'],
      aiTranscriber: ['transcription', 'speech to text', 'audio transcription', 'video transcription', 'AI transcribe'],
    },
    de: {
      qrGenerator: ['QR-Code', 'QR-Generator', 'QR mit Logo', 'kostenloser QR'],
      imageCompressor: ['Bildkomprimierung', 'Bilder komprimieren', 'Dateigröße reduzieren'],
      heicConverter: ['HEIC zu JPG', 'HEIC Konverter', 'iOS Fotos', 'iPhone Fotos'],
      pdfToolkit: ['PDF zusammenführen', 'PDF teilen', 'PDF Tools', 'kostenlos PDF'],
      ocr: ['OCR', 'Texterkennung', 'Text extrahieren', 'Bild zu Text'],
      audioCutter: ['Audio schneiden', 'MP3 schneiden', 'Audio trimmen'],
      backgroundRemover: ['Hintergrund entfernen', 'transparenter Hintergrund'],
      jsonFormatter: ['JSON formatieren', 'JSON Formatter', 'JSON validieren'],
      aiTranslator: ['PDF übersetzen', 'Dokumentübersetzung', 'KI-Übersetzung'],
      aiTranscriber: ['Transkription', 'Sprache zu Text', 'Audio transkribieren'],
    },
  };

  return keywordsMap[lng][toolKey] || [];
}

export function getCanonicalUrl(lng: Language, path: string): string {
  return `https://puretools.ai/${lng}${path}`;
}

export function getStructuredData(toolKey: ToolKey, t: (key: string) => string) {
  const config = toolConfigs[toolKey];

  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: t(`tools.${toolKey}.title`),
    description: t(`tools.${toolKey}.metaDescription`),
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: config.variant === 'local' ? '0' : undefined,
      priceCurrency: 'USD',
    },
    featureList: config.variant === 'local' ? ['Privacy-first', 'No data upload', 'Works offline'] : ['AI-powered', 'Cloud processing'],
  };
}
