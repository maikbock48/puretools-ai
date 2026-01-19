'use client';

import { motion } from 'framer-motion';
import { Zap, Clock, Shield, Server, TrendingDown, Check } from 'lucide-react';
import { Language } from '@/i18n/settings';

interface EfficiencyScoreProps {
  lng: Language;
  processingTime: number; // in milliseconds
  savedBytes?: number;
  savedPercent?: number;
  itemCount?: number;
}

const content = {
  en: {
    title: 'Efficiency Score',
    processed: 'Processed locally in',
    items: 'items processed',
    savings: 'Data saved',
    privacy: '100% Privacy preserved',
    serverCost: 'Server costs',
    saved: 'saved',
    zero: '$0',
    localBadge: 'Processed on your device',
  },
  de: {
    title: 'Effizienz-Score',
    processed: 'Lokal verarbeitet in',
    items: 'Elemente verarbeitet',
    savings: 'Daten gespart',
    privacy: '100% Privatsphäre gewahrt',
    serverCost: 'Serverkosten',
    saved: 'gespart',
    zero: '0€',
    localBadge: 'Auf deinem Gerät verarbeitet',
  },
};

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatTime = (ms: number): string => {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

export default function EfficiencyScore({
  lng,
  processingTime,
  savedBytes,
  savedPercent,
  itemCount,
}: EfficiencyScoreProps) {
  const t = content[lng];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent p-4 sm:p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-emerald-500/20 p-1.5">
            <Zap className="h-5 w-5 text-emerald-400" />
          </div>
          <h3 className="font-semibold text-white">{t.title}</h3>
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400"
        >
          <Check className="h-3 w-3" />
          {t.localBadge}
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Processing Time */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-lg bg-zinc-900/50 p-3"
        >
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-emerald-400" />
            <span className="text-xs text-zinc-500">{t.processed}</span>
          </div>
          <div className="text-lg font-bold text-white">{formatTime(processingTime)}</div>
        </motion.div>

        {/* Data Saved */}
        {savedBytes !== undefined && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-lg bg-zinc-900/50 p-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-zinc-500">{t.savings}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-emerald-400">{formatBytes(savedBytes)}</span>
              {savedPercent !== undefined && (
                <span className="text-sm text-emerald-400/70">(-{savedPercent}%)</span>
              )}
            </div>
          </motion.div>
        )}

        {/* Items Count */}
        {itemCount !== undefined && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-lg bg-zinc-900/50 p-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <Check className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-zinc-500">{t.items}</span>
            </div>
            <div className="text-lg font-bold text-white">{itemCount}</div>
          </motion.div>
        )}

        {/* Privacy */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-lg bg-zinc-900/50 p-3"
        >
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-4 w-4 text-emerald-400" />
            <span className="text-xs text-zinc-500">{t.privacy}</span>
          </div>
          <div className="text-lg font-bold text-emerald-400">
            <Check className="h-5 w-5" />
          </div>
        </motion.div>

        {/* Server Cost */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-lg bg-zinc-900/50 p-3"
        >
          <div className="flex items-center gap-2 mb-1">
            <Server className="h-4 w-4 text-emerald-400" />
            <span className="text-xs text-zinc-500">{t.serverCost}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-emerald-400">{t.zero}</span>
            <span className="text-xs text-zinc-500">{t.saved}</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
