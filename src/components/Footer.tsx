import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { Language } from '@/i18n/settings';

interface FooterProps {
  lng: Language;
}

// Static translations to avoid hydration mismatch
const translations = {
  en: {
    tagline: 'Privacy-first tools for everyone.',
    privacy: 'Privacy',
    terms: 'Terms',
    impressum: 'Impressum',
    contact: 'Contact',
    copyright: 'All rights reserved.',
  },
  de: {
    tagline: 'Datenschutz-orientierte Tools für alle.',
    privacy: 'Datenschutz',
    terms: 'AGB',
    impressum: 'Impressum',
    contact: 'Kontakt',
    copyright: 'Alle Rechte vorbehalten.',
  },
};

export default function Footer({ lng }: FooterProps) {
  const t = translations[lng];
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Logo & tagline */}
          <div className="flex flex-col items-center gap-2 md:items-start">
            <Link href={`/${lng}`} className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />
              <span className="text-lg font-semibold text-zinc-900 dark:text-white">
                Pure<span className="text-indigo-500 dark:text-indigo-400">Tools</span>
              </span>
            </Link>
            <p className="text-sm text-zinc-500">{t.tagline}</p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link
              href={`/${lng}/privacy`}
              className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              {t.privacy}
            </Link>
            <Link
              href={`/${lng}/terms`}
              className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              {t.terms}
            </Link>
            <Link
              href={`/${lng}/impressum`}
              className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              {t.impressum}
            </Link>
            <Link
              href={`/${lng}/contact`}
              className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              {t.contact}
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-zinc-200 dark:border-zinc-800 pt-8 text-center">
          <p className="text-sm text-zinc-500">
            &copy; {currentYear} PureTools AI. {t.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
