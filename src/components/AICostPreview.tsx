'use client';

import { motion } from 'framer-motion';
import { Calculator, FileText, Clock, Sparkles, Info, AlertCircle } from 'lucide-react';
import { Language } from '@/i18n/settings';

interface AICostPreviewProps {
  lng: Language;
  type: 'translator' | 'transcriber' | 'summarizer';
  wordCount?: number;
  pageCount?: number;
  audioDuration?: number; // in seconds
  fileSize?: number; // in bytes
  creditsRequired: number;
  estimatedTime?: number; // in seconds
  onConfirm?: () => void;
  onCancel?: () => void;
}

const content = {
  en: {
    title: 'Cost Preview',
    subtitle: 'Review the estimated cost before processing',
    fileInfo: 'File Information',
    words: 'words',
    pages: 'pages',
    duration: 'duration',
    size: 'file size',
    costBreakdown: 'Cost Breakdown',
    apiCost: 'AI Processing Cost',
    serviceFee: 'Service Fee (10%)',
    total: 'Total Credits',
    estimatedTime: 'Estimated Time',
    yourBalance: 'Your Balance',
    credits: 'credits',
    sufficient: 'Sufficient balance',
    insufficient: 'Insufficient balance',
    topUp: 'Top up credits',
    confirm: 'Process Now',
    cancel: 'Cancel',
    transparency: 'We show exact costs upfront. No hidden fees.',
    pricing: {
      translator: '~0.5 credits per 1000 words',
      transcriber: '~1 credit per minute of audio',
      summarizer: '~0.3 credits per 1000 words',
    },
  },
  de: {
    title: 'Kosten-Vorschau',
    subtitle: 'Überprüfe die geschätzten Kosten vor der Verarbeitung',
    fileInfo: 'Datei-Informationen',
    words: 'Wörter',
    pages: 'Seiten',
    duration: 'Dauer',
    size: 'Dateigröße',
    costBreakdown: 'Kostenaufschlüsselung',
    apiCost: 'KI-Verarbeitungskosten',
    serviceFee: 'Service-Gebühr (10%)',
    total: 'Gesamt-Credits',
    estimatedTime: 'Geschätzte Zeit',
    yourBalance: 'Dein Guthaben',
    credits: 'Credits',
    sufficient: 'Ausreichendes Guthaben',
    insufficient: 'Unzureichendes Guthaben',
    topUp: 'Credits aufladen',
    confirm: 'Jetzt verarbeiten',
    cancel: 'Abbrechen',
    transparency: 'Wir zeigen exakte Kosten vorab. Keine versteckten Gebühren.',
    pricing: {
      translator: '~0,5 Credits pro 1000 Wörter',
      transcriber: '~1 Credit pro Minute Audio',
      summarizer: '~0,3 Credits pro 1000 Wörter',
    },
  },
};

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
};

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function AICostPreview({
  lng,
  type,
  wordCount,
  pageCount,
  audioDuration,
  fileSize,
  creditsRequired,
  estimatedTime,
  onConfirm,
  onCancel,
}: AICostPreviewProps) {
  const t = content[lng];

  // Mock user balance - in real app this would come from auth context
  const userBalance = 100;
  const hasSufficientBalance = userBalance >= creditsRequired;

  const baseCost = creditsRequired / 1.1;
  const serviceFee = creditsRequired - baseCost;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-zinc-900 to-zinc-950 p-6 shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="rounded-xl bg-indigo-500/20 p-2">
          <Calculator className="h-6 w-6 text-indigo-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white">{t.title}</h3>
          <p className="text-sm text-zinc-500">{t.subtitle}</p>
        </div>
      </div>

      {/* File Info */}
      <div className="rounded-xl bg-zinc-800/50 p-4 mb-4">
        <h4 className="text-xs font-medium text-zinc-500 mb-3">{t.fileInfo}</h4>
        <div className="grid grid-cols-2 gap-3">
          {wordCount !== undefined && (
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-zinc-500" />
              <span className="text-sm text-white">{wordCount.toLocaleString()} {t.words}</span>
            </div>
          )}
          {pageCount !== undefined && (
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-zinc-500" />
              <span className="text-sm text-white">{pageCount} {t.pages}</span>
            </div>
          )}
          {audioDuration !== undefined && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-zinc-500" />
              <span className="text-sm text-white">{formatDuration(audioDuration)} {t.duration}</span>
            </div>
          )}
          {fileSize !== undefined && (
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-zinc-500" />
              <span className="text-sm text-white">{formatBytes(fileSize)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="rounded-xl bg-zinc-800/50 p-4 mb-4">
        <h4 className="text-xs font-medium text-zinc-500 mb-3">{t.costBreakdown}</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">{t.apiCost}</span>
            <span className="text-white">{baseCost.toFixed(1)} {t.credits}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">{t.serviceFee}</span>
            <span className="text-white">{serviceFee.toFixed(1)} {t.credits}</span>
          </div>
          <div className="border-t border-zinc-700 pt-2 mt-2">
            <div className="flex justify-between">
              <span className="font-medium text-white">{t.total}</span>
              <span className="text-xl font-bold text-indigo-400">{creditsRequired} {t.credits}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Estimated Time */}
      {estimatedTime && (
        <div className="flex items-center justify-between rounded-lg bg-zinc-800/30 px-4 py-2 mb-4">
          <span className="text-sm text-zinc-400">{t.estimatedTime}</span>
          <span className="text-sm font-medium text-white">{formatDuration(estimatedTime)}</span>
        </div>
      )}

      {/* Balance Check */}
      <div className={`rounded-xl p-4 mb-4 ${hasSufficientBalance ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hasSufficientBalance ? (
              <Sparkles className="h-4 w-4 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-400" />
            )}
            <span className="text-sm text-zinc-300">{t.yourBalance}</span>
          </div>
          <span className={`font-medium ${hasSufficientBalance ? 'text-emerald-400' : 'text-red-400'}`}>
            {userBalance} {t.credits}
          </span>
        </div>
        <p className={`text-xs mt-1 ${hasSufficientBalance ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
          {hasSufficientBalance ? t.sufficient : t.insufficient}
        </p>
      </div>

      {/* Pricing Info */}
      <div className="flex items-start gap-2 rounded-lg bg-zinc-800/30 p-3 mb-4">
        <Info className="h-4 w-4 text-zinc-500 mt-0.5" />
        <div>
          <p className="text-xs text-zinc-400">{t.transparency}</p>
          <p className="text-xs text-zinc-500 mt-1">{t.pricing[type]}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {onCancel && (
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 py-3 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
          >
            {t.cancel}
          </button>
        )}
        {onConfirm && (
          <button
            onClick={onConfirm}
            disabled={!hasSufficientBalance}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-500 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="h-4 w-4" />
            {hasSufficientBalance ? t.confirm : t.topUp}
          </button>
        )}
      </div>
    </motion.div>
  );
}
