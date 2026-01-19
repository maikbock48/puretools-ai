import { languages, Language } from '@/i18n/settings';
import HeroSection from '@/components/HeroSection';
import ToolsGrid from '@/components/ToolsGrid';

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
      <ToolsGrid lng={lng} />
    </div>
  );
}
