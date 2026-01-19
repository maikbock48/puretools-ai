import { Metadata } from 'next';
import { languages, Language } from '@/i18n/settings';
import CsvToExcelClient from './CsvToExcelClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lng: string }>;
}): Promise<Metadata> {
  const { lng: rawLng } = await params;
  const lng = languages.includes(rawLng as Language) ? (rawLng as Language) : 'en';

  const titles = {
    en: 'CSV to Excel Converter - Free Online Tool - PureTools AI',
    de: 'CSV zu Excel Konverter - Kostenloses Online-Tool - PureTools AI',
  };

  const descriptions = {
    en: 'Free online CSV to Excel converter. Convert CSV files to XLSX format instantly in your browser. No uploads, 100% private. Supports multiple delimiters.',
    de: 'Kostenloser Online CSV zu Excel Konverter. Konvertieren Sie CSV-Dateien sofort zu XLSX in Ihrem Browser. Keine Uploads, 100% privat. Unterstützt mehrere Trennzeichen.',
  };

  return {
    title: titles[lng],
    description: descriptions[lng],
    keywords: lng === 'de'
      ? ['CSV zu Excel', 'CSV Konverter', 'XLSX', 'Excel', 'kostenlos', 'online', 'privat']
      : ['CSV to Excel', 'CSV converter', 'XLSX', 'Excel', 'free', 'online', 'private'],
  };
}

export default async function CsvToExcelPage({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng: rawLng } = await params;
  const lng = languages.includes(rawLng as Language) ? (rawLng as Language) : 'en';

  return <CsvToExcelClient lng={lng} />;
}
