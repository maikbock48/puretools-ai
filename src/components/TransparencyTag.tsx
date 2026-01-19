'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sparkles, Info, Cpu, Cloud, X } from 'lucide-react';
import { Language } from '@/i18n/settings';

interface TransparencyTagProps {
  type: 'local' | 'ai';
  lng: Language;
  variant?: 'badge' | 'full' | 'minimal';
  showTooltip?: boolean;
}

const content = {
  en: {
    local: {
      badge: 'Free & Local',
      badgeMinimal: 'Free',
      title: 'Why is this free?',
      explanation: 'This tool runs entirely in your browser using WebAssembly. Your files never leave your device - we have no server costs, so we pass the savings to you.',
      points: [
        { icon: Cpu, text: 'Runs on your CPU' },
        { icon: Shield, text: '100% Private' },
        { icon: Shield, text: 'No data uploaded' },
      ],
      cost: '0€ API costs',
    },
    ai: {
      badge: 'AI-Powered',
      badgeMinimal: 'AI',
      title: 'Why does this cost credits?',
      explanation: 'This tool uses cloud AI (Gemini/Whisper) for processing. We charge only our API costs + a small fee to keep developing new features.',
      points: [
        { icon: Cloud, text: 'Cloud AI processing' },
        { icon: Sparkles, text: 'Pay only what you use' },
        { icon: Shield, text: 'No subscriptions' },
      ],
      cost: 'Pay-per-use',
    },
  },
  de: {
    local: {
      badge: 'Kostenlos & Lokal',
      badgeMinimal: 'Kostenlos',
      title: 'Warum ist das kostenlos?',
      explanation: 'Dieses Tool läuft vollständig in deinem Browser mit WebAssembly. Deine Dateien verlassen nie dein Gerät - wir haben keine Serverkosten und geben die Ersparnis an dich weiter.',
      points: [
        { icon: Cpu, text: 'Läuft auf deiner CPU' },
        { icon: Shield, text: '100% Privat' },
        { icon: Shield, text: 'Keine Daten hochgeladen' },
      ],
      cost: '0€ API-Kosten',
    },
    ai: {
      badge: 'KI-gestützt',
      badgeMinimal: 'KI',
      title: 'Warum kostet das Credits?',
      explanation: 'Dieses Tool nutzt Cloud-KI (Gemini/Whisper) zur Verarbeitung. Wir berechnen nur unsere API-Kosten + eine kleine Gebühr für die Weiterentwicklung.',
      points: [
        { icon: Cloud, text: 'Cloud-KI-Verarbeitung' },
        { icon: Sparkles, text: 'Zahle nur was du nutzt' },
        { icon: Shield, text: 'Keine Abos' },
      ],
      cost: 'Pay-per-Use',
    },
  },
};

export default function TransparencyTag({
  type,
  lng,
  variant = 'badge',
  showTooltip = true,
}: TransparencyTagProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = content[lng][type];

  const isLocal = type === 'local';
  const colorClasses = isLocal
    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
    : 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20';

  const iconColorClass = isLocal ? 'text-emerald-400' : 'text-indigo-400';
  const bgGradient = isLocal
    ? 'from-emerald-500/10 to-transparent border-emerald-500/20'
    : 'from-indigo-500/10 to-transparent border-indigo-500/20';

  if (variant === 'minimal') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${colorClasses}`}
      >
        {isLocal ? <Shield className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
        {t.badgeMinimal}
      </span>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`rounded-xl border bg-gradient-to-r p-4 ${bgGradient}`}>
        <div className="flex items-center gap-2 mb-3">
          {isLocal ? (
            <Shield className={`h-5 w-5 ${iconColorClass}`} />
          ) : (
            <Sparkles className={`h-5 w-5 ${iconColorClass}`} />
          )}
          <span className={`font-medium ${iconColorClass}`}>{t.badge}</span>
          <span className="ml-auto rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
            {t.cost}
          </span>
        </div>
        <p className="text-sm text-zinc-400 mb-3">{t.explanation}</p>
        <div className="flex flex-wrap gap-3">
          {t.points.map((point, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-zinc-500">
              <point.icon className="h-3 w-3" />
              {point.text}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default badge variant with tooltip
  return (
    <div className="relative inline-flex flex-col items-center">
      <button
        onClick={() => showTooltip && setIsOpen(!isOpen)}
        className={`group flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${colorClasses}`}
      >
        {isLocal ? <Shield className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
        {t.badge}
        {showTooltip && (
          <Info className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`absolute top-full mt-3 w-80 rounded-xl border bg-gradient-to-br from-zinc-900 to-zinc-950 p-4 shadow-xl z-50 ${
              isLocal ? 'border-emerald-500/20' : 'border-indigo-500/20'
            }`}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-2 top-2 text-zinc-500 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              {isLocal ? (
                <Shield className={`h-5 w-5 ${iconColorClass}`} />
              ) : (
                <Sparkles className={`h-5 w-5 ${iconColorClass}`} />
              )}
              <span className={`font-medium ${iconColorClass}`}>{t.title}</span>
            </div>

            <p className="text-sm text-zinc-400 mb-4">{t.explanation}</p>

            <div className="space-y-2">
              {t.points.map((point, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-zinc-500">
                  <point.icon className={`h-4 w-4 ${iconColorClass}`} />
                  {point.text}
                </div>
              ))}
            </div>

            <div className={`mt-4 pt-3 border-t border-zinc-800 text-center text-sm font-medium ${iconColorClass}`}>
              {t.cost}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
