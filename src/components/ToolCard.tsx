'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { LucideIcon, Shield, Sparkles } from 'lucide-react';
import { useTranslation } from '@/i18n/client';
import { Language } from '@/i18n/settings';

interface ToolCardProps {
  lng: Language;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  variant: 'local' | 'ai';
}

export default function ToolCard({
  lng,
  title,
  description,
  href,
  icon: Icon,
  variant,
}: ToolCardProps) {
  const { t } = useTranslation(lng);
  const isLocal = variant === 'local';

  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={`group relative overflow-hidden rounded-2xl border bg-white dark:bg-zinc-900 p-6 transition-all duration-300 shadow-sm hover:shadow-md ${
          isLocal
            ? 'border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-emerald-500/5'
            : 'border-indigo-500/20 hover:border-indigo-500/40 hover:shadow-indigo-500/5'
        }`}
      >
        {/* Background gradient */}
        <div
          className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
            isLocal ? 'gradient-emerald' : 'gradient-indigo'
          }`}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Icon */}
          <div
            className={`mb-4 inline-flex rounded-xl p-3 ${
              isLocal
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
            }`}
          >
            <Icon className="h-6 w-6" />
          </div>

          {/* Title */}
          <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
            {title}
          </h3>

          {/* Description */}
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {description}
          </p>

          {/* Badge */}
          <div className="flex items-center gap-2">
            {isLocal ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Shield className="h-3 w-3" />
                {t('badges.privacy')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                <Sparkles className="h-3 w-3" />
                {t('badges.ai')}
              </span>
            )}
            <span className="inline-flex items-center rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
              {isLocal ? t('badges.free') : t('badges.credits')}
            </span>
          </div>
        </div>

        {/* Hover arrow */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          whileHover={{ opacity: 1, x: 0 }}
          className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <svg
            className={`h-6 w-6 ${isLocal ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </motion.div>
      </motion.div>
    </Link>
  );
}
