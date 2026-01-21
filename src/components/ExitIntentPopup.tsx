'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Copy, Check, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ExitIntentPopupProps {
  lng: string;
}

const texts = {
  en: {
    title: 'Wait! Before you go...',
    subtitle: 'Get 10% off your first credit purchase',
    description: 'Use this exclusive code at checkout:',
    code: 'STAY10',
    copy: 'Copy Code',
    copied: 'Copied!',
    cta: 'Claim Discount',
    dismiss: 'No thanks',
    validFor: 'Valid for 24 hours only',
  },
  de: {
    title: 'Warte! Bevor du gehst...',
    subtitle: 'Erhalte 10% Rabatt auf deinen ersten Credit-Kauf',
    description: 'Verwende diesen exklusiven Code beim Checkout:',
    code: 'STAY10',
    copy: 'Code kopieren',
    copied: 'Kopiert!',
    cta: 'Rabatt sichern',
    dismiss: 'Nein danke',
    validFor: 'Nur 24 Stunden gültig',
  },
};

const STORAGE_KEY = 'exit-intent-shown';
const STORAGE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export default function ExitIntentPopup({ lng }: ExitIntentPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const t = texts[lng as keyof typeof texts] || texts.en;

  // Check if popup was already shown recently
  const wasRecentlyShown = useCallback(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return false;
    const timestamp = parseInt(stored, 10);
    return Date.now() - timestamp < STORAGE_EXPIRY;
  }, []);

  // Mark popup as shown
  const markAsShown = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    }
  }, []);

  // Handle mouse leave (exit intent)
  useEffect(() => {
    if (wasRecentlyShown()) return;

    let hasTriggered = false;

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse is leaving towards the top of the page (closing tab/window)
      if (e.clientY <= 0 && !hasTriggered) {
        hasTriggered = true;
        setIsVisible(true);
        markAsShown();
      }
    };

    // Also trigger on back button / page unload (mobile)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!hasTriggered && !wasRecentlyShown()) {
        // Can't show popup on unload, but can track
        markAsShown();
      }
    };

    // Delay adding listener to avoid triggering on initial page load
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
      window.addEventListener('beforeunload', handleBeforeUnload);
    }, 5000); // Wait 5 seconds before enabling

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [wasRecentlyShown, markAsShown]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(t.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background decoration */}
            <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500" />
            <div className="absolute top-0 left-0 right-0 h-40 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.2),transparent_50%)]" />

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
            >
              <X className="h-5 w-5 text-white" />
            </button>

            {/* Content */}
            <div className="relative pt-16 pb-8 px-8">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="p-4 rounded-2xl bg-white shadow-xl"
                >
                  <Gift className="h-10 w-10 text-indigo-600" />
                </motion.div>
              </div>

              {/* Title */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                  {t.title}
                </h2>
                <p className="text-lg text-indigo-600 dark:text-indigo-400 font-semibold">
                  {t.subtitle}
                </p>
              </div>

              {/* Promo Code Box */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 rounded-2xl p-6 mb-6 border border-indigo-100 dark:border-indigo-500/20">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center mb-3">
                  {t.description}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <div className="px-6 py-3 bg-white dark:bg-zinc-800 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-500/50">
                    <span className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 tracking-wider">
                      {t.code}
                    </span>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-500/30 transition-colors"
                  >
                    {copied ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-zinc-500 text-center mt-3 flex items-center justify-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  {t.validFor}
                </p>
              </div>

              {/* CTA Button */}
              <Link
                href={`/${lng}/pricing`}
                onClick={handleDismiss}
                className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
              >
                {t.cta}
                <ArrowRight className="h-5 w-5" />
              </Link>

              {/* Dismiss link */}
              <button
                onClick={handleDismiss}
                className="w-full mt-4 py-2 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              >
                {t.dismiss}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
