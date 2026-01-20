import { Metadata } from 'next';
import { Language } from '@/i18n/settings';

export type ToolKey =
  | 'qrGenerator'
  | 'imageCompressor'
  | 'heicConverter'
  | 'pdfToolkit'
  | 'pdfToJpg'
  | 'videoTrimmer'
  | 'wifiQr'
  | 'ocr'
  | 'audioCutter'
  | 'audioConverter'
  | 'socialCropper'
  | 'bacCalculator'
  | 'stickerMaker'
  | 'qrBusinessCard'
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
  pdfToJpg: { path: 'pdf-to-jpg', variant: 'local' },
  videoTrimmer: { path: 'video-trimmer', variant: 'local' },
  wifiQr: { path: 'wifi-qr', variant: 'local' },
  ocr: { path: 'ocr', variant: 'local' },
  audioCutter: { path: 'audio-cutter', variant: 'local' },
  audioConverter: { path: 'audio-converter', variant: 'local' },
  socialCropper: { path: 'social-cropper', variant: 'local' },
  bacCalculator: { path: 'bac-calculator', variant: 'local' },
  stickerMaker: { path: 'sticker-maker', variant: 'local' },
  qrBusinessCard: { path: 'qr-business-card', variant: 'local' },
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
      pdfToJpg: ['PDF to JPG', 'PDF to image', 'convert PDF', 'PDF converter', 'PDF to PNG'],
      videoTrimmer: ['video trimmer', 'video cutter', 'trim video', 'cut video', 'mute video'],
      wifiQr: ['WiFi QR code', 'WiFi QR generator', 'share WiFi', 'WiFi password QR', 'guest WiFi'],
      ocr: ['OCR', 'text recognition', 'extract text', 'image to text', 'OCR free'],
      audioCutter: ['audio cutter', 'MP3 cutter', 'trim audio', 'cut MP3', 'audio editor'],
      audioConverter: ['audio converter', 'convert to MP3', 'WAV to MP3', 'FLAC to MP3', 'audio to MP3'],
      socialCropper: ['social media cropper', 'Instagram crop', 'Facebook image size', 'Twitter image', 'YouTube thumbnail'],
      bacCalculator: ['BAC calculator', 'blood alcohol', 'alcohol calculator', 'promille calculator', 'drink calculator'],
      stickerMaker: ['sticker maker', 'create stickers', 'photo sticker', 'sticker with outline', 'WhatsApp sticker'],
      qrBusinessCard: ['QR business card', 'digital business card', 'vCard QR', 'contact QR code', 'business card generator'],
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
      pdfToJpg: ['PDF zu JPG', 'PDF zu Bild', 'PDF konvertieren', 'PDF Konverter'],
      videoTrimmer: ['Video schneiden', 'Video trimmen', 'Video kürzen', 'Ton entfernen'],
      wifiQr: ['WLAN QR-Code', 'WLAN teilen', 'WiFi QR Generator', 'Gast WLAN'],
      ocr: ['OCR', 'Texterkennung', 'Text extrahieren', 'Bild zu Text'],
      audioCutter: ['Audio schneiden', 'MP3 schneiden', 'Audio trimmen'],
      audioConverter: ['Audio Konverter', 'zu MP3 konvertieren', 'WAV zu MP3', 'FLAC zu MP3'],
      socialCropper: ['Social Media Cropper', 'Instagram zuschneiden', 'Facebook Bildgröße', 'YouTube Thumbnail'],
      bacCalculator: ['Promillerechner', 'Blutalkohol', 'Alkoholrechner', 'BAC Rechner', 'Promille berechnen'],
      stickerMaker: ['Sticker erstellen', 'Foto Sticker', 'Sticker mit Umrandung', 'WhatsApp Sticker', 'Aufkleber Generator'],
      qrBusinessCard: ['QR Visitenkarte', 'digitale Visitenkarte', 'vCard QR', 'Kontakt QR-Code', 'Visitenkarten Generator'],
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
