'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  Sparkles,
  Shield,
  Zap,
  Crown,
  HelpCircle,
  ArrowRight,
  Infinity,
  CreditCard,
} from 'lucide-react';
import Link from 'next/link';
import { Language } from '@/i18n/settings';

interface PricingClientProps {
  lng: Language;
}

const content = {
  en: {
    hero: {
      badge: 'Simple Pricing',
      title: 'Free Tools.',
      titleHighlight: 'Fair AI Pricing.',
      subtitle: 'Local tools are 100% free, forever. AI features use credits — buy only what you need.',
    },
    toggle: {
      monthly: 'Monthly',
      yearly: 'Yearly',
      save: 'Save 20%',
    },
    tiers: {
      free: {
        name: 'Free',
        description: 'All local tools, no limits',
        price: '0',
        period: 'forever',
        features: [
          'Unlimited QR Code generation',
          'Unlimited image compression',
          'PDF merge & split',
          'HEIC to JPG conversion',
          'JSON formatter & more',
          'No account required',
          '100% privacy guaranteed',
        ],
        cta: 'Start Free',
        badge: 'Most Popular',
      },
      starter: {
        name: 'Starter',
        description: 'For occasional AI usage',
        price: '9',
        period: '/month',
        credits: '100 AI Credits',
        features: [
          'Everything in Free',
          '100 AI credits/month',
          'AI document translation',
          'AI transcription',
          'Priority processing',
          'Email support',
        ],
        cta: 'Get Started',
      },
      pro: {
        name: 'Pro',
        description: 'For power users',
        price: '29',
        period: '/month',
        credits: '500 AI Credits',
        features: [
          'Everything in Starter',
          '500 AI credits/month',
          'Bulk file processing',
          'API access',
          'Priority support',
          'Early access to new tools',
        ],
        cta: 'Go Pro',
        badge: 'Best Value',
      },
    },
    credits: {
      title: 'How Credits Work',
      subtitle: 'Pay only for what you use. No surprises.',
      items: [
        { action: 'Translate 1 page', cost: '1 credit' },
        { action: 'Transcribe 1 minute audio', cost: '2 credits' },
        { action: 'AI summary', cost: '1 credit' },
        { action: 'Bulk translate (10 pages)', cost: '8 credits' },
      ],
      buyMore: 'Need more? Buy credit packs anytime.',
    },
    faq: {
      title: 'Frequently Asked Questions',
      items: [
        {
          q: 'Are local tools really free?',
          a: 'Yes! All browser-based tools (QR codes, image compression, PDF tools, etc.) are 100% free with no limits. They run entirely on your device.',
        },
        {
          q: 'What are AI credits?',
          a: 'AI credits are used for cloud-based AI features like document translation and audio transcription. 1 credit ≈ 1 AI operation.',
        },
        {
          q: 'Do unused credits roll over?',
          a: 'Yes, unused credits roll over for up to 3 months. You never lose what you paid for.',
        },
        {
          q: 'Can I cancel anytime?',
          a: 'Absolutely. Cancel anytime with no questions asked. Your remaining credits stay valid until expiry.',
        },
      ],
    },
    cta: {
      title: 'Start with Free Tools',
      subtitle: 'No credit card required. Upgrade only when you need AI features.',
      button: 'Try Free Tools',
    },
  },
  de: {
    hero: {
      badge: 'Einfache Preise',
      title: 'Kostenlose Tools.',
      titleHighlight: 'Faire KI-Preise.',
      subtitle: 'Lokale Tools sind 100% kostenlos, für immer. KI-Funktionen nutzen Credits — kaufen Sie nur, was Sie brauchen.',
    },
    toggle: {
      monthly: 'Monatlich',
      yearly: 'Jährlich',
      save: '20% sparen',
    },
    tiers: {
      free: {
        name: 'Kostenlos',
        description: 'Alle lokalen Tools, ohne Limits',
        price: '0',
        period: 'für immer',
        features: [
          'Unbegrenzte QR-Code Erstellung',
          'Unbegrenzte Bildkomprimierung',
          'PDF zusammenführen & teilen',
          'HEIC zu JPG Konvertierung',
          'JSON Formatter & mehr',
          'Kein Account erforderlich',
          '100% Datenschutz garantiert',
        ],
        cta: 'Kostenlos starten',
        badge: 'Am Beliebtesten',
      },
      starter: {
        name: 'Starter',
        description: 'Für gelegentliche KI-Nutzung',
        price: '9',
        period: '/Monat',
        credits: '100 KI-Credits',
        features: [
          'Alles aus Kostenlos',
          '100 KI-Credits/Monat',
          'KI-Dokumentübersetzung',
          'KI-Transkription',
          'Prioritäts-Verarbeitung',
          'E-Mail Support',
        ],
        cta: 'Jetzt starten',
      },
      pro: {
        name: 'Pro',
        description: 'Für Power-User',
        price: '29',
        period: '/Monat',
        credits: '500 KI-Credits',
        features: [
          'Alles aus Starter',
          '500 KI-Credits/Monat',
          'Stapelverarbeitung',
          'API-Zugang',
          'Prioritäts-Support',
          'Früher Zugang zu neuen Tools',
        ],
        cta: 'Pro werden',
        badge: 'Bester Wert',
      },
    },
    credits: {
      title: 'Wie Credits funktionieren',
      subtitle: 'Zahlen Sie nur für das, was Sie nutzen. Keine Überraschungen.',
      items: [
        { action: '1 Seite übersetzen', cost: '1 Credit' },
        { action: '1 Minute Audio transkribieren', cost: '2 Credits' },
        { action: 'KI-Zusammenfassung', cost: '1 Credit' },
        { action: 'Stapelübersetzung (10 Seiten)', cost: '8 Credits' },
      ],
      buyMore: 'Mehr benötigt? Kaufen Sie jederzeit Credit-Pakete.',
    },
    faq: {
      title: 'Häufig gestellte Fragen',
      items: [
        {
          q: 'Sind lokale Tools wirklich kostenlos?',
          a: 'Ja! Alle browserbasierten Tools (QR-Codes, Bildkomprimierung, PDF-Tools usw.) sind 100% kostenlos ohne Limits.',
        },
        {
          q: 'Was sind KI-Credits?',
          a: 'KI-Credits werden für cloudbasierte KI-Funktionen wie Dokumentübersetzung und Audio-Transkription verwendet.',
        },
        {
          q: 'Werden ungenutzte Credits übertragen?',
          a: 'Ja, ungenutzte Credits werden bis zu 3 Monate übertragen. Sie verlieren nie, was Sie bezahlt haben.',
        },
        {
          q: 'Kann ich jederzeit kündigen?',
          a: 'Absolut. Kündigen Sie jederzeit ohne Fragen. Ihre verbleibenden Credits bleiben bis zum Ablauf gültig.',
        },
      ],
    },
    cta: {
      title: 'Mit kostenlosen Tools starten',
      subtitle: 'Keine Kreditkarte erforderlich. Upgraden Sie nur, wenn Sie KI-Funktionen benötigen.',
      button: 'Kostenlos testen',
    },
  },
};

