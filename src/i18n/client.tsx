'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import i18next from 'i18next';
import {
  initReactI18next,
  useTranslation as useTranslationOrg,
  UseTranslationOptions,
} from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { getOptions, languages, Language } from './settings';

const runsOnServerSide = typeof window === 'undefined';
const useIsomorphicLayoutEffect = runsOnServerSide ? useEffect : useLayoutEffect;

// Track initialization state
let initialized = false;
let currentLng: Language | null = null;

function initI18n(lng: Language) {
  if (initialized) {
    // Already initialized - language change will be handled by effect
    return;
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
      lng,
      preload: runsOnServerSide ? languages : [],
    });

  initialized = true;
  currentLng = lng;
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
  // Initialize on first use with the correct language
  if (!initialized) {
    initI18n(lng);
  }

  const ret = useTranslationOrg(ns, options);
  const { i18n } = ret;

  // Handle language changes in an effect (not during render!)
  useIsomorphicLayoutEffect(() => {
    if (i18n.resolvedLanguage !== lng) {
      i18n.changeLanguage(lng);
      currentLng = lng;
    }
  }, [lng, i18n]);

  return ret;
}
