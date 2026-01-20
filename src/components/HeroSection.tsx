'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Shield, Zap, CreditCard, Sparkles } from 'lucide-react';
import { Language } from '@/i18n/settings';

interface HeroSectionProps {
  lng: Language;
}

const content = {
  en: {
    badge: 'No Ads. No Tracking. Ever.',
    title: 'Honest Tools.',
    titleHighlight: 'Fair Prices.',
    titleEnd: 'Zero BS.',
    subtitle: 'Local tasks run free in your browser. For complex AI, pay only what you use.',
    subtitleAlt: 'Your files never leave your device. No subscriptions. No hidden fees.',
    cta: 'Explore Tools',
    ctaSecondary: 'See Pricing',
    stats: {
      tools: 'Free Tools',
      local: 'Local Processing',
      ads: 'Ads',
      subscriptions: 'Forced Subscriptions',
    },
    trust: [
      { icon: Shield, text: '100% Privacy' },
      { icon: CreditCard, text: 'No subscription traps' },
      { icon: Sparkles, text: 'AI: Pay-per-use only' },
    ],
  },
  de: {
    badge: 'Keine Werbung. Kein Tracking. Niemals.',
    title: 'Ehrliche Tools.',
    titleHighlight: 'Faire Preise.',
    titleEnd: 'Null Bullshit.',
    subtitle: 'Lokale Aufgaben erledigt dein Browser kostenlos. Für komplexe KI zahlst du nur, was du verbrauchst.',
    subtitleAlt: 'Deine Dateien verlassen nie dein Gerät. Keine Abos. Keine versteckten Gebühren.',
    cta: 'Tools entdecken',
    ctaSecondary: 'Preise ansehen',
    stats: {
      tools: 'Kostenlose Tools',
      local: 'Lokale Verarbeitung',
      ads: 'Werbung',
      subscriptions: 'Abo-Zwang',
    },
    trust: [
      { icon: Shield, text: '100% Privatsphäre' },
      { icon: CreditCard, text: 'Keine Abo-Fallen' },
      { icon: Sparkles, text: 'KI: Nur Pay-per-Use' },
    ],
  },
};

export default function HeroSection({ lng }: HeroSectionProps) {
  const t = content[lng];

  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400"
          >
            <Shield className="h-4 w-4" />
            <span>{t.badge}</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl lg:text-6xl"
          >
            {t.title}{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-emerald-600 dark:from-indigo-400 dark:to-emerald-400 bg-clip-text text-transparent">
              {t.titleHighlight}
            </span>
            <br className="hidden sm:block" />
            <span className="text-zinc-500 dark:text-zinc-400">{t.titleEnd}</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto"
          >
            {t.subtitle}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-2 text-base text-zinc-500"
          >
            {t.subtitleAlt}
          </motion.p>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            {t.trust.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 shadow-sm"
              >
                <item.icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>{item.text}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="#tools"
              className="group inline-flex items-center gap-2 rounded-xl bg-indigo-600 dark:bg-indigo-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 dark:hover:bg-indigo-400 hover:shadow-indigo-500/40"
            >
              {t.cta}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href={`/${lng}/pricing`}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-8 py-4 text-base font-semibold text-zinc-900 dark:text-white transition-all hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              <Zap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              {t.ctaSecondary}
            </a>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mx-auto mt-16 grid max-w-3xl grid-cols-2 sm:grid-cols-4 gap-6"
        >
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 text-center shadow-sm">
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">10+</div>
            <div className="mt-1 text-sm text-zinc-500">{t.stats.tools}</div>
          </div>
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 text-center shadow-sm">
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">100%</div>
            <div className="mt-1 text-sm text-zinc-500">{t.stats.local}</div>
          </div>
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 text-center shadow-sm">
            <div className="text-3xl font-bold text-zinc-900 dark:text-white">0</div>
            <div className="mt-1 text-sm text-zinc-500">{t.stats.ads}</div>
          </div>
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 text-center shadow-sm">
            <div className="text-3xl font-bold text-zinc-900 dark:text-white">0</div>
            <div className="mt-1 text-sm text-zinc-500">{t.stats.subscriptions}</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
