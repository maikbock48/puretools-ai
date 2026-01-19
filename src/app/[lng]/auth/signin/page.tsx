import { Metadata } from 'next';
import { languages, Language } from '@/i18n/settings';
import SignInClient from './SignInClient';

const meta = {
  en: {
    title: 'Sign In - PureTools AI',
    description: 'Sign in to access AI-powered tools and manage your credits.',
  },
  de: {
    title: 'Anmelden - PureTools AI',
    description: 'Melde dich an, um auf KI-Tools zuzugreifen und deine Credits zu verwalten.',
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lng: string }>;
}): Promise<Metadata> {
  const { lng: rawLng } = await params;
  const lng = languages.includes(rawLng as Language) ? (rawLng as Language) : 'en';
  const t = meta[lng];

  return {
    title: t.title,
    description: t.description,
  };
}

export default async function SignInPage({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng: rawLng } = await params;
  const lng = languages.includes(rawLng as Language) ? (rawLng as Language) : 'en';

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <SignInClient lng={lng} />
    </div>
  );
}
