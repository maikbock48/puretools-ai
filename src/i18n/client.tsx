'use client';

import { useEffect, useState, useCallback } from 'react';
import i18next from 'i18next';
import {
  initReactI18next,
  useTranslation as useTranslationOrg,
  UseTranslationOptions,
} from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { getOptions, languages, Language } from './settings';

const runsOnServerSide = typeof window === 'undefined';

// Get language from URL path on client side
function getLanguageFromPath(): Language {
  if (runsOnServerSide) return 'en';
  const path = window.location.pathname;
  const langMatch = path.match(/^\/(en|de)(\/|$)/);
  return (langMatch?.[1] as Language) || 'en';
}

i18next
  .use(initReactI18next)
  .use(
    resourcesToBackend(
      (language: string, namespace: string) =>
        import(`./locales/${language}/${namespace}.json`)
    )
  )
  .init({
    ...getOptions(),
    lng: runsOnServerSide ? 'en' : getLanguageFromPath(),
    preload: runsOnServerSide ? languages : [],
  });

export function useTranslation(
  lng: Language,
  ns?: string | string[],
  options?: UseTranslationOptions<undefined>
) {
  const ret = useTranslationOrg(ns, options);
  const { i18n } = ret;
  const [isReady, setIsReady] = useState(i18n.resolvedLanguage === lng);

  const changeLanguage = useCallback(() => {
    if (lng && i18n.resolvedLanguage !== lng) {
      i18n.changeLanguage(lng).then(() => setIsReady(true));
    } else {
      setIsReady(true);
    }
  }, [lng, i18n]);

  useEffect(() => {
    changeLanguage();
  }, [changeLanguage]);

  // Return translation function that returns empty string until ready to prevent hydration mismatch
  if (!isReady && !runsOnServerSide) {
    return {
      ...ret,
      t: ((key: string) => ret.t(key)) as typeof ret.t,
    };
  }

  return ret;
}
