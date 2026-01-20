'use client';

import { motion } from 'framer-motion';
import { Loader2, Sparkles, FileText, Zap } from 'lucide-react';
import { Language } from '@/i18n/settings';

interface AIProgressIndicatorProps {
  lng: Language;
  type: 'translator' | 'transcriber' | 'summarizer';
  isProcessing: boolean;
  progress?: number; // 0-100
}

const content = {
  en: {
    translator: {
      stages: [
        'Analyzing text...',
        'Processing with AI...',
        'Generating translation...',
        'Finalizing...',
      ],
    },
    transcriber: {
      stages: [
        'Uploading audio...',
        'Processing with Whisper AI...',
        'Transcribing speech...',
        'Finalizing transcript...',
      ],
    },
    summarizer: {
      stages: [
        'Analyzing document...',
        'Extracting key points...',
        'Generating summary...',
        'Finalizing...',
      ],
    },
    processingWith: 'Processing with',
    poweredBy: 'Powered by',
    gemini: 'Gemini 1.5 Flash',
    whisper: 'OpenAI Whisper',
  },
  de: {
    translator: {
      stages: [
        'Text wird analysiert...',
        'KI-Verarbeitung...',
        'Übersetzung wird generiert...',
        'Finalisierung...',
      ],
    },
    transcriber: {
      stages: [
        'Audio wird hochgeladen...',
        'Whisper KI verarbeitet...',
        'Sprache wird transkribiert...',
        'Transkript wird finalisiert...',
      ],
    },
    summarizer: {
      stages: [
        'Dokument wird analysiert...',
        'Schlüsselpunkte extrahieren...',
        'Zusammenfassung generieren...',
        'Finalisierung...',
      ],
    },
    processingWith: 'Verarbeitung mit',
    poweredBy: 'Powered by',
    gemini: 'Gemini 1.5 Flash',
    whisper: 'OpenAI Whisper',
  },
};

export default function AIProgressIndicator({
  lng,
  type,
  isProcessing,
  progress,
}: AIProgressIndicatorProps) {
  const t = content[lng];
  const stages = t[type].stages;

  // Calculate current stage based on progress or time
  const stageIndex = progress !== undefined
    ? Math.min(Math.floor(progress / 25), stages.length - 1)
    : 0;

  const currentStage = stages[stageIndex];
  const aiModel = type === 'transcriber' ? t.whisper : t.gemini;

  if (!isProcessing) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent p-4"
    >
      <div className="flex items-center gap-4">
        {/* Animated Icon */}
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="rounded-xl bg-indigo-500/20 p-3"
          >
            <Loader2 className="h-6 w-6 text-indigo-400" />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute -right-1 -top-1"
          >
            <Sparkles className="h-4 w-4 text-indigo-400" />
          </motion.div>
        </div>

        {/* Status */}
        <div className="flex-1 min-w-0">
          <motion.p
            key={currentStage}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-medium text-white truncate"
          >
            {currentStage}
          </motion.p>
          <div className="flex items-center gap-2 mt-1">
            <Zap className="h-3 w-3 text-indigo-400" />
            <span className="text-xs text-zinc-500">
              {t.poweredBy} {aiModel}
            </span>
          </div>
        </div>

        {/* Progress */}
        {progress !== undefined && (
          <div className="text-right">
            <span className="text-2xl font-bold text-indigo-400">{Math.round(progress)}%</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {progress !== undefined && (
        <div className="mt-3 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
          />
        </div>
      )}

      {/* Pulsing dots for indeterminate progress */}
      {progress === undefined && (
        <div className="mt-3 flex justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              className="h-1.5 w-1.5 rounded-full bg-indigo-400"
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
