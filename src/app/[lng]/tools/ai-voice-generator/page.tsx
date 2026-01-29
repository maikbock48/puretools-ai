import { Metadata } from 'next';
import { Language, languages } from '@/i18n/settings';
import AIVoiceGeneratorClient from './AIVoiceGeneratorClient';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

const content = {
  en: {
    title: 'AI Voice Generator - Text to Speech | PureTools',
    description: 'Convert text to natural-sounding speech with AI. 6 premium voices, adjustable speed, multiple formats. Professional text-to-speech powered by OpenAI.',
  },
  de: {
    title: 'KI Stimmen Generator - Text zu Sprache | PureTools',
    description: 'Wandeln Sie Text in natürlich klingende Sprache um. 6 Premium-Stimmen, anpassbare Geschwindigkeit, mehrere Formate. Professionelle Text-zu-Sprache mit OpenAI.',
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lng: Language }>;
}): Promise<Metadata> {
  const { lng } = await params;
  const t = content[lng] || content.en;

  return {
    title: t.title,
    description: t.description,
    openGraph: {
      title: t.title,
      description: t.description,
      type: 'website',
    },
  };
}

export default async function AIVoiceGeneratorPage({
  params,
}: {
  params: Promise<{ lng: Language }>;
}) {
  const { lng } = await params;

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-indigo-50/30 dark:from-zinc-950 dark:to-zinc-900">
      <AIVoiceGeneratorClient lng={lng} />
    </main>
  );
}
