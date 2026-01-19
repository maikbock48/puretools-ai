import { Metadata } from 'next';
import { languages, Language } from '@/i18n/settings';
import ContactClient from './ContactClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lng: string }>;
}): Promise<Metadata> {
  const { lng: rawLng } = await params;
  const lng = languages.includes(rawLng as Language) ? (rawLng as Language) : 'en';

  const titles = {
    en: 'Contact Us - PureTools AI',
    de: 'Kontakt - PureTools AI',
  };

  return {
    title: titles[lng],
    description: lng === 'de'
      ? 'Kontaktieren Sie das PureTools AI Team. Wir helfen bei Fragen, Feedback und Support.'
      : 'Get in touch with the PureTools AI team. We\'re here to help with questions, feedback, and support.',
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng: rawLng } = await params;
  const lng = languages.includes(rawLng as Language) ? (rawLng as Language) : 'en';

  return <ContactClient lng={lng} />;
}
