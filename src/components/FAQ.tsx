'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { Language } from '@/i18n/settings';

interface FAQProps {
  lng: Language;
}

const faqData = {
  en: {
    title: 'Frequently Asked Questions',
    subtitle: 'Everything you need to know about PureTools',
    items: [
      {
        question: 'Are the tools really free?',
        answer: 'Yes! All local tools (QR Generator, Image Compressor, PDF Toolkit, etc.) are completely free with no limits. AI-powered tools use a pay-per-use credit system with fair pricing.',
      },
      {
        question: 'How does local processing work?',
        answer: 'Our local tools run entirely in your browser using WebAssembly and JavaScript. Your files never leave your device - all processing happens on your computer, ensuring complete privacy.',
      },
      {
        question: 'What about AI tool pricing?',
        answer: 'AI tools use credits. You only pay for what you use - no subscriptions, no hidden fees. Credits never expire and you can see exactly how much each operation costs before running it.',
      },
      {
        question: 'Do I need to create an account?',
        answer: 'No account is needed for local tools. For AI-powered features, you\'ll need to sign in to manage your credits, but we keep data collection to an absolute minimum.',
      },
      {
        question: 'Is my data safe?',
        answer: 'Absolutely. Local tools process everything on your device. For AI tools, files are encrypted in transit, processed, and immediately deleted. We never store your files or use them for training.',
      },
      {
        question: 'Can I use PureTools offline?',
        answer: 'Yes! Once loaded, all local tools work offline. PureTools is a Progressive Web App (PWA) that you can install on your device for offline access.',
      },
    ],
  },
  de: {
    title: 'Häufig gestellte Fragen',
    subtitle: 'Alles, was Sie über PureTools wissen müssen',
    items: [
      {
        question: 'Sind die Tools wirklich kostenlos?',
        answer: 'Ja! Alle lokalen Tools (QR-Generator, Bildkompressor, PDF-Toolkit usw.) sind komplett kostenlos und ohne Limits. KI-gestützte Tools nutzen ein faires Pay-per-Use-Kreditsystem.',
      },
      {
        question: 'Wie funktioniert die lokale Verarbeitung?',
        answer: 'Unsere lokalen Tools laufen vollständig in Ihrem Browser mit WebAssembly und JavaScript. Ihre Dateien verlassen nie Ihr Gerät - alle Verarbeitung geschieht auf Ihrem Computer für vollständige Privatsphäre.',
      },
      {
        question: 'Was kosten die KI-Tools?',
        answer: 'KI-Tools nutzen Credits. Sie zahlen nur, was Sie verbrauchen - keine Abos, keine versteckten Gebühren. Credits verfallen nie und Sie sehen vor jeder Operation genau, was sie kostet.',
      },
      {
        question: 'Muss ich ein Konto erstellen?',
        answer: 'Für lokale Tools ist kein Konto nötig. Für KI-Funktionen müssen Sie sich anmelden, um Ihre Credits zu verwalten, aber wir sammeln nur minimal nötige Daten.',
      },
      {
        question: 'Sind meine Daten sicher?',
        answer: 'Absolut. Lokale Tools verarbeiten alles auf Ihrem Gerät. Bei KI-Tools werden Dateien verschlüsselt übertragen, verarbeitet und sofort gelöscht. Wir speichern Ihre Dateien nie und nutzen sie nicht für Training.',
      },
      {
        question: 'Kann ich PureTools offline nutzen?',
        answer: 'Ja! Einmal geladen, funktionieren alle lokalen Tools offline. PureTools ist eine Progressive Web App (PWA), die Sie auf Ihrem Gerät für Offline-Zugriff installieren können.',
      },
    ],
  },
};

export default function FAQ({ lng }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const content = faqData[lng];

  return (
    <section id="faq" className="relative py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-2 rounded-lg bg-indigo-100 dark:bg-indigo-500/10 mb-4">
            <HelpCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-3xl font-bold text-zinc-800 dark:text-white mb-4">
            {content.title}
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            {content.subtitle}
          </p>
        </motion.div>

        {/* FAQ Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4"
        >
          {content.items.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900 overflow-hidden backdrop-blur-sm shadow-sm"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <span className="font-medium text-zinc-800 dark:text-white pr-4">
                  {item.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
                </motion.div>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
