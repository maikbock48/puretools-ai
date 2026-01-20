'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Download, Twitter, Copy, Check, Sparkles } from 'lucide-react';

interface ShareableResultProps {
  toolName: string;
  resultPreview?: string | React.ReactNode;
  downloadUrl?: string;
  shareText: string;
  stats?: {
    label: string;
    value: string;
  }[];
  lng: string;
}

export default function ShareableResult({
  toolName,
  resultPreview,
  downloadUrl,
  shareText,
  stats,
  lng,
}: ShareableResultProps) {
  const [copied, setCopied] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const twitterText = encodeURIComponent(`${shareText}\n\nCreated with PureTools.ai - Free online tools, privacy-first! 🚀`);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const texts = {
    en: {
      success: 'Success!',
      created: 'Created with',
      share: 'Share Result',
      download: 'Download',
      copyLink: 'Copy Link',
      copied: 'Copied!',
      tweet: 'Tweet',
      madeWith: 'Made with PureTools',
    },
    de: {
      success: 'Erfolgreich!',
      created: 'Erstellt mit',
      share: 'Ergebnis teilen',
      download: 'Download',
      copyLink: 'Link kopieren',
      copied: 'Kopiert!',
      tweet: 'Tweeten',
      madeWith: 'Erstellt mit PureTools',
    },
  };

  const t = texts[lng as keyof typeof texts] || texts.en;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
    >
      {/* Success header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-full">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white">{t.success}</h3>
            <p className="text-sm text-white/80">
              {t.created} {toolName}
            </p>
          </div>
        </div>
      </div>

      {/* Result preview */}
      {resultPreview && (
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
          {typeof resultPreview === 'string' ? (
            <div className="aspect-video bg-zinc-100 dark:bg-zinc-900 rounded-lg flex items-center justify-center overflow-hidden">
              <img src={resultPreview} alt="Result" className="max-w-full max-h-full object-contain" />
            </div>
          ) : (
            resultPreview
          )}
        </div>
      )}

      {/* Stats */}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-lg font-bold text-zinc-900 dark:text-white">{stat.value}</div>
              <div className="text-xs text-zinc-500">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="p-4 flex flex-wrap items-center gap-3">
        {downloadUrl && (
          <a
            href={downloadUrl}
            download
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            {t.download}
          </a>
        )}

        <button
          onClick={() => setShowShareOptions(!showShareOptions)}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 text-zinc-900 dark:text-white font-medium rounded-lg transition-colors"
        >
          <Share2 className="h-4 w-4" />
          {t.share}
        </button>

        {showShareOptions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2"
          >
            <a
              href={`https://twitter.com/intent/tweet?text=${twitterText}&url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 rounded-lg hover:bg-sky-200 dark:hover:bg-sky-500/30 transition-colors"
            >
              <Twitter className="h-5 w-5" />
            </a>

            <button
              onClick={copyLink}
              className="flex items-center gap-2 px-3 py-2 bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{t.copied}</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span className="text-sm">{t.copyLink}</span>
                </>
              )}
            </button>
          </motion.div>
        )}
      </div>

      {/* Branding footer */}
      <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
          <Sparkles className="h-3 w-3" />
          <span>{t.madeWith}</span>
          <span className="font-medium text-indigo-500">puretools.ai</span>
        </div>
      </div>
    </motion.div>
  );
}
