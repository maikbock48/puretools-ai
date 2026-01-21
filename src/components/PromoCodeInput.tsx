'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Check, X, Loader2, Gift } from 'lucide-react';

interface PromoCodeInputProps {
  lng: string;
  onSuccess?: (credits: number) => void;
}

const texts = {
  en: {
    placeholder: 'Enter promo code',
    apply: 'Apply',
    success: 'credits added!',
    haveCode: 'Have a promo code?',
  },
  de: {
    placeholder: 'Promo-Code eingeben',
    apply: 'Einlösen',
    success: 'Credits gutgeschrieben!',
    haveCode: 'Hast du einen Promo-Code?',
  },
};

export default function PromoCodeInput({ lng, onSuccess }: PromoCodeInputProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ credits: number } | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const t = texts[lng as keyof typeof texts] || texts.en;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/promo/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), language: lng }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to redeem code');
        return;
      }

      setSuccess({ credits: data.credits });
      setCode('');
      onSuccess?.(data.credits);

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch {
      setError(lng === 'de' ? 'Ein Fehler ist aufgetreten' : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Toggle button */}
      {!isExpanded && !success && (
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
        >
          <Gift className="h-4 w-4" />
          {t.haveCode}
        </button>
      )}

      <AnimatePresence mode="wait">
        {isExpanded && !success && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="space-y-2"
          >
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    setError(null);
                  }}
                  placeholder={t.placeholder}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm uppercase"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={!code.trim() || isLoading}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t.apply
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  setCode('');
                  setError(null);
                }}
                className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                {error}
              </motion.p>
            )}
          </motion.form>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30"
          >
            <div className="rounded-full bg-emerald-500 p-1.5">
              <Check className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                +{success.credits} {t.success}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
