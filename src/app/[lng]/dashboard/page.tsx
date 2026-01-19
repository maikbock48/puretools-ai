import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { languages, Language } from '@/i18n/settings';
import { auth } from '@/lib/auth';
import DashboardClient from './DashboardClient';

const meta = {
  en: {
    title: 'Dashboard - PureTools AI',
    description: 'Manage your credits and view usage statistics.',
  },
  de: {
    title: 'Dashboard - PureTools AI',
    description: 'Verwalte deine Credits und sieh dir deine Nutzungsstatistiken an.',
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

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng: rawLng } = await params;
  const lng = languages.includes(rawLng as Language) ? (rawLng as Language) : 'en';

  const session = await auth();

  if (!session?.user) {
    redirect(`/${lng}/auth/signin`);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <DashboardClient lng={lng} user={session.user} />
    </div>
  );
}
