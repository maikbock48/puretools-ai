'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Clock, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface CreditExpirationWarningProps {
  credits: number;
  lng: string;
  userCreatedAt?: string; // ISO date string
}

const texts = {
  en: {
    title: 'Your credits are waiting!',
    message: 'Use your {credits} credits before they expire.',
    daysLeft: '{days} days left',
    useNow: 'Use Credits Now',
    dismiss: 'Remind me later',
    expired: 'Credits may have expired',
  },
  de: {
    title: 'Deine Credits warten!',
    message: 'Nutze deine {credits} Credits bevor sie verfallen.',
    daysLeft: 'Noch {days} Tage',
    useNow: 'Jetzt Credits nutzen',
    dismiss: 'Später erinnern',
    expired: 'Credits könnten abgelaufen sein',
  },
};

const STORAGE_KEY = 'credit-warning-dismissed';
const DISMISS_DURATION = 3 * 24 * 60 * 60 * 1000; // 3 days
const CREDIT_VALIDITY_DAYS = 30;

export default function CreditExpirationWarning({
  credits,
  lng,
  userCreatedAt,
}: CreditExpirationWarningProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  const t = texts[lng as keyof typeof texts] || texts.en;

  useEffect(() => {
    // Don't show if no credits
    if (credits <= 0) {
      setIsVisible(false);
      return;
    }

    // Check if dismissed recently
    const dismissedAt = localStorage.getItem(STORAGE_KEY);
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      if (Date.now() - dismissedTime < DISMISS_DURATION) {
        return;
      }
    }

    // Calculate days remaining (from user creation or last credit add)
    if (userCreatedAt) {
      const createdDate = new Date(userCreatedAt);
      const expiryDate = new Date(createdDate.getTime() + CREDIT_VALIDITY_DAYS * 24 * 60 * 60 * 1000);
      const now = new Date();
      const diffDays = Math.ceil((expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

      setDaysRemaining(Math.max(0, diffDays));

      // Show warning if less than 14 days remaining
      if (diffDays <= 14 && diffDays >= 0) {
        setIsVisible(true);
      }
    } else {
      // Fallback: assume 7 days remaining as generic warning
      setDaysRemaining(7);
      setIsVisible(true);
    }
  }, [credits, userCreatedAt]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  };

  if (!isVisible || credits <= 0) return null;

  const isUrgent = daysRemaining !== null && daysRemaining <= 7;
  const isExpired = daysRemaining !== null && daysRemaining <= 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`rounded-2xl border p-4 mb-6 ${
          isUrgent
            ? 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 border-amber-200 dark:border-amber-500/30'
            : 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 border-blue-200 dark:border-blue-500/30'
        }`}
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`flex-shrink-0 p-2 rounded-xl ${
            isUrgent
              ? 'bg-amber-100 dark:bg-amber-500/20'
              : 'bg-blue-100 dark:bg-blue-500/20'
          }`}>
            {isUrgent ? (
              <AlertTriangle className={`h-5 w-5 ${
                isUrgent ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'
              }`} />
            ) : (
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className={`font-semibold ${
                  isUrgent ? 'text-amber-800 dark:text-amber-300' : 'text-blue-800 dark:text-blue-300'
                }`}>
                  {isExpired ? t.expired : t.title}
                </h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
                  {t.message.replace('{credits}', credits.toString())}
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <X className="h-4 w-4 text-zinc-400" />
              </button>
            </div>

            {/* Days remaining badge + CTA */}
            <div className="flex flex-wrap items-center gap-3 mt-3">
              {daysRemaining !== null && daysRemaining > 0 && (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                  isUrgent
                    ? 'bg-amber-200 dark:bg-amber-500/30 text-amber-800 dark:text-amber-300'
                    : 'bg-blue-200 dark:bg-blue-500/30 text-blue-800 dark:text-blue-300'
                }`}>
                  <Sparkles className="h-3 w-3" />
                  {t.daysLeft.replace('{days}', daysRemaining.toString())}
                </span>
              )}
              <Link
                href={`/${lng}/tools/ai-translator`}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors ${
                  isUrgent
                    ? 'bg-amber-600 hover:bg-amber-500'
                    : 'bg-blue-600 hover:bg-blue-500'
                }`}
              >
                {t.useNow}
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
