'use client';

import { useEffect, useState } from 'react';
import i18next from 'i18next';
import {
  initReactI18next,
  useTranslation as useTranslationOrg,
  UseTranslationOptions,
} from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { getOptions, languages, Language } from './settings';

const runsOnServerSide = typeof window === 'undefined';

// Initialize i18next once
let initialized = false;

function initI18n(lng: Language) {
  if (initialized) return;

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
      lng,
      preload: runsOnServerSide ? languages : [],
    });

  initialized = true;
}

// Initialize with default on server
if (runsOnServerSide) {
  initI18n('en');
}

export function useTranslation(
  lng: Language,
  ns?: string | string[],
  options?: UseTranslationOptions<undefined>
) {
  // Ensure i18next is initialized with the correct language
  if (!initialized) {
    initI18n(lng);
  }

  const ret = useTranslationOrg(ns, options);
  const { i18n } = ret;

  // Track if language change is needed
  const [, forceUpdate] = useState(0);

  // Synchronously change language if needed (before first render completes)
  if (i18n.resolvedLanguage !== lng) {
    // Change language synchronously if possible
    i18n.changeLanguage(lng);
  }

  // Also handle async language changes
  useEffect(() => {
    if (i18n.resolvedLanguage !== lng) {
      i18n.changeLanguage(lng).then(() => {
        forceUpdate(n => n + 1);
      });
    }
  }, [lng, i18n]);

  return ret;
}
