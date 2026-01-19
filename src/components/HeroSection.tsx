'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Shield, Zap } from 'lucide-react';
import { useTranslation } from '@/i18n/client';
import { Language } from '@/i18n/settings';

interface HeroSectionProps {
  lng: Language;
}

export default function HeroSection({ lng }: HeroSectionProps) {
  const { t } = useTranslation(lng);

  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400"
          >
            <Shield className="h-4 w-4" />
            <span>{t('badges.privacy')}</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            {t('hero.title')}{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              {t('hero.titleHighlight')}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg leading-8 text-zinc-400"
          >
            {t('hero.subtitle')}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="#tools"
              className="group inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-400 hover:shadow-indigo-500/40"
            >
              {t('hero.cta')}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:border-zinc-600 hover:bg-zinc-800"
            >
              <Zap className="h-4 w-4 text-emerald-400" />
              {t('hero.ctaSecondary')}
            </a>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mx-auto mt-20 grid max-w-2xl grid-cols-3 gap-8 text-center"
        >
          <div>
            <div className="text-3xl font-bold text-white">10+</div>
            <div className="mt-1 text-sm text-zinc-500">Tools</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">100%</div>
            <div className="mt-1 text-sm text-zinc-500">{lng === 'de' ? 'Lokal' : 'Local'}</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">0</div>
            <div className="mt-1 text-sm text-zinc-500">{lng === 'de' ? 'Daten-Uploads' : 'Data Uploads'}</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
