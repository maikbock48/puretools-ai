import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { languages, Language } from '@/i18n/settings';

const AIVideoGeneratorClient = dynamic(() => import('./AIVideoGeneratorClient'), {
  loading: () => (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-5xl px-4 animate-pulse">
        <div className="h-16 w-16 mx-auto rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-4 h-8 w-64 mx-auto rounded bg-zinc-200 dark:bg-zinc-800" />
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
    en: 'AI Video Generator - Create Videos from Text (Sora) - PureTools AI',
    de: 'KI Videogenerator - Videos aus Text erstellen (Sora) - PureTools AI',
  };

  const descriptions = {
    en: 'Generate stunning videos from text descriptions using OpenAI Sora. Create cinematic, animated, and realistic videos with AI. Coming soon!',
    de: 'Erstellen Sie beeindruckende Videos aus Textbeschreibungen mit OpenAI Sora. Generieren Sie kinematische, animierte und realistische Videos mit KI. Demnächst verfügbar!',
  };

  return {
    title: titles[lng],
    description: descriptions[lng],
    keywords: lng === 'de'
      ? ['KI Videogenerator', 'Text zu Video', 'Sora', 'AI Video', 'Videogenerierung', 'OpenAI']
      : ['AI video generator', 'text to video', 'Sora', 'AI video', 'video generation', 'OpenAI'],
  };
}

export default async function AIVideoGeneratorPage({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng: rawLng } = await params;
  const lng = languages.includes(rawLng as Language) ? (rawLng as Language) : 'en';

  return <AIVideoGeneratorClient lng={lng} />;
}
