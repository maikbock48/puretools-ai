'use client';

import { motion } from 'framer-motion';
import { Check, X, Sparkles, Shield, CreditCard, Upload, Zap } from 'lucide-react';
import { Language } from '@/i18n/settings';

interface ComparisonTableProps {
  lng: Language;
}

const content = {
  en: {
    title: 'Why PureTools?',
    subtitle: 'See how we compare to traditional tools',
    headers: {
      feature: 'Feature',
      others: 'Other Tools',
      puretools: 'PureTools AI',
    },
    rows: [
      {
        feature: 'Ads & Tracking',
        icon: Shield,
        others: { text: 'Everywhere (slows you down)', good: false },
        puretools: { text: 'Never. Zero ads.', good: true },
      },
      {
        feature: 'Basic Tools Cost',
        icon: CreditCard,
        others: { text: 'Often requires subscription', good: false },
        puretools: { text: 'Free forever (0€)', good: true },
      },
      {
        feature: 'AI Features',
        icon: Sparkles,
        others: { text: 'Expensive monthly plans', good: false },
        puretools: { text: 'Pay only what you use', good: true },
      },
      {
        feature: 'Data Privacy',
        icon: Upload,
        others: { text: 'Uploaded to unknown servers', good: false },
        puretools: { text: 'Processed locally', good: true },
      },
      {
        feature: 'Processing Speed',
        icon: Zap,
        others: { text: 'Server queue delays', good: false },
        puretools: { text: 'Instant (your device)', good: true },
      },
    ],
    badge: 'No subscription traps',
    cta: 'Try for Free',
  },
  de: {
    title: 'Warum PureTools?',
    subtitle: 'So schneiden wir im Vergleich zu herkömmlichen Tools ab',
    headers: {
      feature: 'Feature',
      others: 'Andere Tools',
      puretools: 'PureTools AI',
    },
    rows: [
      {
        feature: 'Werbung & Tracking',
        icon: Shield,
        others: { text: 'Überall (bremst dich aus)', good: false },
        puretools: { text: 'Niemals. Null Werbung.', good: true },
      },
      {
        feature: 'Basis-Tools Kosten',
        icon: CreditCard,
        others: { text: 'Oft Abo erforderlich', good: false },
        puretools: { text: 'Für immer kostenlos (0€)', good: true },
      },
      {
        feature: 'KI-Features',
        icon: Sparkles,
        others: { text: 'Teure Monatspläne', good: false },
        puretools: { text: 'Zahle nur was du nutzt', good: true },
      },
      {
        feature: 'Datenschutz',
        icon: Upload,
        others: { text: 'Upload auf unbekannte Server', good: false },
        puretools: { text: 'Lokal verarbeitet', good: true },
      },
      {
        feature: 'Geschwindigkeit',
        icon: Zap,
        others: { text: 'Server-Warteschlangen', good: false },
        puretools: { text: 'Sofort (dein Gerät)', good: true },
      },
    ],
    badge: 'Keine Abo-Fallen',
    cta: 'Kostenlos testen',
  },
};

export default function ComparisonTable({ lng }: ComparisonTableProps) {
  const t = content[lng];

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-400 mb-4">
            <Shield className="h-4 w-4" />
            {t.badge}
          </span>
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-3">{t.title}</h2>
          <p className="text-zinc-400">{t.subtitle}</p>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="overflow-hidden rounded-2xl border border-zinc-800"
        >
          {/* Table Header */}
          <div className="grid grid-cols-3 bg-zinc-900/80">
            <div className="p-4 sm:p-6">
              <span className="text-sm font-medium text-zinc-500">{t.headers.feature}</span>
            </div>
            <div className="p-4 sm:p-6 border-l border-zinc-800">
              <span className="text-sm font-medium text-zinc-500">{t.headers.others}</span>
            </div>
            <div className="p-4 sm:p-6 border-l border-zinc-800 bg-indigo-500/5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                <span className="text-sm font-medium text-indigo-400">{t.headers.puretools}</span>
              </div>
            </div>
          </div>

          {/* Table Body */}
          {t.rows.map((row, index) => {
            const Icon = row.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="grid grid-cols-3 border-t border-zinc-800"
              >
                {/* Feature */}
                <div className="p-4 sm:p-6 flex items-center gap-3">
                  <div className="rounded-lg bg-zinc-800 p-2">
                    <Icon className="h-4 w-4 text-zinc-400" />
                  </div>
                  <span className="text-sm font-medium text-white">{row.feature}</span>
                </div>

                {/* Others */}
                <div className="p-4 sm:p-6 border-l border-zinc-800 flex items-center gap-2">
                  <div className="rounded-full bg-red-500/20 p-1">
                    <X className="h-3 w-3 text-red-400" />
                  </div>
                  <span className="text-sm text-zinc-400">{row.others.text}</span>
                </div>

                {/* PureTools */}
                <div className="p-4 sm:p-6 border-l border-zinc-800 bg-indigo-500/5 flex items-center gap-2">
                  <div className="rounded-full bg-emerald-500/20 p-1">
                    <Check className="h-3 w-3 text-emerald-400" />
                  </div>
                  <span className="text-sm font-medium text-emerald-400">{row.puretools.text}</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8"
        >
          <a
            href="#tools"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-8 py-4 font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-400 hover:shadow-indigo-500/40"
          >
            <Sparkles className="h-5 w-5" />
            {t.cta}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
