'use client';

import { useEffect, useCallback, useSyncExternalStore } from 'react';
import i18next from 'i18next';
import {
  initReactI18next,
  useTranslation as useTranslationOrg,
  UseTranslationOptions,
} from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { getOptions, languages, Language } from './settings';

const runsOnServerSide = typeof window === 'undefined';

// Track initialization
let initialized = false;

// Initialize i18next once
function initI18next(lng: Language) {
  if (!initialized && !i18next.isInitialized) {
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
}

// Custom hook to track client-side hydration
function useIsClient() {
  const subscribe = useCallback(() => () => {}, []);
  const getSnapshot = useCallback(() => true, []);
  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useTranslation(
  lng: Language,
  ns?: string | string[],
  options?: UseTranslationOptions<undefined>
) {
  // Initialize on first use (only once)
  initI18next(lng);

  const ret = useTranslationOrg(ns, options);
  const { i18n } = ret;

  // Track if we're on the client (after hydration)
  const isClient = useIsClient();

  // Handle language changes after hydration - only in useEffect, never during render
  useEffect(() => {
    if (isClient && i18n.resolvedLanguage !== lng) {
      i18n.changeLanguage(lng);
    }
  }, [isClient, lng, i18n]);

  return ret;
}
