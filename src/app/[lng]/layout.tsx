import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import { languages, Language } from '@/i18n/settings';
import { getTranslation } from '@/i18n/server';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/theme-provider';
import AuthProvider from '@/components/AuthProvider';
import { WebsiteStructuredData, OrganizationStructuredData } from '@/components/StructuredData';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';
import PWAInstaller from '@/components/PWAInstaller';
import ReferralBanner from '@/components/ReferralBanner';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import GoogleAnalytics from '@/components/GoogleAnalytics';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lng: string }>;
}): Promise<Metadata> {
  const { lng } = await params;
  const validLng = languages.includes(lng as Language) ? (lng as Language) : 'en';
  const { t } = await getTranslation(validLng);

  return {
    title: {
      default: t('meta.title'),
      template: `%s | PureTools AI`,
    },
    description: t('meta.description'),
    keywords: [
      'online tools',
      'privacy',
      'QR code',
      'image compression',
      'PDF tools',
      'OCR',
      'AI',
    ],
    authors: [{ name: 'PureTools AI' }],
    creator: 'PureTools AI',
    metadataBase: new URL('https://puretools.ai'),
    openGraph: {
      type: 'website',
      locale: validLng === 'de' ? 'de_DE' : 'en_US',
      url: 'https://puretools.ai',
      title: t('meta.title'),
      description: t('meta.description'),
      siteName: 'PureTools AI',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('meta.title'),
      description: t('meta.description'),
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lng: string }>;
}) {
  const { lng: rawLng } = await params;
  const lng = languages.includes(rawLng as Language) ? (rawLng as Language) : 'en';

  return (
    <html lang={lng} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="theme-color" content="#6366f1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="PureTools" />
        <WebsiteStructuredData />
        <OrganizationStructuredData />
      </head>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <div className="relative min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
            {/* Background gradient - subtle in light, visible in dark */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
              <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-100/50 dark:bg-indigo-500/10 blur-3xl" />
              <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-emerald-100/50 dark:bg-emerald-500/10 blur-3xl" />
            </div>

            {/* Content */}
            <Navbar lng={lng} />
            <main className="relative flex-1 pt-24">{children}</main>
            <Footer lng={lng} />
            <PWAInstaller />
            <ReferralBanner lng={lng} />
            <ServiceWorkerRegistration />
            </div>
          </ThemeProvider>
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
