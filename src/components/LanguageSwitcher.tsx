'use client';

import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { languages, Language } from '@/i18n/settings';

interface LanguageSwitcherProps {
  lng: Language;
}

const languageLabels: Record<Language, string> = {
  en: 'EN',
  de: 'DE',
};

export default function LanguageSwitcher({ lng }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();

  const switchLanguage = (newLng: Language) => {
    if (newLng === lng) return;

    // Replace the current language in the pathname
    const segments = pathname.split('/');
    segments[1] = newLng;
    const newPath = segments.join('/');

    router.push(newPath);
  };

  return (
    <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-1 border border-zinc-800">
      <Globe className="h-4 w-4 text-zinc-500 ml-2" />
      {languages.map((lang) => (
        <motion.button
          key={lang}
          onClick={() => switchLanguage(lang)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            lng === lang
              ? 'bg-zinc-700 text-white'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          {languageLabels[lang]}
        </motion.button>
      ))}
    </div>
  );
}