export default function PricingClient({ lng }: PricingClientProps) {
  const t = content[lng];
  const [isYearly, setIsYearly] = useState(false);

  const getPrice = (monthlyPrice: string) => {
    if (monthlyPrice === '0') return '0';
    const price = parseInt(monthlyPrice);
    return isYearly ? Math.round(price * 0.8).toString() : monthlyPrice;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/80 via-white to-white dark:from-indigo-500/5 dark:via-transparent dark:to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-purple-200/30 dark:bg-purple-500/10 rounded-full blur-3xl opacity-60 dark:opacity-20" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-3xl text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-300 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-700 dark:text-indigo-400"
            >
              <CreditCard className="h-4 w-4" />
              {t.hero.badge}
            </motion.div>

            <h1 className="mb-6 text-4xl font-bold tracking-tight text-zinc-800 dark:text-white sm:text-6xl">
              {t.hero.title}{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                {t.hero.titleHighlight}
              </span>
            </h1>

            <p className="text-lg text-zinc-600 dark:text-zinc-400">{t.hero.subtitle}</p>

            {/* Billing Toggle */}
            <div className="mt-10 flex items-center justify-center gap-4">
              <span className={`text-sm font-medium ${!isYearly ? 'text-zinc-800 dark:text-white' : 'text-zinc-500'}`}>
                {t.toggle.monthly}
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className={`relative h-7 w-14 rounded-full transition-colors ${
                  isYearly ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-700'
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    isYearly ? 'left-8' : 'left-1'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${isYearly ? 'text-zinc-800 dark:text-white' : 'text-zinc-500'}`}>
                {t.toggle.yearly}
              </span>
              {isYearly && (
                <span className="rounded-full bg-indigo-100 dark:bg-indigo-500/20 px-2 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-400">
                  {t.toggle.save}
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Free Tier */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative rounded-3xl border-2 border-emerald-300 dark:border-emerald-500/30 bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-500/10 dark:to-transparent p-8 shadow-lg"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-emerald-500 px-4 py-1 text-sm font-medium text-white shadow-lg">
                  {t.tiers.free.badge}
                </span>
              </div>

              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-emerald-100 dark:bg-emerald-500/20 p-2">
                  <Shield className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-800 dark:text-white">{t.tiers.free.name}</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-500">{t.tiers.free.description}</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-zinc-800 dark:text-white">${t.tiers.free.price}</span>
                  <span className="text-zinc-500">{t.tiers.free.period}</span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                  <Infinity className="h-4 w-4" />
                  Unlimited usage
                </div>
              </div>

              <ul className="mb-8 space-y-3">
                {t.tiers.free.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={`/${lng}`}
                className="block w-full rounded-xl bg-emerald-500 py-3 text-center font-semibold text-white transition-colors hover:bg-emerald-600 shadow-lg shadow-emerald-500/25"
              >
                {t.tiers.free.cta}
              </Link>
            </motion.div>

            {/* Starter Tier */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-sm"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-purple-100 dark:bg-purple-500/20 p-2">
                  <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-800 dark:text-white">{t.tiers.starter.name}</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-500">{t.tiers.starter.description}</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-zinc-800 dark:text-white">${getPrice(t.tiers.starter.price)}</span>
                  <span className="text-zinc-500">{t.tiers.starter.period}</span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
                  <Sparkles className="h-4 w-4" />
                  {t.tiers.starter.credits}
                </div>
              </div>

              <ul className="mb-8 space-y-3">
                {t.tiers.starter.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600 dark:text-purple-400" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button className="w-full rounded-xl border-2 border-purple-200 dark:border-purple-500/30 bg-purple-50 dark:bg-purple-500/10 py-3 font-semibold text-purple-700 dark:text-purple-400 transition-colors hover:bg-purple-100 dark:hover:bg-purple-500/20">
                {t.tiers.starter.cta}
              </button>
            </motion.div>

            {/* Pro Tier */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative rounded-3xl border-2 border-indigo-300 dark:border-indigo-500/30 bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-500/10 dark:to-transparent p-8 shadow-lg"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-indigo-600 px-4 py-1 text-sm font-medium text-white shadow-lg">
                  {t.tiers.pro.badge}
                </span>
              </div>

              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-indigo-100 dark:bg-indigo-500/20 p-2">
                  <Crown className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-800 dark:text-white">{t.tiers.pro.name}</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-500">{t.tiers.pro.description}</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-zinc-800 dark:text-white">${getPrice(t.tiers.pro.price)}</span>
                  <span className="text-zinc-500">{t.tiers.pro.period}</span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="h-4 w-4" />
                  {t.tiers.pro.credits}
                </div>
              </div>

              <ul className="mb-8 space-y-3">
                {t.tiers.pro.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-600 dark:text-indigo-400" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white transition-colors hover:bg-indigo-700 shadow-lg shadow-indigo-500/25">
                {t.tiers.pro.cta}
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Credits Explainer */}
      <section className="border-y border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-indigo-50/50 via-purple-50/50 to-indigo-50/50 dark:from-zinc-900/50 dark:via-zinc-900/50 dark:to-zinc-900/50 py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="mb-2 text-3xl font-bold text-zinc-800 dark:text-white">{t.credits.title}</h2>
            <p className="mb-12 text-zinc-600 dark:text-zinc-400">{t.credits.subtitle}</p>

            <div className="grid gap-4 sm:grid-cols-2">
              {t.credits.items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between rounded-xl border border-indigo-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm"
                >
                  <span className="text-zinc-700 dark:text-zinc-300">{item.action}</span>
                  <span className="rounded-full bg-indigo-100 dark:bg-indigo-500/20 px-3 py-1 text-sm font-medium text-indigo-700 dark:text-indigo-400">
                    {item.cost}
                  </span>
                </motion.div>
              ))}
            </div>

            <p className="mt-8 text-sm text-zinc-500">{t.credits.buyMore}</p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-12 text-center text-3xl font-bold text-zinc-800 dark:text-white">{t.faq.title}</h2>

            <div className="space-y-4">
              {t.faq.items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm"
                >
                  <h3 className="mb-2 flex items-start gap-3 font-semibold text-zinc-800 dark:text-white">
                    <HelpCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-indigo-600 dark:text-indigo-400" />
                    {item.q}
                  </h3>
                  <p className="ml-8 text-sm text-zinc-600 dark:text-zinc-400">{item.a}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 p-12 text-center shadow-xl"
          >
            <div className="absolute inset-0 -z-10">
              <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            </div>

            <h2 className="mb-4 text-3xl font-bold text-white">{t.cta.title}</h2>
            <p className="mb-8 text-indigo-100">{t.cta.subtitle}</p>

            <Link
              href={`/${lng}`}
              className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-indigo-600 shadow-lg transition-all hover:bg-indigo-50"
            >
              {t.cta.button}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
