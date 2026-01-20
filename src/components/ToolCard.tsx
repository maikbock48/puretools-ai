'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { LucideIcon, Shield, Sparkles, Ban, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/i18n/client';
import { Language } from '@/i18n/settings';

interface ToolCardProps {
  lng: Language;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  variant: 'local' | 'ai';
  toolKey?: string;
}

// Unique gradient backgrounds for each tool
const toolBackgrounds: Record<string, string> = {
  // QR & Code tools - Purple/Violet tones
  qrGenerator: 'from-violet-500/10 via-purple-500/5 to-transparent',
  wifiQr: 'from-blue-500/10 via-cyan-500/5 to-transparent',
  qrBusinessCard: 'from-cyan-500/10 via-blue-500/5 to-transparent',

  // Image tools - Pink/Rose tones
  imageCompressor: 'from-rose-500/10 via-pink-500/5 to-transparent',
  heicConverter: 'from-pink-500/10 via-fuchsia-500/5 to-transparent',
  backgroundRemover: 'from-fuchsia-500/10 via-purple-500/5 to-transparent',
  socialCropper: 'from-orange-500/10 via-rose-500/5 to-transparent',
  stickerMaker: 'from-amber-500/10 via-orange-500/5 to-transparent',

  // Document tools - Blue/Indigo tones
  pdfToolkit: 'from-red-500/10 via-orange-500/5 to-transparent',
  pdfToJpg: 'from-indigo-500/10 via-blue-500/5 to-transparent',
  jsonFormatter: 'from-emerald-500/10 via-teal-500/5 to-transparent',
  ocr: 'from-sky-500/10 via-blue-500/5 to-transparent',

  // Media tools - Teal/Cyan tones
  videoTrimmer: 'from-purple-500/10 via-indigo-500/5 to-transparent',
  audioCutter: 'from-teal-500/10 via-emerald-500/5 to-transparent',
  audioConverter: 'from-lime-500/10 via-green-500/5 to-transparent',

  // Other tools
  bacCalculator: 'from-grape-500/10 via-violet-500/5 to-transparent',

  // AI tools
  aiTranslator: 'from-indigo-500/10 via-violet-500/5 to-transparent',
  aiTranscriber: 'from-purple-500/10 via-pink-500/5 to-transparent',
  aiSummarizer: 'from-blue-500/10 via-indigo-500/5 to-transparent',
};

// Decorative patterns for each tool
const toolPatterns: Record<string, string> = {
  qrGenerator: 'bg-[radial-gradient(circle_at_20%_80%,rgba(139,92,246,0.15),transparent_50%)]',
  imageCompressor: 'bg-[radial-gradient(circle_at_80%_20%,rgba(244,63,94,0.15),transparent_50%)]',
  pdfToolkit: 'bg-[radial-gradient(circle_at_20%_20%,rgba(239,68,68,0.15),transparent_50%)]',
  videoTrimmer: 'bg-[radial-gradient(circle_at_80%_80%,rgba(168,85,247,0.15),transparent_50%)]',
  wifiQr: 'bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.15),transparent_50%)]',
  ocr: 'bg-[radial-gradient(circle_at_30%_70%,rgba(14,165,233,0.15),transparent_50%)]',
  audioCutter: 'bg-[radial-gradient(circle_at_70%_30%,rgba(20,184,166,0.15),transparent_50%)]',
  audioConverter: 'bg-[radial-gradient(circle_at_60%_60%,rgba(132,204,22,0.15),transparent_50%)]',
  socialCropper: 'bg-[radial-gradient(circle_at_40%_40%,rgba(249,115,22,0.15),transparent_50%)]',
  bacCalculator: 'bg-[radial-gradient(circle_at_50%_80%,rgba(139,92,246,0.15),transparent_50%)]',
  stickerMaker: 'bg-[radial-gradient(circle_at_80%_50%,rgba(245,158,11,0.15),transparent_50%)]',
  qrBusinessCard: 'bg-[radial-gradient(circle_at_20%_50%,rgba(6,182,212,0.15),transparent_50%)]',
  backgroundRemover: 'bg-[radial-gradient(circle_at_70%_70%,rgba(217,70,239,0.15),transparent_50%)]',
  jsonFormatter: 'bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.15),transparent_50%)]',
  heicConverter: 'bg-[radial-gradient(circle_at_60%_20%,rgba(236,72,153,0.15),transparent_50%)]',
  pdfToJpg: 'bg-[radial-gradient(circle_at_40%_80%,rgba(99,102,241,0.15),transparent_50%)]',
  aiTranslator: 'bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.2),transparent_50%)]',
  aiTranscriber: 'bg-[radial-gradient(circle_at_30%_70%,rgba(168,85,247,0.2),transparent_50%)]',
  aiSummarizer: 'bg-[radial-gradient(circle_at_70%_30%,rgba(59,130,246,0.2),transparent_50%)]',
};

export default function ToolCard({
  lng,
  title,
  description,
  href,
  icon: Icon,
  variant,
  toolKey,
}: ToolCardProps) {
  const { t } = useTranslation(lng);
  const isLocal = variant === 'local';

  const bgGradient = toolKey ? toolBackgrounds[toolKey] || '' : '';
  const bgPattern = toolKey ? toolPatterns[toolKey] || '' : '';

  return (
    <Link href={href} className="block h-full">
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={`group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 shadow-sm hover:shadow-xl h-full flex flex-col ${
          isLocal
            ? 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-500/40'
            : 'bg-white dark:bg-zinc-900 border-indigo-200/60 dark:border-indigo-500/20 hover:border-indigo-300 dark:hover:border-indigo-500/40'
        }`}
      >
        {/* Unique tool background gradient */}
        {bgGradient && (
          <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-60 dark:opacity-40`} />
        )}

        {/* Decorative pattern */}
        {bgPattern && (
          <div className={`absolute inset-0 ${bgPattern}`} />
        )}

        {/* Background gradient on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-indigo-50/80 to-blue-50/40 dark:from-indigo-500/5 dark:to-transparent"
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col flex-1">
          {/* Icon */}
          <div
            className={`mb-4 inline-flex rounded-xl p-3 w-fit ${
              isLocal
                ? 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                : 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
            }`}
          >
            <Icon className="h-6 w-6" />
          </div>

          {/* Title */}
          <h3 className="mb-2 text-lg font-semibold text-zinc-800 dark:text-white group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
            {title}
          </h3>

          {/* Description */}
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed flex-1">
            {description}
          </p>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {isLocal ? (
              <>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                  <Shield className="h-3 w-3" />
                  {t('badges.privacy')}
                </span>
                <span className="inline-flex items-center rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                  {t('badges.free')}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 dark:bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                  <Ban className="h-3 w-3" />
                  {t('badges.noAds')}
                </span>
              </>
            ) : (
              <>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 dark:bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                  <Sparkles className="h-3 w-3" />
                  {t('badges.ai')}
                </span>
                <span className="inline-flex items-center rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                  {t('badges.credits')}
                </span>
              </>
            )}
          </div>

          {/* Try it out Button */}
          <div className="mt-auto pt-2">
            <span className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 text-sm font-medium text-white transition-colors group-hover:shadow-lg group-hover:shadow-indigo-500/25">
              {t('badges.tryIt')}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
