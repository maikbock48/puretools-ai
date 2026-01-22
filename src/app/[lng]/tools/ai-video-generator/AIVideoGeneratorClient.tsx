'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Video,
  Sparkles,
  Clock,
  Film,
  Square,
  RectangleHorizontal,
  RectangleVertical,
  Palette,
  Bell,
  Mail,
  CheckCircle,
  Play,
} from 'lucide-react';
import { Language } from '@/i18n/settings';

interface AIVideoGeneratorClientProps {
  lng: Language;
}

const content = {
  en: {
    title: 'AI Video Generator',
    subtitle: 'Create stunning videos from text descriptions using OpenAI Sora',
    comingSoon: 'Coming Soon',
    comingSoonSubtitle: 'Sora API access is currently limited. We\'re on the waitlist!',
    notifyMe: 'Notify Me When Available',
    notifyPlaceholder: 'Enter your email',
    notifyButton: 'Subscribe',
    notifySuccess: 'You\'ll be notified when this feature launches!',
    promptLabel: 'Describe your video',
    promptPlaceholder: 'A serene mountain landscape at golden hour, camera slowly panning across the lake while birds fly overhead, cinematic style...',
    durationLabel: 'Video Duration',
    durations: {
      '5': '5 seconds',
      '10': '10 seconds',
      '15': '15 seconds',
      '20': '20 seconds',
    },
    aspectLabel: 'Aspect Ratio',
    aspects: {
      '16:9': 'Landscape (16:9)',
      '9:16': 'Portrait (9:16)',
      '1:1': 'Square (1:1)',
    },
    styleLabel: 'Style',
    styles: {
      cinematic: 'Cinematic',
      animated: 'Animated',
      realistic: 'Realistic',
    },
    credits: 'Estimated Credits',
    previewTitle: 'What Sora Can Create',
    previewItems: [
      'Photorealistic scenes from imagination',
      'Smooth camera movements & transitions',
      'Consistent characters across frames',
      'Complex multi-subject interactions',
      'Cinematic lighting & effects',
    ],
    timeline: {
      title: 'Expected Timeline',
      items: [
        { status: 'done', text: 'Integration architecture prepared' },
        { status: 'done', text: 'UI components designed' },
        { status: 'pending', text: 'Waiting for API access' },
        { status: 'pending', text: 'Beta testing phase' },
        { status: 'pending', text: 'Public launch' },
      ],
    },
  },
  de: {
    title: 'KI Videogenerator',
    subtitle: 'Erstellen Sie beeindruckende Videos aus Textbeschreibungen mit OpenAI Sora',
    comingSoon: 'Demnächst verfügbar',
    comingSoonSubtitle: 'Der Sora API-Zugang ist derzeit begrenzt. Wir sind auf der Warteliste!',
    notifyMe: 'Benachrichtigen wenn verfügbar',
    notifyPlaceholder: 'E-Mail-Adresse eingeben',
    notifyButton: 'Abonnieren',
    notifySuccess: 'Sie werden benachrichtigt, wenn diese Funktion verfügbar ist!',
    promptLabel: 'Beschreiben Sie Ihr Video',
    promptPlaceholder: 'Eine ruhige Berglandschaft zur goldenen Stunde, die Kamera schwenkt langsam über den See während Vögel darüber fliegen, kinematischer Stil...',
    durationLabel: 'Videodauer',
    durations: {
      '5': '5 Sekunden',
      '10': '10 Sekunden',
      '15': '15 Sekunden',
      '20': '20 Sekunden',
    },
    aspectLabel: 'Seitenverhältnis',
    aspects: {
      '16:9': 'Querformat (16:9)',
      '9:16': 'Hochformat (9:16)',
      '1:1': 'Quadrat (1:1)',
    },
    styleLabel: 'Stil',
    styles: {
      cinematic: 'Kinematisch',
      animated: 'Animiert',
      realistic: 'Realistisch',
    },
    credits: 'Geschätzte Credits',
    previewTitle: 'Was Sora erschaffen kann',
    previewItems: [
      'Fotorealistische Szenen aus der Vorstellung',
      'Flüssige Kamerabewegungen & Übergänge',
      'Konsistente Charaktere über Frames hinweg',
      'Komplexe Multi-Subjekt-Interaktionen',
      'Kinematische Beleuchtung & Effekte',
    ],
    timeline: {
      title: 'Erwarteter Zeitplan',
      items: [
        { status: 'done', text: 'Integrationsarchitektur vorbereitet' },
        { status: 'done', text: 'UI-Komponenten gestaltet' },
        { status: 'pending', text: 'Warten auf API-Zugang' },
        { status: 'pending', text: 'Beta-Testphase' },
        { status: 'pending', text: 'Öffentlicher Launch' },
      ],
    },
  },
};

const CREDIT_COSTS = {
  '5': 25,
  '10': 40,
  '15': 55,
  '20': 70,
};

