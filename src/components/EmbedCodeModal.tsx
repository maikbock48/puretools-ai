'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Code, Copy, Check, ExternalLink } from 'lucide-react';

interface EmbedCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolSlug: string;
  toolName: string;
  lng: string;
}

const translations = {
  en: {
    title: 'Embed This Tool',
    subtitle: 'Add this tool to your blog or website',
    iframeTab: 'iFrame Code',
    linkTab: 'Link Badge',
    preview: 'Preview',
    copyCode: 'Copy Code',
    copied: 'Copied!',
    dimensions: 'Dimensions',
    width: 'Width',
    height: 'Height',
    customNote: 'Adjust width and height to fit your layout.',
    poweredBy: 'Powered by',
    freeTools: 'Free Online Tools',
    shareNote: 'Help others discover free tools!',
  },
  de: {
    title: 'Dieses Tool einbetten',
    subtitle: 'Füge dieses Tool zu deinem Blog oder Website hinzu',
    iframeTab: 'iFrame Code',
    linkTab: 'Link-Badge',
    preview: 'Vorschau',
    copyCode: 'Code kopieren',
    copied: 'Kopiert!',
    dimensions: 'Abmessungen',
    width: 'Breite',
    height: 'Höhe',
    customNote: 'Passe Breite und Höhe an dein Layout an.',
    poweredBy: 'Betrieben von',
    freeTools: 'Kostenlose Online-Tools',
    shareNote: 'Hilf anderen, kostenlose Tools zu entdecken!',
  },
};

export function EmbedCodeModal({
  isOpen,
  onClose,
  toolSlug,
  toolName,
  lng,
}: EmbedCodeModalProps) {
  const t = translations[lng as keyof typeof translations] || translations.en;
  const [activeTab, setActiveTab] = useState<'iframe' | 'badge'>('iframe');
  const [copied, setCopied] = useState(false);
  const [width, setWidth] = useState('100%');
  const [height, setHeight] = useState('600');

  const baseUrl = 'https://puretools.ai';
  const toolUrl = `${baseUrl}/${lng}/tools/${toolSlug}`;
  const embedUrl = `${baseUrl}/${lng}/embed/${toolSlug}`;

  const iframeCode = `<iframe
  src="${embedUrl}"
  width="${width}"
  height="${height}"
  frameborder="0"
  allow="clipboard-write"
  style="border: 1px solid #e5e7eb; border-radius: 12px;"
  title="${toolName} - PureTools.ai"
></iframe>`;

  const badgeCode = `<a href="${toolUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; border-radius: 8px; font-family: system-ui, sans-serif; font-size: 14px; font-weight: 500;">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
  ${t.poweredBy} PureTools.ai
</a>`;

  const copyToClipboard = useCallback(async () => {
    const code = activeTab === 'iframe' ? iframeCode : badgeCode;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [activeTab, iframeCode, badgeCode]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-2xl"
          >
            {/* Header */}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Code className="h-5 w-5 text-indigo-500" />
                  <h2 className="text-xl font-bold text-zinc-800 dark:text-white">
                    {t.title}
                  </h2>
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {t.subtitle}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveTab('iframe')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'iframe'
                    ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <Code className="h-4 w-4" />
                {t.iframeTab}
              </button>
              <button
                onClick={() => setActiveTab('badge')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'badge'
                    ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <ExternalLink className="h-4 w-4" />
                {t.linkTab}
              </button>
            </div>

            {/* Content */}
            {activeTab === 'iframe' && (
              <div className="space-y-4">
                {/* Dimensions */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs text-zinc-500 mb-1">{t.width}</label>
                    <input
                      type="text"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-800 dark:text-white"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-zinc-500 mb-1">{t.height} (px)</label>
                    <input
                      type="text"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-800 dark:text-white"
                    />
                  </div>
                </div>
                <p className="text-xs text-zinc-400">{t.customNote}</p>
              </div>
            )}

            {/* Code Preview */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-zinc-500">{t.preview}</span>
                <button
                  onClick={copyToClipboard}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    copied
                      ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      {t.copied}
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      {t.copyCode}
                    </>
                  )}
                </button>
              </div>
              <pre className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-900 p-4 text-xs text-zinc-300">
                <code>{activeTab === 'iframe' ? iframeCode : badgeCode}</code>
              </pre>
            </div>

            {/* Badge Preview */}
            {activeTab === 'badge' && (
              <div className="mt-4">
                <span className="text-xs font-medium text-zinc-500 block mb-2">{t.preview}</span>
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
                  <a
                    href={toolUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-indigo-600 hover:to-purple-600 transition-all"
                  >
                    <Code className="h-4 w-4" />
                    {t.poweredBy} PureTools.ai
                  </a>
                </div>
              </div>
            )}

            {/* Footer Note */}
            <div className="mt-6 text-center">
              <p className="text-xs text-zinc-400">
                {t.shareNote}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Hook for managing embed modal state
 */
export function useEmbedModal(toolSlug: string, toolName: string, lng: string) {
  const [isOpen, setIsOpen] = useState(false);

  const openEmbedModal = useCallback(() => setIsOpen(true), []);
  const closeEmbedModal = useCallback(() => setIsOpen(false), []);

  const EmbedModalComponent = useCallback(
    () => (
      <EmbedCodeModal
        isOpen={isOpen}
        onClose={closeEmbedModal}
        toolSlug={toolSlug}
        toolName={toolName}
        lng={lng}
      />
    ),
    [isOpen, closeEmbedModal, toolSlug, toolName, lng]
  );

  return {
    isEmbedOpen: isOpen,
    openEmbedModal,
    closeEmbedModal,
    EmbedModalComponent,
  };
}
