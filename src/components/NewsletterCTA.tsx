'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Check, Sparkles } from 'lucide-react';

interface NewsletterCTAProps {
  lng: string;
  variant?: 'inline' | 'card';
}

export default function NewsletterCTA({ lng, variant = 'card' }: NewsletterCTAProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const texts = {
    en: {
      title: 'Stay Updated',
      subtitle: 'Get notified about new tools and features. No spam, ever.',
      placeholder: 'Enter your email',
      cta: 'Subscribe',
      success: 'Welcome aboard! Check your inbox.',
      error: 'Something went wrong. Please try again.',
      privacy: 'We respect your privacy. Unsubscribe anytime.',
    },
    de: {
      title: 'Bleib auf dem Laufenden',
      subtitle: 'Erhalte Updates zu neuen Tools und Features. Kein Spam.',
      placeholder: 'Deine E-Mail',
      cta: 'Abonnieren',
      success: 'Willkommen! Schau in dein Postfach.',
      error: 'Etwas ist schiefgelaufen. Bitte erneut versuchen.',
      privacy: 'Wir respektieren deine Privatsphäre. Jederzeit abmelden.',
    },
  };

  const t = texts[lng as keyof typeof texts] || texts.en;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === 'loading') return;

    setStatus('loading');

    // Simulate API call - replace with actual newsletter service
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // TODO: Integrate with actual newsletter service (Mailchimp, ConvertKit, etc.)
      setStatus('success');
      setMessage(t.success);
      setEmail('');
    } catch {
      setStatus('error');
      setMessage(t.error);
    }
  };

  if (variant === 'inline') {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.placeholder}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={status === 'loading' || status === 'success'}
          />
        </div>
        <button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {status === 'loading' ? (
            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : status === 'success' ? (
            <>
              <Check className="h-5 w-5" />
              {t.success.split('!')[0]}
            </>
          ) : (
            <>
              {t.cta}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 md:p-12"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative max-w-xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white/80 text-sm mb-6">
          <Sparkles className="h-4 w-4" />
          <span>Join 5,000+ users</span>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">{t.title}</h2>
        <p className="text-white/80 mb-8">{t.subtitle}</p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <div className="relative flex-1">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.placeholder}
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white/50"
              disabled={status === 'loading' || status === 'success'}
            />
          </div>
          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="px-8 py-4 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {status === 'loading' ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : status === 'success' ? (
              <>
                <Check className="h-5 w-5" />
              </>
            ) : (
              <>
                {t.cta}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`mt-4 text-sm ${status === 'success' ? 'text-white' : 'text-red-200'}`}
          >
            {message}
          </motion.p>
        )}

        <p className="mt-6 text-xs text-white/50">{t.privacy}</p>
      </div>
    </motion.div>
  );
}
