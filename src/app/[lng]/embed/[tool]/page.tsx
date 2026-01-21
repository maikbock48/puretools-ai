import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import { languages, Language } from '@/i18n/settings';
import EmbedWrapper from '@/components/EmbedWrapper';

// Map of available embeddable tools
const toolComponents: Record<string, {
  component: React.ComponentType<{ lng: Language }>;
  name: { en: string; de: string };
}> = {
  'qr-generator': {
    component: dynamic(() => import('../../tools/qr-generator/QRGeneratorClient')),
    name: { en: 'QR Code Generator', de: 'QR-Code Generator' },
  },
  'image-compressor': {
    component: dynamic(() => import('../../tools/image-compressor/ImageCompressorClient')),
    name: { en: 'Image Compressor', de: 'Bildkompressor' },
  },
  'json-formatter': {
    component: dynamic(() => import('../../tools/json-formatter/JsonFormatterClient')),
    name: { en: 'JSON Formatter', de: 'JSON Formatierer' },
  },
  'code-beautifier': {
    component: dynamic(() => import('../../tools/code-beautifier/CodeBeautifierClient')),
    name: { en: 'Code Beautifier', de: 'Code Verschönerer' },
  },
  'heic-converter': {
    component: dynamic(() => import('../../tools/heic-converter/HeicConverterClient')),
    name: { en: 'HEIC Converter', de: 'HEIC Konverter' },
  },
  'wifi-qr': {
    component: dynamic(() => import('../../tools/wifi-qr/WifiQrClient')),
    name: { en: 'WiFi QR Generator', de: 'WiFi QR Generator' },
  },
  'csv-to-excel': {
    component: dynamic(() => import('../../tools/csv-to-excel/CsvToExcelClient')),
    name: { en: 'CSV to Excel', de: 'CSV zu Excel' },
  },
  'bac-calculator': {
    component: dynamic(() => import('../../tools/bac-calculator/BacCalculatorClient')),
    name: { en: 'BAC Calculator', de: 'Promillerechner' },
  },
};

interface PageProps {
  params: Promise<{ lng: string; tool: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lng: rawLng, tool } = await params;
  const lng = languages.includes(rawLng as Language) ? (rawLng as Language) : 'en';

  const toolConfig = toolComponents[tool];
  if (!toolConfig) {
    return { title: 'Tool not found' };
  }

  const toolName = toolConfig.name[lng];

  return {
    title: `${toolName} - Embed - PureTools.ai`,
    robots: 'noindex, nofollow', // Don't index embed pages
  };
}

export default async function EmbedPage({ params }: PageProps) {
  const { lng: rawLng, tool } = await params;
  const lng = languages.includes(rawLng as Language) ? (rawLng as Language) : 'en';

  const toolConfig = toolComponents[tool];
  if (!toolConfig) {
    notFound();
  }

  const ToolComponent = toolConfig.component;
  const toolName = toolConfig.name[lng];

  return (
    <EmbedWrapper toolName={toolName}>
      <ToolComponent lng={lng} />
    </EmbedWrapper>
  );
}

export async function generateStaticParams() {
  const params: { lng: string; tool: string }[] = [];

  for (const lng of languages) {
    for (const tool of Object.keys(toolComponents)) {
      params.push({ lng, tool });
    }
  }

  return params;
}
