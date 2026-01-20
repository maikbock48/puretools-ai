import { languages, Language } from '@/i18n/settings';
import HeroSection from '@/components/HeroSection';
import ToolsGrid from '@/components/ToolsGrid';
import ComparisonTable from '@/components/ComparisonTable';
import SocialProof from '@/components/SocialProof';
import NewsletterCTA from '@/components/NewsletterCTA';

export default async function HomePage({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng: rawLng } = await params;
  const lng = languages.includes(rawLng as Language) ? (rawLng as Language) : 'en';

  return (
    <div className="relative">
      <HeroSection lng={lng} />

      {/* Social Proof Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SocialProof lng={lng} />
      </section>

      <ToolsGrid lng={lng} />
      <ComparisonTable lng={lng} />

      {/* Newsletter CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <NewsletterCTA lng={lng} />
      </section>
    </div>
  );
}