export default function AIVideoGeneratorClient({ lng }: AIVideoGeneratorClientProps) {
  const t = content[lng];
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState<'5' | '10' | '15' | '20'>('10');
  const [aspect, setAspect] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [style, setStyle] = useState<'cinematic' | 'animated' | 'realistic'>('cinematic');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const currentCost = CREDIT_COSTS[duration];

  const handleSubscribe = async () => {
    if (!email.includes('@')) return;

    try {
      await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'sora-waitlist' }),
      });
      setSubscribed(true);
    } catch {
      // Silent fail, still show success for UX
      setSubscribed(true);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-rose-100 to-orange-100 dark:from-rose-500/10 dark:to-orange-500/10 p-3">
            <Video className="h-8 w-8 text-rose-600 dark:text-rose-400" />
          </div>
          <h1 className="mb-3 text-3xl font-bold text-zinc-800 dark:text-white sm:text-4xl">
            {t.title}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">{t.subtitle}</p>

          {/* Coming Soon Badge */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-700 dark:text-amber-400"
          >
            <Clock className="h-4 w-4" />
            {t.comingSoon}
          </motion.div>
        </motion.div>

        {/* Coming Soon Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-500/30 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/5 dark:to-orange-500/5 p-8 text-center"
        >
          <Sparkles className="mx-auto mb-4 h-12 w-12 text-amber-500" />
          <h2 className="mb-2 text-xl font-bold text-zinc-800 dark:text-white">
            {t.comingSoon}
          </h2>
          <p className="mb-6 text-zinc-600 dark:text-zinc-400">
            {t.comingSoonSubtitle}
          </p>

          {/* Email Subscription */}
          {!subscribed ? (
            <div className="mx-auto max-w-md">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.notifyPlaceholder}
                    className="w-full rounded-xl border border-amber-200 dark:border-amber-500/30 bg-white dark:bg-zinc-900 pl-10 pr-4 py-3 text-zinc-800 dark:text-white placeholder-zinc-400 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubscribe}
                  className="flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 font-semibold text-white shadow-lg shadow-amber-500/25 hover:bg-amber-400"
                >
                  <Bell className="h-5 w-5" />
                  {t.notifyButton}
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-3 text-emerald-700 dark:text-emerald-400">
              <CheckCircle className="h-5 w-5" />
              {t.notifySuccess}
            </div>
          )}
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Controls (Disabled/Preview) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6 opacity-60"
          >
            {/* Prompt Input */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t.promptLabel}
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t.promptPlaceholder}
                rows={5}
                disabled
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-4 py-3 text-zinc-800 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 cursor-not-allowed resize-none"
              />
            </div>

            {/* Duration Selection */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                <Clock className="h-4 w-4" />
                {t.durationLabel}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['5', '10', '15', '20'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    disabled
                    className={`rounded-xl border p-3 text-sm transition-all cursor-not-allowed ${
                      duration === d
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        : 'border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {t.durations[d]}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                <Film className="h-4 w-4" />
                {t.aspectLabel}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['16:9', '9:16', '1:1'] as const).map((a) => {
                  const icons = {
                    '16:9': RectangleHorizontal,
                    '9:16': RectangleVertical,
                    '1:1': Square,
                  };
                  const Icon = icons[a];
                  return (
                    <button
                      key={a}
                      onClick={() => setAspect(a)}
                      disabled
                      className={`flex flex-col items-center gap-1 rounded-xl border p-3 transition-all cursor-not-allowed ${
                        aspect === a
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          : 'border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs">{a}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Style */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                <Palette className="h-4 w-4" />
                {t.styleLabel}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['cinematic', 'animated', 'realistic'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    disabled
                    className={`rounded-xl border px-3 py-2 text-sm transition-all cursor-not-allowed ${
                      style === s
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        : 'border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {t.styles[s]}
                  </button>
                ))}
              </div>
            </div>

            {/* Cost Preview */}
            <div className="rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-rose-700 dark:text-rose-400">
                  {t.credits}
                </span>
                <span className="text-lg font-bold text-rose-600 dark:text-rose-400">
                  ~{currentCost} Credits
                </span>
              </div>
            </div>
          </motion.div>

          {/* Preview / Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Video Preview Placeholder */}
            <div className="relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-900 overflow-hidden aspect-video">
              <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400">
                <div className="relative">
                  <Play className="h-16 w-16" />
                  <div className="absolute inset-0 animate-ping">
                    <Play className="h-16 w-16 opacity-25" />
                  </div>
                </div>
                <p className="mt-4 text-sm">{t.comingSoon}</p>
              </div>
              {/* Fake video grid overlay */}
              <div className="absolute inset-0 grid grid-cols-4 grid-rows-3 gap-px opacity-10">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-zinc-700" />
                ))}
              </div>
            </div>

            {/* What Sora Can Create */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-4">
              <h3 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t.previewTitle}
              </h3>
              <ul className="space-y-2">
                {t.previewItems.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Timeline */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-4">
              <h3 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t.timeline.title}
              </h3>
              <div className="space-y-3">
                {t.timeline.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${
                      item.status === 'done'
                        ? 'bg-emerald-500'
                        : 'bg-zinc-300 dark:bg-zinc-600'
                    }`} />
                    <span className={`text-sm ${
                      item.status === 'done'
                        ? 'text-zinc-700 dark:text-zinc-300'
                        : 'text-zinc-500 dark:text-zinc-500'
                    }`}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
